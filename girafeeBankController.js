/**
 * Girafee Bank Controller
 *
 * We use Rinkeby by default
 */

var server = 'http://localhost:8081';
var girafeeBankDb = require('./girafeeBankDb.js');
var uport = require('uport');
var jsontokens = require('jsontokens');

var serviceUportApp = 'Giraffe Bank';
var serviceUportId = '2otc2H5DoY78vgbxEc5gSiide5VUx3asGg1';
var serviceUportPublicKey = '54b75339810d81b169fbe4e736f2d02e02eff75eb5704c1431edd523bd4dfa8d';
var signer = uport.SimpleSigner(serviceUportPublicKey);

var cbCheckUportIdUrl = server +'/cbcheckuportid';
var cbAttestDataUrl= server +'/cbattestdata';
var cbRequestToShareDataUrl = server +'/cbrequestdata';
var credentials = new uport.Credentials({
    appName: serviceUportApp,
    address: serviceUportId,
    signer: signer,
});

function getNextYearFromNow() {
    var aYearFromNow = new Date();
    aYearFromNow.setFullYear(aYearFromNow.getFullYear() + 1);
    return aYearFromNow;
}

function checkAuth (req, res, next) {
    // don't serve /admin to those not logged in
    if ((!req.session || !req.session.authenticated)) {
       res.redirect('/admin/login');
    }
}

exports.index = (req, res, next) => {
    res.render('index', { title: 'Girafee Bank', serviceUportId:  serviceUportId, serviceUportApp: serviceUportApp});
}

exports.verifyIdentity = (req, res, next) => {
    res.render('request', { title: 'Verify My Identity', serviceUportId: serviceUportId,  serviceUportApp: serviceUportApp});
};

exports.thanks = (req, res, next) =>{
    var userRequest = {
        uportId: req.body.clientUportId,
        name : req.body.clientName,
        phone: req.body.phone?req.body.phone:null,
        creditCardLimitOption: req.body.creditCardLimitOption === 'true',
        switchingBankAccountOption: req.body.switchingBankAccountOption=== 'true',
        phoneOption: req.body.phoneOption=== 'true',
        passportOption: req.body.passportOption=== 'true',
        insuranceOption: req.body.insuranceOption=== 'true',
        ageOption: req.body.ageOption=== 'true'};

    girafeeBankDb.saveRequest(userRequest);
    res.render('thanks');
};

exports.adminDashboard = (req, res, next) => {
    checkAuth (req, res, next);
    res.render('adminDashboard', { title: 'Dashboard', serviceUportId:  serviceUportId, serviceUportApp: serviceUportApp});
};

exports.enterLogin = (req, res, next) => {
    res.render('adminLogin');
};

exports.checkLogin = (req, res, next) => {
    var username = req.body.username;
    var password = req.body.password;
    if( username && username==='admin' && password && password==='admin') {
        req.session.authenticated = true;
        res.render('adminDashboard', { title: 'Girafee Bank', serviceUportId:  serviceUportId, serviceUportApp: serviceUportApp});
    } else {
        //TODO
       // req.flash('error', 'Username and password are incorrect');
        res.redirect('/admin/login');
    }
}

exports.logout = (req, res, next) => {
    delete req.session.authenticated;
    res.redirect('/');
};

exports.enterIdentityData = (req, res, next) =>{
    var accountId = req.params.accountId;

    girafeeBankDb.loadRequest(accountId, (data) => {
        res.render('adminAccount', { title: 'Attest Personal Data and Account', serviceUportId: serviceUportId,
            serviceUportApp: serviceUportApp,
            request: data});
    });
};

exports.viewRequests = (req, res, next) =>{
    girafeeBankDb.loadRequests((data) => {
        res.render('adminAttestationRequest', { title: 'Requests to attest Personal Data and Account',
            serviceUportId: serviceUportId,
            serviceUportApp: serviceUportApp,
            request: data});
    });

};

exports.createRequestToShareData= (req, res, next) =>{
    res.render('adminVerifiedDataRequest', { title: 'Request verified data by uPortId',
        serviceUportId: serviceUportId,
        serviceUportApp: serviceUportApp
    });
};


exports.sendRequestToShareData = (req, res, next) =>{
    var requestedCredentials, verifiedCredentials;
    var dataType  = req.body.dataType;
    credentials.createRequest({
        requested:dataType,
        verified: dataType,
        callbackUrl: cbRequestToShareDataUrl,
        notifications: true,
        exp: new Date().getTime() + 600000
    }).then( function(requestToken) {
        var mobileUrl = 'https://id.uport.me/me?requestToken=' + requestToken;
        res.redirect(mobileUrl);
    })
};

exports.cbAttestData = (req, res, next) =>{
    if(req.query['attestations']) {
        //Save attested data to add in blockchain later.
        var result =  jsontokens.decodeToken(req.query['attestations']);
        girafeeBankDb.addPayload(result.payload.sub, JSON.stringify(result.payload));
    }
};

exports.checkVerifiedData = (req, res, next) =>{
    var accountId = req.params.accountId;

    girafeeBankDb.loadRequest(accountId, (data) => {
        res.render('adminVerifiedAccount', { title: 'View Verified IdentityData', serviceUportId: serviceUportId,
            serviceUportApp: serviceUportApp,
            request: data});
    });
};

exports.attestPassport = (req, res, next) =>{
    var accountId = req.body.accountId,
        clientUportId = req.body.uportId,
        fullName = req.body.fullName,
        fullNameOption = req.body.fullNameOption,
        passportOption = req.body.passportOption,
        passport = req.body.passport,
        ageOption = req.body.ageOption,
        age = req.body.age;

    var data = {};

    if(fullNameOption) {
        data['FullName'] = fullName;
    }

    if(passportOption) {
        data['Passport']=  passport;
    }

    if(ageOption) {
        data['Age'] = age;
    }

    //attest passport data
    credentials.attest({
        sub: clientUportId,
        exp: getNextYearFromNow(),
        claim: data
    }).then(function (att) {
        var mobileUrl = 'https://id.uport.me/add?attestations=' + att + '&callback_url='+cbAttestDataUrl+ '?attestations='+att;
        res.redirect(mobileUrl);
    });
};

exports.attestPhone = (req, res, next) =>{
    var clientUportId = req.body.uportid,
    phoneOption = req.body.phoneOption,
    phone = req.body.phone;

    if(phoneOption) {
        credentials.attest({
            sub: clientUportId,
            exp: getNextYearFromNow(),
            claim: {'Pnone:': phone}
        }).then(function (att) {
            var mobileUrl = 'https://id.uport.me/add?attestations=' + att + '&callback_url=' + cbUrl;
            res.redirect(mobileUrl);
        });
    }
};

exports.attestCreditCardLimit = (req, res, next) =>{
    var clientUportId = req.body.uportId,
        creditCardLimitOption = req.body.creditCardLimitOption,
        cardId = req.body.cardId,
        creditCardLimit = req.body.creditCardLimit;

    if(creditCardLimitOption) {
        credentials.attest({
            sub: clientUportId,
            exp: getNextYearFromNow(),
            claim: {'CardId': cardId, 'CreditCardLimit': creditCardLimit}
        }).then(function (att) {
            var mobileUrl = 'https://id.uport.me/add?attestations=' + att + '&callback_url=' +cbAttestDataUrl;
            res.redirect(mobileUrl);
        });
    }
};


