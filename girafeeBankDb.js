"use strict";

var sqlite3 = require('sqlite3').verbose();
var db;

function createTable() {
    console.log("createTable user_request");
    db.run("CREATE TABLE IF NOT EXISTS user_request(accountid INTEGER PRIMARY KEY AUTOINCREMENT, " +
        "uportid CHAR(35) NOT NULL," +
        "name CHAR(30) NOT NULL, " +
        "phone CHAR(20)," +
        "credit_card_limit_option BOOLEAN NOT NULL, " +
        "switching_bank_account_option BOOLEAN NOT NULL," +
        "phone_option BOOLEAN NOT NULL," +
        "passport_option BOOLEAN NOT NULL," +
        "insurance_option BOOLEAN NOT NULL," +
        "age_option BOOLEAN NOT NULL, " +
        "date DATE NOT NULL); ");

    db.run("CREATE TABLE IF NOT EXISTS payload(payloadid INTEGER PRIMARY KEY AUTOINCREMENT, " +
        "uportid CHAR(35) NOT NULL," +
        "data TEXT NULL," +
        "date DATE NOT NULL" +
        ");");

    //db.run("CREATE INDEX IF NOT EXISTS ix_uportid ON payload(uportid);")
};

exports.createDb = () => {
    console.log("createDb in memory");
    db = new sqlite3.Database(':memory:', createTable);
    //db = new sqlite3.Database('test.db', sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE);
    db.serialize(createTable());

};

exports.closeDb = () => function closeDb() {
    console.log("closeDb");
    db.close();
};

exports.saveRequest = (userRequest) => {
   db.run("INSERT INTO user_request(uportid, name, phone,credit_card_limit_option,switching_bank_account_option, phone_option,\n" +
       " passport_option,insurance_option,age_option,date) VALUES (?,?,?,?,?,?,?,?,?,datetime('now'))",
       [userRequest.uportId, userRequest.name, userRequest.phone,
           userRequest.creditCardLimitOption,
           userRequest.switchingBankAccountOption,
           userRequest.phoneOption,
           userRequest.passportOption,
           userRequest.insuranceOption,
           userRequest.ageOption], (err) => {
       if(err) {
           return console.log(err.message);
       }
   });
};

exports.addPayload = (uportId,payload) => {
    db.run("INSERT INTO payload(uportid, data,date) VALUES(?,?,datetime('now'))", [uportId, payload], (err) => {
        if(err) {
            return console.log(err.message);
        }

    });
};

exports.loadPayload = (uportIdd, done) => {
    db.get("SELECT * FROM payload WHERE uportid = ? order by date desc", [uportId],(err, row) => {
        return done({payloadid: row.payloadid,
            uportId: row.uportid,
            data: row.data,
            date:row.date
        });
    });
};

exports.loadRequest = (accountId, done) => {
    db.get("SELECT ur.*, p.data FROM user_request ur LEFT JOIN payload p ON ur.uportid = p.uportid and p.date =" +
        " (select max(date) from payload where uportid = ur.uportid )" +
        "where ur.accountid = ?", [accountId],(err, row) => {
        return done({accountId: row.accountid,
            uportId: row.uportid,
            name: row.name ,
            phone: row.phone,
            creditCardLimitOption: row.credit_card_limit_option,
            switchingBankAccountOption: row.switching_bank_account_option,
            phoneOption: row.phone_option,
            passportOption: row.passport_option,
            insuranceOption: row.insurance_option,
            ageOption: row.age_option,
            attestedData: row.data
        });
    });
};

exports.loadRequests = (done) => {
    var data = [];
    db.all("SELECT ur.*, p.data FROM user_request ur LEFT JOIN payload p ON ur.uportid = p.uportid and p.date =" +
        "(select max(date) from payload where uportid = ur.uportid)", (err, rows) => {
        for(var i =0; i < rows.length; i++) {
            data.push({accountId: rows[i].accountid,
                uportId: rows[i].uportid,
                name: rows[i].name ,
                phone: rows[i].phone,
                creditCardLimitOption: rows[i].credit_card_limit_option,
                switchingBankAccountOption: rows[i].switching_bank_account_option,
                phoneOption: rows[i].phone_option,
                passportOption: rows[i].passport_option,
                insuranceOption: rows[i].insurance_option,
                ageOption: rows[i].age_option,
                isAttestedData: rows[i].data != null
            });
        }
        return done(data);
    });
};




