const { readReport } = require("..");
const fs = require("fs")
const { getMockReq, getMockRes } = require('@jest-mock/express');


const caseData = JSON.parse(fs.readFileSync('tests/caseData.json'));


test.each(caseData)("use cache: %s", async (date, torontoNewCases, ontarioNewCases) => {
  const req = getMockReq({ query: {date: date} });
  const { res } = getMockRes();
  await readReport(req, res);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.send).toHaveBeenCalledWith(
    expect.objectContaining({
      'torontoNewCases': torontoNewCases,
      'ontarioNewCases': ontarioNewCases
    })
  );
})

test.each(caseData)("no cache: %s", async (date, torontoNewCases, ontarioNewCases) => {
  const req = getMockReq({ query: {date: date, useCache: true} });
  const { res } = getMockRes();
  await readReport(req, res);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.send).toHaveBeenCalledWith(
    expect.objectContaining({
      'torontoNewCases': torontoNewCases,
      'ontarioNewCases': ontarioNewCases
    })
  );
})
