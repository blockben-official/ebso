import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { EBlockStock } from '../typechain';
import { solidity } from 'ethereum-waffle';
import { ethers } from 'hardhat';
import chai from 'chai';

chai.use(solidity);
const { expect } = chai;

describe('eBSO - 014: transfer-from', () => {
  let EBSO: EBlockStock;
  let owner: SignerWithAddress;
  let superadmin: SignerWithAddress;
  let amlAdmin: SignerWithAddress;
  let treasuryAdmin: SignerWithAddress;
  let bsoPool: SignerWithAddress;
  let feeAccount: SignerWithAddress;
  let assignor: SignerWithAddress;
  let user: SignerWithAddress;
  let anotherUser: SignerWithAddress;
  let addresses: SignerWithAddress[];

  const EBSO_ADMIN = ethers.utils.id('EBSO_ADMIN');
  const AML_ADMIN = ethers.utils.id('AML_ADMIN');
  const TREASURY_ADMIN = ethers.utils.id('TREASURY_ADMIN');

  beforeEach(async () => {
    [owner, superadmin, amlAdmin, treasuryAdmin, bsoPool, feeAccount, assignor, user, anotherUser, ...addresses] =
      await ethers.getSigners();

    const eBSOContract = await ethers.getContractFactory('EBlockStock', owner);
    EBSO = (await eBSOContract.deploy(superadmin.address)) as EBlockStock;

    await EBSO.grantRole(AML_ADMIN, amlAdmin.address);
    await EBSO.grantRole(TREASURY_ADMIN, treasuryAdmin.address);
    await EBSO.setBsoPoolAddress(bsoPool.address);
    await EBSO.setFeeAddress(feeAccount.address);
  });

  it('user should be able to transfer from assignor after allowance', async () => {
    await EBSO.connect(treasuryAdmin).mint(assignor.address, 10000);
    await EBSO.connect(assignor).approve(user.address, 2000);
    await EBSO.connect(user).transferFrom(assignor.address, user.address, 2000);

    const assignorBalance = await EBSO.balanceOf(assignor.address);
    const userBalance = await EBSO.balanceOf(user.address);

    expect(assignorBalance).to.eq(8000);
    expect(userBalance).to.eq(2000);
  });

  it('user should be able to transfer from assignor to another user after allowance', async () => {
    await EBSO.connect(treasuryAdmin).mint(assignor.address, 10000);
    await EBSO.connect(assignor).approve(user.address, 2000);
    await EBSO.connect(user).transferFrom(assignor.address, anotherUser.address, 2000);

    const assignorBalance = await EBSO.balanceOf(assignor.address);
    const anotherUserBalance = await EBSO.balanceOf(anotherUser.address);
    const userBalance = await EBSO.balanceOf(user.address);

    expect(assignorBalance).to.eq(8000);
    expect(anotherUserBalance).to.eq(2000);
    expect(userBalance).to.eq(0);
  });

  it('transfer-from should be charged as usual', async () => {
    await EBSO.setBsoFee(500);
    await EBSO.setGeneralFee(400);
    await EBSO.connect(treasuryAdmin).mint(assignor.address, 1000000);
    await EBSO.connect(assignor).approve(user.address, 700000);
    await EBSO.connect(user).transferFrom(assignor.address, anotherUser.address, 700000);

    const assignorBalance = await EBSO.balanceOf(assignor.address);
    const anotherUserBalance = await EBSO.balanceOf(anotherUser.address);
    const bsoPoolBalance = await EBSO.balanceOf(bsoPool.address);
    const generalFeeBalance = await EBSO.balanceOf(feeAccount.address);

    expect(assignorBalance).to.eq(300000);
    expect(anotherUserBalance).to.eq(693700);
    expect(bsoPoolBalance).to.eq(3500);
    expect(generalFeeBalance).to.eq(2800);
  });

  it('transfer-from should fail without sufficient balance', async () => {
    await EBSO.connect(assignor).approve(user.address, 2000);

    await expect(EBSO.connect(user).transferFrom(assignor.address, anotherUser.address, 2000)).to
      .be.revertedWith('ERC20: transfer amount exceeds balance');
  });

  it('transfer-from should fail without any allowance', async () => {
    await EBSO.connect(treasuryAdmin).mint(assignor.address, 10000);

    await expect(EBSO.connect(user).transferFrom(assignor.address, anotherUser.address, 2000)).to
      .be.revertedWith('ERC20: transfer amount exceeds allowance');
  });

  it('transfer-from should fail without sufficient allowance', async () => {
    await EBSO.connect(treasuryAdmin).mint(assignor.address, 10000);
    await EBSO.connect(assignor).approve(user.address, 2000);

    await expect(EBSO.connect(user).transferFrom(assignor.address, anotherUser.address, 10000)).to
      .be.revertedWith('ERC20: transfer amount exceeds allowance');
  });

  it('increasing allowance should provide the desired allowance', async () => {
    await EBSO.connect(treasuryAdmin).mint(assignor.address, 10000);
    await EBSO.connect(assignor).approve(user.address, 2000);
    await EBSO.connect(assignor).increaseAllowance(user.address, 4000);
    await EBSO.connect(user).transferFrom(assignor.address, anotherUser.address, 6000);

    const assignorBalance = await EBSO.balanceOf(assignor.address);
    const anotherUserBalance = await EBSO.balanceOf(anotherUser.address);

    expect(assignorBalance).to.eq(4000);
    expect(anotherUserBalance).to.eq(6000);
  });

  it('decreasing allowance should prevent transferring the previous amount of allowance', async () => {
    await EBSO.connect(treasuryAdmin).mint(assignor.address, 10000);
    await EBSO.connect(assignor).approve(user.address, 6000);
    await EBSO.connect(assignor).decreaseAllowance(user.address, 2000);

    await expect(EBSO.connect(user).transferFrom(assignor.address, anotherUser.address, 6000)).to
      .be.revertedWith('ERC20: transfer amount exceeds allowance');
  });

  it('decreasing allowance should provide the desired allowance', async () => {
    await EBSO.connect(treasuryAdmin).mint(assignor.address, 10000);
    await EBSO.connect(assignor).approve(user.address, 6000);
    await EBSO.connect(assignor).decreaseAllowance(user.address, 2000);
    await EBSO.connect(user).transferFrom(assignor.address, anotherUser.address, 4000);

    const assignorBalance = await EBSO.balanceOf(assignor.address);
    const anotherUserBalance = await EBSO.balanceOf(anotherUser.address);

    expect(assignorBalance).to.eq(6000);
    expect(anotherUserBalance).to.eq(4000);
  });

  it('transfer-from should fail if the source is blacklisted', async () => {
    await EBSO.connect(treasuryAdmin).mint(assignor.address, 10000);
    await EBSO.connect(assignor).approve(user.address, 2000);
    await EBSO.connect(amlAdmin).setSourceAccountBL(assignor.address, true);

    await expect(EBSO.connect(user).transferFrom(assignor.address, anotherUser.address, 2000)).to
      .be.revertedWith('Blacklist: sender');
  });

  it('transfer-from should fail if the destination is blacklisted', async () => {
    await EBSO.connect(treasuryAdmin).mint(assignor.address, 10000);
    await EBSO.connect(assignor).approve(user.address, 2000);
    await EBSO.connect(amlAdmin).setDestinationAccountBL(anotherUser.address, true);

    await expect(EBSO.connect(user).transferFrom(assignor.address, anotherUser.address, 2000)).to
      .be.revertedWith('Blacklist: recipient');
  });

  it('blacklisted account should be able to initiate transfer if the source and destination are not blacklisted', async () => {
    await EBSO.connect(treasuryAdmin).mint(assignor.address, 10000);
    await EBSO.connect(assignor).approve(user.address, 2000);
    await EBSO.connect(amlAdmin).setSourceAccountBL(user.address, true);
    await EBSO.connect(amlAdmin).setDestinationAccountBL(user.address, true);
    await EBSO.connect(user).transferFrom(assignor.address, anotherUser.address, 2000);

    const assignorBalance = await EBSO.balanceOf(assignor.address);
    const anotherUserBalance = await EBSO.balanceOf(anotherUser.address);

    expect(assignorBalance).to.eq(8000);
    expect(anotherUserBalance).to.eq(2000);
  });

  it('transfer-from should fail if the contract is paused', async () => {
    await EBSO.connect(treasuryAdmin).mint(assignor.address, 10000);
    await EBSO.connect(assignor).approve(user.address, 2000);
    await EBSO.pause();

    await expect(EBSO.connect(user).transferFrom(assignor.address, anotherUser.address, 2000)).to
      .be.revertedWith('Pausable: paused');
  });

  it('transfer-from should emit Transfer event', async () => {
    await EBSO.connect(treasuryAdmin).mint(assignor.address, 10000);
    await EBSO.connect(assignor).approve(user.address, 2000);

    await expect(EBSO.connect(user).transferFrom(assignor.address, anotherUser.address, 2000)).to
      .emit(EBSO, 'Transfer')
      .withArgs(assignor.address, anotherUser.address, 2000);
  });
});
