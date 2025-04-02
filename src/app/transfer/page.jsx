"use client"

import React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { TextGenerateEffect } from "../components/ui/TextGenerateEffect"
import Web3Service from "./web3-service"
import SupportedChains from "./supported-chains"
import TransactionGraph from "./transaction-graph"
import { Html5Qrcode } from 'html5-qrcode';
import {
  Send,
  ReceiptIcon,
  RotateCcw,
  Wallet,
  QrCode,
  Clock,
  TrendingUp,
  BarChart3,
  ArrowLeftRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  ChevronDown,
  Camera,
  Shield,
  Copy,
  RefreshCw,
  X,
} from "lucide-react"
import { useChainId } from "wagmi"

export default function TransferPage() {
  const [activeTab, setActiveTab] = useState("send")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showQrScanner, setShowQrScanner] = useState(false)
  const [selectedToken, setSelectedToken] = useState(null)
  const [showTokenList, setShowTokenList] = useState(false)
  const [transactionView, setTransactionView] = useState("all")
  const [account, setAccount] = useState("")
  const [balance, setBalance] = useState("0")
  const [transactions, setTransactions] = useState([])
  const [qrImage, setQrImage] = useState(null)
  const [qrImageUrl, setQrImageUrl] = useState("")
  const [isReadingQr, setIsReadingQr] = useState(false)
  let chainId=useChainId();
  const web3Service = new Web3Service(chainId);
  const curr_symbol=web3Service.curr_symbol;
  // Form states
  const [sendForm, setSendForm] = useState({
    recipient: "",
    amount: "",
    username: "",
  })

  const [receiveForm, setReceiveForm] = useState({
    sender: "",
    username: "",
  })

  const [refundForm, setRefundForm] = useState({
    transactionId: "",
    receiverAddress: "",
  })

  const tokens = [
    {
      id: "eth",
      name: "Ethereum",
      symbol: "ETH",
      price: "$2,234.25",
      change: "+5.2%",
      icon: "https://cdn-icons-png.flaticon.com/512/6001/6001368.png",
    },
    {
      id: "usdt",
      name: "Tether",
      symbol: "USDT",
      price: "$1.00",
      change: "+0.1%",
      icon: "https://cdn-icons-png.flaticon.com/512/6001/6001566.png",
    },
    {
      id: "hbar",
      name: "Hedera",
      symbol: "HBAR",
      price: "$1.00",
      change: "+0.1%",
      icon: "https://cdn-icons-png.flaticon.com/512/6001/6001402.png",
    },
    {
      id: "usdc",
      name: "USD Coin",
      symbol: "USDC",
      price: "$1.00",
      change: "0%",
      icon: "https://cdn-icons-png.flaticon.com/512/14446/14446285.png",
    },
  ]

  const stats = {
    totalSent: `0.00 ${curr_symbol} `,
    totalReceived: `0.00 ${curr_symbol}`,
    pendingTransactions: 0,
    successRate: "98.5%",
  }

  useEffect(() => {
    const initializeWeb3 = async () => {
      try {
        const userAccount = await web3Service.getAccount()
        console.log("My user Account is::::",userAccount);
        
        setAccount(userAccount)

        if (userAccount) {
          const userBalance = await web3Service.getBalance()
          setBalance(userBalance)

          await loadTransactionHistory()
        }
      } catch (error) {
        console.error("Error initializing web3:", error)
        setError("Failed to connect to wallet. Please make sure MetaMask is installed and unlocked.")
      }
    }

    initializeWeb3()
  }, [])


  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Display the selected image
    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      const result = await html5QrCode.scanFileV2(file);
      
      // Close the scanner instance
      html5QrCode.clear();

      // Display the result
      // setScanResult(result.decodedText);
      console.log("My Result for qr code is::::::"+result.decodedText);
      
    } catch (err) {
      console.error("Error scanning QR code:", err);
      setError('Could not decode QR code from this image. Please try another image.');
    } 
  };



  const loadTransactionHistory = async () => {
    try {
      const events = await web3Service.listEvents()

      // Format events into transaction history
      const formattedTransactions = events.map((event, index) => ({
        id: event.transaction_id,
        type: event.event_type.toLowerCase(),
        amount: `${event.amount} ${curr_symbol}`,
        status: "completed",
        to: "0x71C...976F", // This would need to be extracted from the actual event
        from: "0x3A1...B45E", // This would need to be extracted from the actual event
        date: new Date().toISOString().split("T")[0], // Placeholder
        time: new Date().toTimeString().split(" ")[0].substring(0, 5), // Placeholder
      }))

      setTransactions(formattedTransactions)
    } catch (error) {
      console.error("Error loading transaction history:", error)
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const { recipient, amount, username } = sendForm

      if (!amount) {
        throw new Error("Amount is required.")
      }

      await web3Service.sendMoney(recipient  || "0xDF34e3550c1c05A61CE1b183420F532d8c0326CA", amount, username)

      setSuccess("Transaction sent successfully!")
      setSendForm({ recipient: "", amount: "", username: "" })

      // Reload transaction history
      await loadTransactionHistory()

      // Update balance
      const userBalance = await web3Service.getBalance()
      setBalance(userBalance)
    } catch (error) {
      console.error("Error sending transaction:", error)
      setError(error.message || "Failed to send transaction")
    } finally {
      setLoading(false)
    }
  }

  const handleReceive = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const { sender, username } = receiveForm
      console.log("my sender address is::::",sender);
      console.log("my Username address is::::",username);
      
      
      await web3Service.receiveMoney(sender || "0xDF34e3550c1c05A61CE1b183420F532d8c0326CA", username)

      setSuccess("Funds received successfully!")
      setReceiveForm({ sender: "" ||"0xDF34e3550c1c05A61CE1b183420F532d8c0326CA", username: "" })

      // Reload transaction history
      await loadTransactionHistory()

      // Update balance
      const userBalance = await web3Service.getBalance()
      setBalance(userBalance)
    } catch (error) {
      console.error("Error receiving funds:", error)
      setError(error.message || "Failed to receive funds")
    } finally {
      setLoading(false)
    }
  }

  const handleRefund = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const { transactionId, receiverAddress } = refundForm
      const txId = transactionId ? Number.parseInt(transactionId) : 0
      // dummy address for this
      await web3Service.refundMoney(txId, receiverAddress ||"0xDF34e3550c1c05A61CE1b183420F532d8c0326CA")

      setSuccess("Refund processed successfully!")
      setRefundForm({ transactionId: "", receiverAddress: ""  })

      // Reload transaction history
      await loadTransactionHistory()

      // Update balance
      const userBalance = await web3Service.getBalance()
      setBalance(userBalance)
    } catch (error) {
      console.error("Error processing refund:", error)
      setError(error.message || "Failed to process refund")
    } finally {
      setLoading(false)
    }
  }

  const handleQrImageUpload =async (e) => {  
    const file = e.target.files?.[0];
    console.log("My File is:::::", file);
      const imageUrl = URL.createObjectURL(file);
    // setSelectedImage(imageUrl);
    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      const result = await html5QrCode.scanFileV2(file);
      // Close the scanner instance
      html5QrCode.clear();
      // Display the result
      console.log(result.decodedText);
      setReceiveForm({sender:result.decodedText,username:""});
      // setScanResult(result.decodedText);
    } catch (err) {
      console.log("Error scanning QR code:", err);

    }
    
};

  const readQrCode = async () => {
    if (!qrImageUrl) return

    setIsReadingQr(true)
    setError("")

    try {
      // First, upload the image to get a URL
      const formData = new FormData()
      if (qrImage) {
        formData.append("file", qrImage)
      }

      // This is a placeholder for your image upload service
      // You would need to implement this or use a service like Vercel Blob
      // const uploadResponse = await fetch("/api/upload", {
      //   method: "POST",
      //   body: formData,
      // })

      // if (!uploadResponse.ok) {
      //   throw new Error("Failed to upload image")
      // }

      // const { url } = await uploadResponse.json()

      // Now use the QR code reading API
      console.log("my formdata is:::",qrImage);
      console.log("my formdata URL  is:::",qrImageUrl);
      
      const qrResponse = await fetch(`https://api.qrserver.com/v1/read-qr-code/?fileurl=${formData.file}`)
      console.log("My QR Response is::::",qrResponse);
      

      if (!qrResponse.ok) {
        throw new Error("Failed to read QR code")
      }

      const qrData = await qrResponse.json()

      if (qrData && qrData.length > 0 && qrData[0].symbol && qrData[0].symbol.length > 0) {
        const qrText = qrData[0].symbol[0].data

        // Parse the QR data - assuming it's in format "address:amount:username"
        // Adjust this parsing logic based on your actual QR code format
        const parts = qrText.split(":")

        if (activeTab === "send") {
          setSendForm({
            recipient: parts[0] || "",
            amount: parts[1] || "",
            username: parts[2] || "",
          })
        } else if (activeTab === "receive") {
          setReceiveForm({
            sender: parts[0] || "",
            username: parts[2] || "",
          })
        } else if (activeTab === "refund") {
          setRefundForm({
            ...refundForm,
            receiverAddress: parts[0] || "",
          })
        }

        setSuccess("QR code read successfully!")
      } else {
        throw new Error("No QR code found or invalid QR code")
      }
    } catch (error) {
      console.error("Error reading QR code:", error)
      setError(error.message || "Failed to read QR code")
    } finally {
      setIsReadingQr(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* <div className="absolute z-"> */}

      {/* Premium Aurora Gradient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute top-0 -left-1/4 w-[80%] h-[80%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse"
          style={{ animationDuration: "8s" }}
        ></div>
        <div
          className="absolute top-1/3 right-0 w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse"
          style={{ animationDuration: "12s" }}
        ></div>
        <div
          className="absolute -bottom-1/4 left-1/4 w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse"
          style={{ animationDuration: "10s" }}
        ></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/5 rounded-full blur-[150px]"></div>
      </div>
      {/* Background SVG */}
      <div className="absolute inset-0 pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute  -top-[10vh] left-[40vw] w-[1000px] h-[1000px] object-cover mix-blend-lighten"
        >
          <source src="https://framerusercontent.com/assets/GifwF0GC6kftxDgniF6lsk9E9wc.mp4" type="video/mp4" />
        </video>
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] opacity-30 blur-3xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full" />
        <div className="absolute top-20 left-1/2 w-[1000px] h-[1000px] opacity-30 blur-3xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-5xl text-white md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/50 pt-11">
            <TextGenerateEffect words="Make Crypto Transactions Easier" />
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Send, receive, and manage your crypto transactions securely with our advanced portal
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Sent</p>
                <p className="text-xl font-bold">{stats.totalSent}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800">
            <div className="flex items-center gap-3">
              <div className="bg-green-500/20 p-2 rounded-lg">
                <BarChart3 className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Received</p>
                <p className="text-xl font-bold">{stats.totalReceived}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-500/20 p-2 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Pending</p>
                <p className="text-xl font-bold">{stats.pendingTransactions}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800">
            <div className="flex items-center gap-3">
              <div className="bg-purple-500/20 p-2 rounded-lg">
                <Shield className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Success Rate</p>
                <p className="text-xl font-bold">{stats.successRate}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex justify-center space-x-2 mb-8">
            {[
              { id: "send", label: "Send", icon: Send, color: "blue" },
              { id: "receive", label: "Receive", icon: ReceiptIcon, color: "green" },
              { id: "refund", label: "Refund", icon: RotateCcw, color: "yellow" },
            ].map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                flex items-center px-6 py-3 rounded-xl transition-all
                ${
                  activeTab === tab.id
                    ? `bg-${tab.color}-500/20 text-${tab.color}-400 border border-${tab.color}-500/30`
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }
                  `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.label}
              </motion.button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-800 overflow-hidden">
            <AnimatePresence mode="wait">
              {activeTab === "send" && (
                <motion.div
                  key="send"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-6"
                >
                  <form onSubmit={handleSend}>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm text-gray-400 block mb-2">Select Token</label>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setShowTokenList(!showTokenList)}
                              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-3 flex items-center justify-between"
                            >
                              {selectedToken ? (
                                <div className="flex items-center">
                                  <Image
                                    src={selectedToken.icon || "/placeholder.svg"}
                                    alt={selectedToken.name}
                                    width={24}
                                    height={24}
                                    className="mr-2"
                                  />
                                  <div>
                                    <p className="font-medium">{selectedToken.name}</p>
                                    <p className="text-sm text-gray-400">{selectedToken.price}</p>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-400">Select a token</span>
                              )}
                              <ChevronDown className="h-5 w-5 text-gray-400" />
                            </button>

                            {showTokenList && (
                              <div className="absolute z-10 w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl">
                                {tokens.map((token) => (
                                  <button
                                    key={token.id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedToken(token)
                                      setShowTokenList(false)
                                    }}
                                    className="w-full p-3 flex items-center justify-between hover:bg-gray-700"
                                  >
                                    <div className="flex items-center">
                                      <Image
                                        src={token.icon || "/placeholder.svg"}
                                        alt={token.name}
                                        width={24}
                                        height={24}
                                        className="mr-2"
                                      />
                                      <div>
                                        <p className="font-medium">{token.name}</p>
                                        <p className="text-sm text-gray-400">{token.price}</p>
                                      </div>
                                    </div>
                                    <span
                                      className={`text-sm ${
                                        token.change.startsWith("+") ? "text-green-400" : "text-red-400"
                                      }`}
                                    >
                                      {token.change}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="text-sm text-gray-400 block mb-2">Amount</label>
                          <div className="relative">
                            <input
                              type="number"
                              placeholder="0.00"
                              value={sendForm.amount}
                              onChange={(e) => setSendForm({ ...sendForm, amount: e.target.value })}
                              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-sm text-gray-400 block mb-2">Recipient Address</label>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Enter wallet address or ENS"
                              value={sendForm.recipient}
                              onChange={(e) => setSendForm({ ...sendForm, recipient: e.target.value })}
                              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 pl-10 pr-10 text-white"
                            />
                            <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <button
                              type="button"
                              onClick={() => setShowQrScanner(true)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                              <QrCode className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm text-gray-400 block mb-2">Username (Any one username or address)</label>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Enter username if registered"
                              value={sendForm.username}
                              onChange={(e) => setSendForm({ ...sendForm, username: e.target.value })}
                              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                          <h3 className="text-lg font-medium mb-3">Transaction Summary</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Amount</span>
                              <span>{sendForm.amount || "0.00"} {curr_symbol}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Network Fee</span>
                              <span>~0.001 {curr_symbol}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Total</span>
                              <span className="font-medium">
                                {sendForm.amount ? (Number.parseFloat(sendForm.amount) + 0.001).toFixed(4) : "0.001"}{" "}
                                {curr_symbol}
                              </span>
                            </div>
                          </div>
                        </div>

                        {(error || success) && (
                          <div
                            className={`p-4 rounded-lg ${error ? "bg-red-900/20 border border-red-800/30" : "bg-green-900/20 border border-green-800/30"}`}
                          >
                            <div className="flex items-start">
                              {error ? (
                                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" />
                              ) : (
                                <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 mr-2 flex-shrink-0" />
                              )}
                              <p className={error ? "text-red-400" : "text-green-400"}>{error || success}</p>
                            </div>
                          </div>
                        )}

                        <button
                          type="submit"
                          // disable the button
                          // if receipent address is there
                          disabled={loading  ||  !sendForm.amount}
                          className={`w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 
                            text-white py-3 rounded-lg flex items-center justify-center group
                            ${loading  || !sendForm.amount ? "opacity-50 cursor-not-allowed" : ""}
                            `}
                        >
                          {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          ) : (
                            <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                          )}
                          {loading ? "Processing..." : "Send Transaction"}
                        </button>
                      </div>
                    </div>
                  </form>
                </motion.div>
              )}

              {activeTab === "receive" && (
                <motion.div
                  key="receive"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-6"
                >
                  <form onSubmit={handleReceive}>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 text-center">
                          {qrImageUrl ? (
                            <div className="relative mb-4">
                              <Image
                                src={qrImageUrl || "/placeholder.svg"}
                                alt="QR Code"
                                width={200}
                                height={200}
                                className="rounded-lg mx-auto"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setQrImageUrl("")
                                  setQrImage(null)
                                }}
                                className="absolute top-2 right-2 bg-gray-900/80 p-1 rounded-full text-gray-400 hover:text-white"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="bg-white p-4 rounded-lg inline-block mb-4">
                              <QrCode className="w-48 h-48 text-gray-800" />
                            </div>
                          )}

                          <div className="space-y-3">
                            {!qrImageUrl ? (
                              <>
                                <p className="text-sm text-gray-400 mb-2">
                                  Scan this QR code to receive payment or upload a QR code image
                                </p>
                                <label className="bg-gray-700/50 hover:bg-gray-700 text-blue-400 py-2 px-4 rounded-lg cursor-pointer flex items-center justify-center">
                                  <Camera className="w-4 h-4 mr-2" />
                                  Upload QR Code Image
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    id="qr-reader"
                                    onChange={handleQrImageUpload}
                                  />
                                </label>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={readQrCode}
                                disabled={isReadingQr}
                                className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 py-2 px-4 rounded-lg flex items-center justify-center w-full"
                              >
                                {isReadingQr ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <QrCode className="w-4 h-4 mr-2" />
                                )}
                                {isReadingQr ? "Reading QR Code..." : "Read QR Code"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-sm text-gray-400 block mb-2">Your Wallet Address</label>
                          <div className="relative">
                            <input
                              type="text"
                              readOnly
                              value={account}
                              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(account)
                                setSuccess("Address copied to clipboard!")
                                setTimeout(() => setSuccess(""), 2000)
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                              <Copy className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm text-gray-400 block mb-2">Sender Address</label>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Enter sender's wallet address"
                              value={receiveForm.sender}
                              onChange={(e) => setReceiveForm({ ...receiveForm, sender: e.target.value })}
                              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-sm text-gray-400 block mb-2">Username</label>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Enter username if registered"
                              value={receiveForm.username}
                              onChange={(e) => setReceiveForm({ ...receiveForm, username: e.target.value })}
                              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white"
                            />
                          </div>
                        </div>

                        {(error || success) && (
                          <div
                            className={`p-4 rounded-lg ${error ? "bg-red-900/20 border border-red-800/30" : "bg-green-900/20 border border-green-800/30"}`}
                          >
                            <div className="flex items-start">
                              {error ? (
                                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" />
                              ) : (
                                <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 mr-2 flex-shrink-0" />
                              )}
                              <p className={error ? "text-red-400" : "text-green-400"}>{error || success}</p>
                            </div>
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={loading }
                          className={`w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 
                            text-white py-3 rounded-lg flex items-center justify-center
                            ${loading  ? "opacity-50 cursor-not-allowed" : ""}
                            `}
                        >
                          {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          ) : (
                            <ArrowLeftRight className="w-5 h-5 mr-2" />
                          )}
                          {loading ? "Processing..." : "Receive Funds"}
                        </button>
                      </div>
                    </div>
                  </form>
                </motion.div>
              )}

              {activeTab === "refund" && (
                <motion.div
                  key="refund"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-6"
                >
                  <form onSubmit={handleRefund}>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm text-gray-400 block mb-2">Transaction ID (Anyone Tx Id Or Address)</label>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Enter transaction ID"
                              value={refundForm.transactionId}
                              onChange={(e) => setRefundForm({ ...refundForm, transactionId: e.target.value })}
                              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 pl-10 text-white"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                        </div>

                        <div>
                          <label className="text-sm text-gray-400 block mb-2">Receiver Address</label>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Enter receiver's address"
                              value={refundForm.receiverAddress}
                              onChange={(e) => setRefundForm({ ...refundForm, receiverAddress: e.target.value })}
                              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 pl-10 text-white"
                            />
                            <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                        </div>

                        <div>
                          <label className="text-sm text-gray-400 block mb-2">Refund Reason</label>
                          <select className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white appearance-none">
                            <option value="">Select reason</option>
                            <option value="wrong_address">Wrong Address</option>
                            <option value="wrong_amount">Wrong Amount</option>
                            <option value="failed_transaction">Failed Transaction</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-sm text-gray-400 block mb-2">Description</label>
                          <textarea
                            placeholder="Provide additional details about the refund..."
                            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white h-24 resize-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-yellow-900/20 border border-yellow-800/30 rounded-lg p-4">
                          <div className="flex items-start">
                            <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 mr-2" />
                            <div>
                              <h4 className="font-medium text-yellow-400">Important Notice</h4>
                              <p className="text-sm text-gray-400 mt-1">
                                Refunds may take 1-3 business days to process. Make sure all provided information is
                                correct.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-800/50 rounded-lg p-4 border border-  gray-700">
                          <h3 className="text-lg font-medium mb-3">Refund Summary</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Original Amount</span>
                              <span>0.00 {curr_symbol}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Refund Fee</span>
                              <span>0.001 {curr_symbol}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Total Refund</span>
                              <span className="font-medium">0.001 {curr_symbol}</span>
                            </div>
                          </div>
                        </div>

                        {(error || success) && (
                          <div
                            className={`p-4 rounded-lg ${error ? "bg-red-900/20 border border-red-800/30" : "bg-green-900/20 border border-green-800/30"}`}
                          >
                            <div className="flex items-start">
                              {error ? (
                                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" />
                              ) : (
                                <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 mr-2 flex-shrink-0" />
                              )}
                              <p className={error ? "text-red-400" : "text-green-400"}>{error || success}</p>
                            </div>
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={loading }
                          className={`w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 
                            text-white py-3 rounded-lg flex items-center justify-center
                            ${loading  ? "opacity-50 cursor-not-allowed" : ""}
                            `}
                        >
                          {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          ) : (
                            <RotateCcw className="w-5 h-5 mr-2" />
                          )}
                          {loading ? "Processing..." : "Process Refund"}
                        </button>
                      </div>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Transaction History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-800 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Recent Transactions</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    className="bg-transparent text-gray-400 text-sm"
                    value={transactionView}
                    onChange={(e) => setTransactionView(e.target.value)}
                  >
                    <option value="all">All Transactions</option>
                    <option value="send">Sent</option>
                    <option value="receive">Received</option>
                    <option value="refund">Refunds</option>
                  </select>
                </div>
                <button onClick={loadTransactionHistory} className="text-gray-400 hover:text-white">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 text-sm">
                    <th className="pb-4">Type</th>
                    <th className="pb-4">Amount</th>
                    <th className="pb-4">Tx id </th>
                    <th className="pb-4">To/From</th>
                    <th className="pb-4">Date</th>
                    <th className="pb-4">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length > 0 ? (
                    transactions
                      .filter((tx) => transactionView === "all" || tx.type === transactionView)
                      .map((tx) => (
                        <tr key={tx.id} className="border-t border-gray-800">
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <div
                                className={`p-1.5 rounded-lg ${
                                  tx.type === "send"
                                    ? "bg-blue-500/20"
                                    : tx.type === "receive"
                                      ? "bg-green-500/20"
                                      : "bg-yellow-500/20"
                                }`}
                              >
                                {tx.type === "send" ? (
                                  <Send className="w-4 h-4 text-blue-400" />
                                ) : tx.type === "receive" ? (
                                  <ReceiptIcon className="w-4 h-4 text-green-400" />
                                ) : (
                                  <RotateCcw className="w-4 h-4 text-yellow-400" />
                                )}
                              </div>
                              <span className="capitalize">{tx.type}</span>
                            </div>
                          </td>
                          <td className="py-4">{tx.amount}</td>
                          <td className="py-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                tx.status === "completed"
                                  ? "bg-green-500/20 text-green-400"
                                  : tx.status === "pending"
                                    ? "bg-yellow-500/20 text-yellow-400"
                                    : "bg-blue-500/20 text-blue-400"
                              }`}
                            >
                              {tx.id}
                            </span>
                          </td>
                          <td className="py-4">{tx.to || tx.from}</td>
                          <td className="py-4">{tx.date}</td>
                          <td className="py-4">{tx.time}</td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        No transactions found. Start sending or receiving crypto to see your history.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Transaction Graph Component */}
          <TransactionGraph transactions={transactions} />
        </div>

        {/* Supported Chains Section */}
        <div className="mt-16">
          <SupportedChains />
        </div>
      </div>
      {/* QR Scanner Modal */}
      {showQrScanner && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Scan QR Code</h3>
              <button
                onClick={() => {
                  setShowQrScanner(false)
                  setQrImageUrl("")
                  setQrImage(null)
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {qrImageUrl ? (
                <div className="relative">
                  <Image
                    src={qrImageUrl || "/placeholder.svg"}
                    alt="QR Code"
                    width={300}
                    height={300}
                    className="rounded-lg mx-auto"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setQrImageUrl("")
                      setQrImage(null)
                    }}
                    className="absolute top-2 right-2 bg-gray-900/80 p-1 rounded-full text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
                  <Camera className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">Upload a QR code image</p>
                  <label className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg cursor-pointer inline-block">
                    Select Image
                    <input type="file" accept="image/*" className="hidden" onChange={handleQrImageUpload} />
                  </label>
                </div>
              )}

              {qrImageUrl && (
                <button
                  type="button"
                  onClick={() => {
                    readQrCode()
                    setShowQrScanner(false)
                  }}
                  disabled={isReadingQr}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center"
                >
                  {isReadingQr ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <QrCode className="w-5 h-5 mr-2" />
                  )}
                  {isReadingQr ? "Reading QR Code..." : "Read QR Code"}
                </button>
              )}

              {(error || success) && (
                <div
                  className={`p-4 rounded-lg ${error ? "bg-red-900/20 border border-red-800/30" : "bg-green-900/20 border border-green-800/30"}`}
                >
                  <div className="flex items-start">
                    {error ? (
                      <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 mr-2 flex-shrink-0" />
                    )}
                    <p className={error ? "text-red-400" : "text-green-400"}>{error || success}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

