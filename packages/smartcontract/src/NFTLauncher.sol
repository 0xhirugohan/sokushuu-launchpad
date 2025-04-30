// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";

contract NFTLauncher is Initializable, ERC721Upgradeable, OwnableUpgradeable {
    using Strings for uint256;   

    string private i_BaseURI;
    uint256 private _tokenId = 0;
    
    error ErrorNFTLauncher__TokenIdNonExisting();

    constructor() initializer {}

    function initialize(
        string memory _name,
        string memory _ticker,
        string memory _baseURIInput,
        address initialOwner
    ) public initializer {
        __ERC721_init(_name, _ticker);
        __Ownable_init(initialOwner);
        i_BaseURI = _baseURIInput;
    }

    function _baseURI() internal view override returns (string memory) {
        return i_BaseURI;
    }

    function baseURI() public view returns (string memory) {
        return _baseURI();
    }

    function getCurrentTokenId() public view returns (uint256) {
        return _tokenId;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (tokenId > _tokenId) revert ErrorNFTLauncher__TokenIdNonExisting();

        string memory base = _baseURI();
        if (bytes(base).length == 0) {
            return "";
        }

        return string(abi.encodePacked(base, tokenId.toString(), ".json"));
    }

    function safeMintTo(address to) public onlyOwner {
        _safeMint(to, _tokenId);
        _tokenId++;
    }
}