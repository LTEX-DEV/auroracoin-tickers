var express = require("express")
var request = require('request')
var morgan  = require('morgan')
var bodyParser = require('body-parser')
var compression = require('compression')

var app = express()


var fiat_URL = "https://apiv2.bitcoinaverage.com/indices/global/ticker/short?crypto=BTC&fiat=AUD,BRL,CAD,CHF,CNY,DKK,EUR,GBP,IDR,ILS,ISK,JPY,MXN,NOK,NZD,PLN,RUB,SEK,SGD,TRY,UAH,USD,ZAR";
var aur_URL = "https://api.coingecko.com/api/v3/coins/auroracoin/tickers";
var currencies = [
    {
        "code": "AUD",
        "name": "Australian Dollar"
      },
      {
        "code": "MXN",
        "name": "Mexican Peso"
      },
      {
        "code": "NOK",
        "name": "Norwegian Krone"
      },
      {
        "code": "NZD",
        "name": "New Zealand Dollar"
      },
      {
        "code": "PLN",
        "name": "Polish Zloty"
      },
      {
        "code": "RUB",
        "name": "Russian Ruble"
      },
      {
        "code": "SEK",
        "name": "Swedish Krona"
      },
      {
        "code": "SGD",
        "name": "Singapore Dollar"
      },
      {
        "code": "TRY",
        "name": "Turkish Lira"
      },
      {
        "code": "UAH",
        "name": "Ukrainian Hryvnia"
      },
      {
        "code": "ZAR",
        "name": "South African Rand"
      },
      {
        "code": "BRL",
        "name": "Brazilian Real"
      },
      {
        "code": "CAD",
        "name": "Canadian Dollar"
      },
      {
        "code": "AUD",
        "name": "Australian Dollar"
      },
      {
        "code": "CNY",
        "name": "Chinese Yuan"
      },
      {
        "code": "CHF",
        "name": "Swiss Franc"
      },
      {
        "code": "DKK",
        "name": "Danish Krone"
      },
      {
        "code": "USD",
        "name": "US Dollar"
      },
      {
        "code": "EUR",
        "name": "Eurozone Euro"
      },
      {
        "code": "GBP",
        "name": "Pound Sterling"
      },
      {
        "code": "JPY",
        "name": "Japanese Yen"
      },
      {
        "code": "IDR",
        "name": "Indonesian Rupiah"
      },
      {
        "code": "ILS",
        "name": "Israeli Shekel"
      },
      {
        "code": "ISK",
        "name": "Icelandic Króna"
      },
  ]


function allowCrossDomain(req, res, next) {
  res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGINS)
  res.header('Access-Control-Allow-Methods', 'GET')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With')

  next()
}

app.use(morgan())
app.use(allowCrossDomain)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
//app.use(compression())



app.get('/', function(req, res,next){


var aurToBtc = function(callback) {
    request({
        method: 'GET',
        uri: aur_URL
       
      }, function(err, response, body){
        res.statusCode = response.statusCode
    
        if (res.statusCode !== 200 ) {
            console.error(body)
            return callback(err)
          
        }
        body = JSON.parse(body);
        var result = body.tickers[0].last;
        callback(null,result);
      });
}

var getExchangeRates = function(callback) {

    request({
        method: 'GET',
        uri: fiat_URL
        
    }, function(err, response, body){
        res.statusCode = response.statusCode
    
        if (res.statusCode !== 200 ) {
            console.error(body)
            return callback(err)
          
        }
        body = JSON.parse(body);

        var rates = {}
        currencies.forEach(function(currency){
          rates[currency.code] = body["BTC"+currency.code].last
        })
        

        callback(null,rates);
      });


}

aurToBtc(function(err, aurRate){
    if(err) res.status(404).json(err);

    getExchangeRates(function(err, rates){
      if(err) res.status(404).json(err);
      resp = [];

      for(var c in currencies) {
        var tempObj = {};
        tempObj["code"]=currencies[c].code;
        tempObj["name"]=currencies[c].name;
        tempObj["rate"]=rates[currencies[c].code] * aurRate;

        resp[c]=tempObj;
        
      }
      resp.push({code:"BTC",name:"Bitcoin",rate:aurRate});
        

      res.json(resp);
    })
  });


});



app.listen(process.env.PORT || 9000);