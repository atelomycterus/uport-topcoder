//HD Wallet for keyless servers (infura)
var HDWalletProvider = require("truffle-hdwallet-provider");
function getNmemonic(){
  try{
    return require('fs').readFileSync("./seed1", "utf8").trim();
  } catch(err){
    return "";
  }
}

var TestRPC = require("ethereumjs-testrpc");
var path = require("path");

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    in_memory: {
      provider: TestRPC.provider(),
      network_id: "*",
    },
    ropsten:{
      provider: new HDWalletProvider(getNmemonic(), "https://ropsten.infura.io/",0),
      network_id: "3"
    },
    rinkeby:{
      provider: new HDWalletProvider(getNmemonic(), "https://rinkeby.infura.io",0),
      network_id: "4",
        gas: 1000000,
        gasPrice: 10000000000
    },
    kovan:{
      provider: new HDWalletProvider(getNmemonic(), "https://kovan.infura.io/",0),
      network_id: "42"
    }
  },
  contracts_build_directory: path.join(__dirname, "src", "contracts")
};
