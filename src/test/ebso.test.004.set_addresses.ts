import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { EBlockStock } from '../typechain';
import { solidity } from 'ethereum-waffle';
import { ethers } from 'hardhat';
import chai from 'chai';

chai.use(solidity);
const { expect } = chai;

describe('eBSO - 004: set addresses', () => {
  let EBSO: EBlockStock;
  let owner: SignerWithAddress;
  let superadmin: SignerWithAddress;
  let eBSOAdmin: SignerWithAddress;
  let amlAdmin: SignerWithAddress;
  let treasuryAdmin: SignerWithAddress;
  let user: SignerWithAddress;
  let addresses: SignerWithAddress[];

  const TOKEN_ADMIN = ethers.utils.id('TOKEN_ADMIN');
  const AML_ADMIN = ethers.utils.id('AML_ADMIN');
  const TREASURY_ADMIN = ethers.utils.id('TREASURY_ADMIN');

  const nullAddress: string = '0x0000000000000000000000000000000000000000';

  beforeEach(async () => {
    [owner, superadmin, eBSOAdmin, amlAdmin, treasuryAdmin, user, ...addresses] = await ethers.getSigners();

    const eBSOContract = await ethers.getContractFactory('EBlockStock', owner);
    EBSO = (await eBSOContract.deploy(superadmin.address)) as EBlockStock;

    await EBSO.grantRole(TOKEN_ADMIN, eBSOAdmin.address);
    await EBSO.grantRole(AML_ADMIN, amlAdmin.address);
    await EBSO.grantRole(TREASURY_ADMIN, treasuryAdmin.address);
  });

  it('fee address can be set', async () => {
    await EBSO.setFeeAddress(user.address);

    const feeAddress = await EBSO.feeAddress();

    expect(feeAddress).to.eq(user.address);
  });

  it('fee address can not be set to zero address', async () => {
    await expect(EBSO.setFeeAddress(nullAddress)).to.be.revertedWith('fee address cannot be 0');
  });

  it('setting fee address should emit event', async () => {
    await expect(EBSO.setFeeAddress(user.address)).to.emit(EBSO, 'eBSOFeeAddressChange').withArgs(user.address);
  });

  it('an eBSO admin should be able to set fee address', async () => {
    await EBSO.connect(eBSOAdmin).setFeeAddress(user.address);

    const feeAddress = await EBSO.feeAddress();

    expect(feeAddress).to.eq(user.address);
  });

  it('superadmin should be able to set fee address', async () => {
    await EBSO.connect(superadmin).setFeeAddress(user.address);

    const feeAddress = await EBSO.feeAddress();

    expect(feeAddress).to.eq(user.address);
  });

  it('an AML admin should not be able to set fee address', async () => {
    await expect(EBSO.connect(amlAdmin).setFeeAddress(user.address)).to.be.revertedWith('missing role');
  });

  it('a treasury admin should not be able to set fee address', async () => {
    await expect(EBSO.connect(treasuryAdmin).setFeeAddress(user.address)).to.be.revertedWith('missing role');
  });

  it('a simple user should not be able to set fee address', async () => {
    await expect(EBSO.connect(user).setFeeAddress(user.address)).to.be.revertedWith('missing role');
  });

  it('BSO pool address can be set', async () => {
    await EBSO.setBsoPoolAddress(user.address);

    const bsoPoolAddress = await EBSO.bsoPoolAddress();

    expect(bsoPoolAddress).to.eq(user.address);
  });

  it('BSO pool address can not be set to zero address', async () => {
    await expect(EBSO.setBsoPoolAddress(nullAddress)).to.be.revertedWith('bso pool address cannot be 0');
  });

  it('setting BSO pool address should emit event', async () => {
    await expect(EBSO.setBsoPoolAddress(user.address)).to.emit(EBSO, 'eBSOBsoPoolAddressChange').withArgs(user.address);
  });

  it('an eBSO admin should be able to set BSO pool address', async () => {
    await EBSO.connect(eBSOAdmin).setBsoPoolAddress(user.address);

    const bsoPoolAddress = await EBSO.bsoPoolAddress();

    expect(bsoPoolAddress).to.eq(user.address);
  });

  it('superadmin should be able to set BSO pool address', async () => {
    await EBSO.connect(superadmin).setBsoPoolAddress(user.address);

    const bsoPoolAddress = await EBSO.bsoPoolAddress();

    expect(bsoPoolAddress).to.eq(user.address);
  });

  it('an AML admin should not be able to set BSO pool address', async () => {
    await expect(EBSO.connect(amlAdmin).setBsoPoolAddress(user.address)).to.be.revertedWith('missing role');
  });

  it('a treasury admin should not be able to set BSO pool address', async () => {
    await expect(EBSO.connect(treasuryAdmin).setBsoPoolAddress(user.address)).to.be.revertedWith('missing role');
  });

  it('a simple user should not be able to set BSO pool address', async () => {
    await expect(EBSO.connect(user).setBsoPoolAddress(user.address)).to.be.revertedWith('missing role');
  });

  it('treasury address can be set', async () => {
    await EBSO.setTreasuryAddress(user.address);

    const treasuryAddress = await EBSO.treasuryAddress();

    expect(treasuryAddress).to.eq(user.address);
  });

  it('treasury address can not be set to zero address', async () => {
    await expect(EBSO.setTreasuryAddress(nullAddress)).to.be.revertedWith('treasury address cannot be 0');
  });

  it('setting treasury address should emit event', async () => {
    await expect(EBSO.setTreasuryAddress(user.address))
      .to.emit(EBSO, 'eBSOTreasuryAddressChange')
      .withArgs(user.address);
  });

  it('an eBSO admin should be able to set treasury address', async () => {
    await EBSO.connect(eBSOAdmin).setTreasuryAddress(user.address);

    const treasuryAddress = await EBSO.treasuryAddress();

    expect(treasuryAddress).to.eq(user.address);
  });

  it('superadmin should be able to set treasury address', async () => {
    await EBSO.connect(superadmin).setTreasuryAddress(user.address);

    const treasuryAddress = await EBSO.treasuryAddress();

    expect(treasuryAddress).to.eq(user.address);
  });

  it('an AML admin should not be able to set treasury address', async () => {
    await expect(EBSO.connect(amlAdmin).setTreasuryAddress(user.address)).to.be.revertedWith('missing role');
  });

  it('a treasury admin should not be able to set treasury address', async () => {
    await expect(EBSO.connect(treasuryAdmin).setTreasuryAddress(user.address)).to.be.revertedWith('missing role');
  });

  it('a simple user should not be able to set treasury address', async () => {
    await expect(EBSO.connect(user).setTreasuryAddress(user.address)).to.be.revertedWith('missing role');
  });
});
