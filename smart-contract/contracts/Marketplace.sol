// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

contract Marketplace is
    Initializable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable
{
    IERC721Upgradeable public NftContract;
    uint256[] private itemsInAuction;
    uint256[] private itemsInFixedSale;

    mapping(uint256 => address[]) biddersByTokenId;

    enum ListingType {
        Fixed,
        Auction
    }

    struct ListingDetail {
        ListingType listingType;
        address sellerAddress;
        uint256 tokenId;
        address contractAddress;
        uint256 floorPrice;
        uint256 fixedPrice;
        uint256 startTime;
        uint256 endTime;
    }
    struct HighestBid {
        address bidderAddress;
        uint256 bidAmount;
        uint256 timestamp;
    }

    mapping(uint256 => bool) isListed;
    mapping(uint256 => ListingDetail) listingDetailsByTokenId;
    mapping(uint256 => HighestBid) highestBidByTokenId;

    event ItemListed(
        ListingType listingType,
        address sellerAddress,
        uint256 basePrice,
        uint256 timestamp
    );

    event NftPurchased(
        address indexed buyerAddress,
        address indexed sellerAddress,
        uint256 indexed tokenId,
        uint256 price,
        uint256 timestamp
    );

    event BidPlaced(
        address bidderAddress,
        address sellerAddress,
        uint256 tokenId,
        uint256 bidAmount,
        uint256 timestamp
    );

    event NftClaimed(
        address previousOwnerAddress,
        address newOwnerAddress,
        uint256 tokenId,
        uint256 bidAmount,
        uint256 timestamp
    );

    function initialise(IERC721Upgradeable _nftContract) public initializer {
        NftContract = _nftContract;
        __Ownable_init();
        __ReentrancyGuard_init();
    }

    function setNftContract(IERC721Upgradeable _nftContract) public onlyOwner {
        require(
            address(_nftContract) != address(0),
            "Marketplace: Zero address"
        );
        NftContract = _nftContract;
    }

    function listItem(
        uint256 _tokenId,
        ListingType _listingType,
        uint256 _fixedOrFloorPrice,
        uint256 _durationInHours
    ) external {
        require(!isListed[_tokenId], "Marketplace: NFT listed already");

        if (_listingType == ListingType.Fixed) {
            _list(_tokenId, msg.sender, _fixedOrFloorPrice);
        } else {
            _list(_tokenId, msg.sender, _fixedOrFloorPrice, _durationInHours);
        }
    }

    function getListingDetails(
        uint256 _tokenId
    ) public view returns (ListingDetail memory) {
        return listingDetailsByTokenId[_tokenId];
    }

    function buyNft(uint256 _tokenId) public payable nonReentrant {
        require(isListed[_tokenId], "Marketplace: NFT not listed");
        ListingDetail memory _listingDetails = listingDetailsByTokenId[
            _tokenId
        ];
        require(
            _listingDetails.listingType == ListingType.Fixed,
            "Marketplace: Cannot instant buy on Auction"
        );
        require(
            msg.value == _listingDetails.fixedPrice,
            "Marketplace: Incorrect ether value"
        );

        address sellerAddress = _listingDetails.sellerAddress;

        delete listingDetailsByTokenId[_tokenId];
        delete isListed[_tokenId];

        NftContract.transferFrom(address(this), msg.sender, _tokenId);
        payable(sellerAddress).transfer(msg.value);

        emit NftPurchased(
            msg.sender,
            sellerAddress,
            _tokenId,
            msg.value,
            block.timestamp
        );
    }

    function placeBid(uint256 _tokenId) public payable nonReentrant {
        require(isListed[_tokenId], "Marketplace: NFT not listed");
        ListingDetail memory _listingDetails = listingDetailsByTokenId[
            _tokenId
        ];
        require(
            _listingDetails.listingType == ListingType.Auction,
            "Marketplace: Cannot bid on fixed price"
        );
        require(
            _listingDetails.endTime > block.timestamp,
            "Marketplace: Auction closed"
        );

        HighestBid storage highestBid = highestBidByTokenId[_tokenId];
        address _previousBidderAddress = highestBid.bidderAddress;
        uint256 _previousBidAmount = highestBid.bidAmount;
        if (_previousBidAmount == 0) {
            require(
                msg.value >= _listingDetails.floorPrice,
                "Marketplace: Bid must be higher than the floor price"
            );
            highestBid.bidderAddress = msg.sender;
            highestBid.bidAmount = msg.value;
            highestBid.timestamp = block.timestamp;
        } else {
            require(
                msg.value > _previousBidAmount,
                "Marketplace: Bid must be higher than last bid"
            );
            highestBid.bidAmount = msg.value;
            highestBid.bidderAddress = msg.sender;
            highestBid.timestamp = block.timestamp;

            payable(_previousBidderAddress).transfer(_previousBidAmount);
        }

        biddersByTokenId[_tokenId].push(msg.sender);

        emit BidPlaced(
            msg.sender,
            _listingDetails.sellerAddress,
            _tokenId,
            msg.value,
            block.timestamp
        );
    }

    function getHighestBid(
        uint256 _tokenId
    ) public view returns (HighestBid memory) {
        return highestBidByTokenId[_tokenId];
    }

    function claimNft(uint256 _tokenId) public nonReentrant {
        require(isListed[_tokenId], "Marketplace: NFT not listed");
        ListingDetail memory _listingDetails = listingDetailsByTokenId[
            _tokenId
        ];
        require(
            block.timestamp > _listingDetails.endTime,
            "Marketplace: NFT cannot be claimed before auction ends"
        );

        HighestBid memory _highestBid = highestBidByTokenId[_tokenId];
        require(
            msg.sender == _highestBid.bidderAddress,
            "Marketplace: Only highest bidder can claim NFT"
        );

        address _sellerAddress = _listingDetails.sellerAddress;
        uint256 _highestBidAmount = _highestBid.bidAmount;
        address _bidderAddress = _highestBid.bidderAddress;

        delete listingDetailsByTokenId[_tokenId];
        delete highestBidByTokenId[_tokenId];
        delete isListed[_tokenId];
        delete biddersByTokenId[_tokenId];

        payable(_sellerAddress).transfer(_highestBidAmount);
        NftContract.transferFrom(address(this), _bidderAddress, _tokenId);

        emit NftClaimed(
            _listingDetails.sellerAddress,
            msg.sender,
            _tokenId,
            _highestBidAmount,
            block.timestamp
        );
    }

    // List for fixed price
    function _list(
        uint256 _tokenId,
        address _seller,
        uint256 _fixedPrice
    ) private {
        NftContract.transferFrom(_seller, address(this), _tokenId);
        isListed[_tokenId] = true;
        listingDetailsByTokenId[_tokenId] = ListingDetail(
            ListingType.Fixed,
            _seller,
            _tokenId,
            address(NftContract),
            0,
            _fixedPrice,
            block.timestamp,
            0
        );
        itemsInFixedSale.push(_tokenId);

        emit ItemListed(
            ListingType.Fixed,
            msg.sender,
            _fixedPrice,
            block.timestamp
        );
    }

    // List for Auction
    function _list(
        uint256 _tokenId,
        address _seller,
        uint256 _floorPrice,
        uint256 _durationInHours
    ) private {
        NftContract.transferFrom(_seller, address(this), _tokenId);
        isListed[_tokenId] = true;
        listingDetailsByTokenId[_tokenId] = ListingDetail(
            ListingType.Auction,
            _seller,
            _tokenId,
            address(NftContract),
            _floorPrice,
            0,
            block.timestamp,
            block.timestamp + (_durationInHours * 1 hours)
        );
        itemsInAuction.push(_tokenId);

        emit ItemListed(
            ListingType.Fixed,
            msg.sender,
            _floorPrice,
            block.timestamp
        );
    }

    function getListedItems(
        ListingType _listingType
    ) external view returns (uint256[] memory) {
        uint256[] memory _nftIds = _listingType == ListingType.Auction
            ? itemsInAuction
            : itemsInFixedSale;
        uint256[] memory _listedNftIds = new uint256[](_nftIds.length);
        uint256 deletedElems = 0;
        uint256 counter = 0;

        for (uint256 i = 0; i < _nftIds.length; i++) {
            if (isListed[_nftIds[i]]) {
                _listedNftIds[counter] = _nftIds[i];
                counter++;
            } else {
                deletedElems++;
            }
        }
        assembly {
            mstore(_listedNftIds, sub(mload(_listedNftIds), deletedElems))
        }

        return _listedNftIds;
    }

    function getBiddersAddresses(
        uint256 _tokenId
    ) external view returns (address[] memory) {
        return biddersByTokenId[_tokenId];
    }

    function getAuctionEndTime(
        uint256 _tokenId
    ) external view returns (uint256) {
        ListingDetail memory _listingDetails = listingDetailsByTokenId[
            _tokenId
        ];
        return _listingDetails.endTime;
    }
}
