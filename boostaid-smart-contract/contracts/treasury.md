# Treasury Contract Documentation Update

## Overview
This document outlines the structure and functionality of the treasury contract, including contract managers, commission and fee structures, available functions, and error codes.

### Contract Managers
The contract managers are designated entities or addresses with special permissions to execute certain actions within the contract. These include:
- `.auction-store`
- `.promoter-rank`
- `tx-sender` (the transaction sender)

### Commission
Commissions are applied to certain transactions within the contract. The commission rate is determined by the type of transaction.

#### Initial Commission Rates
- **ID 0:** Claim bids from consignor - 5%
- **ID 1:** Claim commission Promoter NFT - 0%
- **ID 2:** Owner of the fund claim funding-campaign - 5% *(new!)*
- **ID 3:** 100% comission to treasure - 100% *(new!)*
- **ID 4:** Promoter claim funding-campaign comission - 4% *(new!)*

### Fee Structure
Fees are charged for specific services provided by the contract to cover associated operational costs.

#### Initial Fees
- **ID 0:** Mint Fundraiser NFT - 1,000,000 microSTX
- **ID 1:** Transfer Fundraiser NFT - 2,000,000 microSTX
- **ID 2:** Update data for Fundraiser NFT - 5,000,000 microSTX
- **ID 3:** Mint Promoter NFT - 1,000,000 microSTX
- **ID 4:** Transfer Promoter NFT - 1,500,000 microSTX
- **ID 5:** Update data for Promoter NFT - 4,000,000 microSTX
- **ID 6:** Create funding campaign - 1,000,000 microSTX *(new!)*

## Contract Functions

### Read-Only Functions
These functions can be called by any user to read data from the contract without making any state changes.
- `get-treasury-balance`: Returns the current balance of the treasury.
- `get-commission (c-id uint)`: Returns the commission fee for the specified ID.
- `get-fee (fee-id uint)`: Returns the fixed fee for the specified ID.
- `is-contract-manager`: Checks if the caller is a contract manager.

### Public Functions
These functions can change the state of the contract and are subject to various permissions and conditions.
- `update-contract-manager (contract principal) (allowed bool)`: Updates the permission of a contract manager.
- `update-commission (c-id uint) (value uint)`: Updates the commission fee for a specified ID.
- `update-fee (fee-id uint) (value uint)`: Updates the fixed fee for a specified ID.
- `deposit-fund (amount uint)`: Allows depositing funds into the treasury.
- `withdraw-deposit-fund (amount uint) (recipient principal) (c-id uint)`: Withdraws funds from the treasury, applying a commission fee.
- `pay-tax (fee-id uint)`: Pays a fixed fee to the treasury.
- `collect-treasure (amount uint) (recipient principal)`: Allows a contract manager to withdraw a specified amount from the treasury to a recipient.

### Errors
- `ERR-PERMISSION-DENIED` **(u1000)**: Returned when a caller attempts to perform an action without the necessary permissions.
- `ERR-INSUFFICIENT-FUND` **(u1001)**: Returned when the treasury does not have enough funds to complete a distribution.
- `ERR-PRECONDITION` **(u1002)**: Returned when a precondition for a transaction is not met.