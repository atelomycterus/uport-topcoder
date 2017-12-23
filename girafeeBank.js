var path  = require('path');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var girafeeBankController = require('./girafeeBankController.js');
var girafeeBankDb = require('./girafeeBankDb.js');
var app = express();

//create in-memory db to save person requests and load them in admin area when a person will visit any bank branch
girafeeBankDb.createDb();


app.use(session({secret: 'girafee bank', resave: false, saveUninitialized: false}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// view engine setup
app.set('views', path.join(__dirname, 'views', 'girafee-bank'));
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', girafeeBankController.index);
app.get('/request', girafeeBankController.verifyIdentity);
app.post('/request', girafeeBankController.thanks);
app.get('/admin', girafeeBankController.adminDashboard);
app.get('/admin/dashboard', girafeeBankController.adminDashboard);
app.get('/admin/login', girafeeBankController.enterLogin);
app.post('/admin/login', girafeeBankController.checkLogin);
app.get('/admin/account', girafeeBankController.enterIdentityData);
app.get('/admin/account/:accountId', girafeeBankController.enterIdentityData);
app.get('/admin/account/:accountId/checkuportid', girafeeBankController.checkUportId);
app.post('/admin/account/:accountId/attest/passport', girafeeBankController.attestPassport);
app.post('/admin/account/:accountId/attest/creditcardlimit', girafeeBankController.attestCreditCardLimit);
app.get('/admin/account/:accountId/registry', girafeeBankController.checkVerifiedData);

app.get('/admin/requestdata', girafeeBankController.createRequestToShareData);//using client UportId to get verified data from smart contracts
app.post('/admin/requestdata', girafeeBankController.sendRequestToShareData);//using client UportId to get verified data from smart contracts
app.post('/cbrequestdata', girafeeBankController.cbRequestToShareData);//using client UportId to get verified data from smart contracts
app.post('/cbcheckuportid', girafeeBankController.cbCheckUportId);//request client UportId to get jwt to send push notification later

app.get('/admin/request', girafeeBankController.viewRequests);//view all requests created by users to attest data
app.get('/admin/logout', girafeeBankController.logout);
app.post('/cbattestdata', girafeeBankController.cbAttestData);
app.use("*", function(req, res){
    res.send("404 Error");
    console.log("URL: "+req.baseUrl);
    //res.sendFile("404.html");
});

var server = app.listen(8081, function () {
  console.log("Giraffe Bank running...")
})
