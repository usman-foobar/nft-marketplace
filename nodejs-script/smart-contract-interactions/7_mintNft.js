const { createNftContractInstance } = require("./configuration");
const { NftContract } = createNftContractInstance();

// Add a function to mint ERC-721 NFTs (Only Minter)

async function listNftForFixedPrice(toAddress) {
  const mintTransaction = await NftContract.mint(toAddress, {
    gasLimit: "3000000",
  });
  await mintTransaction.wait();
  console.log(
    `Transaction Completed! Check it out at: https://goerli.etherscan.io/tx//${mintTransaction.hash}`
  );
}

listNftForFixedPrice("0xE1043012936b8a877D37bd64839544204638d035").catch(
  (err) => {
    console.log(err);
    process.exitCode = 1;
  }
);
