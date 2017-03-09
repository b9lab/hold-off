var HoldOff = artifacts.require("./HoldOff.sol");
var StringStore = artifacts.require("./StringStore.sol");

Extensions = require("../utils/extensions.js");
Extensions.init(web3, assert);

contract('HoldOff', function(accounts) {

    var owner, requester;
    var holdOff, stringStore;

    before("should have correct accounts", () => {
        assert.isAtLeast(accounts.length, 2, "should have at least 2 accounts");
        owner = accounts[0];
        requester = accounts[1];
        return Extensions.makeSureAreUnlocked([ owner, requester ]);
    });

    beforeEach("should deploy both contracts", function() {
        return HoldOff.new({ from: owner })
            .then(created => {
                holdOff = created;
                return StringStore.new(holdOff.address, { from: owner });
            })
            .then(created => stringStore = created);
    });

    it("should not be possible to update string if not the updater", function() {
        return Extensions.expectedExceptionPromise(
            () => stringStore.setString("Hello World", { from: requester, gas: 3000000 }),
            3000000);
    });

    it("should be possible to update string is passing through hold off", function() {
        var msgData = stringStore.contract.setString.getData("Hello World");

        return stringStore.myString()
            .then(myString => {
                assert.strictEqual(myString, "", "should be an empty string to start with");
                return holdOff.requestCall(stringStore.address, msgData, { from: requester });
            })
            .then(txObject => {
                assert.strictEqual(txObject.logs.length, 1, "should have been a single event");
                var event0 = txObject.logs[0];
                assert.strictEqual(event0.args.requester, requester, "should be the tx sender");
                assert.strictEqual(event0.args.target, stringStore.address, "should be the string store");
                assert.strictEqual(event0.args.msgData, msgData, "should be the msg data");
                return holdOff.doCall(event0.args.target, event0.args.msgData, { from: owner });
            })
            .then(txObject => {
                assert.strictEqual(txObject.logs.length, 0, "should have had no event");
                // Now has it been updated?
                return stringStore.myString();
            })
            .then(myString => assert.strictEqual(myString, "Hello World", "should have been updated"));

    });

});
