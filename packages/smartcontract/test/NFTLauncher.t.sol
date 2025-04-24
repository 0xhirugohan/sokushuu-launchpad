// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {NFTLauncher} from "../src/NFTLauncher.sol";

contract NFTLauncherTest is Test {
    NFTLauncher public nftLauncher;

    address user = makeAddr("user");

    string public constant NFT_LAUNCHER_NAME = "TEST LAUNCH NFT";
    string public constant NFT_LAUNCHER_TICKER = "TEST_LAUNCH_TICKER";
    string public constant NFT_LAUNCHER_BASE_URL = "TEST_LAUNCH_BASE_URL";

    function setUp() public {
        NFTLauncher nftLauncherImplementation = new NFTLauncher();
        address nftLauncherAddress = Clones.clone(address(nftLauncherImplementation));
        NFTLauncher(nftLauncherAddress).initialize(
            NFT_LAUNCHER_NAME,
            NFT_LAUNCHER_TICKER,
            NFT_LAUNCHER_BASE_URL,
            address(this)
        );

        nftLauncher = NFTLauncher(nftLauncherAddress);
    }

    function test_SetUp() public view {
        assertEq(nftLauncher.name(), NFT_LAUNCHER_NAME);
        assertEq(nftLauncher.symbol(), NFT_LAUNCHER_TICKER);
        assertEq(nftLauncher.owner(), address(this));
    }

    function test_Mint() public {
        nftLauncher.safeMintTo(user);

        assertEq(IERC721(address(nftLauncher)).ownerOf(0), user);
        assertEq(IERC721(address(nftLauncher)).balanceOf(user), 1);
    }
}