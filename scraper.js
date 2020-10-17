const pdfjs = require('pdfjs-dist/es5/build/pdf.js');
const isnumeric = require('isnumeric');


function scrapeValues(file) {
  return new Promise(async (resolve, reject) => {

    const torontoNewCases = await getNewCases(file, 'TOTAL TORONTO');
    const ontarioNewCases = await getNewCases(file, 'TOTAL ONTARIO');

    resolve({
      "torontoNewCases": parseInt(torontoNewCases),
      "ontarioNewCases": parseInt(ontarioNewCases)
    });

  });
};


async function getNewCases(file, healthUnit) {

  pdfjs.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/build/pdf.worker.js'
  let pdf = await pdfjs.getDocument({data: file}).promise;

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
    idx += window_size;

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
}

module.exports = {
    scrapeValues: scrapeValues
}
