'use strict';
const Telegram = require('telegram-node-bot');
var request = require('request');
var http = require('http');
var parse = require('parse-json-response');
var dateUtils = require('../utils/dateUtils');
let apiUrl = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22Kiev%2C%20ua%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys';
let owmMainUrl = 'http://api.openweathermap.org/data/2.5/forecast';
let idKiev = '703448';
let owmKey = '4500114e47fbeff00012c79e3d8011d3';

// key for openweathermap: 4500114e47fbeff00012c79e3d8011d3

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


    /**
     * This method gets weather forecast for 1 day(today)
     * gets list for 30 days or above as ARRAY, and just get [0] element and parse it
     * @param $
     */
    weatherHandlerOpenWeatherMap($) {
        let response = request({
            method: 'GET',
            uri: (owmMainUrl + "?" +
                "id=" + idKiev + "&" +
                "appid=" + owmKey +
                "&units=metric")
        }, function (error, response, body){
            let forecast = JSON.parse(body); //full JSON
            let forecastItem = forecast.list[0];

            let date = dateUtils.convertOWMDate(forecast.list[0].dt_txt);
            let minT = forecastItem.main.temp_min;
            let maxT = forecastItem.main.temp_max;

            let responseString = date + "\n"
                + "high: " + Math.ceil(minT) + "C  "
                + "low: " + Math.ceil(maxT) + "C  \n"
                + forecastItem.weather[0].main;
            $.sendMessage(responseString);
        });

        function convertFtoC(degreeF) {
            return Math.ceil((degreeF-32)*5/9);
        }
    }



    get routes() {
        return {
            'weatherCommand': 'weatherHandler',
            'openWeatherMap': 'weatherHandlerOpenWeatherMap'
        };
    }
}

module.exports = WeatherController;