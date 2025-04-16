// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract NFTLauncher is ERC721, Ownable {
    using Strings for uint256;   

    string private i_BaseURI;
    uint256 private _tokenId = 0;

    constructor(
        string memory _name,
        string memory _ticker,
        string memory _baseURIInput
    ) ERC721(_name, _ticker) Ownable(msg.sender) {
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