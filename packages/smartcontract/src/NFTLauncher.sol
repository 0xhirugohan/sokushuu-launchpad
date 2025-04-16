// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC721} from "@openzeppelin/token/ERC721/ERC721.sol";
import {Strings} from "@openzeppelin/utils/Strings.sol";

contract NFTLauncher is ERC721 {
    using Strings for uint256;   

    string private i_BaseURI;

    constructor(
        string memory _name,
        string memory _ticker,
        string memory _baseURIInput
    ) ERC721(_name, _ticker) {
        i_BaseURI = _baseURIInput;
    }

    function _baseURI() internal view override returns (string memory) {
        return i_BaseURI;
    }
}