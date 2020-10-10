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

  if (req.query.useCache) {
    const db = new Firestore();
    const newCasesRef = db.collection(process.env.COLLECTION);
    const doc = await newCasesRef.doc(req.query.date).get();
    if (doc.exists) {
      console.log(doc.data());
      res.status(200).send(doc.data());
      return;
    }
  }

  return downloader.download(req.query.date)
  .then(file => scraper.scrapeValues(file))
  .then(values => {
      console.log(values);
      if (req.query.useCache) newCasesRef.doc(req.query.date).set(values);
      res.status(200).send(values);
  })
  .catch(err => {
      console.log(err);
      res.status(400).send();
  });
};