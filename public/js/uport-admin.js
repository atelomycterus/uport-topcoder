/* global Web3 globalState render */

// Setup
const network = 'rinkeby';
const AttestedDataRegistryAddress = '0x390eff51e354fa19d73f5eb9191d01ce69cb5314';
const serviceUPortId= '2otc2H5DoY78vgbxEc5gSiide5VUx3asGg1';
const Connect = window.uportconnect.Connect;
const connect =  new Connect('Giraffee Bank', {
    clientId: serviceUPortId,
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
                "type": "string"
            },
            {
                "name": "expiredDate",
                "type": "string"
            }
        ],
        "name": "addAttestedData",
        "outputs": [],
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
            }
        ],
        "name": "getAttestedData",
        "outputs": [
            {
                "name": "",
                "type": "string"
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
        globalState.serviceName = 'Giraffee Bank';
        /*
                AttestedDataRegistry.getStatus.call(globalState.ethAddress, (err, st) => {
                    globalState.currentStatus = st
                    web3.eth.getBalance(globalState.ethAddress, (err, bal) => {
                        globalState.ethBalance = web3.fromWei(bal)
                        render()
                    })
                })
                */
    })
};


const addAttestedPassport = (attestedData) => {
    //uportConnect();
    const clientUportId = attestedData.sub;
    const validator  = attestedData.iss;
    const expDate = ''+attestedData.exp;//string
    const attDate = ''+attestedData.iat;
    const keys = Object.keys(attestedData.claim);
    for(let i=0; i < keys.length  ; i++ ){
        //TODO:
        AttestedDataRegistry.addAttestedData(clientUportId,
            validator, keys[i], attestedData.claim[keys[i]], expDate, attDate, (error, txHash) => {
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
const getAttestedPassport = (clientUportId,  dataType) => {

   AttestedDataRegistry.getAttestedData(clientUportId,serviceUPortId, dataType, (error, obj) => {
      console.log("getAttestedData: "+ obj );
      if (error) {
            throw error;
      }
      var message = 'No data in AttestedDataRegistry.';
      if(obj[2]) {
        message = 'AttestedDataRegistry contains the following data: ' + dataType +' '+ obj[2] + ', attested at ' + obj[0] +', expired at ' + obj[1] +'.';
      }
      renderMessage(message);
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



