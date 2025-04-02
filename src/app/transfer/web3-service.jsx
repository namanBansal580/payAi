import Web3 from "web3";
import { CONTRACT_ABI } from "@/ContractABI"; // You'll need to update this with the new ABI

class Web3Service {
  web3 = null;
  contract = null;
  account = "";
  contract_add = "";
  curr_symbol = "";

  constructor(chainId) {
    console.log("Chain id is:::::", chainId);
    
    switch (chainId) {
      case 1: 
          this.contract_add = "0xYourEthereumMainnetContractAddress";
          this.curr_symbol = "ETH";
          break;
      case 296: // Hedera testnet
          this.contract_add = "0x8108510386b062778F861E62C5aeDfCFB0ac4a19";
          this.curr_symbol = "HBAR";
          break;
      case 5003:
          this.contract_add = "0xYour5003ChainContractAddress";
          this.curr_symbol = "POP";
          break;
      case 80001:
          this.contract_add = "0xYourMumbaiTestnetContractAddress";
          this.curr_symbol = "MM";
          break;
      default:
          this.contract_add = "0xDefaultContractAddress";
    }
    
    this.initWeb3();
  }

  async initWeb3() {
    if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
      try {
        // Request account access
        await window.ethereum.request({ method: "eth_requestAccounts" });
        this.web3 = new Web3(window.ethereum);

        // Get the connected account
        const accounts = await this.web3.eth.getAccounts();
        this.account = accounts[0];

        // Initialize the contract
        this.contract = new this.web3.eth.Contract(CONTRACT_ABI, this.contract_add); 
        
        // Listen for account changes
        window.ethereum.on("accountsChanged", (accounts) => {
          this.account = accounts[0];
        });

        return true;
      } catch (error) {
        console.error("Error initializing Web3:", error);
        return false;
      }
    } else {
      console.error("Web3 not found. Please install MetaMask!");
      return false;
    }
  }

  async getAccount() {
    if (!this.web3) await this.initWeb3();
    return this.account;
  }

  // Converts HBAR to tinybar (similar to Ether to Wei)
  convertToTinybar(amount) {
    // For Hedera: 1 HBAR = 100,000,000 tinybar (10^8)
    // For Ethereum networks, we'll use the standard Wei conversion
    if (this.curr_symbol === "HBARO") {
      // Manual tinybar conversion for Hedera
      return (BigInt(Math.floor(parseFloat(amount) * 100000000))).toString();
    } else {
      // Standard Wei conversion for Ethereum networks
      return this.web3.utils.toWei(amount.toString(), "ether");
    }
  }

  // Converts tinybar to HBAR (similar to Wei to Ether)
  convertFromTinybar(amount) {
    if (this.curr_symbol === "HBAR") {
      // Manual HBAR conversion from tinybar
      return (parseFloat(amount) / 100000000).toString();
    } else {
      // Standard Ether conversion from Wei
      return this.web3.utils.fromWei(amount.toString(), "ether");
    }
  }

  async sendMoney(recipientAddress, amount, username = "") {
    if (!this.web3 || !this.contract) {
      const initialized = await this.initWeb3();
      if (!initialized) throw new Error("Web3 not initialized");
    }

    try {
      const amountInSmallestUnit = this.convertToTinybar(amount);
      // console.log(`Amount in ${this.curr_symbol === "HBAR" ? "tinybar" : "wei"} is::::`, amountInSmallestUnit);
      
      // Note: The function name is now 'sendMoney' instead of 'send_money'
      const result = await this.contract.methods.sendMoney(recipientAddress, username).send({
        from: this.account,
        value: amountInSmallestUnit, // Send the value in tinybar/wei
      });

      return result;
    } catch (error) {
      console.error("Error sending money:", error);
      throw error;
    }
  }

  async receiveMoney(senderAddress, username = "") {
    if (!this.web3 || !this.contract) {
      const initialized = await this.initWeb3();
      if (!initialized) throw new Error("Web3 not initialized");
    }

    try {
      // Note: The function name is now 'receiveMoney' instead of 'receive_money'
      const result = await this.contract.methods.receiveMoney(senderAddress, username).send({
        from: this.account,
      });

      return result;
    } catch (error) {
      console.error("Error receiving money:", error);
      throw error;
    }
  }

  async refundMoney(transactionId = 0, receiverAddress) {
    if (!this.web3 || !this.contract) {
      const initialized = await this.initWeb3();
      if (!initialized) throw new Error("Web3 not initialized");
    }

    try {
      // Note: The function name is now 'refundMoney' instead of 'refund_money'
      const result = await this.contract.methods.refundMoney(transactionId, receiverAddress).send({
        from: this.account,
      });

      return result;
    } catch (error) {
      console.error("Error refunding money:", error);
      throw error;
    }
  }

  async registerUser(username) {
    if (!this.web3 || !this.contract) {
      const initialized = await this.initWeb3();
      if (!initialized) throw new Error("Web3 not initialized");
    }

    try {
      // Note: The function name is now 'registerUser' instead of 'register_user'
      const result = await this.contract.methods.registerUser(username).send({
        from: this.account,
      });

      return result;
    } catch (error) {
      console.error("Error registering user:", error);
      throw error;
    }
  }

  async groupPayments(addresses, amounts) {
    console.log("my Address Array is::::",addresses);
    console.log("my Amounts Array is::::",amounts);
    
    if (!this.web3 || !this.contract) {
      const initialized = await this.initWeb3();
      if (!initialized) throw new Error("Web3 not initialized");
    }

    try {
      // Convert amounts to tinybar/wei
      let tAmount=0;
      for (let i = 0; i < amounts.length; i++) {
        tAmount+=Number(amounts[i]);
      }
      const amountsInSmallestUnit = this.convertToTinybar(tAmount);
      console.log("My Amount in smallest Unit ::::"+amountsInSmallestUnit);
      // Calculate total amount
      // const totalAmount = amountsInSmallestUnit.reduce(
      //   (sum, amount) => BigInt(sum) + BigInt(amount),
      //   BigInt(0)
      // );
      for (let i = 0; i < amounts.length; i++) {
        amounts[i]=this.convertToTinybar(Number(amounts[i]));
      }
      

      // Note: The function name is now 'groupPayments' instead of 'group_payments'
      const result = await this.contract.methods.groupPayments(addresses, amounts).send({
        from: this.account,
        value: amountsInSmallestUnit    ,
      });

      return result;
    } catch (error) {
      console.error("Error making group payments:", error);
      throw error;
    }
  }

  async createPot(amount, info) {
    if (!this.web3 || !this.contract) {
      const initialized = await this.initWeb3();
      if (!initialized) throw new Error("Web3 not initialized");
    }

    try {
      const amountInSmallestUnit = this.convertToTinybar(amount);
      
      // Note: The function name is now 'createPot' instead of 'create_pot' and takes only info parameter
      const result = await this.contract.methods.createPot(info).send({
        from: this.account,
        value: amountInSmallestUnit,
      });

      return result;
    } catch (error) {
      console.error("Error creating pot:", error);
      throw error;
    }
  }

  async withdrawPot(potId) {
    if (!this.web3 || !this.contract) {
      const initialized = await this.initWeb3();
      if (!initialized) throw new Error("Web3 not initialized");
    }

    try {
      // Note: The function name is now 'withdrawPot' instead of 'withdraw_pot'
      const result = await this.contract.methods.withdrawPot(potId).send({
        from: this.account,
      });

      return result;
    } catch (error) {
      console.error("Error withdrawing from pot:", error);
      throw error;
    }
  }

  async listEvents() {
    if (!this.web3 || !this.contract) {
      const initialized = await this.initWeb3();
      if (!initialized) throw new Error("Web3 not initialized");
    }

    try {
      // Function name remains 'listEvents'
      const events = await this.contract.methods.listEvents().call({
        from: this.account,
      });

      // Format the events
      return events.map((event) => ({
        transaction_id: Number.parseInt(event.transactionId),
        amount: this.convertFromTinybar(event.amount),
        event_type: event.eventType,
      }));
    } catch (error) {
      console.error("Error listing events:", error);
      throw error;
    }
  }

  async listPots() {
    if (!this.web3 || !this.contract) {
      const initialized = await this.initWeb3();
      if (!initialized) throw new Error("Web3 not initialized");
    }

    try {
      // Function name remains 'listPots'
      const pots = await this.contract.methods.listPots().call({
        from: this.account,
      });

      // Format the pots
      return pots.map((pot) => ({
        transaction_id: Number.parseInt(pot.transactionId),
        amount: this.convertFromTinybar(pot.amount),
        info: pot.info,
      }));
    } catch (error) {
      console.error("Error listing pots:", error);
      throw error;
    }
  }

  async getBalance(address = "") {
    if (!this.web3) await this.initWeb3();

    try {
      const targetAddress = address || this.account;
      const balanceInSmallestUnit = await this.web3.eth.getBalance(targetAddress);
      return this.convertFromTinybar(balanceInSmallestUnit);
    } catch (error) {
      console.error("Error getting balance:", error);
      throw error;
    }
  }

  async sendMessage(sender, recipient, message, fileHash) {
    if (!this.web3 || !this.contract) {
      const initialized = await this.initWeb3();
      if (!initialized) throw new Error("Web3 not initialized");
    }

    try {
      // Note: The function name is now 'sendMessage' instead of 'send_msg'
      const gas = await this.contract.methods
        .sendMessage(message, fileHash, recipient)
        .estimateGas({ from: sender });

      const tx = await this.contract.methods
        .sendMessage(message, fileHash, recipient)
        .send({ from: sender, gas });

      return tx;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  async listMessages(userAddress, recipient) {
    if (!this.web3 || !this.contract) {
      const initialized = await this.initWeb3();
      if (!initialized) throw new Error("Web3 not initialized");
    }

    try {
      // Note: The function name is now 'listMessages' instead of 'list_msg'
      const messages = await this.contract.methods
        .listMessages(recipient)
        .call({ from: userAddress });

      return messages.map(msg => ({
        recipient: msg.recipient,
        message: msg.msg,
        fileHash: msg.fileHash
      }));
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw error;
    }
  }

  async listAddresses() {
    if (!this.web3 || !this.contract) {
      const initialized = await this.initWeb3();
      if (!initialized) throw new Error("Web3 not initialized");
    }

    try {
      const addresses = await this.contract.methods
        .listAddresses()
        .call({ from: this.account });

      return addresses;
    } catch (error) {
      console.error("Error fetching addresses:", error);
      throw error;
    }
  }
}

export default Web3Service;