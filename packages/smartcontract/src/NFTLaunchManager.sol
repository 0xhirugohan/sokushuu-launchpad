// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

import {NFTLauncher} from "./NFTLauncher.sol";

contract NFTLaunchManager is Ownable {
    using Strings for uint256;

    string constant NFT_BASE_URI = "https://launchpad-dev.sokushuu.dev/api/nft/";

    // NFT created by an address
    mapping(address owner => address[]) private _userContracts;

    mapping(address owner => uint256) private _userContractAmount;

    mapping(address contractAddress => address) private _contractOwner;

    error ErrorNFTLaunchManager__UserIsNotContractOwner();

    error ErrorNFTLaunchManager__AddressIsZero();

    constructor(address initialOwner) Ownable(initialOwner) {}

    modifier onlyContractOwner(address contractAddress) {
        if (msg.sender != _contractOwner[msg.sender]) {
            revert ErrorNFTLaunchManager__UserIsNotContractOwner();
        }
        _;
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

        return address(nftLauncher);
    }

    function mintContractTo(address nftContract, address to) public onlyContractOwner(nftContract) {
        if (to == address(0)) {
            revert ErrorNFTLaunchManager__AddressIsZero();
        }

        NFTLauncher nftLauncher = NFTLauncher(nftContract);
        nftLauncher.safeMintTo(to);
    }

    function _getUserContractAmount(address user) internal view returns (uint256) {
        return _userContractAmount[user];
    }
}