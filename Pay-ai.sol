// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/utils/Strings.sol";

contract HederaCryptoSafe {
    using Strings for uint256;
    
    struct User {
        uint256 id;
        address userAddress;
        uint256 amountSend; // in tinybar (Hedera's equivalent of wei)
    }
    
    struct EventEmit {
        uint transactionId;
        uint amount;
        string eventType;
    }
    
    struct Pot {
        uint transactionId;
        uint amount;
        string info;
    }
    
    struct MsgInfo {
        address recipient;
        string msg;
        string fileHash;
    }
    
    mapping(address => User[]) private userTransactions;
    mapping(string => address) private usernameToAddress;
    mapping(address => EventEmit[]) private eventsByUser;
    mapping(address => Pot[]) private potsByUser;
    mapping(address => address[]) private sendHistory;
    mapping(address => MsgInfo[]) private messagesByUser;
    
    // Events
    event SendMoney(address indexed senderAddress, uint256 amount);
    event ReceiveMoney(address indexed receiverAddress, uint256 amount);
    
    uint256 private transactionIdCounter = 1000001;
    
    // Function to send money to another user
    function sendMoney(
        address recipientAddress,
        string memory username
    ) external payable {
        require(msg.value > 0, "Amount must be greater than 0");
        
        if (bytes(username).length != 0) {
            require(usernameToAddress[username] != address(0), "Not a valid username");
            recipientAddress = usernameToAddress[username];
        }
        
        bool isFound = false;
        for (uint256 i = 0; i < userTransactions[msg.sender].length; i++) {
            if (userTransactions[msg.sender][i].userAddress == recipientAddress) {
                isFound = true;
                userTransactions[msg.sender][i].amountSend += msg.value;
                break;
            }
        }
        
        if (!isFound) {
            userTransactions[msg.sender].push(User(transactionIdCounter, recipientAddress, msg.value));
        }
        
        // Record the event
        eventsByUser[msg.sender].push(EventEmit(transactionIdCounter, msg.value, "SEND"));
        
        emit SendMoney(msg.sender, msg.value);
        transactionIdCounter++;
    }
    
    // Function to receive money sent by another user
    function receiveMoney(address senderAddress, string memory username) public {
        if (bytes(username).length != 0) {
            require(usernameToAddress[username] != address(0), "Not a valid username");
            senderAddress = usernameToAddress[username];
        }
        
        for (uint256 i = 0; i < userTransactions[senderAddress].length; i++) {
            if (userTransactions[senderAddress][i].userAddress == msg.sender) {
                uint256 amountToTransfer = userTransactions[senderAddress][i].amountSend;
                require(amountToTransfer > 0, "No funds to receive");
                
                // Save the amount before deleting the record
                uint256 receivedAmount = amountToTransfer;
                
                // Delete the record before transfer to prevent reentrancy attacks
                delete userTransactions[senderAddress][i];
                
                // Transfer the HBAR to the recipient
                (bool success, ) = payable(msg.sender).call{value: receivedAmount}("");
                require(success, "Transfer failed");
                
                // Record the event
                eventsByUser[msg.sender].push(EventEmit(transactionIdCounter, receivedAmount, "RECEIVE"));
                
                emit ReceiveMoney(msg.sender, receivedAmount);
                transactionIdCounter++;
                break;
            }
        }
    }
    
    // Function to refund money
    function refundMoney(uint transactionId, address recipientAddress) public {
        if (transactionId == 0) {
            // Using the recipient address
            for (uint256 i = 0; i < userTransactions[msg.sender].length; i++) {
                if (userTransactions[msg.sender][i].userAddress == recipientAddress) {
                    uint256 amountToRefund = userTransactions[msg.sender][i].amountSend;
                    require(amountToRefund > 0, "No funds to refund");
                    
                    // Save the amount before deleting the record
                    uint256 refundedAmount = amountToRefund;
                    
                    // Delete the record before transfer to prevent reentrancy attacks
                    delete userTransactions[msg.sender][i];
                    
                    // Transfer the HBAR back to the sender
                    (bool success, ) = payable(msg.sender).call{value: refundedAmount}("");
                    require(success, "Refund transfer failed");
                    
                    // Record the event
                    eventsByUser[msg.sender].push(EventEmit(transactionIdCounter, refundedAmount, "REFUND"));
                    
                    emit ReceiveMoney(msg.sender, refundedAmount);
                    transactionIdCounter++;
                    break;
                }
            }
        } else {
            // Using the transaction ID
            for (uint256 i = 0; i < userTransactions[msg.sender].length; i++) {
                if (userTransactions[msg.sender][i].id == transactionId) {
                    uint256 amountToRefund = userTransactions[msg.sender][i].amountSend;
                    require(amountToRefund > 0, "No funds to refund");
                    
                    // Save the amount before deleting the record
                    uint256 refundedAmount = amountToRefund;
                    
                    // Delete the record before transfer to prevent reentrancy attacks
                    delete userTransactions[msg.sender][i];
                    
                    // Transfer the HBAR back to the sender
                    (bool success, ) = payable(msg.sender).call{value: refundedAmount}("");
                    require(success, "Refund transfer failed");
                    
                    // Record the event
                    eventsByUser[msg.sender].push(EventEmit(transactionIdCounter, refundedAmount, "REFUND"));
                    
                    emit ReceiveMoney(msg.sender, refundedAmount);
                    transactionIdCounter++;
                    break;
                }
            }
        }
    }
    
    // Register a username
    function registerUser(string memory userName) public returns (bool) {
        require(bytes(userName).length > 0, "Username cannot be empty");
        
        if (usernameToAddress[userName] == address(0)) {
            usernameToAddress[userName] = msg.sender;
            return true;
        }
        return false;
    }
    
    // Send to multiple recipients
    function groupPayments(
        address[] memory recipientAddresses,
        uint256[] memory amountArray
    ) external payable {
        require(recipientAddresses.length == amountArray.length, "Arrays must be the same length");
        require(recipientAddresses.length > 0, "Must have at least one recipient");
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amountArray.length; i++) {
            totalAmount += amountArray[i];
        }
        
        require(msg.value == totalAmount, "Total amount must match sum of individual amounts");
        
        for (uint256 i = 0; i < amountArray.length; i++) {
            bool isFound = false;
            for (uint256 j = 0; j < userTransactions[msg.sender].length; j++) {
                if (userTransactions[msg.sender][j].userAddress == recipientAddresses[i]) {
                    isFound = true;
                    userTransactions[msg.sender][j].amountSend += amountArray[i];
                    break;
                }
            }
            
            if (!isFound) {
                userTransactions[msg.sender].push(User(transactionIdCounter, recipientAddresses[i], amountArray[i]));
            }
        }
        
        string memory eventInfo = string(abi.encodePacked("GP", amountArray.length.toString()));
        eventsByUser[msg.sender].push(EventEmit(transactionIdCounter, msg.value, eventInfo));
        
        emit SendMoney(msg.sender, msg.value);
        transactionIdCounter++;
    }
    
    // Create a savings pot
    function createPot(string memory info) external payable {
        require(msg.value > 0, "Amount must be greater than 0");
        
        potsByUser[msg.sender].push(Pot(transactionIdCounter, msg.value, info));
        
        // Record the event
        eventsByUser[msg.sender].push(EventEmit(transactionIdCounter, msg.value, "SAVE"));
        
        emit SendMoney(msg.sender, msg.value);
        transactionIdCounter++;
    }
    
    // Withdraw from a savings pot
    function withdrawPot(uint potId) public {
        for (uint i = 0; i < potsByUser[msg.sender].length; i++) {
            if (potsByUser[msg.sender][i].transactionId == potId) {
                uint256 amountToWithdraw = potsByUser[msg.sender][i].amount;
                require(amountToWithdraw > 0, "No funds to withdraw");
                
                // Save the amount before deleting the record
                uint256 withdrawnAmount = amountToWithdraw;
                
                // Delete the pot before transfer to prevent reentrancy attacks
                delete potsByUser[msg.sender][i];
                
                // Transfer the HBAR to the owner
                (bool success, ) = payable(msg.sender).call{value: withdrawnAmount}("");
                require(success, "Withdrawal failed");
                
                // Record the event
                eventsByUser[msg.sender].push(EventEmit(transactionIdCounter, withdrawnAmount, "WITHDRAW"));
                
                emit ReceiveMoney(msg.sender, withdrawnAmount);
                transactionIdCounter++;
                break;
            }
        }
    }
    
    // Send a message with file hash
    function sendMessage(string memory message, string memory fileHash, address recipient) public {
        require(recipient != address(0), "Invalid recipient address");
        
        sendHistory[msg.sender].push(recipient);
        sendHistory[recipient].push(msg.sender);
        
        // Store the message for the sender
        messagesByUser[msg.sender].push(MsgInfo(recipient, message, fileHash));
        
        // Store the message for the recipient
        messagesByUser[recipient].push(MsgInfo(msg.sender, message, fileHash));
    }
    
    // View functions
    function listEvents() public view returns (EventEmit[] memory) {
        return eventsByUser[msg.sender];
    }
    
    function listPots() public view returns (Pot[] memory) {
        return potsByUser[msg.sender];
    }
    
    function listAddresses() public view returns (address[] memory) {
        return sendHistory[msg.sender];
    }
    
    function listMessages(address recipient) public view returns (MsgInfo[] memory) {
        uint messageCount = 0;
        
        // Count messages with this recipient
        for (uint i = 0; i < messagesByUser[msg.sender].length; i++) {
            if (messagesByUser[msg.sender][i].recipient == recipient) {
                messageCount++;
            }
        }
        
        // Create the return array of the correct size
        MsgInfo[] memory messages = new MsgInfo[](messageCount);
        
        // Fill the array
        uint index = 0;
        for (uint i = 0; i < messagesByUser[msg.sender].length; i++) {
            if (messagesByUser[msg.sender][i].recipient == recipient) {
                messages[index] = messagesByUser[msg.sender][i];
                index++;
            }
        }
        
        return messages;
    }
    
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}