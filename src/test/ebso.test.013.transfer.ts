import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { EBlockStock } from '../typechain';
import { solidity } from 'ethereum-waffle';
import { ethers } from 'hardhat';
import chai from 'chai';

chai.use(solidity);
const { expect } = chai;

describe('eBSO - 013: transfer', () => {
  let EBSO: EBlockStock;
  let owner: SignerWithAddress;
  let superadmin: SignerWithAddress;
  let amlAdmin: SignerWithAddress;
  let treasuryAdmin: SignerWithAddress;
  let treasury: SignerWithAddress;
  let bsoPool: SignerWithAddress;
  let feeAccount: SignerWithAddress;
  let user: SignerWithAddress;
  let anotherUser: SignerWithAddress;
  let addresses: SignerWithAddress[];

  const TOKEN_ADMIN = ethers.utils.id('TOKEN_ADMIN');
  const AML_ADMIN = ethers.utils.id('AML_ADMIN');
  const TREASURY_ADMIN = ethers.utils.id('TREASURY_ADMIN');

  beforeEach(async () => {
    [owner, superadmin, amlAdmin, treasuryAdmin, treasury, bsoPool, feeAccount, user, anotherUser, ...addresses] =
      await ethers.getSigners();

    const eBSOContract = await ethers.getContractFactory('EBlockStock', owner);
    EBSO = (await eBSOContract.deploy(superadmin.address)) as EBlockStock;

    await EBSO.grantRole(AML_ADMIN, amlAdmin.address);
    await EBSO.grantRole(TREASURY_ADMIN, treasuryAdmin.address);
    await EBSO.setTreasuryAddress(treasury.address);
    await EBSO.setBsoPoolAddress(bsoPool.address);
    await EBSO.setFeeAddress(feeAccount.address);
  });

  it('user should be able to transfer to treasury', async () => {
    await EBSO.connect(treasuryAdmin).mint(user.address, 10000);
    await EBSO.connect(user).transfer(treasury.address, 2000);

    const userBalance = await EBSO.balanceOf(user.address);
    const treasuryBalance = await EBSO.balanceOf(treasury.address);

    expect(userBalance).to.eq(8000);
    expect(treasuryBalance).to.eq(2000);
  });

  it('transfer from treasury should be free', async () => {
    await EBSO.setBsoFee(500);
    await EBSO.setGeneralFee(400);
    await EBSO.connect(treasuryAdmin).mint(treasury.address, 1000000);
    await EBSO.connect(treasury).transfer(user.address, 700000);

    const treasuryBalance = await EBSO.balanceOf(treasury.address);
    const userBalance = await EBSO.balanceOf(user.address);
    const bsoPoolBalance = await EBSO.balanceOf(bsoPool.address);
    const generalFeeBalance = await EBSO.balanceOf(feeAccount.address);

    expect(treasuryBalance).to.eq(300000);
    expect(userBalance).to.eq(700000);
    expect(bsoPoolBalance).to.eq(0);
    expect(generalFeeBalance).to.eq(0);
  });

  it('transfer to treasury should be free', async () => {
    await EBSO.setBsoFee(500);
    await EBSO.setGeneralFee(400);
    await EBSO.connect(treasuryAdmin).mint(user.address, 1000000);
    await EBSO.connect(user).transfer(treasury.address, 700000);

    const userBalance = await EBSO.balanceOf(user.address);
    const treasuryBalance = await EBSO.balanceOf(treasury.address);
    const bsoPoolBalance = await EBSO.balanceOf(bsoPool.address);
    const generalFeeBalance = await EBSO.balanceOf(feeAccount.address);

    expect(userBalance).to.eq(300000);
    expect(treasuryBalance).to.eq(700000);
    expect(bsoPoolBalance).to.eq(0);
    expect(generalFeeBalance).to.eq(0);
  });

  it('user should be able to transfer to another user', async () => {
    await EBSO.connect(treasuryAdmin).mint(user.address, 10000);
    await EBSO.connect(user).transfer(anotherUser.address, 2000);

    const userBalance = await EBSO.balanceOf(user.address);
    const anotherUserBalance = await EBSO.balanceOf(anotherUser.address);

    expect(userBalance).to.eq(8000);
    expect(anotherUserBalance).to.eq(2000);
  });

  it('transfer between users should be charged', async () => {
    await EBSO.setBsoFee(500);
    await EBSO.setGeneralFee(400);
    await EBSO.connect(treasuryAdmin).mint(user.address, 1000000);
    await EBSO.connect(user).transfer(anotherUser.address, 700000);

    const userBalance = await EBSO.balanceOf(user.address);
    const anotherUserBalance = await EBSO.balanceOf(anotherUser.address);
    const bsoPoolBalance = await EBSO.balanceOf(bsoPool.address);
    const generalFeeBalance = await EBSO.balanceOf(feeAccount.address);

    expect(userBalance).to.eq(300000);
    expect(anotherUserBalance).to.eq(693700);
    expect(bsoPoolBalance).to.eq(3500);
    expect(generalFeeBalance).to.eq(2800);
  });

  it('transfer should fail without sufficient balance', async () => {
    await expect(EBSO.connect(user).transfer(anotherUser.address, 2000)).to.be.revertedWith(
      'ERC20: transfer amount exceeds balance'
    );
  });

  it('transfer should fail if the source is blacklisted', async () => {
    await EBSO.connect(treasuryAdmin).mint(user.address, 10000);
    await EBSO.connect(amlAdmin).setSourceAccountBL(user.address, true);

    await expect(EBSO.connect(user).transfer(anotherUser.address, 2000)).to.be.revertedWith('Blacklist: sender');
  });

  it('transfer should fail if the destination is blacklisted', async () => {
    await EBSO.connect(treasuryAdmin).mint(user.address, 10000);
    await EBSO.connect(amlAdmin).setDestinationAccountBL(anotherUser.address, true);

    await expect(EBSO.connect(user).transfer(anotherUser.address, 2000)).to.be.revertedWith('Blacklist: recipient');
  });

  it('transfer is not affected if general fee account is blacklisted as a destination', async () => {
    await EBSO.setGeneralFee(400);
    await EBSO.connect(treasuryAdmin).mint(user.address, 1000000);
    await EBSO.connect(amlAdmin).setDestinationAccountBL(feeAccount.address, true);
    await EBSO.connect(user).transfer(anotherUser.address, 700000);

    const userBalance = await EBSO.balanceOf(user.address);
    const anotherUserBalance = await EBSO.balanceOf(anotherUser.address);
    const generalFeeBalance = await EBSO.balanceOf(feeAccount.address);

    expect(userBalance).to.eq(300000);
    expect(anotherUserBalance).to.eq(697200);
    expect(generalFeeBalance).to.eq(2800);
  });

  it('transfer is not affected if BSO pool is blacklisted as a destination', async () => {
    await EBSO.setBsoFee(500);
    await EBSO.connect(treasuryAdmin).mint(user.address, 1000000);
    await EBSO.connect(amlAdmin).setDestinationAccountBL(bsoPool.address, true);
    await EBSO.connect(user).transfer(anotherUser.address, 700000);

    const userBalance = await EBSO.balanceOf(user.address);
    const anotherUserBalance = await EBSO.balanceOf(anotherUser.address);
    const bsoPoolBalance = await EBSO.balanceOf(bsoPool.address);

    expect(userBalance).to.eq(300000);
    expect(anotherUserBalance).to.eq(696500);
    expect(bsoPoolBalance).to.eq(3500);
  });

  it('transfer is not affected if general fee account is blacklisted as a source', async () => {
    await EBSO.setGeneralFee(400);
    await EBSO.connect(treasuryAdmin).mint(user.address, 1000000);
    await EBSO.connect(amlAdmin).setSourceAccountBL(feeAccount.address, true);
    await EBSO.connect(user).transfer(anotherUser.address, 700000);

    const userBalance = await EBSO.balanceOf(user.address);
    const anotherUserBalance = await EBSO.balanceOf(anotherUser.address);
    const generalFeeBalance = await EBSO.balanceOf(feeAccount.address);

    expect(userBalance).to.eq(300000);
    expect(anotherUserBalance).to.eq(697200);
    expect(generalFeeBalance).to.eq(2800);
  });

  it('transfer is not affected if BSO pool is blacklisted as a source', async () => {
    await EBSO.setBsoFee(500);
    await EBSO.connect(treasuryAdmin).mint(user.address, 1000000);
    await EBSO.connect(amlAdmin).setSourceAccountBL(bsoPool.address, true);
    await EBSO.connect(user).transfer(anotherUser.address, 700000);

    const userBalance = await EBSO.balanceOf(user.address);
    const anotherUserBalance = await EBSO.balanceOf(anotherUser.address);
    const bsoPoolBalance = await EBSO.balanceOf(bsoPool.address);

    expect(userBalance).to.eq(300000);
    expect(anotherUserBalance).to.eq(696500);
    expect(bsoPoolBalance).to.eq(3500);
  });

  it('transfer should fail if the contract is paused', async () => {
    await EBSO.connect(treasuryAdmin).mint(user.address, 10000);
    await EBSO.pause();

    await expect(EBSO.connect(user).transfer(anotherUser.address, 2000)).to.be.revertedWith('Pausable: paused');
  });

  it('transfer should emit Transfer event', async () => {
    await EBSO.connect(treasuryAdmin).mint(user.address, 10000);

    await expect(EBSO.connect(user).transfer(anotherUser.address, 2000))
      .to.emit(EBSO, 'Transfer')
      .withArgs(user.address, anotherUser.address, 2000);
  });

  it('transfer should emit Transfer events for fees', async () => {
    await EBSO.setBsoFee(500);
    await EBSO.setGeneralFee(400);
    await EBSO.connect(treasuryAdmin).mint(user.address, 1000000);

    await expect(EBSO.connect(user).transfer(anotherUser.address, 700000))
      .to.emit(EBSO, 'Transfer')
      .withArgs(user.address, anotherUser.address, 693700)
      .emit(EBSO, 'Transfer')
      .withArgs(user.address, bsoPool.address, 3500)
      .emit(EBSO, 'Transfer')
      .withArgs(user.address, feeAccount.address, 2800);

    const transfersFromUser = await EBSO.queryFilter(EBSO.filters.Transfer(user.address, null, null));

    expect(transfersFromUser.length).to.eq(3);
  });

  it('transfer should not emit event for zero BSO fee', async () => {
    await EBSO.setBsoFee(0);
    await EBSO.setGeneralFee(400);
    await EBSO.connect(treasuryAdmin).mint(user.address, 1000000);
    await EBSO.connect(user).transfer(anotherUser.address, 700000);

    const transfersFromUser = await EBSO.queryFilter(EBSO.filters.Transfer(user.address, null, null));
    const transfersToBsoPool = await EBSO.queryFilter(EBSO.filters.Transfer(null, bsoPool.address, null));

    expect(transfersFromUser.length).to.eq(2);
    expect(transfersToBsoPool.length).to.eq(0);
  });

  it('transfer should not emit event for zero general fee', async () => {
    await EBSO.setBsoFee(500);
    await EBSO.setGeneralFee(0);
    await EBSO.connect(treasuryAdmin).mint(user.address, 1000000);
    await EBSO.connect(user).transfer(anotherUser.address, 700000);

    const transfersFromUser = await EBSO.queryFilter(EBSO.filters.Transfer(user.address, null, null));
    const transfersToFeeAccount = await EBSO.queryFilter(EBSO.filters.Transfer(null, feeAccount.address, null));

    expect(transfersFromUser.length).to.eq(2);
    expect(transfersToFeeAccount.length).to.eq(0);
  });

  it('transfer should not emit events for zero fees even if percentage is not zero', async () => {
    await EBSO.setBsoFee(500);
    await EBSO.setGeneralFee(400);
    await EBSO.connect(treasuryAdmin).mint(user.address, 1000000);
    await EBSO.connect(user).transfer(anotherUser.address, 20);

    const transfersFromUser = await EBSO.queryFilter(EBSO.filters.Transfer(user.address, null, null));
    const transfersToBsoPool = await EBSO.queryFilter(EBSO.filters.Transfer(null, bsoPool.address, null));
    const transfersToFeeAccount = await EBSO.queryFilter(EBSO.filters.Transfer(null, feeAccount.address, null));

    expect(transfersFromUser.length).to.eq(1);
    expect(transfersToBsoPool.length).to.eq(0);
    expect(transfersToFeeAccount.length).to.eq(0);
  });
});
