// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

contract NftContract is
    Initializable,
    ERC721Upgradeable,
    AccessControlUpgradeable
{
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    uint256 private tokenId;
    string private baseUri;

    function initialise(
        string memory _baseUri,
        address _minter
    ) external initializer {
        tokenId = 0;
        baseUri = _baseUri;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        grantRole(MINTER_ROLE, _minter);
        __ERC721_init("foobar", "FB");
        __AccessControl_init();
    }

    function mint(address _to) public onlyRole(MINTER_ROLE) {
        _mint(_to, ++tokenId);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseUri;
    }

    function totalSupply() public view returns (uint256) {
        return tokenId;
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(ERC721Upgradeable, AccessControlUpgradeable)
        returns (bool)
    {
        return
            ERC721Upgradeable.supportsInterface(interfaceId) ||
            AccessControlUpgradeable.supportsInterface(interfaceId);
    }
}
