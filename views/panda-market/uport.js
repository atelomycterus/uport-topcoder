/* global Web3 globalState render */

// Setup

const $ = (selector) => document.querySelector(selector);

let globalState = {
    clientUportId: "",
    clientName:"",
}
const render = function () {
   console.log(globalState);
   $('#clientUportId').innerHTML = globalState.clientUportId;
   $('#clientName').innerHTML = globalState.clientName;
   $('#connectUportBtn').setAttribute('class', 'invisible');
}

