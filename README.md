# Toronto COVID-19 New Cases

Simple Google Cloud Function which retrieves the daily new cases of COVID-19 in Toronto
and in Ontario, as reported in the province's daily epidemiological update.

### Usage

Sample query string:
`?date=YYYY-MM-DD`

Sample response:
```
{
    "torontoNewCases": 6,
    "ontarioNewCases": 76
}
```

### Notes

This only works for the current report format, which reports daily new cases.
The Ontario government changed the format sometime in early June. Reports prior
to that date do not include daily new cases, so there is no data in those reports for
the code to retrieve.

Negative numbers for Toronto are occasionally reported due to corrections and
updates from Toronto Public Health.
