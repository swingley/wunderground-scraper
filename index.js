'use strict'
const temperatureRecords = require('./temperature-records')

// Example usage:
// node index.js KBNO 2016
let station = process.argv[2]
let year = process.argv[3] || 2000

if ( !station ) {
  console.log('No station ID provided. Call this script with a station ID as an argument.')
  process.exit()
}
console.log(`\nStation, year:  ${station}, ${year}`)

let info = {
  station: station,
  year: year
}

temperatureRecords(info)
