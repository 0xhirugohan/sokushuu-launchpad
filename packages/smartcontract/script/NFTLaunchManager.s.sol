// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script} from "forge-std/Script.sol";
import {NFTLaunchManager} from "../src/NFTLaunchManager.sol";
import {NFTLauncher} from "../src/NFTLauncher.sol";

contract NFTLaunchManagerScript is Script {
    NFTLaunchManager public nftLaunchManager;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        NFTLauncher nftLauncher = new NFTLauncher();

        nftLaunchManager = new NFTLaunchManager(
            address(this),
            address(nftLauncher)
        );
        vm.stopBroadcast();
    }
}