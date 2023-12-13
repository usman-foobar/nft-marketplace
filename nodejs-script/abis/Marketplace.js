module.exports.MarketplaceAbi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "bidderAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "sellerAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "bidAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "BidPlaced",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint8",
        name: "version",
        type: "uint8",
      },
    ],
    name: "Initialized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "enum Marketplace.ListingType",
        name: "listingType",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "address",
        name: "sellerAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "basePrice",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "ItemListed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "previousOwnerAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "newOwnerAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "bidAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "NftClaimed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "buyerAddress",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sellerAddress",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "price",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "NftPurchased",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [],
    name: "NftContract",
    outputs: [
      {
        internalType: "contract IERC721Upgradeable",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_tokenId", type: "uint256" }],
    name: "buyNft",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_tokenId", type: "uint256" }],
    name: "claimNft",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_tokenId", type: "uint256" }],
    name: "getAuctionEndTime",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_tokenId", type: "uint256" }],
    name: "getBiddersAddresses",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_tokenId", type: "uint256" }],
    name: "getHighestBid",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "bidderAddress",
            type: "address",
          },
          { internalType: "uint256", name: "bidAmount", type: "uint256" },
          { internalType: "uint256", name: "timestamp", type: "uint256" },
        ],
        internalType: "struct Marketplace.HighestBid",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "enum Marketplace.ListingType",
        name: "_listingType",
        type: "uint8",
      },
    ],
    name: "getListedItems",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_tokenId", type: "uint256" }],
    name: "getListingDetails",
    outputs: [
      {
        components: [
          {
            internalType: "enum Marketplace.ListingType",
            name: "listingType",
            type: "uint8",
          },
          {
            internalType: "address",
            name: "sellerAddress",
            type: "address",
          },
          { internalType: "uint256", name: "tokenId", type: "uint256" },
          {
            internalType: "address",
            name: "contractAddress",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "floorPrice",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "fixedPrice",
            type: "uint256",
          },
          { internalType: "uint256", name: "startTime", type: "uint256" },
          { internalType: "uint256", name: "endTime", type: "uint256" },
        ],
        internalType: "struct Marketplace.ListingDetail",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IERC721Upgradeable",
        name: "_nftContract",
        type: "address",
      },
    ],
    name: "initialise",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_tokenId", type: "uint256" },
      {
        internalType: "enum Marketplace.ListingType",
        name: "_listingType",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "_fixedOrFloorPrice",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_durationInHours",
        type: "uint256",
      },
    ],
    name: "listItem",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_tokenId", type: "uint256" }],
    name: "placeBid",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IERC721Upgradeable",
        name: "_nftContract",
        type: "address",
      },
    ],
    name: "setNftContract",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
