
import { describe, expect, it } from "vitest";
import { Cl, ClarityValue, ResponseOkCV } from '@stacks/transactions';
import { uint } from "@stacks/transactions/dist/cl";

const accounts = simnet.getAccounts();

const deployer = accounts.get("deployer")!;
const address1 = accounts.get("wallet_1")!;
const address2 = accounts.get("wallet_2")!;
const address3 = accounts.get("wallet_3")!;

export const Treasury = {
  comission: {  // percentage
    'CLAIM-BIDS-FROM-CONSIGNOR': 5,    // Claim bids from consignor
    'CLAIM-COMISSION-PROMOTER-NFT': 0,    // Claim comission Promoter NFT
  },
  fee: {
    'FUNDRAISER-NFT-MINT': 1000000,    // Mint Fundraiser NFT
    'FUNDRAISER-NFT-TRANSFER': 2000000,    // Transfer Fundraiser NFT
    'FUNDRAISER-NFT-UPDATE-DATA': 5000000,    // Update data for Fundraiser NFT
    'PROMOTER-NFT-MINT': 1500000,    // Mint Promoter NFT
    'PROMOTER-NFT-TRANSFER': 4000000,    // Transfer Promoter NFT
    'PROMOTER-NFT-UPDATE-DATA': 6000000,    // Update data for Promoter NFT
  }
}

/*
(define-constant ERR-PERMISSION-DENIED (err u1000))
(define-constant ERR-INSUFFICIENT-FUND (err u1001))
(define-constant ERR-PRECONDITION (err u1002))
*/
const ERR_PERMISSION_DENIED = Cl.uint(1000);
const ERR_INSUFFICIENT_FUND = Cl.uint(1001);
const ERR_PRECONDITION = Cl.uint(1002);

describe("Treasury Fee Operations", () => {
  it("TEST.treasury.01: percent fee", async () => {
    // Update percent fee
    const updatePercentFee = await simnet.callPublicFn(
      "treasury",
      "update-comission",
      [Cl.uint(0), Cl.uint(10)],
      deployer
    );
    // console.log('updatePercentFee: ', Cl.prettyPrint(updatePercentFee.result));
    expect(updatePercentFee.result, 'updatePercentFee: ').toBeOk(Cl.bool(true));

    // Retrieve and assert percent fee
    const percentFee = await simnet.callReadOnlyFn(
      "treasury",
      "get-comission",
      [Cl.uint(0)],
      address3
    );
    // console.log('percentFee: ', Cl.prettyPrint(percentFee.result));
    expect(percentFee.result, 'percentFee: ').toEqual(Cl.uint(10));
  });

  it("TEST.treasury.02: fixed fee", async () => {
    // Update fixed fee
    const updateFixedFee = await simnet.callPublicFn(
      "treasury",
      "update-fee",
      [Cl.uint(0), Cl.uint(100)],
      deployer
    );
    // console.log('updateFixedFee: ', Cl.prettyPrint(updateFixedFee.result));
    expect(updateFixedFee.result, 'updateFixedFee: ').toBeOk(Cl.bool(true));

    // Retrieve and assert fixed fee
    const fixedFee = await simnet.callReadOnlyFn(
      "treasury",
      "get-fee",
      [Cl.uint(0)],
      address3
    );
    // console.log('fixedFee: ', Cl.prettyPrint(fixedFee.result));
    expect(fixedFee.result, 'fixedFee: ').toEqual(Cl.uint(100));
  });
});


describe("Test Treasury tax", () => {
  it("TEST.treasury.03: pay tax", async () => {

    // Check address1 balance
    const balance1 = simnet.getAssetsMap().get('STX')?.get(address1);

    // pay-tax
    const payTax = await simnet.callPublicFn(
      "treasury",
      "pay-tax",
      [
        Cl.uint(0)  // Mint Fundraiser NFT
      ],
      address1
    );

    // console.log('payTax: ', Cl.prettyPrint(payTax.result));
    expect(payTax.result, 'payTax: ').toBeOk(Cl.uint(1000000));

    // get-treasury-balance
    const treasuryBalance = await simnet.callReadOnlyFn(
      "treasury",
      "get-treasury-balance",
      [],
      address3
    );

    // console.log('treasuryBalance: ', Cl.prettyPrint(treasuryBalance.result));
    expect(treasuryBalance.result, 'treasuryBalance: ').toEqual(Cl.uint(1000000));

    const balance2 = simnet.getAssetsMap().get('STX')?.get(address1);
    // console.log('balance2: ', balance2);
    // Subtract balance2 from balance1
    if (balance1 && balance2) {
      let result: bigint = balance2 - balance1;
      expect(result, 'Final balance: ').toEqual(BigInt(-1000000));
    } else {
      console.error('balance1 or balance2 is undefined');
    }

    // console.log('Accounts: ', simnet.getAssetsMap().get('STX'));
  });

  it("TEST.treasury.04: pay fee", async () => {

    // Check address1 balance
    const balance1 = simnet.getAssetsMap().get('STX')?.get(address1);

    // deposit-fund
    const depositFund = await simnet.callPublicFn(
      "treasury",
      "deposit-fund",
      [
        Cl.uint(100)
      ],
      address1
    );
    // console.log('depositFund: ', Cl.prettyPrint(depositFund.result));
    expect(depositFund.result, 'depositFund: ').toBeOk(Cl.bool(true));

    // withdraw-deposit-fund
    const withdrawDepositFund = await simnet.callPublicFn(
      "treasury",
      "withdraw-deposit-fund",
      [
        Cl.uint(100),
        Cl.address(address1),
        Cl.uint(0)
      ],
      deployer
    );

    // console.log('withdrawDepositFund: ', Cl.prettyPrint(withdrawDepositFund.result));
    expect(withdrawDepositFund.result, 'withdrawDepositFund: ').toBeOk(Cl.uint(95));

    const treasuryBalance = await simnet.callReadOnlyFn(
      "treasury",
      "get-treasury-balance",
      [],
      address3
    );

    // console.log('treasuryBalance: ', Cl.prettyPrint(treasuryBalance.result));
    expect(treasuryBalance.result, 'treasuryBalance: ').toEqual(Cl.uint(5));

    const balance2 = simnet.getAssetsMap().get('STX')?.get(address1);
    // console.log('balance2: ', balance2);
    // Subtract balance2 from balance1
    if (balance1 && balance2) {
      let result: bigint = balance2 - balance1;
      expect(result, 'Final balance: ').toEqual(BigInt(-5));
    } else {
      console.error('balance1 or balance2 is undefined');
    }

    // console.log('Accounts: ', simnet.getAssetsMap().get('STX'));
  });

});

describe("Test Treasury collect treasure", () => {
  it("TEST.treasury.05: not fund enough", async () => {

    // Check deployer balance
    // const balance1 = simnet.getAssetsMap().get('STX')?.get(deployer);
    // console.log('balance1: ', balance1);

    // collect-treasure
    const collectTreasure = await simnet.callPublicFn(
      "treasury",
      "collect-treasure",
      [
        Cl.uint(500),
        Cl.principal(address2),
      ],
      deployer
    );

    // console.log('collectTreasure: ', Cl.prettyPrint(collectTreasure.result));
    expect(collectTreasure.result, 'collectTreasure: ').toBeErr(Cl.uint(1001));
  });

  it("TEST.treasury.06: success", async () => {

    // Check deployer balance
    const balance1 = simnet.getAssetsMap().get('STX')?.get(address2);

    // pay-tax
    const payTax = await simnet.callPublicFn(
      "treasury",
      "pay-tax",
      [
        Cl.uint(0)  // Mint Fundraiser NFT
      ],
      address1
    );
    expect(payTax.result, 'payTax: ').toBeOk(Cl.uint(1000000));

    // collect-treasure
    const collectTreasure = await simnet.callPublicFn(
      "treasury",
      "collect-treasure",
      [
        Cl.uint(500),
        Cl.principal(address2),
      ],
      deployer
    );

    expect(collectTreasure.result, 'collectTreasure: ').toBeOk(Cl.bool(true));

    const balance2 = simnet.getAssetsMap().get('STX')?.get(address2);
    // Subtract balance2 from balance1
    if (balance1 && balance2) {
      let result: bigint = balance2 - balance1;
      expect(result, 'Final balance: ').toEqual(BigInt(500));
    } else {
      console.error('balance1 or balance2 is undefined');
    }
  });

  it("TEST.treasury.07: add manager and collect treasure", async () => {

    // Check deployer balance
    const balance1 = simnet.getAssetsMap().get('STX')?.get(address3);

    // update-contract-manager
    const addManager = await simnet.callPublicFn(
      "treasury",
      "add-contract-manager",
      [
        Cl.principal(address1),
        // Cl.bool(true)
      ],
      deployer
    );
    expect(addManager.result, 'add-contract-manager: ').toBeOk(Cl.bool(true));

    // pay-tax
    const payTax = await simnet.callPublicFn(
      "treasury",
      "pay-tax",
      [
        Cl.uint(0)  // Mint Fundraiser NFT
      ],
      address2
    );
    expect(payTax.result, 'payTax: ').toBeOk(Cl.uint(1000000));

    // collect-treasure
    const collectTreasure = await simnet.callPublicFn(
      "treasury",
      "collect-treasure",
      [
        Cl.uint(1000000),
        Cl.principal(address3),
      ],
      address1
    );

    // console.log('collectTreasure: ', Cl.prettyPrint(collectTreasure.result));
    expect(collectTreasure.result, 'collectTreasure: ').toBeOk(Cl.bool(true));

    const balance2 = simnet.getAssetsMap().get('STX')?.get(address3);
    // console.log('balance2: ', balance2);
    // Subtract balance2 from balance1
    if (balance1 && balance2) {
      let result: bigint = balance2 - balance1;
      expect(result, 'Final balance: ').toEqual(BigInt(1000000));
    } else {
      console.error('balance1 or balance2 is undefined');
    }
  });

  // remove-contract-manager
  it("TEST.treasury.08: remove manager", async () => {

    const addManager = await simnet.callPublicFn(
      "treasury",
      "add-contract-manager",
      [
        Cl.principal(address1)
      ],
      deployer
    );
    expect(addManager.result, 'add-contract-manager: ').toBeOk(Cl.bool(true));

    // update-contract-manager
    const removeManager = await simnet.callPublicFn(
      "treasury",
      "remove-contract-manager",
      [
        Cl.principal(deployer)
      ],
      address1
    );
    expect(removeManager.result, 'remove-contract-manager: ').toBeOk(Cl.bool(true));

    const addManagerWithoutPermission = await simnet.callPublicFn(
      "treasury",
      "add-contract-manager",
      [
        Cl.principal(address2)
      ],
      deployer
    );
    expect(addManagerWithoutPermission.result, 'addManagerWithoutPermission: ').toBeErr(ERR_PERMISSION_DENIED);
  });


});
