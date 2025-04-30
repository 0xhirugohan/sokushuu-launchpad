// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface INFTLauncher {

    /**
     * @notice Gets the next token ID that will be minted.
     * @return tokenId The current token ID counter.
     */
    function getCurrentTokenId() external view returns (uint256 tokenId);

}