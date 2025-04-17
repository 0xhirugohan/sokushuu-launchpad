// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script} from "forge-std/Script.sol";
import {NFTLaunchManager} from "../src/NFTLaunchManager.sol";

contract NFTLaunchManagerScript is Script {
    NFTLaunchManager public nftLaunchManager;

    function setUp() public {}

    function run() public {
        vm.createSelectFork("pharos-devnet");

        vm.startBroadcast();
        nftLaunchManager = new NFTLaunchManager(
            address(this)
        );
        vm.stopBroadcast();
    }
}