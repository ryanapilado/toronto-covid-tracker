const wget = require('wget-improved');
const fs = require('fs');
const { Storage } = require('@google-cloud/storage');


function download(date) {
  return new Promise(async (resolve, reject) => {

    const outputTarget = '/tmp/report.pdf';
    const filename = `${date}.pdf`;

    // first try to retrieve file from storage
    getFileFromStorage(filename, outputTarget)
      .then(file => resolve(file))

      // if file not found in storage, download
      .catch(err => {

        const url = `https://files.ontario.ca/moh-covid-19-report-en-${date}.pdf`;
        const downloader = wget.download(url, outputTarget);
        downloader.on('error', function(err) {
          reject(err);
        });

        downloader.on('end', function(outputMessage) {
          const file = fs.readFileSync(outputTarget, {encoding: 'binary'});
          writeFileToStorage(filename, outputTarget);
          resolve(file);
        }, function (err) {
          reject(err);
        });
      });
  });
};

async function getFileFromStorage(filename, outputTarget) {
  const storage = new Storage();
  const bucket = storage.bucket(process.env.BUCKET);
  const storageFile = bucket.file(filename);
  return storageFile.exists()
    .then(data => storageFile.download({destination: outputTarget}))
    .then(data => new Promise(fs.readFileSync(outputTarget, {encoding: 'binary'})))
    .catch(err => console.err("Failed to download file from storage."));
}

async function writeFileToStorage(filename, outputTarget) {
  const storage = new Storage();
  const bucket = storage.bucket(process.env.BUCKET);
  const storageFile = bucket.file(filename);
  fs.createReadStream(outputTarget)
    .pipe(storageFile.createWriteStream())
    .on('error', (err) => console.log(err))
    .on('finish', () => console.log('Storage upload complete'))
}


module.exports = {
    download: download
}
