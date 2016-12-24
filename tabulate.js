'use strict'

const tabulate = (station, year, content) => {
  let results = {
    station: station,
    year: year,
    conflictingHighs: 0,
    matchingHighs: 0,
    missingHighs: { count: 0, days: [] },
    conflictingLows: 0,
    matchingLows: 0,
    missingLows: { count: 0, days: [] },
    biggestDifferenceHigh: { day: null, value: 0 },
    biggestDifferenceLow: { day: null, value: 0 }
  }
  content.data.forEach(day => {
    // Co-erce to numbers. 
    // Depending when the data was generated, missing values are "-" or "unk".
    let highRecord = +day[1].value
    let highActual = +day[2].value
    let lowRecord = +day[3].value
    let lowActual = +day[4].value
    // Count instances of different record/actual temperatures.
    if ( highRecord && highActual ) {
      let diffHigh = Math.abs(Math.abs(day[1].value) - Math.abs(day[2].value))
      if ( diffHigh !== 0 ) {
        results.conflictingHighs += 1
      } else {
        results.matchingHighs += 1
      }
      // Track biggest differences in record/actual temperatures.
      if ( diffHigh > results.biggestDifferenceHigh.value ) {
        results.biggestDifferenceHigh.value = diffHigh
        results.biggestDifferenceHigh.day = day[0].value
      }
    } else {
      results.missingHighs.count += 1
      results.missingHighs.days.push(day[2].urlDate)
    }
    // Count instances of different record/actual temperatures.
    if ( lowRecord && lowActual ) {
      let diffLow = Math.abs(Math.abs(day[3].value) - Math.abs(day[4].value))
      if ( diffLow !== 0 ) {
        results.conflictingLows += 1
      } else {
        results.matchingLows += 1
      }
      // Track biggest differences in record/actual temperatures.
      if ( diffLow > results.biggestDifferenceLow.value ) {
        results.biggestDifferenceLow.value = diffLow
        results.biggestDifferenceLow.day = day[0].value
      }
    } else {
      results.missingLows.count += 1
      results.missingLows.days.push(day[4].urlDate)
    }
  })
  return results
}

module.exports = tabulate
