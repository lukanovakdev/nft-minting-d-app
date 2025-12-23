// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract NFTMarketplace is Ownable, ReentrancyGuard {
    IERC721 public nftContract;
    
    // Marketplace fee percentage (basis points: 250 = 2.5%)
    uint256 public marketplaceFee = 250; // 2.5% default
    uint256 public constant MAX_FEE = 1000; // 10% max
    
    struct Listing {
        address seller;
        uint256 tokenId;
        uint256 price;
        bool active;
    }
    
    // tokenId => Listing
    mapping(uint256 => Listing) public listings;
    
    // Track all active listings for enumeration
    uint256[] private activeListingIds;
    mapping(uint256 => uint256) private listingIndex; // tokenId => index in activeListingIds
    
    event NFTListed(
        address indexed seller,
        uint256 indexed tokenId,
        uint256 price
    );
    
    event NFTSold(
        address indexed seller,
        address indexed buyer,
        uint256 indexed tokenId,
        uint256 price
    );
    
    event ListingCancelled(
        address indexed seller,
        uint256 indexed tokenId
    );
    
    event MarketplaceFeeUpdated(uint256 oldFee, uint256 newFee);
    
    constructor(address _nftContract) Ownable(msg.sender) {
        require(_nftContract != address(0), "Invalid NFT contract address");
        nftContract = IERC721(_nftContract);
    }
    
    /**
     * @dev List an NFT for sale
     * @param tokenId The token ID to list
     * @param price The price in wei
     */
    function listNFT(uint256 tokenId, uint256 price) external {
        require(nftContract.ownerOf(tokenId) == msg.sender, "Not the owner");
        require(price > 0, "Price must be greater than 0");
        require(!listings[tokenId].active, "NFT already listed");
        require(
            nftContract.getApproved(tokenId) == address(this) ||
            nftContract.isApprovedForAll(msg.sender, address(this)),
            "Marketplace not approved"
        );
        
        listings[tokenId] = Listing({
            seller: msg.sender,
            tokenId: tokenId,
            price: price,
            active: true
        });
        
        // Add to active listings array
        activeListingIds.push(tokenId);
        listingIndex[tokenId] = activeListingIds.length - 1;
        
        emit NFTListed(msg.sender, tokenId, price);
    }
    
    /**
     * @dev Buy a listed NFT
     * @param tokenId The token ID to buy
     */
    function buyNFT(uint256 tokenId) external payable nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.active, "NFT not for sale");
        require(msg.value >= listing.price, "Insufficient payment");
        require(listing.seller != msg.sender, "Cannot buy your own NFT");
        
        address seller = listing.seller;
        uint256 price = listing.price;
        
        // Mark listing as inactive
        listing.active = false;
        
        // Remove from active listings array
        _removeListing(tokenId);
        
        // Calculate marketplace fee
        uint256 feeAmount = (price * marketplaceFee) / 10000;
        
        // Calculate and transfer royalties (EIP-2981)
        uint256 royaltyAmount = 0;
        address royaltyReceiver = address(0);
        try IERC2981(address(nftContract)).royaltyInfo(tokenId, price) returns (
            address receiver,
            uint256 royalty
        ) {
            royaltyReceiver = receiver;
            royaltyAmount = royalty;
        } catch {}
        
        // Ensure total fees don't exceed sale price
        require(feeAmount + royaltyAmount < price, "Fees exceed sale price");
        
        uint256 sellerAmount = price - feeAmount - royaltyAmount;
        
        // Transfer NFT to buyer
        nftContract.safeTransferFrom(seller, msg.sender, tokenId);
        
        // Transfer royalties to royalty receiver
        if (royaltyAmount > 0 && royaltyReceiver != address(0)) {
            payable(royaltyReceiver).transfer(royaltyAmount);
        }
        
        // Transfer payment to seller (minus fees and royalties)
        payable(seller).transfer(sellerAmount);
        
        // Refund excess payment
        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }
        
        emit NFTSold(seller, msg.sender, tokenId, price);
    }
    
    /**
     * @dev Cancel a listing
     * @param tokenId The token ID to cancel listing for
     */
    function cancelListing(uint256 tokenId) external {
        Listing storage listing = listings[tokenId];
        require(listing.active, "Listing not active");
        require(listing.seller == msg.sender, "Not the seller");
        
        listing.active = false;
        
        // Remove from active listings array
        _removeListing(tokenId);
        
        emit ListingCancelled(msg.sender, tokenId);
    }
    
    /**
     * @dev Update the listing price
     * @param tokenId The token ID
     * @param newPrice The new price in wei
     */
    function updateListingPrice(uint256 tokenId, uint256 newPrice) external {
        Listing storage listing = listings[tokenId];
        require(listing.active, "Listing not active");
        require(listing.seller == msg.sender, "Not the seller");
        require(newPrice > 0, "Price must be greater than 0");
        
        listing.price = newPrice;
        
        emit NFTListed(msg.sender, tokenId, newPrice);
    }
    
    /**
     * @dev Get listing details
     * @param tokenId The token ID
     * @return seller The seller address
     * @return price The listing price
     * @return active Whether the listing is active
     */
    function getListing(uint256 tokenId) external view returns (
        address seller,
        uint256 price,
        bool active
    ) {
        Listing memory listing = listings[tokenId];
        return (listing.seller, listing.price, listing.active);
    }
    
    /**
     * @dev Get total number of active listings
     */
    function getActiveListingsCount() external view returns (uint256) {
        return activeListingIds.length;
    }
    
    /**
     * @dev Get active listing IDs (paginated)
     * @param offset Starting index
     * @param limit Number of items to return
     */
    function getActiveListings(
        uint256 offset,
        uint256 limit
    ) external view returns (uint256[] memory) {
        uint256 length = activeListingIds.length;
        if (offset >= length) {
            return new uint256[](0);
        }
        
        uint256 end = offset + limit;
        if (end > length) {
            end = length;
        }
        
        uint256[] memory result = new uint256[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = activeListingIds[i];
        }
        
        return result;
    }
    
    /**
     * @dev Set marketplace fee (only owner)
     * @param _fee Fee in basis points (100 = 1%)
     */
    function setMarketplaceFee(uint256 _fee) external onlyOwner {
        require(_fee <= MAX_FEE, "Fee too high");
        uint256 oldFee = marketplaceFee;
        marketplaceFee = _fee;
        emit MarketplaceFeeUpdated(oldFee, _fee);
    }
    
    /**
     * @dev Withdraw marketplace fees (only owner)
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        payable(owner()).transfer(balance);
    }
    
    /**
     * @dev Remove listing from active listings array
     */
    function _removeListing(uint256 tokenId) private {
        uint256 index = listingIndex[tokenId];
        uint256 lastIndex = activeListingIds.length - 1;
        
        if (index != lastIndex) {
            uint256 lastTokenId = activeListingIds[lastIndex];
            activeListingIds[index] = lastTokenId;
            listingIndex[lastTokenId] = index;
        }
        
        activeListingIds.pop();
        delete listingIndex[tokenId];
    }
    
    /**
     * @dev Get all listings for a specific seller
     * Note: This is a view function that might be expensive for large numbers
     * Consider using events or off-chain indexing for production
     */
    function getSellerListings(address seller) external view returns (uint256[] memory) {
        uint256[] memory result = new uint256[](activeListingIds.length);
        uint256 count = 0;
        
        for (uint256 i = 0; i < activeListingIds.length; i++) {
            uint256 tokenId = activeListingIds[i];
            if (listings[tokenId].seller == seller && listings[tokenId].active) {
                result[count] = tokenId;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory trimmedResult = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            trimmedResult[i] = result[i];
        }
        
        return trimmedResult;
    }
}

