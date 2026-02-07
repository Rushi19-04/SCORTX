// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CryptoVault {
    mapping(address => uint) public balances;
    mapping(address => bool) public admins;
    address public owner;

    event Deposit(address indexed user, uint amount);
    event Withdraw(address indexed user, uint amount);

    constructor() {
        owner = msg.sender;
        admins[msg.sender] = true;
    }

    function addAdmin(address _admin) public {
        admins[_admin] = true;
    }

    function deposit() public payable {
        require(msg.value > 0, "Amount must be greater than 0");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint _amount) public {
        require(balances[msg.sender] >= _amount, "Insufficient balance");
        
        // Interaction
        (bool success, ) = msg.sender.call{value: _amount}("");
        require(success, "Transfer failed");

        // Vulnerability: Reentrancy (checks-effects-interactions pattern violation)
        balances[msg.sender] -= _amount;
        
        emit Withdraw(msg.sender, _amount);
    }

    function luckyDrop() public {
        // Vulnerability: Weak Randomness / Timestamp Dependence
        if (block.timestamp % 2 == 0) {
            payable(msg.sender).transfer(address(this).balance / 10);
        }
    }

    function burn(address _user, uint _amount) public {
        // Vulnerability: Missing Access Control
        require(balances[_user] >= _amount, "Insufficient balance");
        balances[_user] -= _amount;
    }
}
