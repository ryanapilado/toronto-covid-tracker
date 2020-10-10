const wget = require('wget-improved');
const fs = require('fs');
const { Storage } = require('@google-cloud/storage');


function download(date) {
  return new Promise(async (resolve, reject) => {

    const src = `https://files.ontario.ca/moh-covid-19-report-en-${date}.pdf`;
    const outputTarget = '/tmp/report.pdf';

    const downloader = wget.download(src, outputTarget);
    downloader.on('error', function(err) {
      reject(err);
    });

    downloader.on('end', function(outputMessage) {
      const file = fs.readFileSync(outputTarget, {encoding: 'binary'});
      writeFileToStorage(outputTarget, date);
      resolve(file);
    }, function (err) {
      reject(err);
    });
  });
};

async function writeFileToStorage(path, date) {
    const storage = new Storage();
    const bucket = storage.bucket('toronto-covid-tracker-reports');
    const storageFile = bucket.file(`${date}.pdf`);
    fs.createReadStream(path)
      .pipe(storageFile.createWriteStream())
      .on('error', (err) => console.err(err))
      .on('finish', () => console.log('Storage upload complete'))
}


module.exports = {
    download: download
}
