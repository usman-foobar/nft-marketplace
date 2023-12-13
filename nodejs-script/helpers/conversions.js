const ethers = require("ethers");

module.exports.bnToFloat = (BN) =>
  parseFloat(ethers.utils.parseEther(BN.toString()) / 10 ** 18);

module.exports.to18Decimals = (num) => (num * 10 ** 18).toString();
