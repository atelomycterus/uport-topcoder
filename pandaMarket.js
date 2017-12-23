var path  = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var app = express();
var uport = require('uport');
var serviceUportApp = 'Panda Market';
var serviceUportId = '2otVuW7DCA7FzG6Sgv28Uw6ZfpV3iwfUvKz';
var signer = uport.SimpleSigner('0ee6714c0249f7cdc854a62377fed3ec91642d6d7ee46d3679abc3eb0760d383');

var cbPushNotification = 'http://localhost:8082/push';
var cbQuickCheckUrl = 'http://localhost:8082/cbquickcheck';
var credentials = new uport.Credentials({
    appName: serviceUportApp,
    address: serviceUportId,
    signer: signer,
});

var  girafeeBankUportId = '2otc2H5DoY78vgbxEc5gSiide5VUx3asGg1';

app.use(session({secret: 'pandamarket', resave: false, saveUninitialized: false}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// view engine setup
app.set('views', path.join(__dirname, 'views', 'panda-market'));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
    res.render('panda-market', { title: 'Panda Market', serviceUportId:  serviceUportId, serviceUportApp: serviceUportApp});
});


app.get('/quickcheck', function (req, res) {

    credentials.createRequest({
        //requested:['name'],
        verified: ['Phone', 'CardId', 'CreditCardLimit'],
        callbackUrl: cbQuickCheckUrl,
        notifications: true,
        exp: new Date().getTime() + 600000
    }).then( function(requestToken) {
        var uri = 'me.uport:me?requestToken=' + requestToken
        var mobileUrl = 'https://id.uport.me/me?requestToken=' + requestToken;
        res.redirect(mobileUrl);
    });
})

app.post('/push', function (req, res) {
   console.log('Push notification was read.');
});

app.post('/cbquickcheck', function (req, res) {
    var jwt = req.body.access_token;
    credentials.receive(jwt).then( function(creds) {
        var message = "Buying a product by CreditCard wasn't accepted";

        //Check CreditCard Limit and it's issued by Giraffe Bank
        if(creds.verified && creds.verified.length > 0) {
            if (creds.address == creds.verified[0].sub &&
                creds.verified[0].iss == girafeeBankUportId) {

                if(creds.verified[0].claim['CreditCardLimit'] >= 100) {
                     message = 'Buying a product by CreditCard is approved.';
                 }
            }
        }
        console.log('Result of QuickCheck: ' + message);
        credentials.push(creds.pushToken, creds.publicEncKey,
            { url: 'me.uport:me?callback_url='+cbPushNotification, message: message });

    })
});
app.use("*", function(req, res){
    res.send("404 Error");
    console.log("URL: "+req.baseUrl);
    //res.sendFile("404.html");
});

var server = app.listen(8082, function () {
  console.log("Panda Market app running...")
})
