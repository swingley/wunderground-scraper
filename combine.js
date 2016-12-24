'use strict'
const fs = require('fs')
const tabulate = require('./tabulate')

const getColor = (record, observed) => {
  var c = 'noop'
  if (record === observed) {
    c = 'match'
  }
  if (record < observed || record > observed) {
    c = 'miss'
  }
  return c
}

const combine = (station, year, files, outFolder, cb) => {
  // Expected order is allRecords, observedHighs, observedLows.
  let keys = Object.keys(files)
  if ( keys.length !== 3 ) {
    return
  }
  let content = {}
  let combined = {}
  keys.forEach(f => {
    content[f] = JSON.parse(fs.readFileSync(files[f]))
  })
  // All records.
  for (let p in content.records ) {
    let record = content.records[p]
    let when = p.slice(5)
    combined[when] = {
        rHigh: {
          value: record.max.value,
          year: record.max.year,
          urlDate: '',
          station: station
        },
        rLow: {
          value: record.min.value,
          year: record.min.year,
          urlDate: '',
          station: station
        }
      }
    combined[when].all = [{
      value: when,
      year: '',
      css: '',
      urlDate: '',
      station: station
    }]
    combined[when].all[1] = combined[when].rHigh
    combined[when].all[3] = combined[when].rLow
  }
  // Observed highs.
  for (let h in content.highs ) {
    let year = h.slice(0, 4)
    let when = h.slice(5)
    let high = content.highs[h]
    let recordHigh = combined[when].all[1].value
    let css = getColor(recordHigh, high)
    combined[when].oHigh = {
      value: high,
      year: year,
      urlDate: h,
      css: css,
      station: station
    }
    combined[when].all[1].css = css
    combined[when].all[2] = combined[when].oHigh
  }
  // Observed lows.
  for (let l in content.lows ) {
    let year = l.slice(0, 4)
    let when = l.slice(5)
    let low = content.lows[l]
    let recordLow = combined[when].all[3].value
    let css = getColor(recordLow, low)
    combined[when].oLow = {
      value: low,
      year: year,
      urlDate: l,
      css: css,
      station: station
    }
    combined[when].all[3].css = css
    combined[when].all[4] = combined[when].oLow
  }
  let days = Object.keys(combined).sort()
  let temperatures = {}
  temperatures.data = days.map(d => {
    return combined[d].all
  })
  temperatures.meta = tabulate(station, year, temperatures)
  let temperaturesString = JSON.stringify(temperatures, null, 2)
  let outFile = outFolder + 'temperatures.json'
  fs.writeFile(outFile, temperaturesString, (err) => {
    console.log('Wrote combined file')
    cb(null, outFile, temperatures)
  })
}

module.exports = combine
