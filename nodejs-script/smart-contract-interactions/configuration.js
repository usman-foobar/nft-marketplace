const ethers = require("ethers");
require("dotenv").config();

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

const provider = new ethers.providers.AlchemyProvider(
  "goerli",
  ALCHEMY_API_KEY
);
const signer = new ethers.Wallet(process.env.OWNER_KEY, provider);
const minter = new ethers.Wallet(process.env.MINTER_KEY, provider);

module.exports.createNftContractInstance = () => {
  try {
    const contractAddress = process.env.NFT_CONTRACT_ADDRESS;
    const { NftContractAbi } = require("../abis/NftContract");

    const NftContract = new ethers.Contract(
      contractAddress,
      NftContractAbi,
      signer
    );

    return { NftContract, minter, provider };
  } catch (error) {
    console.log("Error occurred", error);
  }
};

module.exports.createMarketplaceContractInstance = () => {
  try {
    const contractAddress = process.env.MARKETPLACE_CONTRACT_ADDRESS;
    const { MarketplaceAbi } = require("../abis/Marketplace");

    const Marketplace = new ethers.Contract(
      contractAddress,
      MarketplaceAbi,
      signer
    );

    return { Marketplace, signer, provider };
  } catch (error) {
    console.log("Error occurred", error);
  }
};
