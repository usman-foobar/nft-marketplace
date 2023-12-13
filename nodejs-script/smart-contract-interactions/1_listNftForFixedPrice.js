const { to18Decimals } = require("../helpers/conversions");
const { listingType } = require("../helpers/listingType");

const { createMarketplaceContractInstance } = require("./configuration");
let { Marketplace } = createMarketplaceContractInstance();

// List an NFT for fixed price (price should be provided by user).

async function listNftForFixedPrice(
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

listNftForFixedPrice(1, listingType.Fixed, to18Decimals(0.01)).catch((err) => {
  console.log(err);
  process.exitCode = 1;
});
