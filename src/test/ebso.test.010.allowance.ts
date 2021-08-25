import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { EBlockStock } from '../typechain';
import { solidity } from 'ethereum-waffle';
import { ethers } from 'hardhat';
import chai from 'chai';

chai.use(solidity);
const { expect } = chai;

describe('eBSO - 010: allowance', () => {
  let EBSO: EBlockStock;
  let owner: SignerWithAddress;
  let superadmin: SignerWithAddress;
  let amlAdmin: SignerWithAddress;
  let treasuryAdmin: SignerWithAddress;
  let assignor: SignerWithAddress;
  let user: SignerWithAddress;
  let addresses: SignerWithAddress[];

  const EBSO_ADMIN = ethers.utils.id('EBSO_ADMIN');
  const AML_ADMIN = ethers.utils.id('AML_ADMIN');
  const TREASURY_ADMIN = ethers.utils.id('TREASURY_ADMIN');

  beforeEach(async () => {
    [owner, superadmin, amlAdmin, treasuryAdmin, assignor, user, ...addresses] = await ethers.getSigners();

    const eBSOContract = await ethers.getContractFactory('EBlockStock', owner);
    EBSO = (await eBSOContract.deploy(superadmin.address)) as EBlockStock;

    await EBSO.grantRole(AML_ADMIN, amlAdmin.address);
    await EBSO.grantRole(TREASURY_ADMIN, treasuryAdmin.address);
  });

  it('approve should set the proper allowance', async () => {
    await EBSO.connect(assignor).approve(user.address, 2000);

    const allowance = await EBSO.allowance(assignor.address, user.address);

    expect(allowance).to.eq(2000);
  });

  it('actual balance should not limit allowance', async () => {
    await EBSO.connect(treasuryAdmin).mint(assignor.address, 10000);
    await EBSO.connect(assignor).approve(user.address, 20000);

    const balance = await EBSO.balanceOf(assignor.address);
    const allowance = await EBSO.allowance(assignor.address, user.address);

    expect(balance).to.eq(10000);
    expect(allowance).to.eq(20000);
  });

  it('blacklisted account should be able to get allowance', async () => {
    await EBSO.connect(amlAdmin).setSourceAccountBL(user.address, true);
    await EBSO.connect(amlAdmin).setDestinationAccountBL(user.address, true);
    await EBSO.connect(assignor).approve(user.address, 2000);

    const allowance = await EBSO.allowance(assignor.address, user.address);

    expect(allowance).to.eq(2000);
  });

  it('approve should fail if the contract is paused', async () => {
    await EBSO.pause();

    await expect(EBSO.connect(assignor).approve(user.address, 2000)).to
      .be.revertedWith('Pausable: paused');
  });

  it('approve should emit Approval event', async () => {
    await expect(EBSO.connect(assignor).approve(user.address, 2000)).to
      .emit(EBSO, 'Approval')
      .withArgs(assignor.address, user.address, 2000);
  });

  it('increasing allowance should set the proper allowance', async () => {
    await EBSO.connect(assignor).approve(user.address, 2000);
    await EBSO.connect(assignor).increaseAllowance(user.address, 1000);

    const allowance = await EBSO.allowance(assignor.address, user.address);

    expect(allowance).to.eq(3000);
  });

  it('increasing allowance should succeed without any approval before', async () => {
    await EBSO.connect(assignor).increaseAllowance(user.address, 1000);

    const allowance = await EBSO.allowance(assignor.address, user.address);

    expect(allowance).to.eq(1000);
  });

  it('increasing allowance should fail if the contract is paused', async () => {
    await EBSO.connect(assignor).approve(user.address, 2000);
    await EBSO.pause();

    await expect(EBSO.connect(assignor).increaseAllowance(user.address, 1000)).to
      .be.revertedWith('Pausable: paused');
  });

  it('increasing allowance should emit Approval event with the increased allowance value', async () => {
    await EBSO.connect(assignor).approve(user.address, 2000);

    await expect(EBSO.connect(assignor).increaseAllowance(user.address, 1000)).to
      .emit(EBSO, 'Approval')
      .withArgs(assignor.address, user.address, 3000);
  });

  it('decreasing allowance should set the proper allowance', async () => {
    await EBSO.connect(assignor).approve(user.address, 2000);
    await EBSO.connect(assignor).decreaseAllowance(user.address, 500);

    const allowance = await EBSO.allowance(assignor.address, user.address);

    expect(allowance).to.eq(1500);
  });

  it('decreasing allowance should fail without a sufficient actual allowance value', async () => {
    await EBSO.connect(assignor).approve(user.address, 2000);

    await expect(EBSO.connect(assignor).decreaseAllowance(user.address, 5000)).to
      .be.revertedWith('ERC20: decreased allowance below zero');
  });

  it('decreasing allowance should fail without any approval before because of unsufficient allowance value', async () => {
    await expect(EBSO.connect(assignor).decreaseAllowance(user.address, 500)).to
      .be.revertedWith('ERC20: decreased allowance below zero');
  });

  it('decreasing allowance should fail if the contract is paused', async () => {
    await EBSO.connect(assignor).approve(user.address, 2000);
    await EBSO.pause();

    await expect(EBSO.connect(assignor).decreaseAllowance(user.address, 500)).to
      .be.revertedWith('Pausable: paused');
  });

  it('decreasing allowance should emit Approval event with the decreased allowance value', async () => {
    await EBSO.connect(assignor).approve(user.address, 2000);

    await expect(EBSO.connect(assignor).decreaseAllowance(user.address, 500)).to
      .emit(EBSO, 'Approval')
      .withArgs(assignor.address, user.address, 1500);
  });
});
