const pdfjs = require('pdfjs-dist');
const wget = require('wget-improved');
const fs = require('fs');
const jsdom = require('jsdom');

/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.helloWorld = (req, res) => {
  const src = 'https://files.ontario.ca/moh-covid-19-report-en-2020-07-16.pdf';
  const output = '/tmp/report.pdf';

  const options = {};

  let download = wget.download(src, output, options);
  download.on('error', function(err) {
    console.log(err);
    res.status(400).send(message);
  });
  download.on('end', function(output) {
    console.log(output);
    const contents = fs.readFileSync('/tmp/report.pdf', {encoding: 'binary'});

    const loadingTask = pdfjs.getDocument({data: contents});
    loadingTask.promise.then(function(pdf) {
      console.log('PDF loaded');
      console.log(pdf);
      let message = req.query.message || req.body.message || 'Hello World!';
      res.status(200).send(message);
    });
  });
};

