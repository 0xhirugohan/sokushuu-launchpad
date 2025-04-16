// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {NFTLaunchManager} from "../src/NFTLaunchManager.sol";
import {NFTLauncher} from "../src/NFTLauncher.sol";

contract NFTLaunchManagerTest is Test {
    NFTLaunchManager public nftLaunchManager;

    function setUp() public {
        nftLaunchManager = new NFTLaunchManager(
            address(this)
        );
    }

    function test_deployNFT() public {
        string memory nftName = "Test NFT Token";
        string memory nftTicker = "TNT";

        address nftAddress = nftLaunchManager.deployNFT(nftName, nftTicker);

        NFTLauncher nftLauncher = NFTLauncher(nftAddress);

        assertEq(nftLauncher.name(), nftName);
        assertEq(nftLauncher.symbol(), nftTicker);
    }
}