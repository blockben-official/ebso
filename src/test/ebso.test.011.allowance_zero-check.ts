import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { EBlockStock } from '../typechain';
import { solidity } from 'ethereum-waffle';
import { ethers } from 'hardhat';
import chai from 'chai';

chai.use(solidity);
const { expect } = chai;

describe('eBSO - 011: allowance zero-check', () => {
  let EBSO: EBlockStock;
  let owner: SignerWithAddress;
  let superadmin: SignerWithAddress;
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
    [owner, superadmin, treasuryAdmin, bsoPool, feeAccount, assignor, user, anotherUser, ...addresses] =
      await ethers.getSigners();

    const eBSOContract = await ethers.getContractFactory('EBlockStock', owner);
    EBSO = (await eBSOContract.deploy(superadmin.address)) as EBlockStock;

    await EBSO.grantRole(TREASURY_ADMIN, treasuryAdmin.address);
    await EBSO.setBsoPoolAddress(bsoPool.address);
    await EBSO.setFeeAddress(feeAccount.address);
  });

  it('approve should fail if there is a non-zero actual allowance value', async () => {
    await EBSO.connect(assignor).approve(user.address, 4000);

    await expect(EBSO.connect(assignor).approve(user.address, 3000)).to
      .be.revertedWith('Approve: zero first');
  });

  it('approving zero amount should succeed even if there is a non-zero actual allowance value', async () => {
    await EBSO.connect(assignor).approve(user.address, 4000);
    await EBSO.connect(assignor).approve(user.address, 0);

    const allowance = await EBSO.allowance(assignor.address, user.address);

    expect(allowance).to.eq(0);
  });

  it('approve should succeed if the previous non-zero allowance was set to zero before', async () => {
    await EBSO.connect(assignor).approve(user.address, 4000);
    await EBSO.connect(assignor).approve(user.address, 0);
    await EBSO.connect(assignor).approve(user.address, 3000);

    const allowance = await EBSO.allowance(assignor.address, user.address);

    expect(allowance).to.eq(3000);
  });

  it('approve should succeed if the previous non-zero allowance was decreased to zero before', async () => {
    await EBSO.connect(assignor).approve(user.address, 4000);
    await EBSO.connect(assignor).decreaseAllowance(user.address, 4000);
    await EBSO.connect(assignor).approve(user.address, 3000);

    const allowance = await EBSO.allowance(assignor.address, user.address);

    expect(allowance).to.eq(3000);
  });

  it('approve should fail if there is a non-zero actual allowance value even if there was some decrease before', async () => {
    await EBSO.connect(assignor).approve(user.address, 4000);
    await EBSO.connect(assignor).decreaseAllowance(user.address, 1000);

    await expect(EBSO.connect(assignor).approve(user.address, 2000)).to
      .be.revertedWith('Approve: zero first');
  });

  it('approve should succeed if the previous non-zero allowance was fully transferred before', async () => {
    await EBSO.connect(treasuryAdmin).mint(assignor.address, 10000);
    await EBSO.connect(assignor).approve(user.address, 4000);
    await EBSO.connect(user).transferFrom(assignor.address, user.address, 4000);
    await EBSO.connect(assignor).approve(user.address, 3000);

    const allowance = await EBSO.allowance(assignor.address, user.address);

    expect(allowance).to.eq(3000);
  });

  it('approve should fail if there is a non-zero actual allowance value even if the previous allowance was partially transferred before', async () => {
    await EBSO.connect(treasuryAdmin).mint(assignor.address, 10000);
    await EBSO.connect(assignor).approve(user.address, 4000);
    await EBSO.connect(user).transferFrom(assignor.address, user.address, 1000);

    await expect(EBSO.connect(assignor).approve(user.address, 2000)).to
      .be.revertedWith('Approve: zero first');
  });
});
