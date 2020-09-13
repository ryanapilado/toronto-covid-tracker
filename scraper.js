const pdfjs = require('pdfjs-dist/es5/build/pdf.js');
const wget = require('wget-improved');
const isnumeric = require('isnumeric');
const fs = require('fs');


async function scrapeValues(date) {
  return new Promise((resolve, reject) => {

      const src = `https://files.ontario.ca/moh-covid-19-report-en-${date}.pdf`;
      const outputTarget = '/tmp/report.pdf';

      const download = wget.download(src, outputTarget);
      download.on('error', function(err) {
        reject(err);
      });

      download.on('end', async function(outputMessage) {

        const pdf = await getDocument(outputTarget);
        const torontoNewCases = await getNewCases(pdf, 'TORONTO');
        const ontarioNewCases = await getNewCases(pdf, 'ONTARIO');

        resolve({
          "torontoNewCases": parseInt(torontoNewCases),
          "ontarioNewCases": parseInt(ontarioNewCases)
        });

      }, function (err) {
        reject(err);
      });

  });
};


async function getDocument(output) {
  const contents = fs.readFileSync(output, {encoding: 'binary'});
  pdfjs.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/build/pdf.worker.js'
  let pdf = await pdfjs.getDocument({data: contents}).promise.then();
  return pdf;
}


async function getNewCases(pdf, healthUnit) {
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const window_size = 4;
    const windows = content.items.map((item, i) => {
        let window = item.str;
        for (j = 0; j < window_size && i + j < content.items.length; j++) {
            window += content.items[i + j].str;
        }
        return window;
    });

    let idx = windows.findIndex(window => window.includes(healthUnit));
    if (idx < 0) { continue; }

    let idx2 = idx;
    let numInts = 0;
    do {
      idx2++;
      if (isnumeric(content.items[idx2].str)) { numInts++; }
    } while (numInts < 2);

    if (content.items[idx2 - 1].str === '-') {
      return '-' + content.items[idx2].str;
    }
    return content.items[idx2].str;

  }

  console.log(`Could not locate page containing ${healthUnit} data.`);
  res.status(400).send(err);
}

module.exports = {
    scrapeValues: scrapeValues
}