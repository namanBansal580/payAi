// Contract ABI - This should be replaced with your actual ABI
export const CONTRACT_ABI = [
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_amount",
          type: "uint256",
        },
        {
          internalType: "string",
          name: "_info",
          type: "string",
        },
      ],
      name: "create_pot",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address[]",
          name: "_address_array",
          type: "address[]",
        },
        {
          internalType: "uint256[]",
          name: "amount_array",
          type: "uint256[]",
        },
      ],
      name: "group_payments",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_sender_add",
          type: "address",
        },
        {
          internalType: "string",
          name: "_username",
          type: "string",
        },
      ],
      name: "receive_money",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "sender_address",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "receiveMoney_event",
      type: "event",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_trans_id",
          type: "uint256",
        },
        {
          internalType: "address",
          name: "_rec_add",
          type: "address",
        },
      ],
      name: "refund_money",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "string",
          name: "_userName",
          type: "string",
        },
      ],
      name: "register_user",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_recipient_add",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "_amount",
          type: "uint256",
        },
        {
          internalType: "string",
          name: "_username",
          type: "string",
        },
      ],
      name: "send_money",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "string",
          name: "_msg",
          type: "string",
        },
        {
          internalType: "string",
          name: "_filehash",
          type: "string",
        },
        {
          internalType: "address",
          name: "_rec",
          type: "address",
        },
      ],
      name: "send_msg",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "sender_address",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "sendMoney_event",
      type: "event",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_pot_id",
          type: "uint256",
        },
      ],
      name: "withdraw_pot",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "getBalance",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "list_adds",
      outputs: [
        {
          internalType: "address[]",
          name: "",
          type: "address[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "list_events",
      outputs: [
        {
          components: [
            {
              internalType: "uint256",
              name: "transaction_id",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
            {
              internalType: "string",
              name: "event_type",
              type: "string",
            },
          ],
          internalType: "struct CryptoSafe.event_emit[]",
          name: "",
          type: "tuple[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_rec",
          type: "address",
        },
      ],
      name: "list_msg",
      outputs: [
        {
          components: [
            {
              internalType: "address",
              name: "_rec",
              type: "address",
            },
            {
              internalType: "string",
              name: "msg",
              type: "string",
            },
            {
              internalType: "string",
              name: "filehash",
              type: "string",
            },
          ],
          internalType: "struct CryptoSafe.msgInfo[]",
          name: "",
          type: "tuple[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "list_pots",
      outputs: [
        {
          components: [
            {
              internalType: "uint256",
              name: "transaction_id",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
            {
              internalType: "string",
              name: "info",
              type: "string",
            },
          ],
          internalType: "struct CryptoSafe.pot[]",
          name: "",
          type: "tuple[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ]
  
  export const CONTRACT_ADDRESS = "0x13a3796F3D76dB3D8246D210A171298dC5c2551c"
  
  