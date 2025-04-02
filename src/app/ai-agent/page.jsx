"use client"
import React from "react"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import noise from "../../../public/noise.jpg";
import BG from "../../../public/BG.jpg";
import {
  Send,
  Bot,
  Loader2,
  Shield,
  Coins,
  Zap,
  DollarSign,
  RefreshCw,
  MessageSquare,
  AlertTriangle,
} from "lucide-react"
// import axios from "axios"  
import useSound from "use-sound"
// import { useToast } from "@/components/ui/use-toast"
// import web3Service from "./web3-service"
import AuroraBackground from "./aurora-background"
import GridBackground from "./grid-background"
import web3Service from "../transfer/web3-service"
import Web3Service from "../transfer/web3-service";
import { useChainId } from "wagmi";

// Define types for better type safety




export default function CryptoChatApp() {
// web3Service
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [connected, setConnected] = useState(false)
  const [account, setAccount] = useState("")
  const [showTerms, setShowTerms] = useState(false)
  const [showExamples, setShowExamples] = useState(false)
  const [balance, setBalance] = useState(null)
  const [isProcessingTransaction, setIsProcessingTransaction] = useState(false)
  const messagesEndRef = useRef(null)
  // const { toast } = useToast()
  const [examplePrompt, setExamplePrompt] = useState(null)

  // Use empty functions if sound files aren't available
  // const [playSend] = useSound("/sounds/send.mp3", { volume: 0.5 })
  // const [playReceive] = useSound("/sounds/receive.mp3", { volume: 0.5 })
  const examplePrompts = [
    "Send 0.1 ETH to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    "Receive payment from 0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    "Refund transaction to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    "Check my balance",
  ]

  const supportedChains = [
    { name: "Ethereum", icon: "🌐", description: "Main network for secure transactions" },
    { name: "Polygon", icon: "⚡", description: "Fast & low-cost transactions" },
    { name: "BSC", icon: "🔸", description: "Binance Smart Chain integration" },
  ]

  const features = [
    { name: "Send", icon: <DollarSign className="w-5 h-5" />, description: "Send crypto to any address or username" },
    { name: "Receive", icon: <Zap className="w-5 h-5" />, description: "Claim incoming transactions" },
    { name: "Refund", icon: <RefreshCw className="w-5 h-5" />, description: "Request refunds for transactions" },
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Add welcome message on first load
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          content: "Hello! I'm your CryptoSafe assistant. Connect your wallet to get started with secure transactions.",
          isBot: true,
          timestamp: new Date(),
        },
      ])
    }
  }, [messages])

  // Handle example prompt selection
  useEffect(() => {
    if (examplePrompt) {
      setInput(examplePrompt)
      setExamplePrompt(null)
    }
  }, [examplePrompt])

  // Fetch balance when account changes
  const web3Service=new Web3Service(useChainId());
  useEffect(() => {
    const fetchBalance = async () => {
      if (account) {
        try {
          const bal = await web3Service.getBalance(account)
          setBalance(bal)
        } catch (error) {
          console.error("Error fetching balance:", error)
        }
      }
    }

    fetchBalance()
  }, [account])

  const connectWallet = async () => {
    try {
      // Initialize Web3 service
      await web3Service.initWeb3()
      const currentAccount = await web3Service.getAccount()

      if (currentAccount) {
        setAccount(currentAccount)
        setConnected(true)
        // playReceive()

        // toast({
        //   title: "Wallet Connected",
        //   description: `Connected to ${currentAccount.substring(0, 6)}...${currentAccount.substring(38)}`,
        // })

        // Add a welcome message after connecting
        setMessages((prev) => [
          ...prev,
          {
            content: `Welcome! Your wallet is now connected. What would you like to do today?`,
            isBot: true,
            timestamp: new Date(),
          },
        ])
      } else {
        // toast({
        //   title: "Connection Failed",
        //   description: "No account found. Please unlock MetaMask.",
        //   variant: "destructive",
        // })
      }
    } catch (error) {
      console.error("Error connecting wallet:", error)
      // toast({
      //   title: "Connection Failed",
      //   description: "Failed to connect to your wallet",
      //   variant: "destructive",
      // })
    }
  }

  const executeSmartContractFunction = async (response) => {
    response=response.res;
    console.log("My response is::::::::",response);
    
    if (!response.type) {
      console.warn("Transaction type not specified in response:", response)
      return false
    }

    setIsProcessingTransaction(true)

    try {
      // Execute the appropriate function based on transaction type
      switch (response.type) {
        case "send":
          if (!response.amount) {
            throw new Error("Missing address or amount for send transaction")
          }

          await web3Service.sendMoney(response.address || "0x163fADD5eA3B5cC8F59E58C88818567F2FADc75a", response.amount, response.username || "")

          // playSend()

          // Update balance after transaction
          const newBalance = await web3Service.getBalance(account)
          setBalance(newBalance)

          return true

        case "receive":
      

          await web3Service.receiveMoney(response.address || "0x163fADD5eA3B5cC8F59E58C88818567F2FADc75a", response.username || "")

          // playReceive()

          // Update balance after transaction
          const updatedBalance = await web3Service.getBalance(account)
          setBalance(updatedBalance)

          return true

        case "refund":
         
          await web3Service.refundMoney(
            0, // Default transaction ID
            response.address || "0x163fADD5eA3B5cC8F59E58C88818567F2FADc75a",
          )

          // playReceive()

          // Update balance after transaction
          const balanceAfterRefund = await web3Service.getBalance(account)
          setBalance(balanceAfterRefund)

          return true

        default:
          throw new Error(`Unknown transaction type: ${response.type}`)
      }
    } catch (error) {
      console.error("Smart contract error:", error)
      // toast({
      //   title: "Transaction Failed",
      //   description: error instanceof Error ? error.message : "Unknown error occurred",
      //   variant: "destructive",
      // })
      return false
    } finally {
      setIsProcessingTransaction(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = {
      content: input,
      isBot: false,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    // playSend()

    // Check for balance request
    if (input.toLowerCase().includes("balance")) {
      try {
        const bal = await web3Service.getBalance(account)
        setBalance(bal)

        setMessages((prev) => [
          ...prev,
          {
            content: `Your current balance is ${bal} ${web3Service.curr_symbol}.`,
            isBot: true,
            timestamp: new Date(),
          },
        ])

        setIsLoading(false)
        return
      } catch (error) {
        console.error("Error fetching balance:", error)
      }
    }

    try {
      // Add a typing indicator
      const typingIndicatorId = Date.now()
      setMessages((prev) => [
        ...prev,
        {
          content: "...",
          isBot: true,
          timestamp: new Date(typingIndicatorId),
        },
      ])

      // Make API request
      let response = await fetch("https://gemini-service-1.onrender.com/crypto-safeSend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: input }),
      });
      
      response = await response.json(); // Ensuring response is treated as text

      // Remove typing indicator
      setMessages((prev) => prev.filter((msg) => !(msg.isBot && msg.timestamp.getTime() === typingIndicatorId)))

      // Parse the response text as JSON
      let responseData
      try {
        responseData = response
        console.log("API Response:", responseData)
      } catch (error) {
        console.log("Failed to parse response as JSON:", error)
        // throw new Error("Invalid response format from server")
      }

      if (responseData && responseData.success) {
        // Execute smart contract function if needed
        const contractSuccess = await executeSmartContractFunction(responseData)
        console.log("Contract Success is::::::",contractSuccess);
        
        const botMessage= {
          content: contractSuccess==true
            ? "Transaction Processed Successfully..."
            : "Transaction failed. Please check your wallet and try again.",
          isBot: true,
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, botMessage])
        // playReceive()
      } else {
        // Handle API error response
        setMessages((prev) => [
          ...prev,
          {
            content: responseData?.message || "Sorry, I couldn't process that request.",
            isBot: true,
            timestamp: new Date(),
          },
        ])
      }
    } catch (error) {
      console.log("API error:", error)

      // Remove typing indicator if it exists
      setMessages((prev) => prev.filter((msg) => msg.content !== "..."))

      // Add error message with more details
      setMessages((prev) => [
        ...prev,
        {
          content: `An error occurred: ${error instanceof Error ? error.message : "Unknown error"}. Please try again later.`,
          isBot: true,
          timestamp: new Date(),
        },
      ])

      // Show toast with error
      // toast({
      //   title: "Request Failed",
      //   description: "Could not process your request. Please try again.",
      //   variant: "destructive",
      // })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
  className="min-h-screen bg-black flex items-center justify-center p-4 pt-24 relative overflow-hidden "
  
  
>
  {/* Background Image */}
  <img src={BG.src} className=" h-[90vh] top-32 w-[200vw] absolute scale-125 " alt="Background Image" />



      <div className="w-full max-w-4xl relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r text-white mb-2">
           <h1 className=" text-gray-300">Your Pay  <span className="text-pink-500">AI Chatbot</span></h1>
          </div>
          <p className="text-purple-300/80 max-w-2xl mx-auto">
            Your AI-powered assistant for secure Transactions.(Mention @ before username)
          </p>
        </motion.div>
      <GridBackground />
              {/* <AuroraBackground /> */}
 
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-purple-500/20 relative">
          {/* Glass effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 pointer-events-none"></div>

          {!connected ? (
            <div className="p-8 text-center relative z-10">
              <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
              <p className="text-purple-200/70 mb-6 max-w-md mx-auto">
                Connect your MetaMask wallet to start sending, receiving, and managing your crypto transactions
                securely.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={connectWallet}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
              >
                Connect MetaMask
              </motion.button>
            </div>
          ) : (
            <>
              <div className="h-[500px] overflow-y-auto p-6 space-y-4 relative z-10 scrollbar-thin scrollbar-thumb-purple-500/30 scrollbar-track-transparent">
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-[80%] p-4 rounded-2xl ${
                          message.isBot
                            ? "bg-purple-900/30 text-white border border-purple-500/30 backdrop-blur-md"
                            : "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {message.isBot && <Bot className="w-5 h-5 mt-1 flex-shrink-0" />}
                          <div>
                            {message.content === "..." ? (
                              <div className="flex space-x-1">
                                <div
                                  className="w-2 h-2 bg-purple-300 rounded-full animate-bounce"
                                  style={{ animationDelay: "0ms" }}
                                ></div>
                                <div
                                  className="w-2 h-2 bg-purple-300 rounded-full animate-bounce"
                                  style={{ animationDelay: "150ms" }}
                                ></div>
                                <div
                                  className="w-2 h-2 bg-purple-300 rounded-full animate-bounce"
                                  style={{ animationDelay: "300ms" }}
                                ></div>
                              </div>
                            ) : (
                              <p className="whitespace-pre-wrap break-words">{message.content}</p>
                            )}
                            <div className="text-xs text-white/50 mt-1">
                              {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Transaction status indicator */}
              {isProcessingTransaction && (
                <div className="absolute inset-x-0 top-0 p-2 bg-yellow-500/20 backdrop-blur-sm z-20 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 mr-2 animate-pulse" />
                  <p className="text-yellow-200 text-sm">Processing transaction... Please confirm in your wallet</p>
                </div>
              )}

              {/* Balance display */}
              {balance !== null && (
                <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-md rounded-lg px-3 py-1 border border-purple-500/30 z-20">
                  <p className="text-purple-300 text-sm flex items-center">
                    <Coins className="w-3 h-3 mr-1" />
                    {balance} {web3Service.curr_symbol}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="p-4 border-t border-purple-500/20 relative z-10">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-black/30 text-white placeholder-white/50 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-500/20 backdrop-blur-md"
                    disabled={isLoading || isProcessingTransaction}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={isLoading || isProcessingTransaction}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg px-4 py-2 transition-all duration-200 flex items-center gap-2 shadow-md disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </motion.button>
                </div>
              </form>
            </>
          )}
        </div>

        <div className="flex flex-wrap gap-4 mt-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowTerms(!showTerms)}
            className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-2"
          >
            <Shield className="w-4 h-4" />
            Terms & Conditions
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowExamples(!showExamples)}
            className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Example Commands
          </motion.button>

          {connected && (
            <div className="text-purple-400 text-sm flex items-center gap-2">
              <Coins className="w-4 h-4" />
              {account.substring(0, 6)}...{account.substring(38)}
            </div>
          )}
        </div>
        <br />
        <br />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {supportedChains.map((chain, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className="bg-purple-900/20 p-4 rounded-xl border border-purple-500/30 backdrop-blur-md shadow-xl"
            >
              <div className="text-2xl mb-2">{chain.icon}</div>
              <h3 className="text-purple-300 font-semibold">{chain.name}</h3>
              <p className="text-purple-200/70 text-sm">{chain.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className="bg-blue-900/20 p-4 rounded-xl border border-blue-500/30 backdrop-blur-md shadow-xl"
            >
              <div className="text-blue-400 mb-2">{feature.icon}</div>
              <h3 className="text-blue-300 font-semibold">{feature.name}</h3>
              <p className="text-blue-200/70 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
        <AnimatePresence>
          {showTerms && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-4 p-4 bg-black/40 rounded-xl border border-purple-500/20 text-purple-200/70 text-sm backdrop-blur-md"
            >
              <h3 className="text-purple-300 font-semibold mb-2">Terms of Service</h3>
              <p>By using this service, you agree to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Verify all transaction details before confirming</li>
                <li>Accept responsibility for your wallet security</li>
                <li>Understand that transactions are irreversible</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
            </motion.div>
          )}

          {showExamples && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-4 p-4 bg-black/40 rounded-xl border border-purple-500/20 backdrop-blur-md"
            >
              <h3 className="text-purple-300 font-semibold mb-3">Example Commands</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {examplePrompts.map((prompt, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setExamplePrompt(prompt)}
                    className="text-left p-3 bg-purple-900/30 rounded-lg text-purple-200/70 text-sm hover:bg-purple-900/40 transition-colors"
                  >
                    {prompt}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

