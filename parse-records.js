'use strict'
const fs = require('fs')
const Xray = require('x-ray')
const xray = new Xray()

let write = (out, records, cb) => {
  fs.writeFile(out, JSON.stringify(records), (err) => {
    if (err) console.log('error writing json', err)
    cb(out)
  })
}

let parseFilesIn = (folder, out, records, cb) => {
  fs.stat(out, (err, stats) => {
    // Do not process everything again if out file already exists.
    if ( !err ) {
      cb(out)
    } else {
      let parsed = 0
      const containsYear = /\(\d{4}\)/
      fs.readdir(folder, (err, results) => {
        // Ignore hidden files.
        results = results.filter(f => /^\d/.test(f))
        let total = results.length
        results.forEach((when) => {
          let file = folder + when
          fs.readFile(file, (err, content) => {
            when = when.replace('.html', '')
            // Pull all <td>'s from the table with historical info.
            xray(content, '#historyTable', [{
              info: ['td']
            }])((err, obj) => {
              if ( obj && obj[0].info.length > 0 ) {
                // Keep track of number of records found, stop after two.
                let found = 0
                for ( let v of obj[0].info ) {
                  // In wunderground html, records look like:
                  // 85 °F (1943) and 35 °F (1903)
                  // If cell has a year, it's a record temperature.
                  // Pull out the temp and year.
                  if ( containsYear.test(v) ) {
                    let val = v.trim().split('\n')
                    let temp = +val[0].replace(' °F', '')
                    let year = +val[1].replace(/\(|\)/g, '')
                    if ( found === 0 ) {
                      records[when] = { max: { value: temp, year: year } }
                    } else {
                      records[when].min = { value: temp, year: year }
                    }
                    found += 1
                    if ( found === 2 ) {
                      break
                    }
                  }
                }
                parsed += 1
                if ( parsed == total) {
                  write(out, records, cb)
                }
              }
            })
          })
        })
      })
    }
  })
}

module.exports = parseFilesIn
