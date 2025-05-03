// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {NFTLaunchManager} from "../src/NFTLaunchManager.sol";
import {NFTLauncher} from "../src/NFTLauncher.sol";

contract NFTLaunchManagerTest is Test {
    NFTLaunchManager public nftLaunchManager;
    NFTLauncher public nftLauncherImplementation;

    address deployer = makeAddr("deployer");
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    function setUp() public {
        vm.deal(deployer, 10 ether);
        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);

        vm.prank(deployer);
        nftLauncherImplementation = new NFTLauncher();
        nftLaunchManager = new NFTLaunchManager(
            address(this),
            address(nftLauncherImplementation)
        );
        vm.stopPrank();
    }

    function test_deployNFT() public {
        string memory nftName = "Test NFT Token";
        string memory nftTicker = "TNT";
        bytes32 salt = keccak256(abi.encodePacked("test_deployNFT_salt", alice));

        address[] memory deployedAddressInitial = nftLaunchManager.getUserDeployedContracts(alice);
        assertEq(deployedAddressInitial.length, 0);

        vm.startPrank(alice);
        address nftAddress = nftLaunchManager.deployNFT(nftName, nftTicker, salt);
        NFTLauncher nftLauncher = NFTLauncher(nftAddress);
        vm.stopPrank();


        assertEq(nftLauncher.name(), nftName);
        assertEq(nftLauncher.symbol(), nftTicker);
        assertEq(nftLauncher.owner(), address(nftLaunchManager));
        assertEq(nftLaunchManager.getContractOwner(nftAddress), alice);
        address[] memory deployedAddresses = nftLaunchManager.getUserDeployedContracts(alice);
        assertEq(deployedAddresses[0], nftAddress);
        assertEq(deployedAddresses.length, 1);
    }

    function test_mintContractToSelf() public returns (address) {
        string memory nftName = "Test NFT Token";
        string memory nftTicker = "TNT";
        bytes32 salt = keccak256(abi.encodePacked("test_mintContractToSelf_salt", alice));
        uint256 tokenId = 0;

        vm.startPrank(alice);
        address nftAddress = nftLaunchManager.deployNFT(nftName, nftTicker, salt);
        vm.stopPrank();

        uint256 contractTokenId = nftLaunchManager.getContractCurrentTokenId(nftAddress);
        assertEq(contractTokenId, 0);

        vm.startPrank(alice);
        nftLaunchManager.mintContractTo(nftAddress, alice, contractTokenId);
        vm.stopPrank();

        uint256 contractTokenIdAfterMint = nftLaunchManager.getContractCurrentTokenId(nftAddress);
        assertEq(contractTokenIdAfterMint, 1);

        assertEq(IERC721(nftAddress).balanceOf(alice), 1);
        assertEq(IERC721(nftAddress).ownerOf(0), alice);

        NFTLauncher nftLauncher = NFTLauncher(nftAddress);
        string memory baseURI = nftLauncher.baseURI();
        string memory actualTokenURI = nftLauncher.tokenURI(tokenId);
        string memory expectedTokenURI = string.concat(baseURI, "0");

        assertEq(actualTokenURI, expectedTokenURI);

        return nftAddress;
    }

    function test_mintContractToOther() public returns (address) {
        string memory nftName = "Test NFT Token";
        string memory nftTicker = "TNT";
        bytes32 salt = keccak256(abi.encodePacked("test_mintContractToOther_salt", alice));

        vm.startPrank(alice);
        address nftAddress = nftLaunchManager.deployNFT(nftName, nftTicker, salt);
        uint256 contractTokenId = nftLaunchManager.getContractCurrentTokenId(nftAddress);
        nftLaunchManager.mintContractTo(nftAddress, bob, contractTokenId);
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

    function test_mintTo_shouldFailIfTokenIdAlreadyMinted() public {
        string memory nftName = "Test NFT Token";
        string memory nftTicker = "TNT";
        bytes32 salt = keccak256(abi.encodePacked("test_mintContractToSelf_salt", alice));

        vm.startPrank(alice);
        address nftAddress = nftLaunchManager.deployNFT(nftName, nftTicker, salt);
        uint256 contractTokenId = nftLaunchManager.getContractCurrentTokenId(nftAddress);
        nftLaunchManager.mintContractTo(nftAddress, alice, contractTokenId);

        vm.expectRevert();
        nftLaunchManager.mintContractTo(nftAddress, alice, contractTokenId);
        vm.stopPrank();
    }
}