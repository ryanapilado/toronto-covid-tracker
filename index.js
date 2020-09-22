const scraper = require("./scraper");

/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.readReport = (req, res) => {
    scraper.scrapeValues(req.query.date)
        .then(values => {
            console.log(values);
            res.status(200).send(values);
        })
        .catch(err => {
            console.log(err);
            res.status(400).send();
        });
};
