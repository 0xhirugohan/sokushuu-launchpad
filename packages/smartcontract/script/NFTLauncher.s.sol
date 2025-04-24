// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script} from "forge-std/Script.sol";
import {NFTLauncher} from "../src/NFTLauncher.sol";

contract NFTLauncherScript is Script {
    NFTLauncher public nftLauncher;

    function setUp() public {}

    function run() public {
        vm.createSelectFork("pharos-devnet");

        vm.startBroadcast();
        nftLauncher = new NFTLauncher();
        vm.stopBroadcast();
    }
}