module.exports = function(deployer) {
  deployer.deploy(HoldOff)
  	.then(function () {
  		return deployer.deploy(StringStore, HoldOff.address);
  	});
};
