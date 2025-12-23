// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

contract NFTCollection is ERC721URIStorage, ERC721Enumerable, Ownable, IERC2981 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public mintPrice = 0.01 ether;
    
    // Royalty information
    uint256 private _royaltyPercentage = 500; // 5% default (in basis points: 500 = 5%)
    address private _royaltyReceiver;
    
    // Per-token royalty support (optional - defaults to contract-wide royalty)
    mapping(uint256 => RoyaltyInfo) private _tokenRoyalties;

    struct RoyaltyInfo {
        bool isSet;
        address receiver;
        uint96 royaltyFraction; // Basis points (e.g., 500 = 5%)
    }

    event NFTMinted(address indexed to, uint256 indexed tokenId, string tokenURI);
    event RoyaltyInfoUpdated(uint256 indexed tokenId, address receiver, uint256 royaltyPercentage);

    constructor() ERC721("NFTCollection", "NFTC") Ownable(msg.sender) {
        _royaltyReceiver = msg.sender;
    }

    function mint(address to, string memory uri) public payable returns (uint256) {
        require(_tokenIdCounter.current() < MAX_SUPPLY, "Max supply reached");
        require(msg.value >= mintPrice || msg.sender == owner(), "Insufficient payment");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        // Set minter as royalty receiver for this token (optional)
        // You can customize this logic based on your needs

        emit NFTMinted(to, tokenId, uri);
        return tokenId;
    }

    /**
     * @dev Set royalty information for a specific token
     * @param tokenId The token ID
     * @param receiver The address to receive royalties
     * @param royaltyPercentage Royalty percentage in basis points (e.g., 500 = 5%)
     */
    function setTokenRoyalty(
        uint256 tokenId,
        address receiver,
        uint96 royaltyPercentage
    ) external {
        require(_exists(tokenId), "Token does not exist");
        require(
            ownerOf(tokenId) == msg.sender || msg.sender == owner(),
            "Not authorized to set royalty"
        );
        require(receiver != address(0), "Invalid receiver address");
        require(royaltyPercentage <= 1000, "Royalty cannot exceed 10%"); // Max 10%

        _tokenRoyalties[tokenId] = RoyaltyInfo({
            isSet: true,
            receiver: receiver,
            royaltyFraction: royaltyPercentage
        });

        emit RoyaltyInfoUpdated(tokenId, receiver, royaltyPercentage);
    }

    /**
     * @dev Set default royalty receiver for the contract
     * @param receiver The address to receive royalties
     */
    function setRoyaltyReceiver(address receiver) external onlyOwner {
        require(receiver != address(0), "Invalid receiver address");
        _royaltyReceiver = receiver;
    }

    /**
     * @dev Set default royalty percentage
     * @param percentage Royalty percentage in basis points (e.g., 500 = 5%)
     */
    function setRoyaltyPercentage(uint256 percentage) external onlyOwner {
        require(percentage <= 1000, "Royalty cannot exceed 10%"); // Max 10%
        _royaltyPercentage = percentage;
    }

    /**
     * @dev EIP-2981: Returns the royalty info for a token
     * @param tokenId The token ID
     * @param salePrice The sale price of the token
     * @return receiver The address to receive royalties
     * @return royaltyAmount The royalty amount
     */
    function royaltyInfo(
        uint256 tokenId,
        uint256 salePrice
    ) external view override returns (address receiver, uint256 royaltyAmount) {
        require(_exists(tokenId), "Token does not exist");

        // Check if token has custom royalty info
        if (_tokenRoyalties[tokenId].isSet) {
            RoyaltyInfo memory royalty = _tokenRoyalties[tokenId];
            royaltyAmount = (salePrice * royalty.royaltyFraction) / 10000;
            return (royalty.receiver, royaltyAmount);
        }

        // Use contract-wide default royalty
        royaltyAmount = (salePrice * _royaltyPercentage) / 10000;
        return (_royaltyReceiver, royaltyAmount);
    }

    /**
     * @dev Get royalty information for a token
     * @param tokenId The token ID
     * @return receiver The address to receive royalties
     * @return percentage Royalty percentage in basis points
     * @return isCustom Whether this token has custom royalty settings
     */
    function getRoyaltyInfo(uint256 tokenId) external view returns (
        address receiver,
        uint256 percentage,
        bool isCustom
    ) {
        require(_exists(tokenId), "Token does not exist");

        if (_tokenRoyalties[tokenId].isSet) {
            RoyaltyInfo memory royalty = _tokenRoyalties[tokenId];
            return (royalty.receiver, royalty.royaltyFraction, true);
        }

        return (_royaltyReceiver, _royaltyPercentage, false);
    }

    function setMintPrice(uint256 _price) external onlyOwner {
        mintPrice = _price;
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }

    // Required overrides
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, ERC721Enumerable, IERC165)
        returns (bool)
    {
        return interfaceId == type(IERC2981).interfaceId || super.supportsInterface(interfaceId);
    }
}
