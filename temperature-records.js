'use strict'
const fs = require('fs')
const days = require('./month-day-strings')
const scrape = require('./scrape-write')
const parseRecords = require('./parse-records')
const parseObserved = require('./parse-observed')
const combine = require('./combine')
const makeTable = require('./make-table')

const records = (options) => {
  console.log('temperature-records::options', options)
  let station = options.station || 'KBIS'
  let year = options.year
  let dates
  if ( options.days ) {
    dates = days.slice(0, options.days).map(d => `${year}/${d}`)
  } else {
    dates = days.map(d => `${year}/${d}`)
  }
  let out = `data-${station}-${year}/`
  let all = {}

  scrape(station, dates, out, 'days/', 0, (folder) => {
    console.log('Finished first scrape', folder)

    let outRecords = out + 'all-records.json'
    parseRecords(folder, outRecords, {}, (recordsFile) => {
      all.records = recordsFile
      fs.readFile(recordsFile, (err, content) => {
        content = JSON.parse(content)

        let maxDays = Object.keys(content).map(k => {
          return k.replace(/\d{4}/, content[k].max.year).replace(/-/g, '/')
        })
        scrape(station, maxDays, out, 'highs/', 0, (highsFolder) => {
          console.log('Finished highs scrape.', highsFolder)
          let allHighs = out + 'all-highs.json'
          parseObserved(highsFolder, allHighs, 'max', {}, (f) => {
            all.highs = f
            combine(station, year, all, out, (err, outFile, temperatures) => {
              makeTable(station, year, '', temperatures)
            })
          })
        })

        let minDays = Object.keys(content).map(k => {
          return k.replace(/\d{4}/, content[k].min.year).replace(/-/g, '/')
        })
        scrape(station, minDays, out, 'lows/', 0, (lowsFolder) => {
          console.log('Finished lows scrape.', lowsFolder)
          let allLows = out + 'all-lows.json'
          parseObserved(lowsFolder, allLows, 'min', {}, (f) => {
            all.lows = f
            combine(station, year, all, out, (err, outFile, temperatures) => {
              makeTable(station, year, '', temperatures)
            })
          })
        })

      })
    })
  })
}

module.exports = records
