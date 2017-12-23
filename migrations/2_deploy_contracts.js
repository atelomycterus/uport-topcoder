var  AttestedDataRegistry = artifacts.require("./AttestedDataRegistry.sol");

module.exports = function(deployer) {
  deployer.deploy(AttestedDataRegistry);
};
