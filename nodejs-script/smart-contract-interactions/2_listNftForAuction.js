const { to18Decimals } = require("../helpers/conversions");
const { listingType } = require("../helpers/listingType");

const { createMarketplaceContractInstance } = require("./configuration");
let { Marketplace } = createMarketplaceContractInstance();

// List an NFT on auction basis for a specific time (highest bidder acquires the NFT).

async function listNftForAuction(
  tokenId,
  listingType,
  fixedPrice,
  duration = 0
) {
  const listTransaction = await Marketplace.listItem(
    tokenId,
    listingType,
    fixedPrice,
    duration,
    {
      gasLimit: "3000000",
    }
  );
  await listTransaction.wait();
  console.log(
    `Transaction Completed! Check it out at: https://goerli.etherscan.io/tx//${listTransaction.hash}`
  );
}

listNftForAuction(1, listingType.Auction, to18Decimals(0.01), 5).catch(
  (err) => {
    console.log(err);
    process.exitCode = 1;
  }
);
