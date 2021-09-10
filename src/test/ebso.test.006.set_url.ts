import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { EBlockStock } from '../typechain';
import { solidity } from 'ethereum-waffle';
import { ethers } from 'hardhat';
import chai from 'chai';

chai.use(solidity);
const { expect } = chai;

describe('eBSO - 006: set url', () => {
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

  beforeEach(async () => {
    [owner, superadmin, eBSOAdmin, amlAdmin, treasuryAdmin, user, ...addresses] = await ethers.getSigners();

    const eBSOContract = await ethers.getContractFactory('EBlockStock', owner);
    EBSO = (await eBSOContract.deploy(superadmin.address)) as EBlockStock;

    await EBSO.grantRole(TOKEN_ADMIN, eBSOAdmin.address);
    await EBSO.grantRole(AML_ADMIN, amlAdmin.address);
    await EBSO.grantRole(TREASURY_ADMIN, treasuryAdmin.address);
  });

  it('url can be set', async () => {
    await EBSO.setUrl('http://xxx.x');

    const url = await EBSO.url();

    expect(url).to.eq('http://xxx.x');
  });

  it('setting url should emit event', async () => {
    await expect(EBSO.setUrl('http://xxx.x')).to.emit(EBSO, 'eBSOUrlSet').withArgs('http://xxx.x');
  });

  it('an eBSO admin should be able to set url', async () => {
    await EBSO.connect(eBSOAdmin).setUrl('http://xxx.x');

    const url = await EBSO.url();

    expect(url).to.eq('http://xxx.x');
  });

  it('superadmin should be able to set url', async () => {
    await EBSO.connect(superadmin).setUrl('http://xxx.x');

    const url = await EBSO.url();

    expect(url).to.eq('http://xxx.x');
  });

  it('an AML admin should not be able to set url', async () => {
    await expect(EBSO.connect(amlAdmin).setUrl('http://xxx.x')).to.be.revertedWith('missing role');
  });

  it('a treasury admin should not be able to set url', async () => {
    await expect(EBSO.connect(treasuryAdmin).setUrl('http://xxx.x')).to.be.revertedWith('missing role');
  });

  it('a simple user should not be able to set url', async () => {
    await expect(EBSO.connect(user).setUrl('http://xxx.x')).to.be.revertedWith('missing role');
  });
});
