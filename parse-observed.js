'use strict'
const fs = require('fs')
const Xray = require('x-ray')
const xray = new Xray()

const containsYear = /\(\d{4}\)/
const regex = {
  'min': /^Min[\s\S]*?(-\d{1,3}|\d{1,3})/i,
  'max': /^Max[\s\S]*?(-\d{1,3}|\d{1,3})/i
}

let write = (out, records, cb) => {
  fs.writeFile(out, JSON.stringify(records), (err) => {
    if (err) console.log('error writing json', err)
    cb(out)
  })
}

let parse = (folder, out, value, records, cb) => {
  fs.stat(out, (err, stats) => {
    // Do not process everything again if out file already exists.
    if ( !err ) {
      cb(out)
    } else {
      fs.readdir(folder, (err, results) => {
        // Ignore hidden files.
        results = results.filter(f => /^\d/.test(f))
        let parsed = 0
        let total = results.length
        results.forEach((when) => {
          let file = folder + when
          fs.readFile(file, (err, content) => {
            when = when.replace('.html', '')
            xray(content, '#historyTable', [{
              rows: ['tr']
            }])((err, obj) => {
              // Many old records don't have corresponding data on wunderground.com.
              // First row of the table has column names. If 'Actual' isn't there
              // then the data is missing.
              if (obj[0].rows[0].indexOf('Actual') === -1) {
                records[when] = 'unk'
              } else {
                // Find the 'Actual' temperature.
                // It's the first number in the line that starts with 'Max' or 'Min'.
                let temp = regex[value]
                for (let row of obj[0].rows) {
                  let record = row.trim().match(temp)
                  if (record && record.length > 1) {
                    // console.log('record', when, record[1])
                    records[when] = +record[1]
                    break
                  }
                }
              }
              parsed += 1
              if (parsed == total) {
                // console.log('records', records)
                console.log('\nrecords total', Object.keys(records).length)
                write(out, records, cb)
              }
            })
          })
        })
      })
    }
  })
}

module.exports = parse
