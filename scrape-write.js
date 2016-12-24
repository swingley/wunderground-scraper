'use strict'
const fs = require('fs')
const request = require('request')

// Keep track of scraping errors. Stop after 10 errors occur.
let errorCount = 0
let write = (body, out, d) => {
  const fileName = out + d + '.html'
  fs.writeFile(fileName, body, (err) => {
    if ( err ) { console.log('write failed', d, err) }
  })
}

let scrapeDay = (station, days, out, count, cb) => {
  const base = `http://www.wunderground.com/history/airport/${station}/`
  const path = `${days[count]}/DailyHistory.html`
  const url = base + path
  request(url, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      write(body, out, days[count].replace(/\//g, '-'))
    } else {
      console.log('error getting', days[count], error)
      errorCount += 1
      if ( errorCount < 10 ) {
        // Try again.
        console.log(`Trying ${days[count]} again.`)
        scrapeDay(station, days, out, count, cb)
        return
      } else {
        console.log('Too many errors. Stopping.')
        return
      }
    }
    count += 1
    if (count < days.length) {
      scrapeDay(station, days, out, count, cb)
    } else {
      cb(out)
    }
  })
}

let scrape = (station, days, out, subFolder, count, cb) => {
  // Keep track of completed requests.
  // Make sure the output folder exists.
  fs.mkdir(out, (err) => {
    out = out + subFolder
    fs.mkdir(out, (err) => {
      if ( err && err.code === 'EEXIST' ) {
        console.log('Folder exists, assuming data is already there.')
        cb(out)
      } else {
        scrapeDay(station, days, out, count, cb)
      }
    })
  })
}

module.exports = scrape