'use strict';

const Telegram = require('telegram-node-bot'),
    PersistentMemoryStorage = require('./adapters/PersistentMemoryStorage'),
    storage = new PersistentMemoryStorage(
        `${__dirname}/data/userStorage.json`,
        `${__dirname}/data/chatStorage.json`
    ),
    tg = new Telegram.Telegram('148637856:AAEr6HQo7AKAzGw1Kl_evJas3LkFacErYSI', {
        workers: 1,
        storage: storage
    });

const RatesController = require('./controllers/rates')
    , OtherwiseController = require('./controllers/otherwise')
    , WeatherController = require('./controllers/weather');

const todoCtrl = new RatesController();
const weatherController = new WeatherController();

const { Markup } = require('telegraf');

tg.router.when(new Telegram.TextCommand('/add', 'addCommand'), todoCtrl)
    .when(new Telegram.TextCommand('/get', 'getCommand'), todoCtrl)
    .when(new Telegram.TextCommand('/check', 'checkCommand'), todoCtrl)
    .when(new Telegram.TextCommand('/rates', 'ratesCommand'), todoCtrl)
    .when(new Telegram.TextCommand('/weather', 'weatherCommand'), weatherController)
    .when(new Telegram.TextCommand('/owmWeather', 'openWeatherMap'), weatherController)
    .otherwise(new OtherwiseController());

tg.on('callback_query', ctx => {
    const subreddit = ctx.update.callback_query.data;
    const userId = ctx.update.callback_query.from.id;
    Markup.inlineKeyboard([
        Markup.callbackButton('➡️ Next', subreddit),
    ]);
    ctx.answerCallbackQuery();
});

function exitHandler(exitCode) {
    storage.flush();
    process.exit(exitCode);
}

process.on('SIGINT', exitHandler.bind(null, 0));
process.on('uncaughtException', exitHandler.bind(null, 1));