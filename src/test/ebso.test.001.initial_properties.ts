import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { solidity } from 'ethereum-waffle';
import { ethers } from 'hardhat';
import chai from 'chai';
import { EBlockStock } from '../typechain';

chai.use(solidity);
const { expect } = chai;

describe('eBSO - 001: initial properties', () => {
  let EBSO: EBlockStock;
  let owner: SignerWithAddress;
  let superadmin: SignerWithAddress;
  let user: SignerWithAddress;
  let addresses: SignerWithAddress[];
  let nullAddress: String = '0x0000000000000000000000000000000000000000';

  const TOKEN_ADMIN = ethers.utils.id('TOKEN_ADMIN');
  const AML_ADMIN = ethers.utils.id('AML_ADMIN');
  const TREASURY_ADMIN = ethers.utils.id('TREASURY_ADMIN');

  beforeEach(async () => {
    [owner, superadmin, user, ...addresses] = await ethers.getSigners();

    const eBSOContract = await ethers.getContractFactory('EBlockStock', owner);
    EBSO = (await eBSOContract.deploy(superadmin.address)) as EBlockStock;
  });

  it('token name should be EBlockStock', async () => {
    const tokenName = await EBSO.name();

    expect(tokenName).to.eq('EBlockStock');
  });

  it('token symbol should be EBSO', async () => {
    const tokenSymbol = await EBSO.symbol();

    expect(tokenSymbol).to.eq('EBSO');
  });

  it('decimals should be 4', async () => {
    const decimals = await EBSO.decimals();

    expect(decimals).to.eq(4);
  });

  it('token should not be paused by default', async () => {
    const paused = await EBSO.paused();

    expect(paused).to.eq(false);
  });

  it('initial total supply should be zero', async () => {
    const totalSupply = await EBSO.totalSupply();

    expect(totalSupply).to.eq(0);
  });

  it('initial balance of the owner should be zero', async () => {
    const balance = await EBSO.balanceOf(owner.address);

    expect(balance).to.eq(0);
  });

  it('initial balance of the superadmin should be zero', async () => {
    const balance = await EBSO.balanceOf(superadmin.address);

    expect(balance).to.eq(0);
  });

  it('initial balance of a user should be zero', async () => {
    const balance = await EBSO.balanceOf(user.address);

    expect(balance).to.eq(0);
  });

  it('initial general fee should be zero', async () => {
    const generalFee = await EBSO.generalFee();

    expect(generalFee).to.eq(0);
  });

  it('initial BSO fee should be zero', async () => {
    const bsoFee = await EBSO.bsoFee();

    expect(bsoFee).to.eq(0);
  });

  it('initial fee address should be null', async () => {
    const feeAddress = await EBSO.feeAddress();

    expect(feeAddress).to.eq(nullAddress);
  });

  it('initial BSO pool address should be null', async () => {
    const bsoPoolAddress = await EBSO.bsoPoolAddress();

    expect(bsoPoolAddress).to.eq(nullAddress);
  });

  it('initial treasury address should be null', async () => {
    const treasuryAddress = await EBSO.treasuryAddress();

    expect(treasuryAddress).to.eq(nullAddress);
  });

  it('a user should not have a blacklisted source account by default', async () => {
    const isBlacklisted = await EBSO.getSourceAccountBL(user.address);

    expect(isBlacklisted).to.eq(false);
  });

  it('a user should not have a blacklisted destination account by default', async () => {
    const isBlacklisted = await EBSO.getDestinationAccountBL(user.address);

    expect(isBlacklisted).to.eq(false);
  });

  it('the owner is eBSO admin by default', async () => {
    const isEBSOAdmin = await EBSO.hasRole(TOKEN_ADMIN, owner.address);

    expect(isEBSOAdmin).to.eq(true);
  });

  it('superadmin is eBSO admin by default', async () => {
    const isEBSOAdmin = await EBSO.hasRole(TOKEN_ADMIN, superadmin.address);

    expect(isEBSOAdmin).to.eq(true);
  });

  it('a user is not eBSO admin by default', async () => {
    const isEBSOAdmin = await EBSO.hasRole(TOKEN_ADMIN, user.address);

    expect(isEBSOAdmin).to.eq(false);
  });

  it('the owner is not AML admin by default', async () => {
    const isAMLAdmin = await EBSO.hasRole(AML_ADMIN, owner.address);

    expect(isAMLAdmin).to.eq(false);
  });

  it('superadmin is AML admin by default', async () => {
    const isAMLAdmin = await EBSO.hasRole(AML_ADMIN, superadmin.address);

    expect(isAMLAdmin).to.eq(true);
  });

  it('a user is not AML admin by default', async () => {
    const isAMLAdmin = await EBSO.hasRole(AML_ADMIN, user.address);

    expect(isAMLAdmin).to.eq(false);
  });

  it('the owner is not treasury admin by default', async () => {
    const isTreasuryAdmin = await EBSO.hasRole(TREASURY_ADMIN, owner.address);

    expect(isTreasuryAdmin).to.eq(false);
  });

  it('superadmin is treasury admin by default', async () => {
    const isTreasuryAdmin = await EBSO.hasRole(TREASURY_ADMIN, superadmin.address);

    expect(isTreasuryAdmin).to.eq(true);
  });

  it('a user is not treasury admin by default', async () => {
    const isTreasuryAdmin = await EBSO.hasRole(TREASURY_ADMIN, user.address);

    expect(isTreasuryAdmin).to.eq(false);
  });
});
