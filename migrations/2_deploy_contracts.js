var HoldOff = artifacts.require("./HoldOff.sol");
var StringStore = artifacts.require("./StringStore.sol");

module.exports = function(deployer) {
    deployer.deploy(HoldOff)
        .then(() => deployer.deploy(StringStore, HoldOff.address));
};
