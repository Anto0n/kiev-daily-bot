'use strict';

const Telegram = require('telegram-node-bot');
var request = require('request');
var http = require('http');
var parse = require('parse-json-response');


class TodoController extends Telegram.TelegramBaseController {
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
        let apiUrl = 'https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5';
        let path = require('../data/chatStorage.json');

        let response = request({
            method: 'GET',
            uri: apiUrl,
        }, function (error, response, body) {
            let parsedJson = JSON.parse(body);
            let parsedLocalJson = path.USER_1940955_rates;

            let euroString = null;
            let usdString = null;
            let rurString = null;
            let btcString = null;

            // $.getChatSession('rates')
            //     .then(rates => {
            //         if (!Array.isArray(rates)) $.setChatSession('rates', parsedJson);
            //         else $.setChatSession('rates', rates.concat(JSON.stringify(parsedJson)));
            //     });

            // for (let i = 0; i < parsedLocalJson.length; i++) {
            //
            //     let curr = parsedLocalJson[i].ccy;
            //     let buy = parseFloat(parsedLocalJson[i].buy).toFixed(2);
            //     let sale = parseFloat(parsedLocalJson[i].sale).toFixed(2);
            //     let currCalc = (curr + ": " + buy + " / " + sale);
            //
            //
            //     switch (curr) {
            //         case "EUR":
            //             euroString = currCalc;
            //             console.log(euroString);
            //             break;
            //         case "USD":
            //             usdString = currCalc;
            //             console.log(usdString);
            //             break;
            //         case "RUR":
            //             rurString = currCalc;
            //             console.log(rurString);
            //             break;
            //         case "BTC":
            //             btcString = currCalc;
            //             console.log(btcString);
            //             break;
            //     }
            // }

            for (let i = 0; i < parsedJson.length; i++) {

                let curr = parsedJson[i].ccy;
                let buy = parseFloat(parsedJson[i].buy).toFixed(2);
                let sale = parseFloat(parsedJson[i].sale).toFixed(2);
                let currCalc = (curr + ": " + buy + " / " + sale);


                switch (curr) {
                    case "EUR":
                        euroString = currCalc;
                        console.log(euroString);
                        break;
                    case "USD":
                        usdString = currCalc;
                        console.log(usdString);
                        break;
                    case "RUR":
                        rurString = currCalc;
                        console.log(rurString);
                        break;
                    case "BTC":
                        btcString = currCalc;
                        console.log(btcString);
                        break;
                }
            }
            return $.sendMessage(euroString + "\n" + usdString + "\n" + rurString + "\n" + btcString);
        });
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

module.exports = TodoController;