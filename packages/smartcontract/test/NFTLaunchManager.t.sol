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
        address[] memory deployedAddresses = nftLaunchManager.getUserDeployedContracts(alice);
        assertEq(deployedAddresses[0], nftAddress);
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

    function test_listTokenToSell() public returns (address, uint256, uint256) {
        uint256 tokenId = 0;
        address nftAddress = test_mintContractToOther();
        uint256 tokenPrice = 1 ether;

        vm.startPrank(bob);
        IERC721(nftAddress).approve(address(nftLaunchManager), tokenId);
        nftLaunchManager.listTokenToSell(nftAddress, tokenId, tokenPrice);
        vm.stopPrank();

        assertEq(nftLaunchManager.isTokenOnSale(nftAddress, tokenId), true);
        assertEq(nftLaunchManager.getTokenSalePrice(nftAddress, tokenId), 1 ether);

        return (nftAddress, tokenId, tokenPrice);
    }

    function test_cancelTokenListing() public {
        (address nftAddress, uint256 tokenId, ) = test_listTokenToSell();

        vm.startPrank(bob);
        nftLaunchManager.cancelTokenListing(nftAddress, tokenId);
        vm.stopPrank();

        assertEq(nftLaunchManager.getTokenSalePrice(nftAddress, tokenId), 0);
        assertEq(nftLaunchManager.isTokenOnSale(nftAddress, tokenId), false);
    }

    function test_buyListedToken() public {
        (address nftAddress, uint256 tokenId, uint256 tokenPrice) = test_listTokenToSell();

        uint256 aliceBalance = alice.balance;
        uint256 bobBalance = bob.balance;

        vm.startPrank(alice);
        nftLaunchManager.buyListedToken{value: tokenPrice}(nftAddress, tokenId);
        vm.stopPrank();

        assertEq(alice.balance, aliceBalance - tokenPrice);
        assertEq(bob.balance, bobBalance + tokenPrice);
        assertEq(nftLaunchManager.getTokenSalePrice(nftAddress, tokenId), 0);
        assertEq(nftLaunchManager.isTokenOnSale(nftAddress, tokenId), false);
    }
}