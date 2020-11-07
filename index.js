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
  const flushCache = 'flushCache' in req.query;
  if (!noCache && !flushCache) {
    const db = new Firestore();
    collection = db.collection(process.env.COLLECTION);
    const doc = await collection.doc(req.query.date).get();
    if (doc.exists && !req.query.noCache) {
      console.log(doc.data());
      res.status(200).send(doc.data());
      return;
    }
  }

  return downloader.download(req.query.date)
    .then(file => scraper.scrapeValues(file))
    .then(values => {
        console.log(values);
        res.status(200).send(values);
        if (!noCache || flushCache) {
          collection.doc(req.query.date).set(values);
        }
    })
    .catch(err => {
        console.log(err);
        res.status(400).send();
    });
};