/* global Web3 globalState render */

// Setup
const Connect = window.uportconnect.Connect
const serviceAppName = $('#serviceUportApp').value;
const serviceUportId = $('#serviceUportId').value;
const connect = new Connect(serviceAppName, {clientId: serviceUportId, network: 'rinkeby'});
const web3 = connect.getWeb3();

// uPort connect
const uportConnect = function () {
    connect.requestCredentials().then(credentials => {
            console.log(credentials);
            globalState.clientName = credentials.name;
            globalState.clientUportId = credentials.address;
            render();
        },
        (error) => {
            throw error;
        })
 }



