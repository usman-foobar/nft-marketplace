const { ethers, upgrades } = require("hardhat");

const BASE_URI = "http://localhost:3000/";
const MINTER = "0xFbB28e9380B6657b4134329B47D9588aCfb8E33B";

async function main() {
  const NFT_CONTRACT = await hre.ethers.getContractFactory("NftContract");

  const NftContract = await upgrades.deployProxy(
    NFT_CONTRACT,
    [BASE_URI, MINTER],
    {
      initializer: "initialise",
    }
  );
  await NftContract.deploymentTransaction().wait();
  console.log("NFT Contract address:", NftContract.target);

  console.log(
    "Verify command :",
    "npx hardhat verify --network goerli",
    NftContract.target,
    BASE_URI,
    MINTER
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
