Okay, let's break down the steps to implement EIP-1167 (Minimal Proxy Standard) for your `NFTLauncher` deployment within `NFTLaunchManager`.

The core idea is:
1.  Deploy the `NFTLauncher` contract *once* to serve as the master implementation.
2.  Modify `NFTLaunchManager` to deploy cheap "clones" (EIP-1167 proxies) of this master implementation instead of deploying the full `NFTLauncher` bytecode each time.
3.  Since clones don't run constructors, convert `NFTLauncher`'s constructor logic into an `initialize` function.

---

**Step-by-Step Task List:**

**Phase 1: Modify `NFTLauncher.sol` to be Cloneable**

1.  **Make it Initializable:** Clones cannot use constructors. You need to move the constructor logic into a public initializer function and protect it from being called multiple times. OpenZeppelin's `Initializable` contract is perfect for this.
    *   **Task:** Import and inherit `Initializable`.
    *   **Task:** Remove the `constructor`.
    *   **Task:** Create an `initialize` function that takes the same parameters as the old constructor (`_name`, `_ticker`, `_baseURIInput`) plus an `_initialOwner` parameter.
    *   **Task:** Call the initializer functions of the inherited contracts (`ERC721`, `Ownable`) within your new `initialize` function using their `__ContractName_init` methods.
    *   **Task:** Move the logic `i_BaseURI = _baseURIInput;` into the `initialize` function.
    *   **Task:** Add the `initializer` modifier (from `Initializable`) to your `initialize` function to prevent re-initialization.

    ```diff
    --- a/packages/smartcontract/src/NFTLauncher.sol
    +++ b/packages/smartcontract/src/NFTLauncher.sol
    @@ -1,19 +1,25 @@
     // SPDX-License-Identifier: MIT
     pragma solidity ^0.8.28;
    
    +import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol"; // Use upgradeable version for init
     import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
     import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
     import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
    
    -contract NFTLauncher is ERC721, Ownable {
    +// Inherit from Initializable
    +contract NFTLauncher is Initializable, ERC721, Ownable {
         using Strings for uint256;
    
         string private i_BaseURI;
    -    uint256 private _tokenId = 0;
    +    uint256 private _tokenId = 0; // Start token ID at 0
    
    -    constructor(
    -        string memory _name,
    -        string memory _ticker,
    +    // --- CONSTRUCTOR REMOVED ---
    +    // Use empty constructor for Initializable pattern if needed for deployment
    +    // constructor() initializer {} // Not strictly needed if deploying directly once
    +
    +    // --- INITIALIZER FUNCTION ---
    +    function initialize(
    +        string memory _name, // NFT Name
    +        string memory _ticker, // NFT Ticker
         string memory _baseURIInput
     ) ERC721(_name, _ticker) Ownable(msg.sender) {
         i_BaseURI = _baseURIInput;
    @@ -21,10 +27,17 @@
 
     function _baseURI() internal view override returns (string memory) {
         return i_BaseURI;
    +        address _initialOwner // The owner of this specific clone
    +    ) public initializer { // Add initializer modifier
    +    // Call initializers of parent contracts
    +    __ERC721_init(_name, _ticker);
    +    __Ownable_init(_initialOwner); // Set the owner of the clone
    +
    +    // Custom initialization logic
    +    i_BaseURI = _baseURIInput;
     }
 
     function safeMintTo(address to) public onlyOwner {
         _safeMint(to, _tokenId);
    -
         _tokenId++;
     }
    +
    +    // Gap required by OZ UUPS (though not strictly needed here, good practice)
    +    // uint256[49] private __gap; // If using UUPS upgradeability, otherwise optional
    }
    ```

    *   **Code:** (Implement the changes shown in the diff above in `packages/smartcontract/src/NFTLauncher.sol`)
    *   **Reference:** OpenZeppelin Initializable: [https://docs.openzeppelin.com/contracts/4.x/upgradeable#initializers](https://docs.openzeppelin.com/contracts/4.x/upgradeable#initializers)

2.  **Install Upgradeable Contracts (if needed):** The `Initializable` contract is often part of the upgradeable contracts package.
    *   **Task:** If you haven't already, install the OpenZeppelin upgradeable contracts package. Assuming you use npm/yarn in your project structure:
        ```bash
        npm install @openzeppelin/contracts-upgradeable
        # or
        yarn add @openzeppelin/contracts-upgradeable
        ```
    *   **Tool:** Use the `builtin_run_terminal_command` tool.

**Phase 2: Modify `NFTLaunchManager.sol` to Deploy Clones**

3.  **Store Implementation Address:** The manager needs to know the address of the single, deployed `NFTLauncher` implementation.
    *   **Task:** Add an `immutable` state variable `i_nftLauncherImplementation` of type `address`. Immutable variables are set in the constructor and are cheaper than regular storage variables.
    *   **Task:** Update the `NFTLaunchManager` constructor to accept the implementation address and store it in `i_nftLauncherImplementation`.

4.  **Use Cloning Library:** Import OpenZeppelin's `Clones` library for creating EIP-1167 proxies.
    *   **Task:** Import `Clones` from `@openzeppelin/contracts/proxy/Clones.sol`.

5.  **Modify `deployNFT` Function:** Change this function to deploy a clone and then initialize it.
    *   **Task:** Remove the `new NFTLauncher(...)` line.
    *   **Task:** Keep the logic for calculating the `baseURI` using `_userContractAmount`.
    *   **Task:** Use `Clones.clone(i_nftLauncherImplementation)` to deploy the minimal proxy contract. Store the address of the newly created clone.
    *   **Task:** Call the `initialize` function on the *new clone's address*. Pass the required parameters: `_name`, `_ticker`, the calculated `baseURI`, and critically, `msg.sender` as the `_initialOwner` so the *deployer* owns the new NFT contract, not the manager.
    *   **Task:** Update the manager's state (`_userContracts`, `_userContractAmount`, `_contractOwner`) using the *clone's address*.
    *   **Task:** Emit the `DeployNFT` event with the *clone's address*.
    *   **Task:** Return the *clone's address*.

    ```diff
    --- a/packages/smartcontract/src/NFTLaunchManager.sol
    +++ b/packages/smartcontract/src/NFTLaunchManager.sol
    @@ -3,6 +3,7 @@
     
     import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
     import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
    +import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
     import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
     
     import {NFTLauncher} from "./NFTLauncher.sol";
    @@ -18,6 +19,9 @@
 
     string constant NFT_BASE_URI = "https://launchpad-dev.sokushuu.dev/api/nft/";
 
    +    // Address of the single NFTLauncher implementation contract
    +    address public immutable i_nftLauncherImplementation;
    +
     // NFT created by an address
     mapping(address owner => address[]) private _userContracts;
 
    @@ -43,7 +47,11 @@
 
     error ErrorNFTLaunchManager__PaymentTransferFailed();
 
    -    constructor(address initialOwner) Ownable(initialOwner) {}
    +    constructor(
    +        address initialOwner,
    +        address nftLauncherImplementation_ // Address of the deployed NFTLauncher logic contract
    +    ) Ownable(initialOwner) {
    +        i_nftLauncherImplementation = nftLauncherImplementation_;
    +    }
 
     modifier onlyContractOwner(address contractAddress) {
         if (msg.sender != _contractOwner[contractAddress]) {
    @@ -67,25 +75,30 @@
     }
 
     function deployNFT(string memory _name, string memory _ticker) public returns (address) {
    +        // --- EIP-116