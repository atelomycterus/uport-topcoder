/* global Web3 globalState render */

// Setup
const network = 'rinkeby';
const AttestedDataRegistryAddress = '0x390eff51e354fa19d73f5eb9191d01ce69cb5314';

const Connect = window.uportconnect.Connect;
const connect =  new Connect('Panda Market', {
    clientId: '2otVuW7DCA7FzG6Sgv28Uw6ZfpV3iwfUvKz',
    network: network,
});

const web3 = connect.getWeb3();
const AttestedDataRegistryABI = web3.eth.contract([
    {
        "constant": false,
        "inputs": [
            {
                "name": "uportId",
                "type": "string"
            },
            {
                "name": "validator",
                "type": "string"
            },
            {
                "name": "dataType",
                "type": "string"
            },
            {
                "name": "dataHash",
                "type": "string"
            },
            {
                "name": "attestedDate",
                "type": "uint256"
            },
            {
                "name": "expiredDate",
                "type": "string"
            }
        ],
        "name": "addAttestedData",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            },
            {
                "name": "",
                "type": "uint256"
            },
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "uportId",
                "type": "string"
            },
            {
                "name": "validator",
                "type": "string"
            },
            {
                "name": "dataType",
                "type": "string"
            },
            {
                "name": "dataHash",
                "type": "string"
            },
            {
                "name": "attestedDate",
                "type": "uint256"
            },
            {
                "name": "expiredDate",
                "type": "uint256"
            }
        ],
        "name": "getAttestedData",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            },
            {
                "name": "",
                "type": "string"
            },
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
]);
const AttestedDataRegistry = AttestedDataRegistryABI.at(AttestedDataRegistryAddress);

const uportConnect = function () {
    web3.eth.getCoinbase((error, address) => {
        console.log("uportConnect address:"+ address)
        if (error) {
            console.log("uportConnect error:"+error);
            throw error;
        }
        globalState.ethAddress = address;
        globalState.serviceName = 'Panda Market';
    })
};
/*
const quickCheck = () =>{
    connect.createRequest({
        //requested:['name'],
        verified: ['Phone', 'CardId', 'CreditCardLimit'],
        callbackUrl: 'http://192.168.1.165:8082/cbquickcheck',
        notifications: true,
        exp: new Date().getTime() + 600000
    }).then( function(requestToken) {
        var uri = 'me.uport:me?requestToken=' + requestToken
        var qrurl = 'http://chart.apis.google.com/chart?cht=qr&chs=400x400&chl=' + uri;
        var mobileUrl = 'https://id.uport.me/me?requestToken=' + requestToken;
        console.log(uri);
        //res.redirect('<div><img src=' + qrurl + '></img></div><div><a href=' + mobileUrl + '>Click here if on mobile (Not implemented yet!)</a></div>');
        res.redirect(mobileUrl);
    });
}
*/
const addAttestedPassport = (attestedData) => {
    //uportConnect();
    const clientUportId = attestedData.sub;
    const validator  = attestedData.iss;
    const expDate = attestedData.exp;//string
    const attDate = ''+attestedData.iat;//int
    const keys = Object.keys(attestedData.claim);
    for(let i=0; i < keys.length  ; i++ ){
        //TODO:
        AttestedDataRegistry.addAttestedData(clientUportId,
            validator, keys[i], attestedData.claim[keys[i]], attDate, attDate, (error, txHash) => {
                if (error) {
                    throw error;
                }

                waitForMined(globalState.ethAddress, txHash, {blockNumber: null},
                    () => {
                        console.log("Transaction "+ txHash + " is  processing");
                        renderMessage("Transaction "+ txHash + " is  processing");},
                    () => {
                        console.log("Transaction "+ txHash + " was mined");
                        renderMessage("Transaction "+ txHash + " was mined");
                });
        });
    }
}
//TODO: check

const getAttestedPassport = (clientUportId, validator, dataType) => {
   AttestedDataRegistry.getAttestedData(clientUportId, validator, dataType, (error, obj) => {
      console.log("getAttestedData: "+ obj );
      if (error) {
            throw error;
      }
     renderMessage("AttestedDataRegistry contains the following data: hashed" + dataType +" "+ obj[2] + ", attested at" + obj[0] +', expired at' + obj[1]);
   });
}

const pollingLoop = (address, txHash, response,  pendingCB, successCB) => {
    setTimeout(function () {
        web3.eth.getTransaction(txHash, (error, response) => {
            if (error) {
                throw error;
            }
            if (response === null) {
                response = { blockNumber: null }
            } // Some nodes do not return pending tx
            waitForMined(address, txHash, response, pendingCB, successCB);
        })
    }, 1000) // check again in one sec.
}

async function waitForMined (address, txHash, response, pendingCB, successCB) {
    if (response.blockNumber) {
        const addr = address;
        // getShares(addr, actions)
        successCB();
    } else {
        pendingCB();
        pollingLoop(address, txHash, response, pendingCB, successCB);
    }
}



