import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { EBlockStock } from '../typechain';
import { solidity } from 'ethereum-waffle';
import { ethers } from 'hardhat';
import chai from 'chai';

chai.use(solidity);
const { expect } = chai;

describe('eBSO - 005: set fees', () => {
  let EBSO: EBlockStock;
  let owner: SignerWithAddress;
  let superadmin: SignerWithAddress;
  let eBSOAdmin: SignerWithAddress;
  let amlAdmin: SignerWithAddress;
  let treasuryAdmin: SignerWithAddress;
  let user: SignerWithAddress;
  let addresses: SignerWithAddress[];

  const EBSO_ADMIN = ethers.utils.id('EBSO_ADMIN');
  const AML_ADMIN = ethers.utils.id('AML_ADMIN');
  const TREASURY_ADMIN = ethers.utils.id('TREASURY_ADMIN');

  beforeEach(async () => {
    [owner, superadmin, eBSOAdmin, amlAdmin, treasuryAdmin, user, ...addresses] = await ethers.getSigners();

    const eBSOContract = await ethers.getContractFactory('EBlockStock', owner);
    EBSO = (await eBSOContract.deploy(superadmin.address)) as EBlockStock;

    await EBSO.grantRole(EBSO_ADMIN, eBSOAdmin.address);
    await EBSO.grantRole(AML_ADMIN, amlAdmin.address);
    await EBSO.grantRole(TREASURY_ADMIN, treasuryAdmin.address);
  });

  it('general fee can be set', async () => {
    await EBSO.setGeneralFee(60);

    const generalFee = await EBSO.generalFee();

    expect(generalFee).to.eq(60);
  });

  it('setting general fee should emit event', async () => {
    await expect(EBSO.setGeneralFee(50)).to
      .emit(EBSO, 'eBSOGeneralFeeChange')
      .withArgs(50);
  });

  it('an eBSO admin should be able to set general fee', async () => {
    await EBSO.connect(eBSOAdmin).setGeneralFee(60);

    const generalFee = await EBSO.generalFee();

    expect(generalFee).to.eq(60);
  });

  it('superadmin should be able to set general fee', async () => {
    await EBSO.connect(superadmin).setGeneralFee(60);

    const generalFee = await EBSO.generalFee();

    expect(generalFee).to.eq(60);
  });

  it('an AML admin should not be able to set general fee', async () => {
    await expect(EBSO.connect(amlAdmin).setGeneralFee(60)).to
      .be.revertedWith('missing role');
  });

  it('a treasury admin should not be able to set general fee', async () => {
    await expect(EBSO.connect(treasuryAdmin).setGeneralFee(60)).to
      .be.revertedWith('missing role');
  });

  it('a simple user should not be able to set general fee', async () => {
    await expect(EBSO.connect(user).setGeneralFee(60)).to
      .be.revertedWith('missing role');
  });

  it('BSO fee can be set', async () => {
    await EBSO.setBsoFee(40);

    const bsoFee = await EBSO.bsoFee();

    expect(bsoFee).to.eq(40);
  });

  it('setting BSO fee should emit event', async () => {
    await expect(EBSO.setBsoFee(30)).to
      .emit(EBSO, 'eBSOBsoFeeChange')
      .withArgs(30);
  });

  it('an eBSO admin should be able to set BSO fee', async () => {
    await EBSO.connect(eBSOAdmin).setBsoFee(60);

    const bsoFee = await EBSO.bsoFee();

    expect(bsoFee).to.eq(60);
  });

  it('superadmin should be able to set BSO fee', async () => {
    await EBSO.connect(superadmin).setBsoFee(60);

    const bsoFee = await EBSO.bsoFee();

    expect(bsoFee).to.eq(60);
  });

  it('an AML admin should not be able to set BSO fee', async () => {
    await expect(EBSO.connect(amlAdmin).setBsoFee(60)).to
      .be.revertedWith('missing role');
  });

  it('a treasury admin should not be able to set BSO fee', async () => {
    await expect(EBSO.connect(treasuryAdmin).setBsoFee(60)).to
      .be.revertedWith('missing role');
  });

  it('a simple user should not be able to set BSO fee', async () => {
    await expect(EBSO.connect(user).setBsoFee(60)).to
      .be.revertedWith('missing role');
  });
});
