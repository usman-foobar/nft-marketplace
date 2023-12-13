const { ethers, upgrades } = require("hardhat");

const NFT_CONTRACT = "0xA1D0c035FC88a980c995544E7A3d42351CF1951e";

async function main() {
  const MARKETPLACE = await hre.ethers.getContractFactory("Marketplace");

  const Marketplace = await upgrades.deployProxy(MARKETPLACE, [NFT_CONTRACT], {
    initializer: "initialise",
  });
  await Marketplace.deploymentTransaction().wait();
  console.log("Marketplace Contract address:", Marketplace.target);

  console.log(
    "Verify command :",
    "npx hardhat verify --network goerli",
    Marketplace.target,
    NFT_CONTRACT
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
