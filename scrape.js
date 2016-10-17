var d3 = require("./lib/d3v4.js")
var webpage = require("webpage"),
    fs = require("fs")

var system = require('system');



var debug = false,
    _url = "http://en.boerse-frankfurt.de/",
    searchTerm = "mongodb vs couchdb",
    isin = "FR0000121147"

var createPage = function () {
  page = webpage.create()
  page.settings.userAgent = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.106 Safari/537.36"
  page.customHeaders = {
    "Accept-Language" : "en"}
  page.viewportSize = { width: 1440, height: 900 };
  // page.onConsoleMessage = function(msg) {
  //     system.stderr.writeLine('console: ' + msg);
  // };

  //good to debug and abort request, we do not wish to invoke cause they slow things down (e.g. tons of plugins)
  page.onResourceRequested = function (requestData, networkRequest) {
      // console.log(["onResourceRequested", JSON.stringify(networkRequest), JSON.stringify(requestData)]);
      //in case we do not want to invoke the request
      //networkRequest.abort();
  };

  //what dd we get
  page.onResourceReceived = function (response) {
      // console.log(["onResourceReceived", JSON.stringify(response)]);
  };

  //what went wrong
  page.onResourceError = function (error) {
      // console.log(["onResourceError", JSON.stringify(error)]);
  };

  page.onLoadStarted = function() {
      console.log("loading page...");
  };

  page.onLoadFinished = function(status) {
      var currentUrl = page.evaluate(function() {
          return window.location.href;
      });
      console.log("onLoadFinished", currentUrl, status);
  };

  return page;
}



search = function(page, url, isin) {
  console.log("opening page...")
  page.open(url, function () {
     setTimeout(function () {

      // form = page.evaluate( function () {
      //   return document.getElementsByName("mmssearch")[0]
      // } )

      // input = page.evaluate( function () {
      //   return document.getElementsByName("_search")[0]
      // } )

      page.evaluate( function () {
        form = document.getElementsByName("mmssearch")[0]
        input = document.getElementsByName("_search")[0]
        input.value = "FR0000121147"
        form.submit()
      } )

      setTimeout(function() {extract()},3000)



      // input.value = isin
      // form.submit()
      //
      // var series =page.evaluate(function(){
      //   return $("#DetailChart").highcharts().series
      // })
    },2000)
  })
}
extract = function() {
  var next = page.evaluate(function () {
        btn = document.querySelector('a[data-period="OneYear"]')
        var ev = document.createEvent("MouseEvent");
        ev.initEvent("click", true, true);
        btn.dispatchEvent(ev);
    });

    setTimeout(function() {
      xData =page.evaluate(function(){
        return $("#DetailChart").highcharts().series[0].xData
      })
      yData =page.evaluate(function(){
        return $("#DetailChart").highcharts().series[0].yData
      })
    }, 2000)



    setTimeout(function() {
      // console.log(series[0].xData)
      var data = xData.map(function(d,i) { return [d,yData[i]]})


      var lineArray = [];
      data.forEach(function (infoArray, index) {
          var line = infoArray.join(",");
          lineArray.push(index == 0 ? "data:text/csv;charset=utf-8," + line : line);
      });
      var csvContent = lineArray.join("\n");
      fs.write("output.txt", csvContent, 'w');

      page.render("tt.png")
      setTimeout(phantom.exit(),10000)
    },8000)
}
page = createPage()
search(page, _url, isin)
