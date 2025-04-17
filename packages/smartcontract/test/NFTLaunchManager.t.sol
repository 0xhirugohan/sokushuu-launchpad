// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {NFTLaunchManager} from "../src/NFTLaunchManager.sol";
import {NFTLauncher} from "../src/NFTLauncher.sol";

contract NFTLaunchManagerTest is Test {
    NFTLaunchManager public nftLaunchManager;

    address deployer = makeAddr("deployer");
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    function setUp() public {
        vm.deal(deployer, 10 ether);
        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);

        vm.prank(deployer);
        nftLaunchManager = new NFTLaunchManager(
            address(this)
        );
        vm.stopPrank();
    }

    function test_deployNFT() public {
        string memory nftName = "Test NFT Token";
        string memory nftTicker = "TNT";

        vm.startPrank(alice);
        address nftAddress = nftLaunchManager.deployNFT(nftName, nftTicker);
        vm.stopPrank();

        NFTLauncher nftLauncher = NFTLauncher(nftAddress);

        assertEq(nftLauncher.name(), nftName);
        assertEq(nftLauncher.symbol(), nftTicker);
        assertEq(nftLaunchManager.getContractOwner(nftAddress), alice);
    }

    function test_mintContractToSelf() public returns (address) {
        string memory nftName = "Test NFT Token";
        string memory nftTicker = "TNT";

        vm.startPrank(alice);
        address nftAddress = nftLaunchManager.deployNFT(nftName, nftTicker);
        nftLaunchManager.mintContractTo(nftAddress, alice);
        vm.stopPrank();

        assertEq(IERC721(nftAddress).balanceOf(alice), 1);
        assertEq(IERC721(nftAddress).ownerOf(0), alice);

        return nftAddress;
    }

    function test_mintContractToOther() public returns (address) {
        string memory nftName = "Test NFT Token";
        string memory nftTicker = "TNT";

        vm.startPrank(alice);
        address nftAddress = nftLaunchManager.deployNFT(nftName, nftTicker);
        nftLaunchManager.mintContractTo(nftAddress, bob);
        vm.stopPrank();

        assertEq(IERC721(nftAddress).balanceOf(alice), 0);
        assertEq(IERC721(nftAddress).balanceOf(bob), 1);
        assertEq(IERC721(nftAddress).ownerOf(0), bob);

        return nftAddress;
    }

    function test_listTokenToSell() public {
        uint256 tokenId = 0;
        address nftAddress = test_mintContractToOther();

        vm.startPrank(bob);
        IERC721(nftAddress).approve(address(nftLaunchManager), tokenId);
        nftLaunchManager.listTokenToSell(nftAddress, tokenId, 1 ether);
        vm.stopPrank();

        assertEq(nftLaunchManager.isTokenOnSale(nftAddress, tokenId), true);
        assertEq(nftLaunchManager.getTokenSalePrice(nftAddress, tokenId), 1 ether);
    }
}