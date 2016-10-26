var flock = require('flockos');
var util = require('util');
var express = require('express');
var Mustache = require('mustache');
var config = require('./config');
var store = require('./store');

flock.setAppId(config.appId);
flock.setAppSecret(config.appSecret);

var app = express();
app.use(flock.events.tokenVerifier);

app.post('/events', flock.events.listener);

flock.events.on('app.install', function (event) {
    store.saveUserToken(event.userId, event.token);
});

var messageTemplate = require('fs').readFileSync('message.mustache.flockml', 'utf8');
flock.events.on('client.slashCommand', function (event) {
    store.saveScrap(event.userId, event.chat, event.text);
    var flockml = Mustache.render(messageTemplate, { event: event, widgetURL: config.endpoint + '/scraps' });
    console.log(flockml);
    flock.callMethod('chat.sendMessage', store.getUserToken(event.userId), {
        to: event.chat,
        text: util.format('%s saved a scrap: %s', event.userName, event.text),
        flockml: flockml
    }, function (error, response) {
        if (!error) {
            console.log('uid for message: ' + response.uid);
        } else {
            console.log('error sending message: ' + error);
        }
    });
});

var widgetTemplate = require('fs').readFileSync('index.mustache.html', 'utf8');
var urlRegex = new RegExp('(http|ftp|https)://([\\w_-]+(?:(?:\\.[\\w_-]+)+))([\\w.,@?^=%&:/~+#-]*[\\w@?^=%&/~+#-])?');

app.get('/scraps', function (req, res) {
    console.log('request query: ', req.query);
    var userId = res.locals.eventTokenPayload.userId;
    console.log('user id: ', userId);
    var event = JSON.parse(req.query.flockEvent);
    if (event.userId !== userId) {
        console.log('userId in event doesn\'t match the one in event token');
        res.sendStatus(403);
        return;
    }
    console.log('event: ', event);
    res.set('Content-Type', 'text/html');
    var list = store.listScraps(userId, event.chat);
    console.log('list: ', list);
    if (list) {
        list = list.map(function (text) {
            return text.replace(urlRegex, '<a href="$&">$&</a>');
        });
    }
    var body = Mustache.render(widgetTemplate, { list: list, event: event });
    res.send(body);
});

var port = config.port || 8080;
app.listen(port, function () {
    console.log('Listening on port: ' + port);
});
