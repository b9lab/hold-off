pragma solidity ^0.4.5;

contract StringStore {
	string public myString;
	address public updater;

	function StringStore(address _updater) {
		updater = _updater;
	}

	function setString(string newString) {
		if (updater != msg.sender) throw;
		myString = newString;
	}
}