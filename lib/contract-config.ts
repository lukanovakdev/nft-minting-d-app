// Replace with your deployed contract address
export const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"

// Default mint price (0.01 ETH) - should match contract's mintPrice
export const DEFAULT_MINT_PRICE = "0.01"

// ERC-721 ABI for NFT contract
export const CONTRACT_ABI = [
  "function mint(address to, string memory tokenURI) public payable returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string memory)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function totalSupply() view returns (uint256)",
  "function mintPrice() view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event NFTMinted(address indexed to, uint256 indexed tokenId, string tokenURI)",
] as const
