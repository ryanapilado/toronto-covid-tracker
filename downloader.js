const wget = require('wget-improved');
const fs = require('fs');


async function download(date) {
  return new Promise((resolve, reject) => {

    const src = `https://files.ontario.ca/moh-covid-19-report-en-${date}.pdf`;
    const outputTarget = '/tmp/report.pdf';

    const downloader = wget.download(src, outputTarget);
    downloader.on('error', function(err) {
      reject(err);
    });

    downloader.on('end', async function(outputMessage) {
      const file = fs.readFileSync(outputTarget, {encoding: 'binary'});
      resolve(file);
    }, function (err) {
      reject(err);
    });

  });
};


module.exports = {
    download: download
}
