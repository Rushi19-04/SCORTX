# Test Contracts

This folder contains sample Solidity contracts for testing SCORTX.

## VulnerableBank.sol

A simple banking contract with intentional vulnerabilities for testing:

**Known Issues:**
1. **Reentrancy Vulnerability** (Critical): The `withdraw()` function sends ETH before updating the balance, allowing attackers to recursively call withdraw and drain the contract.

2. **Integer Overflow** (Medium): While Solidity 0.8.0+ has built-in overflow protection, the pattern could be problematic in older versions.

3. **Missing Events** (Low): No events are emitted for deposits, withdrawals, or transfers, making it hard to track activity.

**Expected SCORTX Findings:**
- Mythril should detect the reentrancy vulnerability
- Slither should flag missing events and suggest best practices
- AI remediation should suggest using the checks-effects-interactions pattern

**Correct Implementation:**

```solidity
function withdraw(uint256 _amount) public {
    require(balances[msg.sender] >= _amount, "Insufficient balance");

    // Update state BEFORE external call
    balances[msg.sender] -= _amount;

    (bool success, ) = msg.sender.call{value: _amount}("");
    require(success, "Transfer failed");

    emit Withdrawal(msg.sender, _amount);
}
```

## How to Test

1. Start SCORTX and the Docker Brain
2. Navigate to the Scanner page
3. Upload `VulnerableBank.sol`
4. Click "Deep Scan"
5. Review the findings in the Results page
6. Compare the original code with the AI-remediated version

This contract is perfect for demonstrating SCORTX's capabilities in detecting real-world vulnerabilities.
