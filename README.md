# EBSO (EBlockStock) token

## Contract addresses

Mainnet: 0x866f8a50A64e68ca66E97e032c5Da99538B3F942
Ropsten (UAT): 0xFC26A78F58Ad4919dD30510E481F1F187823397b
Ropsten (DEV): 0x8F4f99c1d0123858a2b1396fEebc485D7AD4F8e1

## FUNCTIONAL SPECIFICATION

### General requirements:

- ERC156 interface implemented
- ERC20 compatible token
- with extra standard functionalities: mint and burn
- four decimal points
- tokensymbol EBSO
- approve function is modified to prevent known front-running attacks: at creating new approve, the allowance has to be set to zero first!

### Specialities in basic functions:

- There are two blacklists controlling if a token can be transferred, minted or burned.
- Both enable and disable must be available
- Blacklists are called sourceAccountBL and destinationAccountBL
- transfer (from, to, amount) should be only possible of `from` is not blacklisted in sourceAccountBL and `to` is not blacklisted in destinationAccountBL
- mint should be possible to all addresses, however only if they are not in destinationAccountBL
- burn should be only possible if the address is not in sourceAccountBL
- burn must be possible only from the treasury account
- burn does not take parameter, it burns from the treasury account automatically

### Special accounts: there are three special accounts in the system:

- treasuryAddress is from where the tokens can burned, in other adress than the treasury address, these functionalities must be denied.
- bsopoolAddress is an address where part of the token transaction fee will be transferred
- feeAddress is the second address where a part of the token transaction fee will be transferred

### Transfer and token fees:

- There are two token fees at a transfer: bsoFee and generalFee
- both fees can be set dynamically
- bsoFee is transferred to the bsoFee address
- generalFee is transferred to the general Fee address
- both fees are integer numbers: 100 means 0.1 percent
- if the `from` or the `to` account is the treasury account, there should not be any fee calculted

### Administration and rights:

- There are three roles of admins:
  - EBSO admin role
  - treasury admin role
  - AML admin role

#### EBSO admin can:

- adding or removing further EBSO admin accounts
- adding or removing further treasury admin accounts
- adding or removing further AML admin accounts
- setting issueraddress
- setting bsoFee and the related address
- setting generalFee and the related address
- pausing or unpausing the contract

#### Treasury admin can:

- only treasury admins can mint tokens
- only treasury admins can burn tokens
- treasury admins can not do anything else priviliged apart from burn and mint

#### AML admin can:

- blacklist accounts
- treasury admins can not do anything else priviliged apart from blacklisting

#### Error scenarios and key compromise protocols:

- at error situations, the contract can paused by the admins
- if the error is fatal, a paused contract can be destroyed by the admins
- if all the administrator accounts are compromised, there is a last level of key recovery protocol: a superadmin wired at the initialization, only available on a paperwallet.
- if only a treasury admin is compromised it can be rechanged by an EBSO admin
- if only an AML admin is compromised it can be rechanged by an EBSO admin

**EBlockStock Address (Ropsten): 0x7983a25F987aCEfE6A65682ddde0b9983e3146cC**

## Tests

### Running unit tests

To run the test, first install dependencies:

`npm i`

Run tests:

`npm run test`

### Running tests with coverage

To run the tests with coverage report, first install dependencies:

`npm i`

Run tests with coverage:

`npm run coverage`

When running coverage tests, the testing framework adds some extra functionality to the contracts. Because of these modification, the contract size will grow and it can exceed the mainnet size limit. It is a known behaviour, the mainnet deployment does not contain the modification, its size is under the limit.

`Warning: 1 contracts exceed the size limit for mainnet deployment.`

### Coverage report

| File                  | % Stmts    | % Branch   | % Funcs    | % Lines    | Uncovered Lines  |
| --------------------- | ---------- | ---------- | ---------- | ---------- | ---------------- |
| contracts/            | 100        | 100        | 100        | 100        |                  |
| EBlockStock.sol       | 100        | 100        | 100        | 100        |                  |
| EBlockStockACL.sol    | 100        | 100        | 100        | 100        |                  |
| --------------------- | ---------- | ---------- | ---------- | ---------- | ---------------- |
| All files             | 100        | 100        | 100        | 100        |                  |
