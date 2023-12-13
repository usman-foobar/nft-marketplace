const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { to18Decimals } = require("../utils/conversions");
const { ethers, upgrades } = require("hardhat");

const FIXED_OR_FLOOR_PRICE = to18Decimals(0.0001);

describe("NFT Marketplace", function () {
  const BASE_URI = "http://localhost:3000/";
  const NFT_CONTRACT_NAME = "foobar";
  const NFT_CONTRACT_SYMBOL = "FB";

  async function deployContracts() {
    const [
      deployer,
      minter,
      nftOwner1,
      nftOwner2,
      nftOwner3,
      buyer1,
      buyer2,
      buyer3,
    ] = await ethers.getSigners();

    const NFT_CONTRACT = await ethers.getContractFactory("NftContract");
    const NftContract = await upgrades.deployProxy(
      NFT_CONTRACT,
      [BASE_URI, minter.address],
      {
        initializer: "initialise",
      }
    );

    const MARKETPLACE = await ethers.getContractFactory("Marketplace");
    const Marketplace = await upgrades.deployProxy(
      MARKETPLACE,
      [NftContract.target],
      {
        initializer: "initialise",
      }
    );

    return {
      NftContract,
      Marketplace,
      deployer,
      minter,
      nftOwner1,
      nftOwner2,
      nftOwner3,
      buyer1,
      buyer2,
      buyer3,
    };
  }

  async function resetContractWithBalancesAndAllowances() {
    const {
      Marketplace,
      NftContract,
      deployer,
      minter,
      nftOwner1,
      nftOwner2,
      nftOwner3,
      buyer1,
      buyer2,
      buyer3,
    } = await loadFixture(deployContracts);

    await NftContract.connect(minter).mint(nftOwner1.address);
    await NftContract.connect(minter).mint(nftOwner2.address);
    await NftContract.connect(minter).mint(nftOwner3.address);

    let marketplaceAddress = Marketplace.target;

    await NftContract.connect(nftOwner1).approve(marketplaceAddress, 1);
    await NftContract.connect(nftOwner2).approve(marketplaceAddress, 2);
    await NftContract.connect(nftOwner3).approve(marketplaceAddress, 3);

    return {
      NftContract,
      Marketplace,
      deployer,
      minter,
      nftOwner1,
      nftOwner2,
      nftOwner3,
      buyer1,
      buyer2,
      buyer3,
    };
  }

  describe("NFT Contract", function () {
    it("Should set the accurate parameters", async function () {
      const { NftContract, Marketplace } = await loadFixture(deployContracts);

      expect(await NftContract.name()).to.equal(NFT_CONTRACT_NAME);
      expect(await NftContract.symbol()).to.equal(NFT_CONTRACT_SYMBOL);
      expect(await NftContract.totalSupply()).to.equal(0);
    });

    it("Should set the right access control", async function () {
      const { NftContract, deployer, minter } = await loadFixture(
        deployContracts
      );

      const minterRole = await NftContract.MINTER_ROLE();
      const adminRole = await NftContract.DEFAULT_ADMIN_ROLE();

      expect(await NftContract.hasRole(minterRole, minter.address)).to.equal(
        true
      );
      expect(await NftContract.hasRole(adminRole, deployer.address)).to.equal(
        true
      );
    });

    it("Only owner should be allowed to mint NFTs", async function () {
      const { NftContract, minter, nftOwner1 } = await loadFixture(
        deployContracts
      );

      await expect(NftContract.connect(nftOwner1).mint(nftOwner1.address)).to.be
        .rejected;

      await expect(NftContract.connect(minter).mint(nftOwner1.address)).to.be
        .fulfilled;

      expect(await NftContract.ownerOf(1)).to.be.equal(nftOwner1.address);
      expect(await NftContract.balanceOf(nftOwner1.address)).to.be.equal(1);
      expect(await NftContract.totalSupply()).to.be.equal(1);
    });
  });

  describe("Marketplace Contract", function () {
    it("Should set parameters accurately", async function () {
      const { Marketplace, NftContract } = await loadFixture(deployContracts);

      let nftContract = await Marketplace.NftContract();
      expect(nftContract).to.be.equal(NftContract.target);
    });

    it("Should not set zero address in NFT Contract", async function () {
      const { Marketplace } = await loadFixture(deployContracts);

      await expect(
        Marketplace.setNftContract("0x0000000000000000000000000000000000000000")
      ).to.be.rejectedWith("Marketplace: Zero address");
    });

    it("Only owner should be able to change or update NFT Contract address", async function () {
      const { Marketplace, NftContract, deployer, nftOwner1 } =
        await loadFixture(deployContracts);

      await expect(
        Marketplace.connect(nftOwner1).setNftContract(deployer.address)
      ).to.be.rejectedWith("Ownable");

      expect(await Marketplace.NftContract()).to.be.equal(NftContract.target);

      await expect(
        Marketplace.connect(deployer).setNftContract(deployer.address)
      ).to.be.fulfilled;

      expect(await Marketplace.NftContract()).to.be.equal(deployer.address);

      await expect(
        Marketplace.connect(deployer).setNftContract(NftContract.target)
      ).to.be.fulfilled;

      expect(await Marketplace.NftContract()).to.be.equal(NftContract.target);
    });
  });

  describe("Mint NFTs and Set allowances for NFT listings", function () {
    it("Initial balances should be zero", async function () {
      const { NftContract, nftOwner1, nftOwner2, nftOwner3 } =
        await loadFixture(deployContracts);
      expect(await NftContract.totalSupply()).to.be.equal(0);
      expect(await NftContract.balanceOf(nftOwner1)).to.be.equal(0);
      expect(await NftContract.balanceOf(nftOwner2)).to.be.equal(0);
      expect(await NftContract.balanceOf(nftOwner3)).to.be.equal(0);
    });

    it("Should mint nfts for test wallets", async function () {
      const { NftContract, Marketplace, nftOwner1, nftOwner2, nftOwner3 } =
        await resetContractWithBalancesAndAllowances();
      expect(await NftContract.balanceOf(nftOwner1)).to.be.equal(1);
      expect(await NftContract.balanceOf(nftOwner2)).to.be.equal(1);
      expect(await NftContract.balanceOf(nftOwner3)).to.be.equal(1);

      expect(await NftContract.totalSupply()).to.be.equal(3);

      expect(await NftContract.getApproved(1)).to.be.equal(Marketplace.target);
      expect(await NftContract.getApproved(2)).to.be.equal(Marketplace.target);
      expect(await NftContract.getApproved(3)).to.be.equal(Marketplace.target);
    });
  });

  describe("Listing NFTs for fixed price", function () {
    it("Should list NFTs", async function () {
      const { Marketplace, nftOwner1, nftOwner2, nftOwner3 } =
        await resetContractWithBalancesAndAllowances();
      await expect(
        Marketplace.connect(nftOwner1).listItem(1, 0, FIXED_OR_FLOOR_PRICE, 0)
      ).to.be.fulfilled;

      await expect(
        Marketplace.connect(nftOwner2).listItem(2, 0, FIXED_OR_FLOOR_PRICE, 0)
      ).to.be.fulfilled;

      await expect(
        Marketplace.connect(nftOwner3).listItem(3, 0, FIXED_OR_FLOOR_PRICE, 0)
      ).to.be.fulfilled;
    });

    it("Should not let relist already listed items", async function () {
      const { Marketplace, nftOwner1, nftOwner2, nftOwner3 } =
        await resetContractWithBalancesAndAllowances();
      await expect(
        Marketplace.connect(nftOwner1).listItem(1, 0, FIXED_OR_FLOOR_PRICE, 0)
      ).to.be.fulfilled;

      await expect(
        Marketplace.connect(nftOwner2).listItem(2, 0, FIXED_OR_FLOOR_PRICE, 0)
      ).to.be.fulfilled;

      await expect(
        Marketplace.connect(nftOwner3).listItem(3, 0, FIXED_OR_FLOOR_PRICE, 0)
      ).to.be.fulfilled;

      await expect(
        Marketplace.connect(nftOwner1).listItem(1, 0, FIXED_OR_FLOOR_PRICE, 0)
      ).to.be.rejectedWith("Marketplace: NFT listed already");

      await expect(
        Marketplace.connect(nftOwner2).listItem(2, 0, FIXED_OR_FLOOR_PRICE, 0)
      ).to.be.rejectedWith("Marketplace: NFT listed already");

      await expect(
        Marketplace.connect(nftOwner3).listItem(3, 0, FIXED_OR_FLOOR_PRICE, 0)
      ).to.be.rejectedWith("Marketplace: NFT listed already");
    });
  });

  describe("Buy NFTs with fixed price", function () {
    it("Should be able to buy NFT for fixed price", async function () {
      const {
        Marketplace,
        nftOwner1,
        nftOwner2,
        nftOwner3,
        buyer1,
        buyer2,
        buyer3,
      } = await resetContractWithBalancesAndAllowances();

      await expect(
        Marketplace.connect(nftOwner1).listItem(1, 0, FIXED_OR_FLOOR_PRICE, 0)
      ).to.be.fulfilled;
      await expect(
        Marketplace.connect(nftOwner2).listItem(2, 0, FIXED_OR_FLOOR_PRICE, 0)
      ).to.be.fulfilled;
      await expect(
        Marketplace.connect(nftOwner3).listItem(3, 0, FIXED_OR_FLOOR_PRICE, 0)
      ).to.be.fulfilled;

      const fixedPrice = to18Decimals(0.0001);

      await expect(
        Marketplace.connect(buyer1).buyNft(1, {
          value: fixedPrice,
        })
      ).to.changeEtherBalances([nftOwner1, buyer1], [fixedPrice, -fixedPrice]);

      await expect(
        Marketplace.connect(buyer2).buyNft(2, {
          value: fixedPrice,
        })
      ).to.changeEtherBalances([nftOwner2, buyer2], [fixedPrice, -fixedPrice]);

      await expect(
        Marketplace.connect(buyer3).buyNft(3, {
          value: fixedPrice,
        })
      ).to.changeEtherBalances([nftOwner3, buyer3], [fixedPrice, -fixedPrice]);
    });

    it("Should update the NFT ownership & ETH balances for buyer and seller accurately", async function () {
      const {
        NftContract,
        Marketplace,
        nftOwner1,
        nftOwner2,
        nftOwner3,
        buyer1,
        buyer2,
        buyer3,
      } = await resetContractWithBalancesAndAllowances();

      await expect(
        Marketplace.connect(nftOwner1).listItem(1, 0, FIXED_OR_FLOOR_PRICE, 0)
      ).to.be.fulfilled;
      await expect(
        Marketplace.connect(nftOwner2).listItem(2, 0, FIXED_OR_FLOOR_PRICE, 0)
      ).to.be.fulfilled;
      await expect(
        Marketplace.connect(nftOwner3).listItem(3, 0, FIXED_OR_FLOOR_PRICE, 0)
      ).to.be.fulfilled;

      const fixedPrice = to18Decimals(0.0001);

      await expect(
        Marketplace.connect(buyer1).buyNft(1, {
          value: fixedPrice,
        })
      ).to.changeEtherBalances([nftOwner1, buyer1], [fixedPrice, -fixedPrice]);

      expect(await NftContract.ownerOf(1)).to.be.equal(buyer1.address);

      await expect(
        Marketplace.connect(buyer2).buyNft(2, {
          value: fixedPrice,
        })
      ).to.changeEtherBalances([nftOwner2, buyer2], [fixedPrice, -fixedPrice]);

      expect(await NftContract.ownerOf(2)).to.be.equal(buyer2.address);

      await expect(
        Marketplace.connect(buyer3).buyNft(3, {
          value: fixedPrice,
        })
      ).to.changeEtherBalances([nftOwner3, buyer3], [fixedPrice, -fixedPrice]);

      expect(await NftContract.ownerOf(3)).to.be.equal(buyer3.address);
    });
  });

  describe("Listing NFTs on Auction", function () {
    it("Should list NFTs on Auction for 5 hours", async function () {
      const { Marketplace, nftOwner1, nftOwner2, nftOwner3 } =
        await resetContractWithBalancesAndAllowances();

      await expect(
        Marketplace.connect(nftOwner1).listItem(1, 1, FIXED_OR_FLOOR_PRICE, 5)
      ).to.be.fulfilled;
      await expect(
        Marketplace.connect(nftOwner2).listItem(2, 1, FIXED_OR_FLOOR_PRICE, 5)
      ).to.be.fulfilled;
      await expect(
        Marketplace.connect(nftOwner3).listItem(3, 1, FIXED_OR_FLOOR_PRICE, 5)
      ).to.be.fulfilled;
    });

    it("Should update the NFT ownership - Marketplace contract should own NFTs", async function () {
      const { NftContract, Marketplace, nftOwner1, nftOwner2, nftOwner3 } =
        await resetContractWithBalancesAndAllowances();

      await expect(
        Marketplace.connect(nftOwner1).listItem(1, 1, FIXED_OR_FLOOR_PRICE, 5)
      ).to.be.fulfilled;
      await expect(
        Marketplace.connect(nftOwner2).listItem(2, 1, FIXED_OR_FLOOR_PRICE, 5)
      ).to.be.fulfilled;
      await expect(
        Marketplace.connect(nftOwner3).listItem(3, 1, FIXED_OR_FLOOR_PRICE, 5)
      ).to.be.fulfilled;

      expect(await NftContract.ownerOf(1)).to.be.equal(Marketplace.target);
      expect(await NftContract.ownerOf(2)).to.be.equal(Marketplace.target);
      expect(await NftContract.ownerOf(3)).to.be.equal(Marketplace.target);
    });
  });

  describe("Bidding", function () {
    it("Should not bid below floor price", async function () {
      const { Marketplace, nftOwner1, nftOwner2, nftOwner3, buyer1 } =
        await resetContractWithBalancesAndAllowances();

      await expect(
        Marketplace.connect(nftOwner1).listItem(1, 1, FIXED_OR_FLOOR_PRICE, 5)
      ).to.be.fulfilled;
      await expect(
        Marketplace.connect(nftOwner2).listItem(2, 1, FIXED_OR_FLOOR_PRICE, 5)
      ).to.be.fulfilled;
      await expect(
        Marketplace.connect(nftOwner3).listItem(3, 1, FIXED_OR_FLOOR_PRICE, 5)
      ).to.be.fulfilled;

      await expect(
        Marketplace.connect(buyer1).placeBid(1, {
          value: to18Decimals(0.000001),
        })
      ).to.be.rejectedWith(
        "Marketplace: Bid must be higher than the floor price"
      );

      await expect(
        Marketplace.connect(buyer1).placeBid(1, {
          value: to18Decimals(0.000009),
        })
      ).to.be.rejectedWith(
        "Marketplace: Bid must be higher than the floor price"
      );
    });

    it("Should successfully place bid equal to or more than floor price", async function () {
      const { Marketplace, nftOwner1, nftOwner2, nftOwner3, buyer1 } =
        await resetContractWithBalancesAndAllowances();

      await expect(
        Marketplace.connect(nftOwner1).listItem(1, 1, FIXED_OR_FLOOR_PRICE, 5)
      ).to.be.fulfilled;
      await expect(
        Marketplace.connect(nftOwner2).listItem(2, 1, FIXED_OR_FLOOR_PRICE, 5)
      ).to.be.fulfilled;
      await expect(
        Marketplace.connect(nftOwner3).listItem(3, 1, FIXED_OR_FLOOR_PRICE, 5)
      ).to.be.fulfilled;

      const bidAmount = to18Decimals(0.001);

      await expect(
        Marketplace.connect(buyer1).placeBid(1, {
          value: bidAmount,
        })
      ).to.changeEtherBalances([Marketplace, buyer1], [bidAmount, -bidAmount]);
    });

    it("Previous bidder balance should updated on new bid", async function () {
      const {
        NftContract,
        Marketplace,
        nftOwner1,
        nftOwner2,
        nftOwner3,
        buyer1,
        buyer2,
        buyer3,
      } = await resetContractWithBalancesAndAllowances();

      await expect(
        Marketplace.connect(nftOwner1).listItem(1, 1, FIXED_OR_FLOOR_PRICE, 5)
      ).to.be.fulfilled;
      await expect(
        Marketplace.connect(nftOwner2).listItem(2, 1, FIXED_OR_FLOOR_PRICE, 5)
      ).to.be.fulfilled;
      await expect(
        Marketplace.connect(nftOwner3).listItem(3, 1, FIXED_OR_FLOOR_PRICE, 5)
      ).to.be.fulfilled;

      const bidAmount1 = to18Decimals(0.001);

      await expect(
        Marketplace.connect(buyer1).placeBid(1, {
          value: bidAmount1,
        })
      ).to.changeEtherBalances(
        [Marketplace, buyer1],
        [bidAmount1, -bidAmount1]
      );

      const bidAmount2 = to18Decimals(0.002);

      await expect(
        Marketplace.connect(buyer2).placeBid(1, {
          value: bidAmount2,
        })
      ).to.changeEtherBalances(
        [Marketplace, buyer1, buyer2],
        [bidAmount1, bidAmount1, -bidAmount2]
      );

      const bidAmount3 = to18Decimals(0.001);
      await expect(
        Marketplace.connect(buyer3).placeBid(1, {
          value: bidAmount3,
        })
      ).to.be.rejectedWith("Marketplace: Bid must be higher than last bid");
    });

    it("Should bot place bid once Auction is closed", async function () {
      const {
        NftContract,
        Marketplace,
        nftOwner1,
        nftOwner2,
        nftOwner3,
        buyer1,
        buyer2,
        buyer3,
      } = await resetContractWithBalancesAndAllowances();

      await expect(
        Marketplace.connect(nftOwner1).listItem(1, 1, FIXED_OR_FLOOR_PRICE, 5)
      ).to.be.fulfilled;
      await expect(
        Marketplace.connect(nftOwner2).listItem(2, 1, FIXED_OR_FLOOR_PRICE, 5)
      ).to.be.fulfilled;
      await expect(
        Marketplace.connect(nftOwner3).listItem(3, 1, FIXED_OR_FLOOR_PRICE, 5)
      ).to.be.fulfilled;

      const bidAmount1 = to18Decimals(0.001);

      await expect(
        Marketplace.connect(buyer1).placeBid(1, {
          value: bidAmount1,
        })
      ).to.changeEtherBalances(
        [Marketplace, buyer1],
        [bidAmount1, -bidAmount1]
      );

      const bidAmount2 = to18Decimals(0.002);

      await expect(
        Marketplace.connect(buyer2).placeBid(1, {
          value: bidAmount2,
        })
      ).to.changeEtherBalances(
        [Marketplace, buyer1, buyer2],
        [bidAmount1, bidAmount1, -bidAmount2]
      );

      let timeAfter6hours = (await time.latest()) + 6 * 60 * 60;
      await time.increaseTo(timeAfter6hours);

      await expect(
        Marketplace.connect(buyer2).placeBid(1, {
          value: bidAmount2,
        })
      ).to.be.rejectedWith("Marketplace: Auction closed");
    });
  });

  describe("Claim NFT", function () {
    it("Should fail to claim NFT before Auction ends", async function () {
      const {
        NftContract,
        Marketplace,
        nftOwner1,
        nftOwner2,
        nftOwner3,
        buyer1,
        buyer2,
        buyer3,
      } = await resetContractWithBalancesAndAllowances();

      await expect(
        Marketplace.connect(nftOwner1).listItem(1, 1, FIXED_OR_FLOOR_PRICE, 5)
      ).to.be.fulfilled;
      await expect(
        Marketplace.connect(nftOwner2).listItem(2, 1, FIXED_OR_FLOOR_PRICE, 5)
      ).to.be.fulfilled;
      await expect(
        Marketplace.connect(nftOwner3).listItem(3, 1, FIXED_OR_FLOOR_PRICE, 5)
      ).to.be.fulfilled;

      const bidAmount1 = to18Decimals(0.001);

      await expect(
        Marketplace.connect(buyer1).placeBid(1, {
          value: bidAmount1,
        })
      ).to.changeEtherBalances(
        [Marketplace, buyer1],
        [bidAmount1, -bidAmount1]
      );

      const bidAmount2 = to18Decimals(0.002);

      await expect(
        Marketplace.connect(buyer2).placeBid(1, {
          value: bidAmount2,
        })
      ).to.changeEtherBalances(
        [Marketplace, buyer1, buyer2],
        [bidAmount1, bidAmount1, -bidAmount2]
      );

      await expect(Marketplace.connect(buyer2).claimNft(1)).to.be.rejectedWith(
        "Marketplace: NFT cannot be claimed before auction ends"
      );
    });

    it("After auction is closed - Anyone other than highest bidder shouldn't be able to claim NFT", async function () {
      const {
        NftContract,
        Marketplace,
        nftOwner1,
        nftOwner2,
        nftOwner3,
        buyer1,
        buyer2,
        buyer3,
      } = await resetContractWithBalancesAndAllowances();

      await expect(
        Marketplace.connect(nftOwner1).listItem(1, 1, FIXED_OR_FLOOR_PRICE, 5)
      ).to.be.fulfilled;
      await expect(
        Marketplace.connect(nftOwner2).listItem(2, 1, FIXED_OR_FLOOR_PRICE, 5)
      ).to.be.fulfilled;
      await expect(
        Marketplace.connect(nftOwner3).listItem(3, 1, FIXED_OR_FLOOR_PRICE, 5)
      ).to.be.fulfilled;

      const bidAmount1 = to18Decimals(0.001);

      await expect(
        Marketplace.connect(buyer1).placeBid(1, {
          value: bidAmount1,
        })
      ).to.changeEtherBalances(
        [Marketplace, buyer1],
        [bidAmount1, -bidAmount1]
      );

      const bidAmount2 = to18Decimals(0.002);

      await expect(
        Marketplace.connect(buyer2).placeBid(1, {
          value: bidAmount2,
        })
      ).to.changeEtherBalances(
        [Marketplace, buyer1, buyer2],
        [bidAmount1, bidAmount1, -bidAmount2]
      );

      let timeAfter6hours = (await time.latest()) + 6 * 60 * 60;
      await time.increaseTo(timeAfter6hours);

      await expect(Marketplace.connect(buyer1).claimNft(1)).to.be.rejectedWith(
        "Marketplace: Only highest bidder can claim NFT"
      );

      await expect(Marketplace.connect(buyer3).claimNft(1)).to.be.rejectedWith(
        "Marketplace: Only highest bidder can claim NFT"
      );
    });

    it("After auction is closed - Highest bidder should be able to claim NFT successfully", async function () {
      const {
        NftContract,
        Marketplace,
        nftOwner1,
        nftOwner2,
        nftOwner3,
        buyer1,
        buyer2,
        buyer3,
      } = await resetContractWithBalancesAndAllowances();

      await expect(
        Marketplace.connect(nftOwner1).listItem(1, 1, FIXED_OR_FLOOR_PRICE, 5)
      ).to.be.fulfilled;
      await expect(
        Marketplace.connect(nftOwner2).listItem(2, 1, FIXED_OR_FLOOR_PRICE, 5)
      ).to.be.fulfilled;
      await expect(
        Marketplace.connect(nftOwner3).listItem(3, 1, FIXED_OR_FLOOR_PRICE, 5)
      ).to.be.fulfilled;

      const bidAmount1 = to18Decimals(0.001);

      await expect(
        Marketplace.connect(buyer1).placeBid(1, {
          value: bidAmount1,
        })
      ).to.changeEtherBalances(
        [Marketplace, buyer1],
        [bidAmount1, -bidAmount1]
      );

      const bidAmount2 = to18Decimals(0.002);

      await expect(
        Marketplace.connect(buyer2).placeBid(1, {
          value: bidAmount2,
        })
      ).to.changeEtherBalances(
        [Marketplace, buyer1, buyer2],
        [bidAmount1, bidAmount1, -bidAmount2]
      );

      let timeAfter6hours = (await time.latest()) + 6 * 60 * 60;
      await time.increaseTo(timeAfter6hours);

      await expect(
        Marketplace.connect(buyer2).claimNft(1)
      ).to.changeEtherBalances(
        [nftOwner1, Marketplace],
        [bidAmount2, -bidAmount2]
      );

      expect(await NftContract.ownerOf(1)).to.be.equal(buyer2.address);
    });
  });
});
