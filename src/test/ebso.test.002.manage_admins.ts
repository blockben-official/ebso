import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { EBlockStock } from '../typechain';
import { solidity } from 'ethereum-waffle';
import { ethers } from 'hardhat';
import chai from 'chai';

chai.use(solidity);
const { expect } = chai;

describe('eBSO - 002: manage admins', () => {
  let EBSO: EBlockStock;
  let owner: SignerWithAddress;
  let superadmin: SignerWithAddress;
  let eBSOAdmin: SignerWithAddress;
  let amlAdmin: SignerWithAddress;
  let treasuryAdmin: SignerWithAddress;
  let user: SignerWithAddress;
  let anotherUser: SignerWithAddress;
  let addresses: SignerWithAddress[];
  let eBSOAdminRole: string;
  let amlAdminRole: string;
  let treasuryAdminRole: string;

  const TOKEN_ADMIN = ethers.utils.id('TOKEN_ADMIN');
  const AML_ADMIN = ethers.utils.id('AML_ADMIN');
  const TREASURY_ADMIN = ethers.utils.id('TREASURY_ADMIN');

  beforeEach(async () => {
    [owner, superadmin, eBSOAdmin, amlAdmin, treasuryAdmin, user, anotherUser, ...addresses] =
      await ethers.getSigners();

    const eBSOContract = await ethers.getContractFactory('EBlockStock', owner);
    EBSO = (await eBSOContract.deploy(superadmin.address)) as EBlockStock;

    await EBSO.grantRole(TOKEN_ADMIN, eBSOAdmin.address);
    await EBSO.grantRole(AML_ADMIN, amlAdmin.address);
    await EBSO.grantRole(TREASURY_ADMIN, treasuryAdmin.address);

    eBSOAdminRole = await EBSO.TOKEN_ADMIN();
    amlAdminRole = await EBSO.AML_ADMIN();
    treasuryAdminRole = await EBSO.TREASURY_ADMIN();
  });

  it('a user can be set as eBSO admin', async () => {
    await EBSO.grantRole(TOKEN_ADMIN, user.address);

    const isEBSOAdmin = await EBSO.hasRole(TOKEN_ADMIN, user.address);

    expect(isEBSOAdmin).to.eq(true);
  });

  it('adding eBSO admin should emit event', async () => {
    await expect(EBSO.grantRole(TOKEN_ADMIN, user.address))
      .to.emit(EBSO, 'RoleGranted')
      .withArgs(eBSOAdminRole, user.address, owner.address);
  });

  it('an eBSO admin should be able to add a new eBSO admin', async () => {
    await EBSO.connect(eBSOAdmin).grantRole(TOKEN_ADMIN, user.address);

    const isEBSOAdmin = await EBSO.hasRole(TOKEN_ADMIN, user.address);

    expect(isEBSOAdmin).to.eq(true);
  });

  it('superadmin should be able to add a new eBSO admin', async () => {
    await EBSO.connect(superadmin).grantRole(TOKEN_ADMIN, user.address);

    const isEBSOAdmin = await EBSO.hasRole(TOKEN_ADMIN, user.address);
    expect(isEBSOAdmin).to.eq(true);
  });

  it('an AML admin should not be able to add a new eBSO admin', async () => {
    await expect(EBSO.connect(amlAdmin).grantRole(TOKEN_ADMIN, user.address)).to.be.revertedWith('missing role');
  });

  it('a treasury admin should not be able to add a new eBSO admin', async () => {
    await expect(EBSO.connect(treasuryAdmin).grantRole(TOKEN_ADMIN, user.address)).to.be.revertedWith('missing role');
  });

  it('a simple user should not be able to add a new eBSO admin', async () => {
    await expect(EBSO.connect(user).grantRole(TOKEN_ADMIN, user.address)).to.be.revertedWith('missing role');
  });

  it('an eBSO admin can be removed', async () => {
    await EBSO.grantRole(TOKEN_ADMIN, user.address);
    await EBSO.revokeRole(TOKEN_ADMIN, user.address);

    const isEBSOAdmin = await EBSO.hasRole(TOKEN_ADMIN, user.address);

    expect(isEBSOAdmin).to.eq(false);
  });

  it('removing eBSO admin should emit event', async () => {
    await EBSO.grantRole(TOKEN_ADMIN, user.address);

    await expect(EBSO.revokeRole(TOKEN_ADMIN, user.address))
      .to.emit(EBSO, 'RoleRevoked')
      .withArgs(eBSOAdminRole, user.address, owner.address);
  });

  it('an eBSO admin should be able to remove eBSO admin', async () => {
    await EBSO.grantRole(TOKEN_ADMIN, user.address);
    await EBSO.connect(eBSOAdmin).revokeRole(TOKEN_ADMIN, user.address);

    const isEBSOAdmin = await EBSO.hasRole(TOKEN_ADMIN, user.address);

    expect(isEBSOAdmin).to.eq(false);
  });

  it('superadmin should be able to remove eBSO admin', async () => {
    await EBSO.grantRole(TOKEN_ADMIN, user.address);
    await EBSO.connect(superadmin).revokeRole(TOKEN_ADMIN, user.address);

    const isEBSOAdmin = await EBSO.hasRole(TOKEN_ADMIN, user.address);

    expect(isEBSOAdmin).to.eq(false);
  });

  it('an AML admin should not be able to remove eBSO admin', async () => {
    await EBSO.grantRole(TOKEN_ADMIN, user.address);

    await expect(EBSO.connect(amlAdmin).revokeRole(TOKEN_ADMIN, user.address)).to.be.revertedWith('missing role');
  });

  it('a treasury admin should not be able to remove eBSO admin', async () => {
    await EBSO.grantRole(TOKEN_ADMIN, user.address);

    await expect(EBSO.connect(treasuryAdmin).revokeRole(TOKEN_ADMIN, user.address)).to.be.revertedWith('missing role');
  });

  it('a simple user should not be able to remove eBSO admin', async () => {
    await EBSO.grantRole(TOKEN_ADMIN, user.address);

    await expect(EBSO.connect(anotherUser).revokeRole(TOKEN_ADMIN, user.address)).to.be.revertedWith('missing role');
  });

  it('a user can be set as AML admin', async () => {
    await EBSO.grantRole(AML_ADMIN, user.address);

    const isAMLAdmin = await EBSO.hasRole(AML_ADMIN, user.address);

    expect(isAMLAdmin).to.eq(true);
  });

  it('adding AML admin should emit event', async () => {
    await expect(EBSO.grantRole(AML_ADMIN, user.address))
      .to.emit(EBSO, 'RoleGranted')
      .withArgs(amlAdminRole, user.address, owner.address);
  });

  it('an eBSO admin should be able to add a new AML admin', async () => {
    await EBSO.connect(eBSOAdmin).grantRole(AML_ADMIN, user.address);

    const isAMLAdmin = await EBSO.hasRole(AML_ADMIN, user.address);

    expect(isAMLAdmin).to.eq(true);
  });

  it('superadmin should be able to add a new AML admin', async () => {
    await EBSO.connect(superadmin).grantRole(AML_ADMIN, user.address);

    const isAMLAdmin = await EBSO.hasRole(AML_ADMIN, user.address);

    expect(isAMLAdmin).to.eq(true);
  });

  it('an AML admin should not be able to add a new AML admin', async () => {
    await expect(EBSO.connect(amlAdmin).grantRole(AML_ADMIN, user.address)).to.be.revertedWith('missing role');
  });

  it('a treasury admin should not be able to add a new AML admin', async () => {
    await expect(EBSO.connect(treasuryAdmin).grantRole(AML_ADMIN, user.address)).to.be.revertedWith('missing role');
  });

  it('a simple user should not be able to add a new AML admin', async () => {
    await expect(EBSO.connect(user).grantRole(AML_ADMIN, user.address)).to.be.revertedWith('missing role');
  });

  it('an AML admin can be removed', async () => {
    await EBSO.grantRole(AML_ADMIN, user.address);
    await EBSO.revokeRole(AML_ADMIN, user.address);

    const isAMLAdmin = await EBSO.hasRole(AML_ADMIN, user.address);

    expect(isAMLAdmin).to.eq(false);
  });

  it('removing AML admin should emit event', async () => {
    await EBSO.grantRole(AML_ADMIN, user.address);

    await expect(EBSO.revokeRole(AML_ADMIN, user.address))
      .to.emit(EBSO, 'RoleRevoked')
      .withArgs(amlAdminRole, user.address, owner.address);
  });

  it('an eBSO admin should be able to remove AML admin', async () => {
    await EBSO.grantRole(AML_ADMIN, user.address);
    await EBSO.connect(eBSOAdmin).revokeRole(AML_ADMIN, user.address);

    const isAMLAdmin = await EBSO.hasRole(AML_ADMIN, user.address);

    expect(isAMLAdmin).to.eq(false);
  });

  it('superadmin should be able to remove AML admin', async () => {
    await EBSO.grantRole(AML_ADMIN, user.address);
    await EBSO.connect(superadmin).revokeRole(AML_ADMIN, user.address);

    const isAMLAdmin = await EBSO.hasRole(AML_ADMIN, user.address);

    expect(isAMLAdmin).to.eq(false);
  });

  it('an AML admin should not be able to remove AML admin', async () => {
    await EBSO.grantRole(AML_ADMIN, user.address);

    await expect(EBSO.connect(amlAdmin).revokeRole(AML_ADMIN, user.address)).to.be.revertedWith('missing role');
  });

  it('a treasury admin should not be able to remove AML admin', async () => {
    await EBSO.grantRole(AML_ADMIN, user.address);

    await expect(EBSO.connect(treasuryAdmin).revokeRole(AML_ADMIN, user.address)).to.be.revertedWith('missing role');
  });

  it('a simple user should not be able to remove AML admin', async () => {
    await EBSO.grantRole(AML_ADMIN, user.address);

    await expect(EBSO.connect(anotherUser).revokeRole(AML_ADMIN, user.address)).to.be.revertedWith('missing role');
  });

  it('a user can be set as treasury admin', async () => {
    await EBSO.grantRole(TREASURY_ADMIN, user.address);

    const isTreasuryAdmin = await EBSO.hasRole(TREASURY_ADMIN, user.address);

    expect(isTreasuryAdmin).to.eq(true);
  });

  it('adding treasury admin should emit event', async () => {
    await expect(EBSO.grantRole(TREASURY_ADMIN, user.address))
      .to.emit(EBSO, 'RoleGranted')
      .withArgs(treasuryAdminRole, user.address, owner.address);
  });

  it('an eBSO admin should be able to add a new treasury admin', async () => {
    await EBSO.connect(eBSOAdmin).grantRole(TREASURY_ADMIN, user.address);

    const isTreasuryAdmin = await EBSO.hasRole(TREASURY_ADMIN, user.address);

    expect(isTreasuryAdmin).to.eq(true);
  });

  it('superadmin should be able to add a new treasury admin', async () => {
    await EBSO.connect(superadmin).grantRole(TREASURY_ADMIN, user.address);

    const isTreasuryAdmin = await EBSO.hasRole(TREASURY_ADMIN, user.address);

    expect(isTreasuryAdmin).to.eq(true);
  });

  it('an AML admin should not be able to add a new treasury admin', async () => {
    await expect(EBSO.connect(amlAdmin).grantRole(TREASURY_ADMIN, user.address)).to.be.revertedWith('missing role');
  });

  it('a treasury admin should not be able to add a new treasury admin', async () => {
    await expect(EBSO.connect(treasuryAdmin).grantRole(TREASURY_ADMIN, user.address)).to.be.revertedWith(
      'missing role'
    );
  });

  it('a simple user should not be able to add a new treasury admin', async () => {
    await expect(EBSO.connect(user).grantRole(TREASURY_ADMIN, user.address)).to.be.revertedWith('missing role');
  });

  it('a treasury admin can be removed', async () => {
    await EBSO.grantRole(TREASURY_ADMIN, user.address);
    await EBSO.revokeRole(TREASURY_ADMIN, user.address);

    const isTreasuryAdmin = await EBSO.hasRole(TREASURY_ADMIN, user.address);

    expect(isTreasuryAdmin).to.eq(false);
  });

  it('removing treasury admin should emit event', async () => {
    await EBSO.grantRole(TREASURY_ADMIN, user.address);

    await expect(EBSO.revokeRole(TREASURY_ADMIN, user.address))
      .to.emit(EBSO, 'RoleRevoked')
      .withArgs(treasuryAdminRole, user.address, owner.address);
  });

  it('an eBSO admin should be able to remove treasury admin', async () => {
    await EBSO.grantRole(TREASURY_ADMIN, user.address);
    await EBSO.connect(eBSOAdmin).revokeRole(TREASURY_ADMIN, user.address);

    const isTreasuryAdmin = await EBSO.hasRole(TREASURY_ADMIN, user.address);

    expect(isTreasuryAdmin).to.eq(false);
  });

  it('superadmin should be able to remove treasury admin', async () => {
    await EBSO.grantRole(TREASURY_ADMIN, user.address);
    await EBSO.connect(superadmin).revokeRole(TREASURY_ADMIN, user.address);

    const isTreasuryAdmin = await EBSO.hasRole(TREASURY_ADMIN, user.address);

    expect(isTreasuryAdmin).to.eq(false);
  });

  it('an AML admin should not be able to remove treasury admin', async () => {
    await EBSO.grantRole(TREASURY_ADMIN, user.address);

    await expect(EBSO.connect(amlAdmin).revokeRole(TREASURY_ADMIN, user.address)).to.be.revertedWith('missing role');
  });

  it('a treasury admin should not be able to remove treasury admin', async () => {
    await EBSO.grantRole(TREASURY_ADMIN, user.address);

    await expect(EBSO.connect(treasuryAdmin).revokeRole(TREASURY_ADMIN, user.address)).to.be.revertedWith(
      'missing role'
    );
  });

  it('a simple user should not be able to remove treasury admin', async () => {
    await EBSO.grantRole(TREASURY_ADMIN, user.address);

    await expect(EBSO.connect(anotherUser).revokeRole(TREASURY_ADMIN, user.address)).to.be.revertedWith('missing role');
  });

  it('the eBSOAdmin role of the superadmin should be persistent', async () => {
    await expect(EBSO.revokeRole(TOKEN_ADMIN, superadmin.address)).to.be.revertedWith('superadmin can not be changed');
  });

  it('the eBSOAdmin role of the superadmin should really be persistent', async () => {
    await expect(EBSO.revokeRole(eBSOAdminRole, superadmin.address)).to.be.revertedWith(
      'superadmin can not be changed'
    );
  });

  it('the amlAdmin role of the superadmin should be persistent', async () => {
    await expect(EBSO.revokeRole(AML_ADMIN, superadmin.address)).to.be.revertedWith('superadmin can not be changed');
  });

  it('the amlAdmin role of the superadmin should really be persistent', async () => {
    await expect(EBSO.revokeRole(amlAdminRole, superadmin.address)).to.be.revertedWith('superadmin can not be changed');
  });

  it('the treasuryAdmin role of the superadmin should be persistent', async () => {
    await expect(EBSO.revokeRole(TREASURY_ADMIN, superadmin.address)).to.be.revertedWith(
      'superadmin can not be changed'
    );
  });

  it('the treasuryAdmin role of the superadmin should really be persistent', async () => {
    await expect(EBSO.revokeRole(treasuryAdminRole, superadmin.address)).to.be.revertedWith(
      'superadmin can not be changed'
    );
  });
});
