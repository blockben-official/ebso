import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { EBlockStock } from '../typechain';
import { solidity } from 'ethereum-waffle';
import { ethers } from 'hardhat';
import chai from 'chai';

chai.use(solidity);
const { expect } = chai;

describe('eBSO - 003: manage blacklists', () => {
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

  it('a user can be blacklisted as a source', async () => {
    await EBSO.connect(amlAdmin).setSourceAccountBL(user.address, true);

    const isBlacklisted = await EBSO.getSourceAccountBL(user.address);

    expect(isBlacklisted).to.eq(true);
  });

  it('blocking a user as a source should emit event', async () => {
    await expect(EBSO.connect(amlAdmin).setSourceAccountBL(user.address, true))
      .to.emit(EBSO, 'eBSOSourceAccountBL')
      .withArgs(user.address, true);
  });

  it('lots of users can be blacklisted on the source list', async () => {
    const addressList = addresses.map((a) => a.address);

    await EBSO.connect(amlAdmin).setBatchSourceAccountBL(addressList, true);

    for (const address of addressList) {
      const isBlacklisted = await EBSO.getSourceAccountBL(address);
      expect(isBlacklisted).to.eq(true);
    }
  });

  it('should emit batch blacklist event', async () => {
    const addressList = addresses.map((a) => a.address);
    await expect(EBSO.connect(amlAdmin).setBatchSourceAccountBL(addressList, true))
      .to.emit(EBSO, 'eBSOBatchSourceAccountBL')
      .withArgs(addressList, true);
  });
  it('an AML admin should be able to blacklist a user as a source', async () => {
    await EBSO.connect(amlAdmin).setSourceAccountBL(user.address, true);

    const isBlacklisted = await EBSO.getSourceAccountBL(user.address);

    expect(isBlacklisted).to.eq(true);
  });

  it('superadmin should be able to blacklist a user as a source', async () => {
    await EBSO.connect(superadmin).setSourceAccountBL(user.address, true);

    const isBlacklisted = await EBSO.getSourceAccountBL(user.address);

    expect(isBlacklisted).to.eq(true);
  });

  it('an eBSO admin should not be able to blacklist a user as a source', async () => {
    await expect(EBSO.connect(eBSOAdmin).setSourceAccountBL(user.address, true)).to.be.revertedWith('missing role');
  });

  it('a treasury admin should not be able to blacklist a user as a source', async () => {
    await expect(EBSO.connect(treasuryAdmin).setSourceAccountBL(user.address, true)).to.be.revertedWith('missing role');
  });

  it('a simple user should not be able to blacklist a user as a source', async () => {
    await expect(EBSO.connect(user).setSourceAccountBL(user.address, true)).to.be.revertedWith('missing role');
  });

  it('a user can be blacklisted as a destination', async () => {
    await EBSO.connect(amlAdmin).setDestinationAccountBL(user.address, true);

    const isBlacklisted = await EBSO.getDestinationAccountBL(user.address);

    expect(isBlacklisted).to.eq(true);
  });

  it('blocking a user as a destination should emit event', async () => {
    await expect(EBSO.connect(amlAdmin).setDestinationAccountBL(user.address, true))
      .to.emit(EBSO, 'eBSODestinationAccountBL')
      .withArgs(user.address, true);
  });

  it('an AML admin should be able to blacklist a user as a destination', async () => {
    await EBSO.connect(amlAdmin).setDestinationAccountBL(user.address, true);

    const isBlacklisted = await EBSO.getDestinationAccountBL(user.address);

    expect(isBlacklisted).to.eq(true);
  });

  it('AML admin should be able to blacklist address list', async () => {
    const addressList = addresses.map((a) => a.address);

    await EBSO.connect(amlAdmin).setBatchDestinationAccountBL(addressList, true);

    for (const address of addressList) {
      const isBlacklisted = await EBSO.getDestinationAccountBL(address);

      expect(isBlacklisted).to.eq(true);
    }
  });

  it('should emit eBSODestinationAccountBL event', async () => {
    const addressList = addresses.map((a) => a.address);
    await expect(EBSO.connect(amlAdmin).setBatchDestinationAccountBL(addressList, true))
      .to.emit(EBSO, 'eBSODestinationAccountBL')
      .withArgs(addressList, true);
  });

  it('superadmin should be able to blacklist a user as a destination', async () => {
    await EBSO.connect(superadmin).setDestinationAccountBL(user.address, true);

    const isBlacklisted = await EBSO.getDestinationAccountBL(user.address);

    expect(isBlacklisted).to.eq(true);
  });

  it('an eBSO admin should not be able to blacklist a user as a destination', async () => {
    await expect(EBSO.connect(eBSOAdmin).setDestinationAccountBL(user.address, true)).to.be.revertedWith(
      'missing role'
    );
  });

  it('a treasury admin should not be able to blacklist a user as a destination', async () => {
    await expect(EBSO.connect(treasuryAdmin).setDestinationAccountBL(user.address, true)).to.be.revertedWith(
      'missing role'
    );
  });

  it('a simple user should not be able to blacklist a user as a destination', async () => {
    await expect(EBSO.connect(user).setDestinationAccountBL(user.address, true)).to.be.revertedWith('missing role');
  });

  it('a user can be removed from the source account blacklist', async () => {
    await EBSO.connect(amlAdmin).setSourceAccountBL(user.address, true);
    await EBSO.connect(amlAdmin).setSourceAccountBL(user.address, false);

    const isBlacklisted = await EBSO.getSourceAccountBL(user.address);

    expect(isBlacklisted).to.eq(false);
  });

  it('unblocking a user as a source should emit event', async () => {
    await expect(EBSO.connect(amlAdmin).setSourceAccountBL(user.address, false))
      .to.emit(EBSO, 'eBSOSourceAccountBL')
      .withArgs(user.address, false);
  });

  it('an AML admin should be able to remove a user from the source account blacklist', async () => {
    await EBSO.connect(amlAdmin).setSourceAccountBL(user.address, true);
    await EBSO.connect(amlAdmin).setSourceAccountBL(user.address, false);

    const isBlacklisted = await EBSO.getSourceAccountBL(user.address);

    expect(isBlacklisted).to.eq(false);
  });

  it('superadmin should be able to remove a user from the source account blacklist', async () => {
    await EBSO.connect(amlAdmin).setSourceAccountBL(user.address, true);
    await EBSO.connect(superadmin).setSourceAccountBL(user.address, false);

    const isBlacklisted = await EBSO.getSourceAccountBL(user.address);

    expect(isBlacklisted).to.eq(false);
  });

  it('an eBSO admin should not be able to remove a user from the source account blacklist', async () => {
    await EBSO.connect(amlAdmin).setSourceAccountBL(user.address, true);

    await expect(EBSO.connect(eBSOAdmin).setSourceAccountBL(user.address, false)).to.be.revertedWith('missing role');
  });

  it('a treasury admin should not be able to remove a user from the source account blacklist', async () => {
    await EBSO.connect(amlAdmin).setSourceAccountBL(user.address, true);

    await expect(EBSO.connect(treasuryAdmin).setSourceAccountBL(user.address, false)).to.be.revertedWith(
      'missing role'
    );
  });

  it('a simple user should not be able to remove a user from the source account blacklist', async () => {
    await EBSO.connect(amlAdmin).setSourceAccountBL(user.address, true);

    await expect(EBSO.connect(user).setSourceAccountBL(user.address, false)).to.be.revertedWith('missing role');
  });

  it('a user can be removed from the destination account blacklist', async () => {
    await EBSO.connect(amlAdmin).setDestinationAccountBL(user.address, true);
    await EBSO.connect(amlAdmin).setDestinationAccountBL(user.address, false);

    const isBlacklisted = await EBSO.getDestinationAccountBL(user.address);

    expect(isBlacklisted).to.eq(false);
  });

  it('unblocking a user as a destination should emit event', async () => {
    await expect(EBSO.connect(amlAdmin).setDestinationAccountBL(user.address, false))
      .to.emit(EBSO, 'eBSODestinationAccountBL')
      .withArgs(user.address, false);
  });

  it('an AML admin should be able to remove a user from the destination account blacklist', async () => {
    await EBSO.connect(amlAdmin).setDestinationAccountBL(user.address, true);
    await EBSO.connect(amlAdmin).setDestinationAccountBL(user.address, false);

    const isBlacklisted = await EBSO.getDestinationAccountBL(user.address);

    expect(isBlacklisted).to.eq(false);
  });

  it('superadmin should be able to remove a user from the destination account blacklist', async () => {
    await EBSO.connect(amlAdmin).setDestinationAccountBL(user.address, true);
    await EBSO.connect(superadmin).setDestinationAccountBL(user.address, false);

    const isBlacklisted = await EBSO.getDestinationAccountBL(user.address);

    expect(isBlacklisted).to.eq(false);
  });

  it('an eBSO admin should not be able to remove a user from the destination account blacklist', async () => {
    await EBSO.connect(amlAdmin).setDestinationAccountBL(user.address, true);

    await expect(EBSO.connect(eBSOAdmin).setDestinationAccountBL(user.address, false)).to.be.revertedWith(
      'missing role'
    );
  });

  it('a treasury admin should not be able to remove a user from the destination account blacklist', async () => {
    await EBSO.connect(amlAdmin).setDestinationAccountBL(user.address, true);

    await expect(EBSO.connect(treasuryAdmin).setDestinationAccountBL(user.address, false)).to.be.revertedWith(
      'missing role'
    );
  });

  it('a simple user should not be able to remove a user from the destination account blacklist', async () => {
    await EBSO.connect(amlAdmin).setDestinationAccountBL(user.address, true);

    await expect(EBSO.connect(user).setDestinationAccountBL(user.address, false)).to.be.revertedWith('missing role');
  });
});
