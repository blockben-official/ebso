import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { EBlockStock } from '../typechain';
import { solidity } from 'ethereum-waffle';
import { ethers } from 'hardhat';
import chai from 'chai';

chai.use(solidity);
const { expect } = chai;

describe('eBSO - 009: mint - burn', () => {
  let EBSO: EBlockStock;
  let owner: SignerWithAddress;
  let superadmin: SignerWithAddress;
  let eBSOAdmin: SignerWithAddress;
  let amlAdmin: SignerWithAddress;
  let treasuryAdmin: SignerWithAddress;
  let treasury: SignerWithAddress;
  let user: SignerWithAddress;
  let addresses: SignerWithAddress[];
  let nullAddress: String = '0x0000000000000000000000000000000000000000';

  const EBSO_ADMIN = ethers.utils.id('EBSO_ADMIN');
  const AML_ADMIN = ethers.utils.id('AML_ADMIN');
  const TREASURY_ADMIN = ethers.utils.id('TREASURY_ADMIN');

  beforeEach(async () => {
    [owner, superadmin, eBSOAdmin, amlAdmin, treasuryAdmin, treasury, user, ...addresses] = await ethers.getSigners();

    const eBSOContract = await ethers.getContractFactory('EBlockStock', owner);
    EBSO = (await eBSOContract.deploy(superadmin.address)) as EBlockStock;

    await EBSO.grantRole(EBSO_ADMIN, eBSOAdmin.address);
    await EBSO.grantRole(AML_ADMIN, amlAdmin.address);
    await EBSO.grantRole(TREASURY_ADMIN, treasuryAdmin.address);
    await EBSO.setTreasuryAddress(treasury.address);
  });

  it('mint should result in a proper balance', async () => {
    await EBSO.connect(treasuryAdmin).mint(user.address, 10000);

    const balance = await EBSO.balanceOf(user.address);
    const totalSupply = await EBSO.totalSupply();

    expect(balance).to.eq(10000);
    expect(totalSupply).to.eq(10000);
  });

  it('mint should emit Transfer event from null address', async () => {
    await expect(EBSO.connect(treasuryAdmin).mint(user.address, 10000)).to
      .emit(EBSO, 'Transfer')
      .withArgs(nullAddress, user.address, 10000);
  });

  it('a treasury admin should be able to mint', async () => {
    await EBSO.connect(treasuryAdmin).mint(user.address, 10000);

    const balance = await EBSO.balanceOf(user.address);

    expect(balance).to.eq(10000);
  });

  it('an eBSO admin should not be able to mint', async () => {
    await expect(EBSO.connect(eBSOAdmin).mint(user.address, 10000)).to
      .be.revertedWith('missing role');
  });

  it('superadmin should be able to mint', async () => {
    await EBSO.connect(superadmin).mint(user.address, 10000);

    const balance = await EBSO.balanceOf(user.address);

    expect(balance).to.eq(10000);
  });

  it('an AML admin should not be able to mint', async () => {
    await expect(EBSO.connect(amlAdmin).mint(user.address, 10000)).to
      .be.revertedWith('missing role');
  });

  it('a simple user should not be able to mint', async () => {
    await expect(EBSO.connect(user).mint(user.address, 10000)).to
      .be.revertedWith('missing role');
  });

  it('source account blacklist is not relevant on the target of minting', async () => {
    await EBSO.connect(amlAdmin).setSourceAccountBL(user.address, true);
    await EBSO.connect(treasuryAdmin).mint(user.address, 10000);

    const balance = await EBSO.balanceOf(user.address);

    expect(balance).to.eq(10000);
  });

  it('mint should fail if the address is blacklisted as a destination', async () => {
    await EBSO.connect(amlAdmin).setDestinationAccountBL(user.address, true);

    await expect(EBSO.connect(treasuryAdmin).mint(user.address, 10000)).to
      .be.revertedWith('Blacklist: target');
  });

  it('mint should fail if the contract is paused', async () => {
    await EBSO.pause();

    await expect(EBSO.connect(treasuryAdmin).mint(user.address, 10000)).to
      .be.revertedWith('Pausable: paused');
  });

  it('burn should result in a proper balance of treasury', async () => {
    await EBSO.connect(treasuryAdmin).mint(treasury.address, 10000);
    await EBSO.connect(treasuryAdmin).burn(5000);

    const balance = await EBSO.balanceOf(treasury.address);
    const totalSupply = await EBSO.totalSupply();

    expect(balance).to.eq(5000);
    expect(totalSupply).to.eq(5000);
  });

  it('burn should emit Transfer event from treasury to null address', async () => {
    await EBSO.connect(treasuryAdmin).mint(treasury.address, 10000);

    await expect(EBSO.connect(treasuryAdmin).burn(5000)).to
      .emit(EBSO, 'Transfer')
      .withArgs(treasury.address, nullAddress, 5000);
  });

  it('a treasury admin should be able to burn', async () => {
    await EBSO.connect(treasuryAdmin).mint(treasury.address, 10000);
    await EBSO.connect(treasuryAdmin).burn(5000);

    const balance = await EBSO.balanceOf(treasury.address);

    expect(balance).to.eq(5000);
  });

  it('an eBSO admin should not be able to burn', async () => {
    await EBSO.connect(treasuryAdmin).mint(treasury.address, 10000);

    await expect(EBSO.connect(eBSOAdmin).burn(5000)).to
      .be.revertedWith('missing role');
  });

  it('superadmin should be able to burn', async () => {
    await EBSO.connect(treasuryAdmin).mint(treasury.address, 10000);
    await EBSO.connect(superadmin).burn(5000);

    const balance = await EBSO.balanceOf(treasury.address);

    expect(balance).to.eq(5000);
  });

  it('an AML admin should not be able to burn', async () => {
    await EBSO.connect(treasuryAdmin).mint(treasury.address, 10000);

    await expect(EBSO.connect(amlAdmin).burn(5000)).to
      .be.revertedWith('missing role');
  });

  it('a simple user should not be able to burn', async () => {
    await EBSO.connect(treasuryAdmin).mint(treasury.address, 10000);

    await expect(EBSO.connect(user).burn(5000)).to
      .be.revertedWith('missing role');
  });

  it('burn should fail without sufficient balance', async () => {
    await expect(EBSO.connect(treasuryAdmin).burn(5000)).to
      .be.revertedWith('ERC20: burn amount exceeds balance');
  });

  it('burn should fail if treasury is blacklisted as a source', async () => {
    await EBSO.connect(treasuryAdmin).mint(treasury.address, 10000);
    await EBSO.connect(amlAdmin).setSourceAccountBL(treasury.address, true);

    await expect(EBSO.connect(treasuryAdmin).burn(5000)).to
      .be.revertedWith('Blacklist: treasury');
  });

  it('destination account blacklist is not relevant on the target of burning (treasury)', async () => {
    await EBSO.connect(treasuryAdmin).mint(treasury.address, 10000);
    await EBSO.connect(amlAdmin).setDestinationAccountBL(treasury.address, true);
    await EBSO.connect(treasuryAdmin).burn(5000);

    const balance = await EBSO.balanceOf(treasury.address);

    expect(balance).to.eq(5000);
  });

  it('burn should fail if the contract is paused', async () => {
    await EBSO.connect(treasuryAdmin).mint(treasury.address, 10000);
    await EBSO.pause();

    await expect(EBSO.connect(treasuryAdmin).burn(5000)).to
      .be.revertedWith('Pausable: paused');
  });
});
