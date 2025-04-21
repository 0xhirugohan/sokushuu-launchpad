// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

import {NFTLauncher} from "./NFTLauncher.sol";

contract NFTLaunchManager is Ownable {
    using Strings for uint256;

    event DeployNFT(address indexed owner, address indexed contractAddress);
    event MintNFT(address indexed contractAddress, address indexed owner, address to);
    event ListingToken(address indexed contractAddress, uint256 indexed tokenId, uint256 priceInEther);
    event CancelListing(address indexed contractAddress, uint256 indexed tokenId);

    string constant NFT_BASE_URI = "https://launchpad-dev.sokushuu.dev/api/nft/";

    // NFT created by an address
    mapping(address owner => address[]) private _userContracts;

    mapping(address owner => uint256) private _userContractAmount;

    mapping(address contractAddress => address) private _contractOwner;

    mapping(address contractAddress => mapping(uint256 tokenId => bool)) private _isTokenOnSale;

    mapping(address contractAddress => mapping(uint256 tokenId => uint256)) private _tokenSalePrice;

    error ErrorNFTLaunchManager__UserIsNotContractOwner();

    error ErrorNFTLaunchManager__NFTContractIsNotRegistered();

    error ErrorNFTLaunchManager__AddressIsZero();

    error ErrorNFTLaunchManager__PriceIsZero();

    error ErrorNFTLaunchManager__WrongOwnerOfToken();

    error ErrorNFTLaunchManager__InsufficientTokenSendApproval();

    error ErrorNFTLaunchManager__TokenIsNotOnSale();

    constructor(address initialOwner) Ownable(initialOwner) {}

    modifier onlyContractOwner(address contractAddress) {
        if (msg.sender != _contractOwner[contractAddress]) {
            revert ErrorNFTLaunchManager__UserIsNotContractOwner();
        }
        _;
    }

    function getContractOwner(address contractAddress) public view returns (address) {
        return _contractOwner[contractAddress];
    }

    function isTokenOnSale(address contractAddress, uint256 tokenId) public view returns (bool) {
        return _isTokenOnSale[contractAddress][tokenId];
    }

    function getTokenSalePrice(address contractAddress, uint256 tokenId) public view returns (uint256) {
        return _tokenSalePrice[contractAddress][tokenId];
    }

    function deployNFT(string memory _name, string memory _ticker) public returns (address) {
        uint256 amountContractOwned = _getUserContractAmount(msg.sender);

        NFTLauncher nftLauncher = new NFTLauncher(
            _name,
            _ticker,
            string.concat(
                NFT_BASE_URI,
                amountContractOwned.toString(),
                "/"
            )
        );

        if (_userContracts[msg.sender].length == 0) {
            _userContracts[msg.sender] = new address[](0);
        }

        _userContracts[msg.sender].push(address(nftLauncher));
        _userContractAmount[msg.sender] += 1;
        _contractOwner[address(nftLauncher)] = msg.sender;

        emit DeployNFT(msg.sender, address(nftLauncher));

        return address(nftLauncher);
    }

    function mintContractTo(address nftContract, address to) public onlyContractOwner(nftContract) {
        if (to == address(0) || nftContract == address(0)) {
            revert ErrorNFTLaunchManager__AddressIsZero();
        }

        NFTLauncher nftLauncher = NFTLauncher(nftContract);
        nftLauncher.safeMintTo(to);

        emit MintNFT(address(nftLauncher), msg.sender, to);
    }

    function listTokenToSell(address nftContract, uint256 tokenId, uint256 priceInEther) public {
        if (nftContract == address(0)) {
            revert ErrorNFTLaunchManager__AddressIsZero();
        }

        if (priceInEther == 0) {
            revert ErrorNFTLaunchManager__PriceIsZero();
        }

        if (_contractOwner[nftContract] == address(0)) {
            revert ErrorNFTLaunchManager__NFTContractIsNotRegistered();
        }

        // check if sender is the owner of that token
        if (IERC721(nftContract).ownerOf(tokenId) != msg.sender) {
            revert ErrorNFTLaunchManager__WrongOwnerOfToken();
        }

        if (IERC721(nftContract).getApproved(tokenId) != address(this)) {
            revert ErrorNFTLaunchManager__InsufficientTokenSendApproval();
        }

        // set the price and store it on storage
        _isTokenOnSale[nftContract][tokenId] = true;
        _tokenSalePrice[nftContract][tokenId] = priceInEther;

        // emit event
        emit ListingToken(nftContract, tokenId, priceInEther);
    }

    function cancelTokenListing(address nftContract, uint256 tokenId) public {
        if (nftContract == address(0)) {
            revert ErrorNFTLaunchManager__AddressIsZero();
        }

        if (_contractOwner[nftContract] == address(0)) {
            revert ErrorNFTLaunchManager__NFTContractIsNotRegistered();
        }

        if (IERC721(nftContract).ownerOf(tokenId) != msg.sender) {
            revert ErrorNFTLaunchManager__WrongOwnerOfToken();
        }

        if (!_isTokenOnSale[nftContract][tokenId]) {
            revert ErrorNFTLaunchManager__TokenIsNotOnSale();
        }

        _isTokenOnSale[nftContract][tokenId] = false;
        _tokenSalePrice[nftContract][tokenId] = 0;

        emit CancelListing(nftContract, tokenId);
    }

    function _getUserContractAmount(address user) internal view returns (uint256) {
        return _userContractAmount[user];
    }
}