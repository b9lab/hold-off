web3.eth.getTransactionReceiptMined = function (txnHash, interval) {
  var transactionReceiptAsync;
  interval = interval ? interval : 500;
  transactionReceiptAsync = function(txnHash, resolve, reject) {
    try {
      var receipt = web3.eth.getTransactionReceipt(txnHash);
      if (receipt == null) {
        setTimeout(function () {
          transactionReceiptAsync(txnHash, resolve, reject);
        }, interval);
      } else {
        resolve(receipt);
      }
    } catch(e) {
      reject(e);
    }
  };

  return new Promise(function (resolve, reject) {
      transactionReceiptAsync(txnHash, resolve, reject);
  });
};

getEventsPromise = function (myFilter, count) {
  return new Promise(function (resolve, reject) {
    count = count ? count : 1;
    var results = [];
    myFilter.watch(function (error, result) {
      if (error) {
        reject(error);
      } else {
        count--;
        results.push(result);
      }
      if (count <= 0) {
        resolve(results);
        myFilter.stopWatching();
      }
    });
  });
};

contract('HoldOff', function(accounts) {

  var owner = accounts[0];
  var requester = accounts[1];

  it("should be able to have delayed action", function() {
    var holdOff = HoldOff.deployed();
    var stringStore = StringStore.deployed();
    var msgData;

    return stringStore.myString()
      .then(function (myString) {
        assert.equal(myString, "", "should be an empty string to start with");
        msgData = stringStore.contract.setString
          .getData("Hello World", { from: requester });

        // Because we only want events from now on
        var blockNumber = web3.eth.blockNumber;

        holdOff.requestCall(stringStore.address, msgData, { from: requester });
        return getEventsPromise(holdOff.LogRequest({}, { from: web3.eth.blockNumber }));
      })
      .then(function (events) {
        assert.equal(events.length, 1, "should have been a single event");
        return holdOff.doCall(
            events[0].args.target,
            events[0].args.msgData,
            { from: owner });
      })
      .then(function (tx) {
        return web3.eth.getTransactionReceiptMined(tx);
      })
      .then(function (receipt) {
        // Now has it been updated?
        return stringStore.myString();
      })
      .then(function (myString) {
        console.log(myString);
        assert.equal(myString, "Hello World", "should have been updated");
      });

  });

});
