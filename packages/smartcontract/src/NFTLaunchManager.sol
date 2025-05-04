// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";

import {NFTLauncher} from "./NFTLauncher.sol";
import {INFTLauncher} from "./interfaces/INFTLauncher.sol";

contract NFTLaunchManager is Ownable {
    using Strings for uint256;

    event DeployNFT(address indexed owner, address indexed contractAddress);
    event MintNFT(address indexed contractAddress, address indexed owner, address to);
    event ListingToken(address indexed contractAddress, uint256 indexed tokenId, uint256 priceInEther);
    event CancelListing(address indexed contractAddress, uint256 indexed tokenId);
    event BuyListedToken(address indexed buyer, address indexed contractAddress, uint256 tokenId);

    string constant NFT_BASE_URI = "https://launchpad.sokushuu.de/api/nft/";
    address public immutable i_nftLauncherImplementation;

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

    error ErrorNFTLaunchManager__WrongPaymentAmount(uint256 required, uint256 provided);

    error ErrorNFTLaunchManager__BuyerIsOwner();

    error ErrorNFTLaunchManager__PaymentTransferFailed();

    error ErrorNFTLaunchManager__LaunchPredictionMismatch();

    error ErrorNFTLaunchManager__TokenIdAlreadyMinted();

    constructor(
        address _initialOwner,
        address _nftLauncherImplementation
    ) Ownable(_initialOwner) {
        i_nftLauncherImplementation = _nftLauncherImplementation;
    }

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

    function getUserDeployedContracts(address user) public view returns (address[] memory) {
        return _userContracts[user];
    }

    function getContractCurrentTokenId(address contractAddress) public view returns (uint256) {
        return INFTLauncher(contractAddress).getCurrentTokenId();
    }

    function deployNFT(
        string memory _name,
        string memory _ticker,
        bytes32 _salt
    ) public returns (address) {
        uint256 currentAmount = _userContractAmount[msg.sender];

        address predictedAddress = Clones.predictDeterministicAddress(
            i_nftLauncherImplementation,
            _salt,
            address(this)
        );

        string memory baseURI = string.concat(
            NFT_BASE_URI,
            Strings.toHexString(uint160(uint256(uint160(predictedAddress))), 20),
            "/"
        );

        address cloneAddress = Clones.cloneDeterministic(i_nftLauncherImplementation, _salt);

        if (cloneAddress != predictedAddress) {
            revert ErrorNFTLaunchManager__LaunchPredictionMismatch();
        }

        NFTLauncher(cloneAddress).initialize(
            _name,
            _ticker,
            baseURI,
            address(this)
        );

        _userContracts[msg.sender].push(cloneAddress);
        _userContractAmount[msg.sender] = currentAmount + 1;
        _contractOwner[cloneAddress] = msg.sender;

        emit DeployNFT(msg.sender, cloneAddress);

        return cloneAddress;
    }

    function mintContractTo(
        address _nftContract,
        address _to,
        uint256 _tokenId
    ) public onlyContractOwner(_nftContract) {
        if (_to == address(0) || _nftContract == address(0)) {
            revert ErrorNFTLaunchManager__AddressIsZero();
        }

        uint256 contractTokenId = INFTLauncher(_nftContract).getCurrentTokenId();
        if (_tokenId != contractTokenId) {
            revert ErrorNFTLaunchManager__TokenIdAlreadyMinted();
        }

        NFTLauncher nftLauncher = NFTLauncher(_nftContract);
        nftLauncher.safeMintTo(_to);

        emit MintNFT(address(nftLauncher), msg.sender, _to);
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

    function buyListedToken(address nftContract, uint256 tokenId) public payable {
        if (nftContract == address(0)) {
            revert ErrorNFTLaunchManager__AddressIsZero();
        }

        if (_contractOwner[nftContract] == address(0)) {
            revert ErrorNFTLaunchManager__NFTContractIsNotRegistered();
        }

        if (IERC721(nftContract).getApproved(tokenId) != address(this)) {
            revert ErrorNFTLaunchManager__InsufficientTokenSendApproval();
        }

        if (!isTokenOnSale(nftContract, tokenId)) {
            revert ErrorNFTLaunchManager__TokenIsNotOnSale();
        }

        address seller = IERC721(nftContract).ownerOf(tokenId);
        uint256 price = getTokenSalePrice(nftContract, tokenId);

        if (msg.sender == seller) {
            revert ErrorNFTLaunchManager__BuyerIsOwner();
        }

        if (msg.value != price) {
            revert ErrorNFTLaunchManager__WrongPaymentAmount(price, msg.value);
        }

        _isTokenOnSale[nftContract][tokenId] = false;
        _tokenSalePrice[nftContract][tokenId] = 0;

        (bool success, ) = payable(seller).call{value: price}("");
        if (!success) {
            revert ErrorNFTLaunchManager__PaymentTransferFailed();
        }

        IERC721(nftContract).safeTransferFrom(seller, msg.sender, tokenId);

        emit BuyListedToken(msg.sender, nftContract, tokenId);
    }

    function _getUserContractAmount(address user) internal view returns (uint256) {
        return _userContractAmount[user];
    }
}