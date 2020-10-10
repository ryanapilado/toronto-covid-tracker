const downloader = require("./downloader");
const scraper = require("./scraper");

/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.readReport = async (req, res) => {

  // check firestore; if found return that, else return below
  
  return downloader.download(req.query.date)
  .then(file => scraper.scrapeValues(file))
  .then(values => {
      console.log(values);
      res.status(200).send(values);
  })
  .catch(err => {
      console.log(err);
      res.status(400).send();
  });
};