##Weather Underground record temperature scraper

The scripts here scrape minimum and maximum temperature records from Weather Underground for a single place as well as the "actual" or observed temperatures to verify that "records" match "actual" values in the Weather Underground historical archive. In most cases, Weather Underground's data for "record" temperatures do not match the "actual" temperatures in their database.

[I wrote a blog post](https://derekswingley.com/2016/12/23/weather-underground-historical-temperature-data-comparisons/) describing more of the "why" behind this. This started as me being curious and eventually turned into this repo.

The main entry point for [Weather Underground](https://www.wunderground.com/)'s historical data is [https://www.wunderground.com/history/](https://www.wunderground.com/history/). 

To use, clone this repo then do `npm install`.

Together, the following files will scrape Weather Underground for one location:

- `index.js`
- `temperature-records.js`
- `month-day-strings.js`
- `scrape-write.js`
- `parse-records.js`
- `parse-observed.js`
- `combine.js`
- `tabulate.js`
- `make-table.js`

`index.js` is the main script to run. Call with a station ID and year as arguments like so:

`node index.js KRAP 2016`

It will take a while to run (10-15 minutes) as pages are scraped in serial rather than all at once to avoid hammering wunderground.com. The year isn't all that relevant unless you want pages for a specific year. Since records are pulled out of the pages for a year, they _should_ be consistent across years. It shouldn't make a difference which year is scraped first since the pages are subsequently downloaded for the year in which a record occurred. If a year isn't provided the script defaults to 2000.

`temperature-records.js` orchestrates the scraping and expects a station ID and a year as properties on an object.

`month-day-strings.js` uses [moment.js](http://momentjs.com/) to generate an array of `mm/dd` strings that are then used to build wunderground.com URLs for each day of the year.

`scrape-write.js` does the scraping via [request](https://github.com/request/request) and writes a file for each page requested from wunderground.com. The `scrape` function accepts a directory name as a parameter. If the directory exists, it's assumed that all the data for a station is there and it moves on without re-downloading content.

`parse-records.js` reads the files written by `scrape-write.js`, uses [x-ray](https://github.com/lapwinglabs/x-ray) to parse the HTML and writes records info to a file. The code here is somewhat brittle. If the structure of the Weather Underground pages changes, this code will break.

`parse-observed.js` is similar to `parse-records.js` but pulls out "actual" temperatures from files written by `scrape-write.js`.

`combine.js` expects to be passed an array of three file names. If three file names are given, it reads the files, creates a single object that is can be used to make a table and writes a new file. Before writing the new file, `tabulate.js` adds some additional info.

`tabulate.js` figures out:

- how many days where the "record" and "actual" value match
- how many days have mismatches
- how many days have missing data
- the biggest gap between "record" and "actual" values for highs and low

and adds it to the main object with the all the daily data.

`make-table.js` takes all the data and runs it through a [Handlebars template](http://handlebarsjs.com/) so it's easy to explore. The template file used is [templates/table.handlebars](templates/table.handlebars).

Also included in this repo is a folder named `display` with pages that summarize the state of record temperature data for [ten locations](https://swingley.github.io/wunderground-scraper/display/). I picked the locations semi-randomly (they're from all over the lower-48) as a way to see if I had been unlucky in picking places or if discrepancies in Weather Underground's data are the norm. Unfortunately, it turned out to be the latter. The [ten-station-summary.csv](display/ten-station-summary.csv) file is a quick way to get a general feel for the state of Weather Undergound's historical extreme temperature data.

