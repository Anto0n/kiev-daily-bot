'use strict';

const Telegram = require('telegram-node-bot');
var request = require('request');
var http = require('http');
var parse = require('parse-json-response');
let apiUrl = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22Kiev%2C%20ua%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys';
let idKiev = 703447;

// key for weather bot: 4500114e47fbeff00012c79e3d8011d3

class WeatherController extends Telegram.TelegramBaseController {

    addHandler($) {

    }

    getHandler($) {

    }

    checkHandler($) {

    }

    weatherHandler($) {

        let response = request({
            method: 'GET',
            uri: apiUrl
        }, function (error, response, body){
            let forecast = JSON.parse(body); //full JSON
            forecast = forecast.query.results.channel.item.forecast; //an array of days
            let responseString = forecast[0].date + ", " +  forecast[0].day + "\n"
            + "high: " + convertFtoC(forecast[0].high) + "C  "
            + "low: " + convertFtoC(forecast[0].low) + "C  \n"
            + forecast[0].text;
            $.sendMessage(responseString);
        });

        function convertFtoC(degreeF) {
         return Math.ceil((degreeF-32)*5/9);
        }
    }


    get routes() {
        return {
            'weatherCommand': 'weatherHandler'
        };
    }
}

module.exports = WeatherController;