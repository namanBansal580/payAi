"use client";
import React, { useState, useEffect } from "react";
import Web3 from "web3";
import FlowPortalABI from "./E.json";
import Ancient8PortalABI from "./P.json";

const FLOW_PORTAL_ADDRESS = "0x55B0C1824803AbE8bC8c6dc2ea99918afa75a6c5"; // Replace with actual address
const ANCIENT8_PORTAL_ADDRESS = "0x2e3b15c3041d269019387c72bEd0CD8705CB85b4"; // Replace with actual address

const Page = () => {
  const [amount, setAmount] = useState("");
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [flowPortal, setFlowPortal] = useState(null);
  const [ancient8Portal, setAncient8Portal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [networkId, setNetworkId] = useState(null);

  useEffect(() => {
    const initWeb3 = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          // Request user to connect their wallet
          await window.ethereum.request({ method: "eth_requestAccounts" });

          // Initialize Web3
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);

          // Get user account
          const accounts = await web3Instance.eth.getAccounts();
          setAccount(accounts[0]);

          // Get network ID
          const netId = await web3Instance.eth.net.getId();
          setNetworkId(netId);

          // Initialize contracts
          const flowContract = new web3Instance.eth.Contract(
            FlowPortalABI,
            FLOW_PORTAL_ADDRESS
          );
          const ancient8Contract = new web3Instance.eth.Contract(
            Ancient8PortalABI,
            ANCIENT8_PORTAL_ADDRESS
          );

          setFlowPortal(flowContract);
          setAncient8Portal(ancient8Contract);

          // Set up event listeners for network and account changes
          window.ethereum.on("accountsChanged", (accounts) => {
            setAccount(accounts[0]);
          });

          window.ethereum.on("chainChanged", () => {
            window.location.reload();
          });
        } catch (error) {
          console.error("Error initializing Web3:", error);
          setStatus(`Error: ${error.message}`);
        }
      } else {
        console.error("MetaMask not detected. Please install MetaMask.");
        setStatus("MetaMask not detected. Please install MetaMask.");
      }
    };

    initWeb3();
  }, []);

  // Generate signature for the transaction
  const signMessage = async (sender, receiver, amount, nonce) => {
    try {
      const amountInWei = Web3.utils.toWei(amount, "ether");
      
      // Create a message hash
      const message = web3.utils.soliditySha3(
        { t: "address", v: sender },
        { t: "address", v: receiver },
        { t: "uint256", v: amountInWei },
        { t: "uint256", v: nonce }
      );
      
      // Use personal_sign instead of eth_sign for better compatibility
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, account]
      });
      
      return signature;
    } catch (error) {
      console.error("Error signing message:", error);
      setStatus(`Error signing message: ${error.message}`);
      return null;
    }
  };

  const burnTokens = async () => {
    if (!flowPortal || !account) {
      setStatus("Flow contract not loaded or wallet not connected");
      return;
    }
    
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setStatus("Please enter a valid amount");
      return;
    }

    // Check if connected to Flow Testnet
    if (!isFlowNetwork()) {
      setStatus("Please connect to Flow Testnet");
      return;
    }

    setLoading(true);
    setStatus("Preparing transaction...");

    try {
      // Get current nonce from the contract
      const currentNonce = await flowPortal.methods.nonce().call();
      const crossChainNonce = parseInt(currentNonce) + 1;
      
      // Generate signature
      const signature = await signMessage(account, account, amount, crossChainNonce);
      if (!signature) {
        setLoading(false);
        return;
      }

      setStatus("Burning tokens on Flow Testnet...");
      const tx = await flowPortal.methods
        .burn(
          Web3.utils.toWei(amount, "ether"),
          crossChainNonce,
          signature
        )
        .send({ from: account });

      console.log("Tokens burned on Flow Testnet!", tx);
      setStatus(`Transaction successful! Tokens burned on Flow Testnet. Tx hash: ${tx.transactionHash}`);
    } catch (error) {
      console.error("Error burning tokens:", error);
      setStatus(`Error burning tokens: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const mintTokens = async () => {
    if (!ancient8Portal || !account) {
      setStatus("Ancient8 contract not loaded or wallet not connected");
      return;
    }
    
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setStatus("Please enter a valid amount");
      return;
    }

    // Check if connected to Ancient8 Testnet
    if (!isAncient8Network()) {
      setStatus("Please connect to Ancient8 Testnet");
      return;
    }

    setLoading(true);
    setStatus("Preparing transaction...");

    try {
      // Get current nonce from the contract
      const currentNonce = await ancient8Portal.methods.nonce().call();
      const crossChainNonce = parseInt(currentNonce) + 1;
      
      // Generate signature
      const signature = await signMessage(account, account, amount, crossChainNonce);
      if (!signature) {
        setLoading(false);
        return;
      }

      setStatus("Minting tokens on Ancient8 Testnet...");
      const tx = await ancient8Portal.methods
        .mint(
          account, // sender
          account, // receiver
          Web3.utils.toWei(amount, "ether"),
          crossChainNonce,
          signature
        )
        .send({ from: account });

      console.log("Tokens minted on Ancient8 Testnet!", tx);
      setStatus(`Transaction successful! Tokens minted on Ancient8 Testnet. Tx hash: ${tx.transactionHash}`);
    } catch (error) {
      console.error("Error minting tokens:", error);
      setStatus(`Error minting tokens: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Check if connected to Flow Testnet
  const isFlowNetwork = () => {
    // Replace with actual Flow Testnet chain ID
    const FLOW_TESTNET_CHAIN_ID = 545; // Example ID - replace with actual
    return true;
  };

  // Check if connected to Ancient8 Testnet
  const isAncient8Network = () => {
    // Replace with actual Ancient8 Testnet chain ID
    const ANCIENT8_TESTNET_CHAIN_ID = 28122024; // Example ID - replace with actual
    return true;
  };

  // Get current network name
  const getNetworkName = () => {
    // Replace with actual chain IDs
    const FLOW_TESTNET_CHAIN_ID = 12340001; // Example ID - replace with actual
    const ANCIENT8_TESTNET_CHAIN_ID = 28122024; // Example ID - replace with actual
    
    switch (networkId) {
      case FLOW_TESTNET_CHAIN_ID:
        return "Flow Testnet";
      case ANCIENT8_TESTNET_CHAIN_ID:
        return "Ancient8 Testnet";
      default:
        return "Unknown Network";
    }
  };

  return (
    <div className="p-4 mt-24 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Cross-Chain Bridge</h1>
      
      <div className="mb-4 p-3 bg-gray-100 rounded">
        <p className="mb-1"><strong>Wallet:</strong> {account ? `${account.substring(0, 6)}...${account.substring(38)}` : "Not connected"}</p>
        <p><strong>Network:</strong> {networkId ? getNetworkName() : "Not connected"}</p>
      </div>
      
      <div className="mb-6">
        <label className="block mb-2 text-sm font-medium">Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="Enter amount"
          disabled={loading}
        />
      </div>
      
      <div className="flex flex-col space-y-2">
        <button 
          onClick={burnTokens} 
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded" 
          disabled={loading}
        >
          {loading ? "Processing..." : "Burn on Flow Testnet"}
        </button>
        
        <button 
          onClick={mintTokens} 
          className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded" 
          disabled={loading}
        >
          {loading ? "Processing..." : "Mint on Ancient8 Testnet"}
        </button>
      </div>
      
      {status && (
        <div className={`mt-4 p-3 rounded ${status.includes("Error") ? "bg-red-100 text-red-700" : status.includes("successful") ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
          {status}
        </div>
      )}
      
      <div className="mt-8 text-sm text-gray-600">
        <p className="font-medium mb-2">Instructions:</p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>For burning tokens on Flow Testnet, connect to Flow Testnet</li>
          <li>For minting tokens on Ancient8 Testnet, connect to Ancient8 Testnet</li>
          <li>Enter the amount of tokens to bridge</li>
          <li>Approve the transaction in your wallet</li>
          <li>Wait for the transaction to be confirmed</li>
        </ol>
      </div>
    </div>
  );
};

export default Page;