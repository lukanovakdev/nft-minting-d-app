const hre = require("hardhat")

async function main() {
  console.log("Starting deployment...")

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners()
  console.log("Deploying contracts with account:", deployer.address)

  // Get account balance
  const balance = await hre.ethers.provider.getBalance(deployer.address)
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH")

  // Deploy the NFT contract
  console.log("\nDeploying NFTCollection...")
  const NFTCollection = await hre.ethers.getContractFactory("NFTCollection")
  const nftCollection = await NFTCollection.deploy()

  await nftCollection.waitForDeployment()
  const contractAddress = await nftCollection.getAddress()

  console.log("✅ NFTCollection deployed to:", contractAddress)
  console.log("\nNext steps:")
  console.log("1. Update CONTRACT_ADDRESS in lib/contract-config.ts with:", contractAddress)
  console.log("2. Verify the contract on Etherscan (optional):")
  console.log(`   npx hardhat verify --network sepolia ${contractAddress}`)
  console.log("\n3. Add the following to your .env file:")
  console.log(`   NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
