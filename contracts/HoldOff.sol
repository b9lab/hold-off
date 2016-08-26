contract HoldOff {
	address public owner;
	event LogRequest(
		address requester,
		address target,
		bytes msgData);

	function HoldOff() {
		owner = msg.sender;	
	}

	function requestCall(address target, bytes msgData) 
		returns (bytes32 key) {
		LogRequest(msg.sender, target, msgData);
	}

	function doCall(address target, bytes msgData) 
		returns (bool) {
		if (owner != msg.sender) throw;
		return target.call(msgData);
	}
}