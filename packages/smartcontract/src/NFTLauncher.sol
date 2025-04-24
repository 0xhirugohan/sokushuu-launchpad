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

    function safeMintTo(address to) public onlyOwner {
        _safeMint(to, _tokenId);
        _tokenId++;
    }
}