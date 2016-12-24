'use strict'
const fs = require('fs')
const Handlebars = require('handlebars')

let tableSource = fs.readFileSync('./templates/table.handlebars', 'utf8')
let tableTemplate = Handlebars.compile(tableSource)
let base = 'http://www.wunderground.com/history/airport/';
let end = '/DailyHistory.html';
let cols = ['Date', 'Record High', 'Actual High', 'Record Low', 'Actual Low' ];

Handlebars.registerHelper('buildLink', (d) => {
  var year = d.year ? `(${d.year})` : '';
  year = d.value + year;
  var link;
  if (d.urlDate) {
    link = new Handlebars.SafeString(`<a href="${base}${d.station}/${d.urlDate.replace(/-/g, '/')}${end}">${year}</a>`);
  } else {
    link = year;
  }
  return link;
})

module.exports = (station, year, out, temperatures) => {
  const templatePath = 'templates/'
  const outFolder = out + 'display/'
  temperatures.cols = cols
  fs.mkdir(outFolder, () => {
    let html = tableTemplate(temperatures)
    fs.writeFile(outFolder + `${station}-${year}.html`, html, (err) => {
      console.log(`Wrote ${station}.html in`, outFolder)
    })
  })
}
