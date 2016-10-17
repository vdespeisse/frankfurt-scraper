var Nightmare = require('nightmare')
var nightmare = Nightmare({ show: false , width : 1024, height : 800})
var fs= require("fs")
var _url = "http://en.boerse-frankfurt.de/"
var _isin_list = ["FR0000121147","XS1210362239","XS1020736069"]


main = function(url, isin_list) {
  var data = scrape(url, isin_list)

}

writeCsv = function(data) {
  console.log("starting writeCsv")
  var csvData = []

  csvData.push(Object.keys(data))
  data.date.map( function(d,i) {var temp = []; Object.keys(data).map( k => temp.push(data[k][i])); csvData.push(temp)})

  var lineArray = [];
  csvData.forEach(function (infoArray, index) {
      var line = infoArray.join(",");
      // lineArray.push(index == 0 ? "data:text/csv;charset=utf-8,\n" + line : line);
      lineArray.push(line)
  })


  var csvContent = lineArray.join("\n")

  fs.writeFile("./output/output.txt", csvContent);

  console.log('done')
}

scrape = function(url, isin_list) {
  data = {}
  var nm = nightmare
    .goto(url)
    // .wait(4000)
    // .cookies.clearAll()
  index = 0
  init = true
  stopIndex = isin_list.length
  searchFn = function(isin, field) {
    var search = nm
      .click('input[name="_search"]')
      .insert('input[name="_search"]', isin)
      .click('.form-submit')
      .wait(1000)
      // .visible('#OpenMarketDisclamer > div:nth-child(3) > div > div > button:nth-child(1)')
      // .click('#OpenMarketDisclamer > div:nth-child(3) > div > div > button:nth-child(1)')
      // .wait(1000)
      .click('a[data-period="OneYear"]')
      .evaluate(function (field) {
        // console.log($("#DetailChart").highcharts().series[0])
        return $("#DetailChart").highcharts().series[0][field]
      }, field)
      return search
  }
  searchEnd = function(s) {
    s.end()
      .then(function(result) {
        console.log("wtf")
        writeCsv(data)
      })
  }

  searchIteration = function(s) {
    s.then(function (result) {
      key = (index===0) ? 'date' : isin_list[index-1]
      data[key] = result

      console.log(result)
      console.log("index1",index)
      if (index === stopIndex) {searchEnd(s)
      } else {
        searchIteration(searchFn(isin_list[index], 'yData'))
        index ++
      }


    })

  }

  s = searchFn(isin_list[index], 'xData')
  searchIteration(s)

}





scrape(_url,_isin_list)
