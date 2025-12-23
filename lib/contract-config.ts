// Replace with your deployed contract address
export const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"

// Replace with your deployed marketplace contract address
export const MARKETPLACE_ADDRESS = "0x0000000000000000000000000000000000000000"

// Default mint price (0.01 ETH) - should match contract's mintPrice
export const DEFAULT_MINT_PRICE = "0.01"

// ERC-721 ABI for NFT contract (includes royalty functions)
export const CONTRACT_ABI = [
  "function mint(address to, string memory tokenURI) public payable returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string memory)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function totalSupply() view returns (uint256)",
  "function mintPrice() view returns (uint256)",
  "function royaltyInfo(uint256 tokenId, uint256 salePrice) view returns (address receiver, uint256 royaltyAmount)",
  "function getRoyaltyInfo(uint256 tokenId) view returns (address receiver, uint256 percentage, bool isCustom)",
  "function setTokenRoyalty(uint256 tokenId, address receiver, uint96 royaltyPercentage)",
  "function approve(address to, uint256 tokenId)",
  "function getApproved(uint256 tokenId) view returns (address)",
  "function setApprovalForAll(address operator, bool approved)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event NFTMinted(address indexed to, uint256 indexed tokenId, string tokenURI)",
  "event RoyaltyInfoUpdated(uint256 indexed tokenId, address receiver, uint256 royaltyPercentage)",
] as const

// Marketplace ABI
export const MARKETPLACE_ABI = [
  "function listNFT(uint256 tokenId, uint256 price)",
  "function buyNFT(uint256 tokenId) payable",
  "function cancelListing(uint256 tokenId)",
  "function updateListingPrice(uint256 tokenId, uint256 newPrice)",
  "function getListing(uint256 tokenId) view returns (address seller, uint256 price, bool active)",
  "function getActiveListingsCount() view returns (uint256)",
  "function getActiveListings(uint256 offset, uint256 limit) view returns (uint256[])",
  "function getSellerListings(address seller) view returns (uint256[])",
  "function marketplaceFee() view returns (uint256)",
  "function nftContract() view returns (address)",
  "event NFTListed(address indexed seller, uint256 indexed tokenId, uint256 price)",
  "event NFTSold(address indexed seller, address indexed buyer, uint256 indexed tokenId, uint256 price)",
  "event ListingCancelled(address indexed seller, uint256 indexed tokenId)",
] as const
