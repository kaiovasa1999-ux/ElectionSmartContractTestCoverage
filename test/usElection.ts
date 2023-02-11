import { USElection__factory } from "./../typechain-types/factories/Election.sol/USElection__factory";
import { USElection } from "./../typechain-types/Election.sol/USElection";
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

// import { ethers } from "hardhat";


describe("USElection", function () {
  let usElectionFactory;
  let usElection: USElection;

  async function everyTime() {
    const stateResultsTrump = ["XXXX", 800, 1200, 33];
    const stateResultsBiden = ["XXXX", 1300, 1200, 33];
    const [owner, otherAccount, electionEnded] = await ethers.getSigners();
    return { owner, otherAccount , electionEnded, stateResultsTrump,stateResultsBiden};
  }

  before(async () => {
    usElectionFactory = await ethers.getContractFactory("USElection");

    const [owner, otherAccount] = await ethers.getSigners();
    usElection = await usElectionFactory.deploy();
   
    await usElection.deployed();
    return {owner, otherAccount}
  });

  it("Should return the current leader before submit any election results", async function () {
    expect(await usElection.currentLeader()).to.equal(0); // NOBODY
  });

  it("Should throw an error when state seats are 0", async function(){
    const stateResults = ["New York",200,300,0];
    expect( usElection.submitStateResult(stateResults)).to.be.revertedWith("States must have at least 1 seat");
  });

  it("Should thow an errore when submit to equal votes",async function(){
    const stateResults = ["LA",100,100,10];
    expect(usElection.submitStateResult(stateResults)).to.be.revertedWith('There cannot be a tie');
  })
  it("Should return the election status", async function () {
    expect(await usElection.electionEnded()).to.equal(false); // Not Ended
  });

  it("Should submit state results and get current leader", async function () {
    const {stateResultsBiden} = await loadFixture(everyTime);
    const submitStateResultsTx = await usElection.submitStateResult(stateResultsBiden);
    await submitStateResultsTx.wait();
    expect(await usElection.currentLeader()).to.equal(1); // BIDEN
  });

  it("Should throw when try to submit already submitted state results", async function () {
    const {stateResultsTrump} = await loadFixture(everyTime);
    const submitStateResultsTx = await usElection.submitStateResult(stateResultsTrump);
    await submitStateResultsTx.wait();
    expect(usElection.submitStateResult(stateResultsTrump)).to.be.revertedWith(
      "This state result was already submitted!"
    );
  });

  it("Should increment seats properly after winning", async function(){
    const {stateResultsTrump} = await loadFixture(everyTime);
    // console.log(stateResultsTrump);
    const submitStateResultsTx = await usElection.submitStateResult(stateResultsTrump);
    await submitStateResultsTx.wait();
    expect(await usElection.seats(2)).to.equal(33);
  });

  it("Should submit state results and get current leader", async function () {
    const {stateResultsTrump} = await loadFixture(everyTime);
    const submitStateResultsTx = await usElection.submitStateResult(stateResultsTrump);
    await submitStateResultsTx.wait();
    expect(await usElection.currentLeader()).to.equal(2); // TRUMP
  });

  it("Should throw on error when trying to end election with not the owner", async function () {
    const {otherAccount} = await loadFixture(everyTime);
    await usElection.connect(otherAccount).electionEnded();
    await expect(usElection.connect(otherAccount).endElection()).to.be.revertedWith('Not invoked by the owner');
  });
 
  it("Should end the elections, get the leader and election status", async function () {
    const {stateResultsTrump} = await loadFixture(everyTime);
    const submitStateResultsTx = await usElection.submitStateResult(stateResultsTrump);
    await submitStateResultsTx.wait();
    const endElectionTx = await usElection.endElection();
    await endElectionTx.wait();

    expect(await usElection.currentLeader()).to.equal(2); // TRUMP

    expect(await usElection.electionEnded()).to.equal(true); // Ended
  });

  describe("Emit events", function () {
    it("Should emit an event on submitStateResult",async function(){
      const {electionEnded} = await loadFixture(everyTime);
      const stateRsults = ["Massachusetts",100,200,30]

      expect(await usElection.submitStateResult(stateRsults)).to.emit(usElection,"LogStaqwerqwerteResult")
      .withArgs(anyValue);
    })

    it("Should emit an event on endElection", async function(){
      expect(await usElection.endElection()).to.emit(usElection,"LogElectionEnded").withArgs(anyValue);
    })
  })
});
