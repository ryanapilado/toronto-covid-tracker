const scraper = require("../scraper.js")
const fs = require("fs")


let caseData = JSON.parse(fs.readFileSync('tests/caseData.json'));


test.each(caseData)("%s", (date, torontoNewCases, ontarioNewCases) => {
  return scraper.scrapeValues(date).then( scrapedData => {
    expect(scrapedData).toHaveProperty('torontoNewCases', torontoNewCases);
    expect(scrapedData).toHaveProperty('ontarioNewCases', ontarioNewCases);
  })}
)
