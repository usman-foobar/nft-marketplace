# Smart Contracts

## Overview

Both the NFT contract and Marketplace contract have been successfully deployed and verified on the Goerli Network.

- **NFT Contract:**

  - Contract Address: [0xA1D0c035FC88a980c995544E7A3d42351CF1951e](https://goerli.etherscan.io/address/0xA1D0c035FC88a980c995544E7A3d42351CF1951e#code)
  - Features: AccessControlled and Upgradeable

- **Marketplace Contract:**

  - Contract Address: [0xAF7AEf8724268BF5683Ba9E3768c4a1058A0217E](https://goerli.etherscan.io/address/0xAF7AEf8724268BF5683Ba9E3768c4a1058A0217E#code)
  - Features: Ownable, Upgradeable, and secured with Reentrancy guard.

  ### Unit Tests

  Unit tests for both contracts can be found in `/smart-contracts/test/NftMarketplace.test.js`.

  ## Node.js Scripts

  To run the provided scripts:

1. Navigate to the `nodejs-scripts/` directory.
2. Execute the following scripts using Node.js:
   - run `node smart-contract-interactions/1_listNftForFixedPrice.js` to list NFT for Fixed Price.
   - run `node smart-contract-interactions/2_listNftForAuction.js` to list NFT for Auction.
   - run `node smart-contract-interactions/3_4_5_6_retrieveData.js` to get response for all call methods like:
     - Retrieve data of NFT(s) listed at a fixed price
     - Retrieve data of NFT(s) listed on an auction basis
     - Retrieve the auction end time for a specific NFT ID
     - Retrieve wallets addresses of bidders for specific NFT ID
   - run `node smart-contract-interactions/7_mintNft.js` to mint ERC-721 NFTs by Minter
