import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { EBlockStock } from '../typechain';
import { solidity } from 'ethereum-waffle';
import { ethers } from 'hardhat';
import chai from 'chai';

chai.use(solidity);
const { expect } = chai;

describe('eBSO - 015: transfer fee', () => {
  let EBSO: EBlockStock;
  let owner: SignerWithAddress;
  let superadmin: SignerWithAddress;
  let treasuryAdmin: SignerWithAddress;
  let bsoPool: SignerWithAddress;
  let feeAccount: SignerWithAddress;
  let user: SignerWithAddress;
  let anotherUser: SignerWithAddress;
  let addresses: SignerWithAddress[];

  const EBSO_ADMIN = ethers.utils.id('EBSO_ADMIN');
  const AML_ADMIN = ethers.utils.id('AML_ADMIN');
  const TREASURY_ADMIN = ethers.utils.id('TREASURY_ADMIN');

  beforeEach(async () => {
    [owner, superadmin, treasuryAdmin, bsoPool, feeAccount, user, anotherUser, ...addresses] =
      await ethers.getSigners();

    const eBSOContract = await ethers.getContractFactory('EBlockStock', owner);
    EBSO = (await eBSOContract.deploy(superadmin.address)) as EBlockStock;

    await EBSO.grantRole(TREASURY_ADMIN, treasuryAdmin.address);
    await EBSO.setBsoPoolAddress(bsoPool.address);
    await EBSO.setFeeAddress(feeAccount.address);
  });

  it('fee calculation: 100 - 0.001% - 0.001%', async () => {
    await EBSO.connect(treasuryAdmin).mint(user.address, 50000000);
    await EBSO.setBsoFee(1);
    await EBSO.setGeneralFee(1);
    await EBSO.connect(user).transfer(anotherUser.address, 100);

    const userBalance = await EBSO.balanceOf(user.address);
    const anotherUserBalance = await EBSO.balanceOf(anotherUser.address);
    const bsoPoolBalance = await EBSO.balanceOf(bsoPool.address);
    const generalFeeBalance = await EBSO.balanceOf(feeAccount.address);

    expect(userBalance).to.eq(49999900);
    expect(anotherUserBalance).to.eq(100);
    expect(bsoPoolBalance).to.eq(0);
    expect(generalFeeBalance).to.eq(0);
  });

  it('fee calculation: 10000 - 0.001% - 0.001%', async () => {
    await EBSO.connect(treasuryAdmin).mint(user.address, 50000000);
    await EBSO.setBsoFee(1);
    await EBSO.setGeneralFee(1);
    await EBSO.connect(user).transfer(anotherUser.address, 10000);

    const userBalance = await EBSO.balanceOf(user.address);
    const anotherUserBalance = await EBSO.balanceOf(anotherUser.address);
    const bsoPoolBalance = await EBSO.balanceOf(bsoPool.address);
    const generalFeeBalance = await EBSO.balanceOf(feeAccount.address);

    expect(userBalance).to.eq(49990000);
    expect(anotherUserBalance).to.eq(10000);
    expect(bsoPoolBalance).to.eq(0);
    expect(generalFeeBalance).to.eq(0);
  });

  it('fee calculation: 24900 - 0.001% - 0.001%', async () => {
    await EBSO.connect(treasuryAdmin).mint(user.address, 50000000);
    await EBSO.setBsoFee(1);
    await EBSO.setGeneralFee(1);
    await EBSO.connect(user).transfer(anotherUser.address, 24900);

    const userBalance = await EBSO.balanceOf(user.address);
    const anotherUserBalance = await EBSO.balanceOf(anotherUser.address);
    const bsoPoolBalance = await EBSO.balanceOf(bsoPool.address);
    const generalFeeBalance = await EBSO.balanceOf(feeAccount.address);

    expect(userBalance).to.eq(49975100);
    expect(anotherUserBalance).to.eq(24900);
    expect(bsoPoolBalance).to.eq(0);
    expect(generalFeeBalance).to.eq(0);
  });

  it('fee calculation: 25000 - 0.001% - 0.001%', async () => {
    await EBSO.connect(treasuryAdmin).mint(user.address, 50000000);
    await EBSO.setBsoFee(1);
    await EBSO.setGeneralFee(1);
    await EBSO.connect(user).transfer(anotherUser.address, 25000);

    const userBalance = await EBSO.balanceOf(user.address);
    const anotherUserBalance = await EBSO.balanceOf(anotherUser.address);
    const bsoPoolBalance = await EBSO.balanceOf(bsoPool.address);
    const generalFeeBalance = await EBSO.balanceOf(feeAccount.address);

    expect(userBalance).to.eq(49975000);
    expect(anotherUserBalance).to.eq(24999);
    expect(bsoPoolBalance).to.eq(0);
    expect(generalFeeBalance).to.eq(1);
  });

  it('fee calculation: 49900 - 0.001% - 0.001%', async () => {
    await EBSO.connect(treasuryAdmin).mint(user.address, 50000000);
    await EBSO.setBsoFee(1);
    await EBSO.setGeneralFee(1);
    await EBSO.connect(user).transfer(anotherUser.address, 49900);

    const userBalance = await EBSO.balanceOf(user.address);
    const anotherUserBalance = await EBSO.balanceOf(anotherUser.address);
    const bsoPoolBalance = await EBSO.balanceOf(bsoPool.address);
    const generalFeeBalance = await EBSO.balanceOf(feeAccount.address);

    expect(userBalance).to.eq(49950100);
    expect(anotherUserBalance).to.eq(49899);
    expect(bsoPoolBalance).to.eq(0);
    expect(generalFeeBalance).to.eq(1);
  });

  it('fee calculation: 50000 - 0.001% - 0.001%', async () => {
    await EBSO.connect(treasuryAdmin).mint(user.address, 50000000);
    await EBSO.setBsoFee(1);
    await EBSO.setGeneralFee(1);
    await EBSO.connect(user).transfer(anotherUser.address, 50000);

    const userBalance = await EBSO.balanceOf(user.address);
    const anotherUserBalance = await EBSO.balanceOf(anotherUser.address);
    const bsoPoolBalance = await EBSO.balanceOf(bsoPool.address);
    const generalFeeBalance = await EBSO.balanceOf(feeAccount.address);

    expect(userBalance).to.eq(49950000);
    expect(anotherUserBalance).to.eq(49999);
    expect(bsoPoolBalance).to.eq(1);
    expect(generalFeeBalance).to.eq(0);
  });

  it('fee calculation: 74900 - 0.001% - 0.001%', async () => {
    await EBSO.connect(treasuryAdmin).mint(user.address, 50000000);
    await EBSO.setBsoFee(1);
    await EBSO.setGeneralFee(1);
    await EBSO.connect(user).transfer(anotherUser.address, 74900);

    const userBalance = await EBSO.balanceOf(user.address);
    const anotherUserBalance = await EBSO.balanceOf(anotherUser.address);
    const bsoPoolBalance = await EBSO.balanceOf(bsoPool.address);
    const generalFeeBalance = await EBSO.balanceOf(feeAccount.address);

    expect(userBalance).to.eq(49925100);
    expect(anotherUserBalance).to.eq(74899);
    expect(bsoPoolBalance).to.eq(1);
    expect(generalFeeBalance).to.eq(0);
  });

  it('fee calculation: 75000 - 0.001% - 0.001%', async () => {
    await EBSO.connect(treasuryAdmin).mint(user.address, 50000000);
    await EBSO.setBsoFee(1);
    await EBSO.setGeneralFee(1);
    await EBSO.connect(user).transfer(anotherUser.address, 75000);

    const userBalance = await EBSO.balanceOf(user.address);
    const anotherUserBalance = await EBSO.balanceOf(anotherUser.address);
    const bsoPoolBalance = await EBSO.balanceOf(bsoPool.address);
    const generalFeeBalance = await EBSO.balanceOf(feeAccount.address);

    expect(userBalance).to.eq(49925000);
    expect(anotherUserBalance).to.eq(74998);
    expect(bsoPoolBalance).to.eq(1);
    expect(generalFeeBalance).to.eq(1);
  });

  it('fee calculation: 124900 - 0.001% - 0.001%', async () => {
    await EBSO.connect(treasuryAdmin).mint(user.address, 50000000);
    await EBSO.setBsoFee(1);
    await EBSO.setGeneralFee(1);
    await EBSO.connect(user).transfer(anotherUser.address, 124900);

    const userBalance = await EBSO.balanceOf(user.address);
    const anotherUserBalance = await EBSO.balanceOf(anotherUser.address);
    const bsoPoolBalance = await EBSO.balanceOf(bsoPool.address);
    const generalFeeBalance = await EBSO.balanceOf(feeAccount.address);

    expect(userBalance).to.eq(49875100);
    expect(anotherUserBalance).to.eq(124898);
    expect(bsoPoolBalance).to.eq(1);
    expect(generalFeeBalance).to.eq(1);
  });

  it('fee calculation: 125000 - 0.001% - 0.001%', async () => {
    await EBSO.connect(treasuryAdmin).mint(user.address, 50000000);
    await EBSO.setBsoFee(1);
    await EBSO.setGeneralFee(1);
    await EBSO.connect(user).transfer(anotherUser.address, 125000);

    const userBalance = await EBSO.balanceOf(user.address);
    const anotherUserBalance = await EBSO.balanceOf(anotherUser.address);
    const bsoPoolBalance = await EBSO.balanceOf(bsoPool.address);
    const generalFeeBalance = await EBSO.balanceOf(feeAccount.address);

    expect(userBalance).to.eq(49875000);
    expect(anotherUserBalance).to.eq(124997);
    expect(bsoPoolBalance).to.eq(1);
    expect(generalFeeBalance).to.eq(2);
  });

  it('fee calculation: 100 - 0.060% - 0.040%', async () => {
    await EBSO.connect(treasuryAdmin).mint(user.address, 50000000);
    await EBSO.setBsoFee(60);
    await EBSO.setGeneralFee(40);
    await EBSO.connect(user).transfer(anotherUser.address, 100);

    const userBalance = await EBSO.balanceOf(user.address);
    const anotherUserBalance = await EBSO.balanceOf(anotherUser.address);
    const bsoPoolBalance = await EBSO.balanceOf(bsoPool.address);
    const generalFeeBalance = await EBSO.balanceOf(feeAccount.address);

    expect(userBalance).to.eq(49999900);
    expect(anotherUserBalance).to.eq(100);
    expect(bsoPoolBalance).to.eq(0);
    expect(generalFeeBalance).to.eq(0);
  });

  it('fee calculation: 400 - 0.060% - 0.040%', async () => {
    await EBSO.connect(treasuryAdmin).mint(user.address, 50000000);
    await EBSO.setBsoFee(60);
    await EBSO.setGeneralFee(40);
    await EBSO.connect(user).transfer(anotherUser.address, 400);

    const userBalance = await EBSO.balanceOf(user.address);
    const anotherUserBalance = await EBSO.balanceOf(anotherUser.address);
    const bsoPoolBalance = await EBSO.balanceOf(bsoPool.address);
    const generalFeeBalance = await EBSO.balanceOf(feeAccount.address);

    expect(userBalance).to.eq(49999600);
    expect(anotherUserBalance).to.eq(400);
    expect(bsoPoolBalance).to.eq(0);
    expect(generalFeeBalance).to.eq(0);
  });

  it('fee calculation: 500 - 0.060% - 0.040%', async () => {
    await EBSO.connect(treasuryAdmin).mint(user.address, 50000000);
    await EBSO.setBsoFee(60);
    await EBSO.setGeneralFee(40);
    await EBSO.connect(user).transfer(anotherUser.address, 500);

    const userBalance = await EBSO.balanceOf(user.address);
    const anotherUserBalance = await EBSO.balanceOf(anotherUser.address);
    const bsoPoolBalance = await EBSO.balanceOf(bsoPool.address);
    const generalFeeBalance = await EBSO.balanceOf(feeAccount.address);

    expect(userBalance).to.eq(49999500);
    expect(anotherUserBalance).to.eq(499);
    expect(bsoPoolBalance).to.eq(0);
    expect(generalFeeBalance).to.eq(1);
  });

  it('fee calculation: 800 - 0.060% - 0.040%', async () => {
    await EBSO.connect(treasuryAdmin).mint(user.address, 50000000);
    await EBSO.setBsoFee(60);
    await EBSO.setGeneralFee(40);
    await EBSO.connect(user).transfer(anotherUser.address, 800);

    const userBalance = await EBSO.balanceOf(user.address);
    const anotherUserBalance = await EBSO.balanceOf(anotherUser.address);
    const bsoPoolBalance = await EBSO.balanceOf(bsoPool.address);
    const generalFeeBalance = await EBSO.balanceOf(feeAccount.address);

    expect(userBalance).to.eq(49999200);
    expect(anotherUserBalance).to.eq(799);
    expect(bsoPoolBalance).to.eq(0);
    expect(generalFeeBalance).to.eq(1);
  });

  it('fee calculation: 900 - 0.060% - 0.040%', async () => {
    await EBSO.connect(treasuryAdmin).mint(user.address, 50000000);
    await EBSO.setBsoFee(60);
    await EBSO.setGeneralFee(40);
    await EBSO.connect(user).transfer(anotherUser.address, 900);

    const userBalance = await EBSO.balanceOf(user.address);
    const anotherUserBalance = await EBSO.balanceOf(anotherUser.address);
    const bsoPoolBalance = await EBSO.balanceOf(bsoPool.address);
    const generalFeeBalance = await EBSO.balanceOf(feeAccount.address);

    expect(userBalance).to.eq(49999100);
    expect(anotherUserBalance).to.eq(899);
    expect(bsoPoolBalance).to.eq(1);
    expect(generalFeeBalance).to.eq(0);
  });

  it('fee calculation: 1400 - 0.060% - 0.040%', async () => {
    await EBSO.connect(treasuryAdmin).mint(user.address, 50000000);
    await EBSO.setBsoFee(60);
    await EBSO.setGeneralFee(40);
    await EBSO.connect(user).transfer(anotherUser.address, 1400);

    const userBalance = await EBSO.balanceOf(user.address);
    const anotherUserBalance = await EBSO.balanceOf(anotherUser.address);
    const bsoPoolBalance = await EBSO.balanceOf(bsoPool.address);
    const generalFeeBalance = await EBSO.balanceOf(feeAccount.address);

    expect(userBalance).to.eq(49998600);
    expect(anotherUserBalance).to.eq(1399);
    expect(bsoPoolBalance).to.eq(1);
    expect(generalFeeBalance).to.eq(0);
  });

  it('fee calculation: 1500 - 0.060% - 0.040%', async () => {
    await EBSO.connect(treasuryAdmin).mint(user.address, 50000000);
    await EBSO.setBsoFee(60);
    await EBSO.setGeneralFee(40);
    await EBSO.connect(user).transfer(anotherUser.address, 1500);

    const userBalance = await EBSO.balanceOf(user.address);
    const anotherUserBalance = await EBSO.balanceOf(anotherUser.address);
    const bsoPoolBalance = await EBSO.balanceOf(bsoPool.address);
    const generalFeeBalance = await EBSO.balanceOf(feeAccount.address);

    expect(userBalance).to.eq(49998500);
    expect(anotherUserBalance).to.eq(1498);
    expect(bsoPoolBalance).to.eq(1);
    expect(generalFeeBalance).to.eq(1);
  });

  it('fee calculation: 2000 - 0.060% - 0.040%', async () => {
    await EBSO.connect(treasuryAdmin).mint(user.address, 50000000);
    await EBSO.setBsoFee(60);
    await EBSO.setGeneralFee(40);
    await EBSO.connect(user).transfer(anotherUser.address, 2000);

    const userBalance = await EBSO.balanceOf(user.address);
    const anotherUserBalance = await EBSO.balanceOf(anotherUser.address);
    const bsoPoolBalance = await EBSO.balanceOf(bsoPool.address);
    const generalFeeBalance = await EBSO.balanceOf(feeAccount.address);

    expect(userBalance).to.eq(49998000);
    expect(anotherUserBalance).to.eq(1998);
    expect(bsoPoolBalance).to.eq(1);
    expect(generalFeeBalance).to.eq(1);
  });

  it('fee calculation: 1000000 - 0.060% - 0.040%', async () => {
    await EBSO.connect(treasuryAdmin).mint(user.address, 50000000);
    await EBSO.setBsoFee(60);
    await EBSO.setGeneralFee(40);
    await EBSO.connect(user).transfer(anotherUser.address, 1000000);

    const userBalance = await EBSO.balanceOf(user.address);
    const anotherUserBalance = await EBSO.balanceOf(anotherUser.address);
    const bsoPoolBalance = await EBSO.balanceOf(bsoPool.address);
    const generalFeeBalance = await EBSO.balanceOf(feeAccount.address);

    expect(userBalance).to.eq(49000000);
    expect(anotherUserBalance).to.eq(999000);
    expect(bsoPoolBalance).to.eq(600);
    expect(generalFeeBalance).to.eq(400);
  });

  it('fee calculation: 2500000000 - 0.060% - 0.040%', async () => {
    await EBSO.connect(treasuryAdmin).mint(user.address, 5000000000);
    await EBSO.setBsoFee(60);
    await EBSO.setGeneralFee(40);
    await EBSO.connect(user).transfer(anotherUser.address, 2500000000);

    const userBalance = await EBSO.balanceOf(user.address);
    const anotherUserBalance = await EBSO.balanceOf(anotherUser.address);
    const bsoPoolBalance = await EBSO.balanceOf(bsoPool.address);
    const generalFeeBalance = await EBSO.balanceOf(feeAccount.address);

    expect(userBalance).to.eq(2500000000);
    expect(anotherUserBalance).to.eq(2497500000);
    expect(bsoPoolBalance).to.eq(1500000);
    expect(generalFeeBalance).to.eq(1000000);
  });

  it('fee calculation: 100 - 0.100% - 0.066%', async () => {
    await EBSO.connect(treasuryAdmin).mint(user.address, 50000000);
    await EBSO.setBsoFee(100);
    await EBSO.setGeneralFee(66);
    await EBSO.connect(user).transfer(anotherUser.address, 100);

    const userBalance = await EBSO.balanceOf(user.address);
    const anotherUserBalance = await EBSO.balanceOf(anotherUser.address);
    const bsoPoolBalance = await EBSO.balanceOf(bsoPool.address);
    const generalFeeBalance = await EBSO.balanceOf(feeAccount.address);

    expect(userBalance).to.eq(49999900);
    expect(anotherUserBalance).to.eq(100);
    expect(bsoPoolBalance).to.eq(0);
    expect(generalFeeBalance).to.eq(0);
  });

  it('fee calculation: 300 - 0.100% - 0.066%', async () => {
    await EBSO.connect(treasuryAdmin).mint(user.address, 50000000);
    await EBSO.setBsoFee(100);
    await EBSO.setGeneralFee(66);
    await EBSO.connect(user).transfer(anotherUser.address, 300);

    const userBalance = await EBSO.balanceOf(user.address);
    const anotherUserBalance = await EBSO.balanceOf(anotherUser.address);
    const bsoPoolBalance = await EBSO.balanceOf(bsoPool.address);
    const generalFeeBalance = await EBSO.balanceOf(feeAccount.address);

    expect(userBalance).to.eq(49999700);
    expect(anotherUserBalance).to.eq(300);
    expect(bsoPoolBalance).to.eq(0);
    expect(generalFeeBalance).to.eq(0);
  });

  it('fee calculation: 400 - 0.100% - 0.066%', async () => {
    await EBSO.connect(treasuryAdmin).mint(user.address, 50000000);
    await EBSO.setBsoFee(100);
    await EBSO.setGeneralFee(66);
    await EBSO.connect(user).transfer(anotherUser.address, 400);

    const userBalance = await EBSO.balanceOf(user.address);
    const anotherUserBalance = await EBSO.balanceOf(anotherUser.address);
    const bsoPoolBalance = await EBSO.balanceOf(bsoPool.address);
    const generalFeeBalance = await EBSO.balanceOf(feeAccount.address);

    expect(userBalance).to.eq(49999600);
    expect(anotherUserBalance).to.eq(399);
    expect(bsoPoolBalance).to.eq(0);
    expect(generalFeeBalance).to.eq(1);
  });

  it('fee calculation: 500 - 0.100% - 0.066%', async () => {
    await EBSO.connect(treasuryAdmin).mint(user.address, 50000000);
    await EBSO.setBsoFee(100);
    await EBSO.setGeneralFee(66);
    await EBSO.connect(user).transfer(anotherUser.address, 500);

    const userBalance = await EBSO.balanceOf(user.address);
    const anotherUserBalance = await EBSO.balanceOf(anotherUser.address);
    const bsoPoolBalance = await EBSO.balanceOf(bsoPool.address);
    const generalFeeBalance = await EBSO.balanceOf(feeAccount.address);

    expect(userBalance).to.eq(49999500);
    expect(anotherUserBalance).to.eq(499);
    expect(bsoPoolBalance).to.eq(1);
    expect(generalFeeBalance).to.eq(0);
  });

  it('fee calculation: 900 - 0.100% - 0.066%', async () => {
    await EBSO.connect(treasuryAdmin).mint(user.address, 50000000);
    await EBSO.setBsoFee(100);
    await EBSO.setGeneralFee(66);
    await EBSO.connect(user).transfer(anotherUser.address, 900);

    const userBalance = await EBSO.balanceOf(user.address);
    const anotherUserBalance = await EBSO.balanceOf(anotherUser.address);
    const bsoPoolBalance = await EBSO.balanceOf(bsoPool.address);
    const generalFeeBalance = await EBSO.balanceOf(feeAccount.address);

    expect(userBalance).to.eq(49999100);
    expect(anotherUserBalance).to.eq(899);
    expect(bsoPoolBalance).to.eq(1);
    expect(generalFeeBalance).to.eq(0);
  });

  it('fee calculation: 1000 - 0.100% - 0.066%', async () => {
    await EBSO.connect(treasuryAdmin).mint(user.address, 50000000);
    await EBSO.setBsoFee(100);
    await EBSO.setGeneralFee(66);
    await EBSO.connect(user).transfer(anotherUser.address, 1000);

    const userBalance = await EBSO.balanceOf(user.address);
    const anotherUserBalance = await EBSO.balanceOf(anotherUser.address);
    const bsoPoolBalance = await EBSO.balanceOf(bsoPool.address);
    const generalFeeBalance = await EBSO.balanceOf(feeAccount.address);

    expect(userBalance).to.eq(49999000);
    expect(anotherUserBalance).to.eq(998);
    expect(bsoPoolBalance).to.eq(1);
    expect(generalFeeBalance).to.eq(1);
  });

  it('fee calculation: 1400 - 0.100% - 0.066%', async () => {
    await EBSO.connect(treasuryAdmin).mint(user.address, 50000000);
    await EBSO.setBsoFee(100);
    await EBSO.setGeneralFee(66);
    await EBSO.connect(user).transfer(anotherUser.address, 1400);

    const userBalance = await EBSO.balanceOf(user.address);
    const anotherUserBalance = await EBSO.balanceOf(anotherUser.address);
    const bsoPoolBalance = await EBSO.balanceOf(bsoPool.address);
    const generalFeeBalance = await EBSO.balanceOf(feeAccount.address);

    expect(userBalance).to.eq(49998600);
    expect(anotherUserBalance).to.eq(1398);
    expect(bsoPoolBalance).to.eq(1);
    expect(generalFeeBalance).to.eq(1);
  });

  it('fee calculation: 1500 - 0.100% - 0.066%', async () => {
    await EBSO.connect(treasuryAdmin).mint(user.address, 50000000);
    await EBSO.setBsoFee(100);
    await EBSO.setGeneralFee(66);
    await EBSO.connect(user).transfer(anotherUser.address, 1500);

    const userBalance = await EBSO.balanceOf(user.address);
    const anotherUserBalance = await EBSO.balanceOf(anotherUser.address);
    const bsoPoolBalance = await EBSO.balanceOf(bsoPool.address);
    const generalFeeBalance = await EBSO.balanceOf(feeAccount.address);

    expect(userBalance).to.eq(49998500);
    expect(anotherUserBalance).to.eq(1498);
    expect(bsoPoolBalance).to.eq(2);
    expect(generalFeeBalance).to.eq(0);
  });

  it('fee calculation: 1600 - 0.100% - 0.066%', async () => {
    await EBSO.connect(treasuryAdmin).mint(user.address, 50000000);
    await EBSO.setBsoFee(100);
    await EBSO.setGeneralFee(66);
    await EBSO.connect(user).transfer(anotherUser.address, 1600);

    const userBalance = await EBSO.balanceOf(user.address);
    const anotherUserBalance = await EBSO.balanceOf(anotherUser.address);
    const bsoPoolBalance = await EBSO.balanceOf(bsoPool.address);
    const generalFeeBalance = await EBSO.balanceOf(feeAccount.address);

    expect(userBalance).to.eq(49998400);
    expect(anotherUserBalance).to.eq(1597);
    expect(bsoPoolBalance).to.eq(2);
    expect(generalFeeBalance).to.eq(1);
  });

  it('fee calculation: 2100 - 0.100% - 0.066%', async () => {
    await EBSO.connect(treasuryAdmin).mint(user.address, 50000000);
    await EBSO.setBsoFee(100);
    await EBSO.setGeneralFee(66);
    await EBSO.connect(user).transfer(anotherUser.address, 2100);

    const userBalance = await EBSO.balanceOf(user.address);
    const anotherUserBalance = await EBSO.balanceOf(anotherUser.address);
    const bsoPoolBalance = await EBSO.balanceOf(bsoPool.address);
    const generalFeeBalance = await EBSO.balanceOf(feeAccount.address);

    expect(userBalance).to.eq(49997900);
    expect(anotherUserBalance).to.eq(2097);
    expect(bsoPoolBalance).to.eq(2);
    expect(generalFeeBalance).to.eq(1);
  });

  it('fee calculation: 2200 - 0.100% - 0.066%', async () => {
    await EBSO.connect(treasuryAdmin).mint(user.address, 50000000);
    await EBSO.setBsoFee(100);
    await EBSO.setGeneralFee(66);
    await EBSO.connect(user).transfer(anotherUser.address, 2200);

    const userBalance = await EBSO.balanceOf(user.address);
    const anotherUserBalance = await EBSO.balanceOf(anotherUser.address);
    const bsoPoolBalance = await EBSO.balanceOf(bsoPool.address);
    const generalFeeBalance = await EBSO.balanceOf(feeAccount.address);

    expect(userBalance).to.eq(49997800);
    expect(anotherUserBalance).to.eq(2196);
    expect(bsoPoolBalance).to.eq(2);
    expect(generalFeeBalance).to.eq(2);
  });

  it('fee calculation: 1000000 - 0.100% - 0.066%', async () => {
    await EBSO.connect(treasuryAdmin).mint(user.address, 50000000);
    await EBSO.setBsoFee(100);
    await EBSO.setGeneralFee(66);
    await EBSO.connect(user).transfer(anotherUser.address, 1000000);

    const userBalance = await EBSO.balanceOf(user.address);
    const anotherUserBalance = await EBSO.balanceOf(anotherUser.address);
    const bsoPoolBalance = await EBSO.balanceOf(bsoPool.address);
    const generalFeeBalance = await EBSO.balanceOf(feeAccount.address);

    expect(userBalance).to.eq(49000000);
    expect(anotherUserBalance).to.eq(998340);
    expect(bsoPoolBalance).to.eq(1000);
    expect(generalFeeBalance).to.eq(660);
  });

  it('fee calculation: 1000000 - 0% - 0%', async () => {
    await EBSO.connect(treasuryAdmin).mint(user.address, 50000000);
    await EBSO.setBsoFee(0);
    await EBSO.setGeneralFee(0);
    await EBSO.connect(user).transfer(anotherUser.address, 1000000);

    const userBalance = await EBSO.balanceOf(user.address);
    const anotherUserBalance = await EBSO.balanceOf(anotherUser.address);
    const bsoPoolBalance = await EBSO.balanceOf(bsoPool.address);
    const generalFeeBalance = await EBSO.balanceOf(feeAccount.address);

    expect(userBalance).to.eq(49000000);
    expect(anotherUserBalance).to.eq(1000000);
    expect(bsoPoolBalance).to.eq(0);
    expect(generalFeeBalance).to.eq(0);
  });
});
