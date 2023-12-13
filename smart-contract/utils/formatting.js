const ListingType = Object.freeze({
  0: "Fixed",
  1: "Auction",
});

module.exports.formatListingDetails = (listingDetails) => {
    return {
      listingType: ListingType[listingDetails.listingType],
      sellerAddress: listingDetails.sellerAddress,
      tokenId: listingDetails.tokenId,
      contractAddress: listingDetails.contractAddress,
      floorPrice: listingDetails.floorPrice,
      fixedPrice: listingDetails.fixedPrice,
      startTime: listingDetails.startTime,
      endTime: listingDetails.endTime,
    };
  }