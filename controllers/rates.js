'use strict';

const Telegram = require('telegram-node-bot');
var request = require('request');
var http = require('http');
var parse = require('parse-json-response');
let yesterdayRates  = "[{\"ccy\":\"EUR\",\"base_ccy\":\"UAH\",\"buy\":\"30.00000\",\"sale\":\"31.30000\"},{\"ccy\":\"RUR\",\"base_ccy\":\"UAH\",\"buy\":\"0.44500\",\"sale\":\"0.47000\"},{\"ccy\":\"USD\",\"base_ccy\":\"UAH\",\"buy\":\"26.40000\",\"sale\":\"26.60000\"},{\"ccy\":\"BTC\",\"base_ccy\":\"USD\",\"buy\":\"4122.9786\",\"sale\":\"4556.9764\"}]";
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
                // yesterdayRates = todayRates;
                todayRates = parsedJson;
                updateDate = new Date();
                return $.sendMessage(makePrivatBankRateString(parsedJson));
            });
        }

        /**
         * Create string from json
         * @param json
         * @returns {string}
         */
        function makePrivatBankRateString(json) {

            let kek = JSON.parse(yesterdayRates);
            let answerString = "";
            for (let i = 0; i < json.length; i++) {
                let spaces = "\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0";
                let curr = json[i].ccy;
                let buy = parseFloat(json[i].buy).toFixed(2);
                let sale = parseFloat(json[i].sale).toFixed(2);
                let lastBuy = parseFloat(kek[i].buy).toFixed(2);
                let lastSale = parseFloat(kek[i].sale).toFixed(2);
                let currCalc = (curr + ": " + buy + " / " + sale);
                let buyDiff = parseFloat(buy) - parseFloat(lastBuy);
                let saleDiff = parseFloat(sale) - parseFloat(lastSale);
                let difBuyString = buyDiff === 0.00 ? spaces + buyDiff.toFixed(2): buyDiff > 0 ? spaces + "\u2191" + buyDiff.toFixed(2) : spaces + "\u2193" + buyDiff.toFixed(2);
                let difSaleString = saleDiff === 0.00 ? spaces + saleDiff.toFixed(2): saleDiff > 0 ? "\u2191" + saleDiff.toFixed(2) : "\u2193" + saleDiff.toFixed(2);
                let changeString = "" + difBuyString + " / " + difSaleString;
                answerString += currCalc + "\n" + changeString + "\n";
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