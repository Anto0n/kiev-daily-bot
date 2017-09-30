'use strict';

const Telegram = require('telegram-node-bot');
var request = require('request');
var http = require('http');
var parse = require('parse-json-response');
let yesterdayRates;
let todayRates;
let updateDate;
let apiUrl = 'https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5';
let path = require('../data/chatStorage.json');

class RatesController extends Telegram.TelegramBaseController {

    addHandler($) {
        let todo = $.message.text.split(' ').slice(1).join(' ');

        if (!todo) return $.sendMessage('Sorry, please pass a todo item.');

        $.getUserSession('todos')
            .then(todos => {
                if (!Array.isArray(todos)) $.setUserSession('todos', [todo]);
                else $.setUserSession('todos', todos.concat([todo]));
                $.sendMessage('Added new todo!');
            });
    }

    getHandler($) {
        $.getUserSession('todos').then(todos => {
            $.sendMessage(this._serializeList(todos), {parse_mode: 'Markdown'});
        });
    }

    checkHandler($) {
        let index = parseInt($.message.text.split(' ').slice(1)[0]);
        if (isNaN(index)) return $.sendMessage('Sorry, you didn\'t pass a valid index.');

        $.getUserSession('todos')
            .then(todos => {
                if (index >= todos.length) return $.sendMessage('Sorry, you didn\'t pass a valid index.');
                todos.splice(index, 1);
                $.setUserSession('todos', todos);
                $.sendMessage('Checked todo!');
            });
    }

    ratesHandler($) {

        console.log(yesterdayRates);
        console.log(todayRates);
        console.log(updateDate);

        checkDate() ? $.sendMessage(makePrivatBankRateString(todayRates)) :
           getRatesFromServer();

        /**
         * Checks on match today date and last update dater
         * @returns {boolean}
         */
        function checkDate() {
            let today = new Date();
            return updateDate !== undefined
                && updateDate.getDay() === today.getDay()
                && updateDate.getMonth() === today.getMonth()
                && updateDate.getYear() === today.getYear();
        }

        /**
         * Get json from server API
         */
        function getRatesFromServer() {
            let response = request({
                method: 'GET',
                uri: apiUrl,
            }, function (error, response, body) {
                let parsedJson = JSON.parse(body);
                yesterdayRates = todayRates;
                todayRates = parsedJson;
                updateDate = new Date();
                return  $.sendMessage(makePrivatBankRateString(parsedJson));
            });
        }

        /**
         * Create string from json
         * @param json
         * @returns {string}
         */
        function makePrivatBankRateString(json){
            let answerString = "";
            for (let i = 0; i < json.length; i++) {
                let curr = json[i].ccy;
                let buy = parseFloat(json[i].buy).toFixed(2);
                let sale = parseFloat(json[i].sale).toFixed(2);
                let currCalc = (curr + ": " + buy + " / " + sale);
                answerString += currCalc + "\n";
            }
            return answerString.trim();
        }
    }


    get routes() {
        return {
            'addCommand': 'addHandler',
            'getCommand': 'getHandler',
            'checkCommand': 'checkHandler',
            'ratesCommand': 'ratesHandler'
        };
    }

    _serializeList(todoList) {
        let serialized = '*Your Todos:*\n\n';
        todoList.forEach((t, i) => {
            serialized += `*${i}* - ${t}\n`;
        });
        return serialized;
    }
}

module.exports = RatesController;