/* global Web3 globalState render */

// Setup

const $ = (selector) => document.querySelector(selector);

let globalState = {
    ethAddress:"",
    serviceUportId: "",
    serviceName:"",
}
const render = function () {
   console.log(globalState);
   $('#result').value = globalState.serviceUportId;
}

const renderMessage = function (message) {
    console.log(globalState);
    $('#result').innerHTML = message;
    $('#result').setAttribute('class', 'alert alert-info');
}

