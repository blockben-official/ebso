import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { EBlockStock } from '../typechain';
import { solidity } from 'ethereum-waffle';
import { ethers } from 'hardhat';
import chai from 'chai';

chai.use(solidity);
const { expect } = chai;

describe('eBSO - 012: transfer setup', () => {
  let EBSO: EBlockStock;
  let owner: SignerWithAddress;
  let superadmin: SignerWithAddress;
  let treasuryAdmin: SignerWithAddress;
  let treasury: SignerWithAddress;
  let user: SignerWithAddress;
  let anotherUser: SignerWithAddress;
  let toBsoPool: SignerWithAddress;
  let toFeeAccount: SignerWithAddress;
  let addresses: SignerWithAddress[];

  const EBSO_ADMIN = ethers.utils.id('EBSO_ADMIN');
  const AML_ADMIN = ethers.utils.id('AML_ADMIN');
  const TREASURY_ADMIN = ethers.utils.id('TREASURY_ADMIN');

  beforeEach(async () => {
    [owner, superadmin, treasuryAdmin, treasury, user, anotherUser, toBsoPool, toFeeAccount, ...addresses] = await ethers.getSigners();

    const eBSOContract = await ethers.getContractFactory('EBlockStock', owner);
    EBSO = (await eBSOContract.deploy(superadmin.address)) as EBlockStock;

    await EBSO.grantRole(TREASURY_ADMIN, treasuryAdmin.address);
    await EBSO.setTreasuryAddress(treasury.address);
  });

  it('transfer between users is not possible without any fee address setup when fees are not zero', async () => {
    await EBSO.setBsoFee(60);
    await EBSO.setGeneralFee(40);
    await EBSO.connect(treasuryAdmin).mint(user.address, 10000);

    await expect(EBSO.connect(user).transfer(anotherUser.address, 2000)).to
      .be.revertedWith('ERC20: transfer to the zero address');
  });

  it('transfer between users is possible without any fee address setup when fees are zero', async () => {
    await EBSO.setBsoFee(0);
    await EBSO.setGeneralFee(0);
    await EBSO.connect(treasuryAdmin).mint(user.address, 10000);
    await EBSO.connect(user).transfer(anotherUser.address, 2000);

    const userBalance = await EBSO.balanceOf(user.address);

    expect(userBalance).to.eq(8000);
  });

  it('transfer between users is not possible without general fee address setup when general fee is not zero', async () => {
    await EBSO.setBsoFee(60);
    await EBSO.setGeneralFee(40);
    await EBSO.setBsoPoolAddress(toBsoPool.address);
    await EBSO.connect(treasuryAdmin).mint(user.address, 10000);

    await expect(EBSO.connect(user).transfer(anotherUser.address, 2000)).to
      .be.revertedWith('ERC20: transfer to the zero address');
  });

  it('transfer between users is possible without general fee address setup when general fee is zero', async () => {
    await EBSO.setBsoFee(60);
    await EBSO.setGeneralFee(0);
    await EBSO.setBsoPoolAddress(toBsoPool.address);
    await EBSO.connect(treasuryAdmin).mint(user.address, 10000);
    await EBSO.connect(user).transfer(anotherUser.address, 2000);

    const userBalance = await EBSO.balanceOf(user.address);

    expect(userBalance).to.eq(8000);
  });

  it('transfer between users is not possible without BSO pool address setup when BSO fee is not zero', async () => {
    await EBSO.setBsoFee(60);
    await EBSO.setGeneralFee(40);
    await EBSO.setFeeAddress(toFeeAccount.address);
    await EBSO.connect(treasuryAdmin).mint(user.address, 10000);

    await expect(EBSO.connect(user).transfer(anotherUser.address, 2000)).to
      .be.revertedWith('ERC20: transfer to the zero address');
  });

  it('transfer between users is possible without BSO pool address setup when BSO fee is zero', async () => {
    await EBSO.setBsoFee(0);
    await EBSO.setGeneralFee(40);
    await EBSO.setFeeAddress(toFeeAccount.address);
    await EBSO.connect(treasuryAdmin).mint(user.address, 10000);
    await EBSO.connect(user).transfer(anotherUser.address, 2000);

    const userBalance = await EBSO.balanceOf(user.address);

    expect(userBalance).to.eq(8000);
  });

  it('transfer between users is possible with proper fee address setup', async () => {
    await EBSO.setBsoFee(60);
    await EBSO.setGeneralFee(40);
    await EBSO.setBsoPoolAddress(toBsoPool.address);
    await EBSO.setFeeAddress(toFeeAccount.address);
    await EBSO.connect(treasuryAdmin).mint(user.address, 10000);
    await EBSO.connect(user).transfer(anotherUser.address, 2000);

    const userBalance = await EBSO.balanceOf(user.address);

    expect(userBalance).to.eq(8000);
  });

  it('transfer from treasury is possible without any fee address setup because fees are not involved', async () => {
    await EBSO.connect(treasuryAdmin).mint(treasury.address, 10000);
    await EBSO.connect(treasury).transfer(user.address, 2000);

    const treasuryBalance = await EBSO.balanceOf(treasury.address);
    const userBalance = await EBSO.balanceOf(user.address);

    expect(treasuryBalance).to.eq(8000);
    expect(userBalance).to.eq(2000);
  });

  it('transfer to treasury is possible without any fee address setup because fees are not involved', async () => {
    await EBSO.connect(treasuryAdmin).mint(user.address, 10000);
    await EBSO.connect(user).transfer(treasury.address, 2000);

    const userBalance = await EBSO.balanceOf(user.address);
    const treasuryBalance = await EBSO.balanceOf(treasury.address);

    expect(userBalance).to.eq(8000);
    expect(treasuryBalance).to.eq(2000);
  });
});
