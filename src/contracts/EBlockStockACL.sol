// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.4;

import '@openzeppelin/contracts/security/Pausable.sol';
import '@openzeppelin/contracts/access/AccessControl.sol';
import '@openzeppelin/contracts/utils/Context.sol';

abstract contract EBlockStockACL is Pausable, AccessControl {
  /// @notice EBSO_ADMIN
  bytes32 public constant EBSO_ADMIN = keccak256('EBSO_ADMIN');

  /// @notice TREASURY_ADMIN. Treasury admins can only mint or burn
  bytes32 public constant TREASURY_ADMIN = keccak256('TREASURY_ADMIN');

  /// @notice AML_ADMIN. AML Admins can only whitelist and blacklist addresses
  bytes32 public constant AML_ADMIN = keccak256('AML_ADMIN');

  /**
   * @notice superadmin on paper wallet for worst case compromise
   */
  address superadmin;

  mapping(address => bool) sourceAccountBL;

  mapping(address => bool) destinationAccountBL;

  /**
   * @notice Public URL, that contains detailed up-to-date information about the token.
   */
  string public url;

  address public treasuryAddress;
  address public feeAddress;
  address public bsoPoolAddress;
  uint16 public generalFee;
  uint16 public bsoFee;

  event eBSOSourceAccountBL(address indexed _account, bool _lockValue);
  event eBSOBatchSourceAccountBL(address[] indexed _account, bool _lockValue);
  event eBSODestinationAccountBL(address indexed _account, bool _lockValue);
  event eBSOBatchDestinationAccountBL(address[] indexed _account, bool _lockValue);
  event eBSOUrlSet(string url);
  event eBSOTreasuryAddressChange(address _newAddress);
  event eBSOFeeAddressChange(address _newAddress);
  event eBSOBsoPoolAddressChange(address _newAddress);
  event eBSOGeneralFeeChange(uint256 _newFee);
  event eBSOBsoFeeChange(uint256 _newFee);

  // Setting the superadmin and adding the deployer as admin
  constructor(address _superadmin) {
    require(_superadmin != address(0), '_superadmin cannot be 0');
    superadmin = _superadmin;

    _setRoleAdmin(EBSO_ADMIN, EBSO_ADMIN);
    _setRoleAdmin(TREASURY_ADMIN, EBSO_ADMIN);
    _setRoleAdmin(AML_ADMIN, EBSO_ADMIN);

    _setupRole(EBSO_ADMIN, _superadmin);
    _setupRole(TREASURY_ADMIN, _superadmin);
    _setupRole(AML_ADMIN, _superadmin);

    _setupRole(EBSO_ADMIN, _msgSender());
  }

  /**
   * @notice Override for AccessControl.sol revokeRole to prevent revoke against superadmin
   * @param _role The role which
   * @param _account Revokes role from the account
   */
  function revokeRole(bytes32 _role, address _account) public virtual override onlyRole(getRoleAdmin(_role)) {
    require(_account != superadmin, 'superadmin can not be changed');
    super.revokeRole(_role, _account);
  }

  function getSourceAccountBL(address _account) public view returns (bool) {
    return sourceAccountBL[_account];
  }

  function getDestinationAccountBL(address _account) public view returns (bool) {
    return destinationAccountBL[_account];
  }

  function setSourceAccountBL(address _account, bool _lockValue) external onlyRole(AML_ADMIN) {
    sourceAccountBL[_account] = _lockValue;
    emit eBSOSourceAccountBL(_account, _lockValue);
  }

  function setBatchSourceAccountBL(address[] calldata _addresses, bool _lockValue) external onlyRole(AML_ADMIN) {
    for (uint256 i = 0; i < _addresses.length; i++) {
      sourceAccountBL[_addresses[i]] = _lockValue;
    }

    emit eBSOBatchSourceAccountBL(_addresses, _lockValue);
  }

  function setBatchDestinationAccountBL(address[] calldata _addresses, bool _lockValue) external onlyRole(AML_ADMIN) {
    for (uint256 i = 0; i < _addresses.length; i++) {
      destinationAccountBL[_addresses[i]] = _lockValue;
    }

    emit eBSOBatchDestinationAccountBL(_addresses, _lockValue);
  }

  function setDestinationAccountBL(address _account, bool _lockValue) external onlyRole(AML_ADMIN) {
    destinationAccountBL[_account] = _lockValue;
    emit eBSODestinationAccountBL(_account, _lockValue);
  }

  function setUrl(string calldata _newUrl) external onlyRole(EBSO_ADMIN) {
    url = _newUrl;
    emit eBSOUrlSet(_newUrl);
  }

  function setTreasuryAddress(address _newAddress) external onlyRole(EBSO_ADMIN) {
    require(_newAddress != address(0), 'treasury address cannot be 0');
    treasuryAddress = _newAddress;
    emit eBSOTreasuryAddressChange(_newAddress);
  }

  function setFeeAddress(address _newAddress) external onlyRole(EBSO_ADMIN) {
    require(_newAddress != address(0), 'fee address cannot be 0');
    feeAddress = _newAddress;
    emit eBSOFeeAddressChange(_newAddress);
  }

  function setBsoPoolAddress(address _newAddress) external onlyRole(EBSO_ADMIN) {
    require(_newAddress != address(0), 'bso pool address cannot be 0');
    bsoPoolAddress = _newAddress;
    emit eBSOBsoPoolAddressChange(_newAddress);
  }

  function setGeneralFee(uint16 _newFee) external onlyRole(EBSO_ADMIN) {
    generalFee = _newFee;
    emit eBSOGeneralFeeChange(_newFee);
  }

  function setBsoFee(uint16 _newFee) external onlyRole(EBSO_ADMIN) {
    bsoFee = _newFee;
    emit eBSOBsoFeeChange(_newFee);
  }

  function pause() external onlyRole(EBSO_ADMIN) {
    _pause();
  }

  function unpause() external onlyRole(EBSO_ADMIN) {
    _unpause();
  }
}
