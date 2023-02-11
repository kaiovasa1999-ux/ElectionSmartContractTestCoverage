import { ethers } from "hardhat";
import { HardhatUserConfig, task } from "hardhat/config";
async function main() {
  const USElection = await ethers.getContractFactory("USElection");
  const usElection = await USElection.deploy();
  await usElection.deployed();
  console.log("USElection deployed to:", usElection.address);
}
const lazyImport = async (module: any) => {
  return await import(module);
};

task("deploy", "Deploys contracts").setAction(async () => {
  const { main } = await lazyImport("./scripts/deploy");
  await main();
});

task("deploy-with-pk", "Deploys contract with pk")
  .addParam("privateKey", "Please provide the private key")
  .setAction(async ({ privateKey }) => {
    const { main } = await lazyImport("./scripts/deploy-pk");
    await main(privateKey);
  });
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
