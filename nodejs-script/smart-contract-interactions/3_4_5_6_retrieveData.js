const { bnToFloat } = require("../helpers/conversions");
const { listingType } = require("../helpers/listingType");

const { createMarketplaceContractInstance } = require("./configuration");

const { Marketplace } = createMarketplaceContractInstance();

// Retrieve data of NFTs on Fixed price and on Auction
async function retrieveDataOfNfts() {
  const itemsOnFixedPrice = await Marketplace.getListedItems(listingType.Fixed);
  const itemsOnAuction = await Marketplace.getListedItems(listingType.Auction);

  const fixedPriceDetailsArray = await Promise.all(
    itemsOnFixedPrice.map(async (itemId) => {
      return await Marketplace.getListingDetails(itemId);
    })
  );

  const auctionDetailsArray = await Promise.all(
    itemsOnAuction.map(async (itemId) => {
      return await Marketplace.getListingDetails(itemId);
    })
  );

  console.log("Fixed price listing details");
  console.table(fixedPriceDetailsArray);
  console.log("Auction listing details");
  console.table(auctionDetailsArray);
}

// Retrieve the auction end time for a specific NFT ID
async function retrieveAuctionEndTime(tokenId) {
  const auctionEndTime = await Marketplace.getAuctionEndTime(tokenId);
  console.log("Auction End Time");
  console.log(bnToFloat(auctionEndTime));
}

// Retrieve wallets addresses of bidders for specific NFT ID
async function retrieveBidderAddresses(tokenId) {
  const biddersAddresses = await Marketplace.getBiddersAddresses(tokenId);
  console.log("Bidders wallet addresses");
  console.log(biddersAddresses);
}

async function retrieveAllNFTData() {
  try {
    await retrieveDataOfNfts();
    await retrieveAuctionEndTime(1);
    await retrieveBidderAddresses(1);
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  }
}

retrieveAllNFTData();
