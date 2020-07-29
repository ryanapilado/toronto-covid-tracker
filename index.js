const pdfjs = require('pdfjs-dist/es5/build/pdf.js');
const wget = require('wget-improved');
const fs = require('fs');

/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.helloWorld = (req, res) => {
  const src = `https://files.ontario.ca/moh-covid-19-report-en-${req.query.date}.pdf`;
  const output = '/tmp/report.pdf';

  let download = wget.download(src, output);
  download.on('error', function(err) {
    console.log(err);
    res.status(400).send(err);
  });

  download.on('end', async function(output) {

    const contents = fs.readFileSync('/tmp/report.pdf', {encoding: 'binary'});

    pdfjs.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/build/pdf.worker.js'
    let pdf = await pdfjs.getDocument({data: contents}).promise.then();

    async function getNewCases(healthUnit, offset) {
      for (let i = 1; i <= pdf.numPages; i++) {
        let page = await pdf.getPage(i);
        let content = await page.getTextContent();
        console.log(content.items);
        let idx = content.items.findIndex(e => e.str.includes(healthUnit));
        if (idx < 0) { continue; }

        let idx2 = content.items.slice(idx).findIndex(e => e.transform[4] > offset) - 1;
        if (content.items[idx + idx2 - 1].str === '-') {
          return '-' + content.items[idx + idx2].str;
        }
        return content.items[idx + idx2].str;

      }

      console.log('could not locate page');
      res.status(400).send(err);
    }

    let torontoNewCases = await getNewCases('TORONTO', 353);
    let ontarioNewCases = await getNewCases('ONTARIO', 353);
    res.status(200).send({
      "torontoNewCases": torontoNewCases,
      "ontarioNewCases": ontarioNewCases
    });

    }, function (reason) {
      console.error(reason);
    }
  );
};

