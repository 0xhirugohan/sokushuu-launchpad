// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {NFTLauncher} from "../src/NFTLauncher.sol";

contract NFTLauncherTest is Test {
    NFTLauncher public nftLauncher;

    string public constant NFT_LAUNCHER_NAME = "TEST LAUNCH NFT";
    string public constant NFT_LAUNCHER_TICKER = "TEST_LAUNCH_TICKER";
    string public constant NFT_LAUNCHER_BASE_URL = "TEST_LAUNCH_BASE_URL";

    function setUp() public {
        nftLauncher = new NFTLauncher(
            NFT_LAUNCHER_NAME,
            NFT_LAUNCHER_TICKER,
            NFT_LAUNCHER_BASE_URL
        );
    }

    function test_SetUp() public view {
        assertEq(nftLauncher.name(), NFT_LAUNCHER_NAME);
        assertEq(nftLauncher.symbol(), NFT_LAUNCHER_TICKER);
    }
}