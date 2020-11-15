const downloader = require("./downloader");
const scraper = require("./scraper");
const Firestore = require("@google-cloud/firestore");

/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.readReport = async (req, res) => {

  require('dotenv').config();

  let collection;
  const noCache = 'noCache' in req.query;
  const overwriteCache = 'overwriteCache' in req.query;

  // setup firestore if using or flushing cache
  if (!noCache) {
    const db = new Firestore();
    collection = db.collection(process.env.COLLECTION);
  }

  // retrieve from firestore if using cache
  if (!noCache && !overwriteCache) {
    const doc = await collection.doc(req.query.date).get();
    if (doc.exists && !req.query.noCache) {
      console.log(doc.data());
      res.status(200).send(doc.data());
      return;
    }
  }

  // scrape and return the results from the report
  return downloader.download(req.query.date)
    .then(file => scraper.scrapeValues(file))
    .then(values => {
        console.log(values);
        res.status(200).send(values);
        if (!noCache || overwriteCache) {
          collection.doc(req.query.date).set(values);
        }
    })
    .catch(err => {
        console.log(err);
        res.status(400).send();
    });
};