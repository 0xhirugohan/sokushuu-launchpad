Okay, let's modify the `NFTLaunchManager.deployNFT` function to use EIP-1167 clones with your `Initializable` `NFTLauncher`.

You'll need to:

1.  Use `Clones.clone()` to deploy a minimal proxy pointing to the `i_nftLauncherImplementation` address.
2.  Call the `initialize` function on the newly created clone address.
3.  **Important:** Modify `NFTLauncher.initialize` to accept the initial owner as an argument, because when the `NFTLaunchManager` calls `initialize`, `msg.sender` within that call context will be the `NFTLaunchManager` itself, not the user calling `deployNFT`.

**Step 1: Modify `NFTLauncher.initialize`**

Change the `initialize` function in `NFTLauncher.sol` to accept the owner:

```solidity
// packages/smartcontract/src/NFTLauncher.sol
// ... (imports remain the same)

contract NFTLauncher is Initializable, ERC721Upgradeable, OwnableUpgradeable {
    using Strings for uint256;

    string private i_BaseURI;
    uint256 private _tokenId = 0;

    constructor() initializer {} // Keep this constructor

    function initialize(
        string memory _name,
        string memory _ticker,
        string memory _baseURIInput,
        address initialOwner // <-- Add this parameter
    ) public initializer {
        __ERC721_init(_name, _ticker);
        __Ownable_init(initialOwner); // <-- Use the parameter here
        i_BaseURI = _baseURIInput;
    }

    function _baseURI() internal view override returns (string memory) {
        return i_BaseURI;
    }

    function safeMintTo(address to) public onlyOwner {
        // onlyOwner check now correctly refers to 'initialOwner' passed during initialization
        _safeMint(to, _tokenId);
        _tokenId++;
    }
}
```

**Step 2: Modify `NFTLaunchManager.deployNFT`**

Update the `deployNFT` function in `NFTLaunchManager.sol` as follows:

```solidity
// packages/smartcontract/src/NFTLaunchManager.sol
// ... (imports and other parts of the contract remain the same)

contract NFTLaunchManager is Ownable {
    // ... (existing state variables, events, errors, constructor, modifiers)

    function deployNFT(string memory _name, string memory _ticker) public returns (address) {
        // 1. Calculate necessary values
        uint256 currentAmount = _userContractAmount[msg.sender];
        string memory baseURI = string.concat(
            NFT_BASE_URI,
            "/",
            (currentAmount + 1).toString(),
            "/"
        );

        // 2. Deploy the clone using Clones.clone
        // Ensure i_nftLauncherImplementation holds the address of a deployed NFTLauncher contract
        address cloneAddress = Clones.clone(i_nftLauncherImplementation);

        // 3. Initialize the newly deployed clone
        // We cast the cloneAddress to NFTLauncher to call its functions
        // We pass msg.sender (the user calling deployNFT) as the initial owner
        NFTLauncher(cloneAddress).initialize(_name, _ticker, baseURI, msg.sender);

        // 4. Update state using the clone's address
        _userContracts[msg.sender].push(cloneAddress);
        _userContractAmount[msg.sender] = currentAmount + 1;
        _contractOwner[cloneAddress] = msg.sender; // Store the user as the owner in the manager

        // 5. Emit event with the clone's address
        emit DeployNFT(msg.sender, cloneAddress);

        // 6. Return the clone's address
        return cloneAddress;
    }

    // ... (rest of the functions: mintContractTo, listTokenToSell, etc.)
    // Note: mintContractTo's onlyContractOwner modifier should still work correctly
    // as _contractOwner[nftContract] is set correctly during deployment.
    // The onlyOwner check within NFTLauncher.safeMintTo will now correctly
    // check against the 'initialOwner' set during initialize.
}
```

**Explanation of Changes:**

1.  **Removed `new NFTLauncher(...)`:** The direct deployment is gone.
2.  **`Clones.clone(i_nftLauncherImplementation)`:** This deploys a minimal proxy contract whose logic is delegated to the `i_nftLauncherImplementation` address. This is much cheaper gas-wise than deploying the full contract each time.
3.  **`NFTLauncher(cloneAddress).initialize(...)`:** We get an instance of the `NFTLauncher` interface pointing at the `cloneAddress` and call its `initialize` function. This sets up the state (name, ticker, base URI, *and owner*) specifically for this clone. Crucially, we pass `msg.sender` (the user initiating the deployment) as the `initialOwner`.
4.  **State Updates:** All mappings (`_userContracts`, `_userContractAmount`, `_contractOwner`) and the event emission now use the `cloneAddress`.

**Before Deploying `NFTLaunchManager`:**

*   You must first deploy the modified `NFTLauncher.sol` contract *once*.
*   Take the address of that deployed `NFTLauncher` contract.
*   Pass that address as the `_nftLauncherImplementation` argument when deploying your `NFTLaunchManager` contract.