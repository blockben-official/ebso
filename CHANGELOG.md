# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.3] - 2021-09-10

### Added

- Batch update sourceAccountBL + tests
- Batch update sourceAccountBL + tests

## [0.0.2] - 2021-09-07

### Added

- EBS-03: tests for EBS-03
- Github action to run coverage tests as PR
- WEB3 type generation via hardhat

### Changed

- EBA-01: lock compiler version to 0.8.4
- EBA-02: description for `url` property
- EBA-03: input validation at address setters
- EBS-01: lock compiler version to 0.8.4
- EBS-02: description for transfer algorithm
- EBS-03: boolean equality at blacklist checks
- EBS-04: `kill` function tests skipped

### Removed

- EBS-04: `kill` function has been removed

## [0.0.1] - 2021-08-26

### Added

- Hardhat framework
- EBlockStock.sol
  - token name, token symbol
  - 4 decimals
  - transfer
  - transferFrom
  - \_transfer with correct fee handling
  - approve
  - allowance change (increase/decrease)
  - mint
  - burn
  - kill
- EBlockStockACL.sol
  - superadmin
  - EBSO admin
  - treasury admin
  - AML admin
  - source account blacklist
  - destination account blacklist
  - token detail URL
  - treasury address
  - general fee address and general fee amount
  - bso pool address and bso pool fee amount
  - setters for roles/addresses/fees/url
  - events for changes
  - pause/unpause
- tests with coverage
- README
- CHANGELOG

[unreleased]: https://github.com/blockben-official/ebso/compare/v0.0.3...HEAD
[0.0.1]: https://github.com/blockben-official/ebso/releases/tag/v0.0.1
[0.0.2]: https://github.com/blockben-official/ebso/releases/tag/v0.0.2
[0.0.2]: https://github.com/blockben-official/ebso/releases/tag/v0.0.3
