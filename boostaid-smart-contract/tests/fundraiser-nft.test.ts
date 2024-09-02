
import { describe, expect, it } from "vitest";
import { Cl, ClarityValue, ResponseOkCV } from '@stacks/transactions';
import { Treasury } from "./treasury.test";

const accounts = simnet.getAccounts();

const deployer = accounts.get("deployer")!;
const address1 = accounts.get("wallet_1")!;
const address2 = accounts.get("wallet_2")!;
const address3 = accounts.get("wallet_3")!;

/*
(define-constant ERR-PERMISSION_DENIED (err u1100))
(define-constant ERR-NOT-TOKEN-OWNER (err u1101))
(define-constant ERR-TOKEN-NOT-EXIST (err u1102))
(define-constant ERR-PRECONDITION (err u1103))
*/
const ERR_PERMISSION_DENIED = Cl.uint(1100);
const ERR_NOT_TOKEN_OWNER = Cl.uint(1101);
const ERR_TOKEN_NOT_EXIST = Cl.uint(1102);
const ERR_PRECONDITION = Cl.uint(1103);


describe("Test Fundraiser NFT", () => {

  describe("TEST.fundraiser-nft.1: Mint", () => {

    it("TEST.fundraiser-nft.1.1: Valid mint", async () => {
      
      const mintResult = await mintNFT(); // You might need to adjust the parameters as per your NFT contract
      expect(mintResult.result, 'Valid mint: ').toBeOk(Cl.uint(1)); // Assuming the first minted NFT has ID 1

      // Optionally, verify other state changes like NFT balance or metadata
      let metadata = await getMetadata(1); // Assuming the first minted NFT has ID 1
      expect(Cl.prettyPrint(metadata.result), 'Check metadata: ').toContain('(ok (some { meta-type: u1, metadata: "nome-test", negative-points: u0, negative-votes: u0, prositive-points: u0, prositive-votes: u0 }))');

      const treasuryBalance = simnet.getAssetsMap().get('STX')?.get(deployer + '.treasury');
      expect(treasuryBalance, 'Minting fee: ').toEqual(BigInt(Treasury.fee["FUNDRAISER-NFT-MINT"]));

      const mint2Result = await mintNFT(); // Mint another NFT
      expect(mint2Result.result, 'Check minting sequence: ').toBeOk(Cl.uint(2)); // Assuming the second minted NFT has ID 2

      const balance1 = simnet.getAssetsMap().get('.fundraiser-nft.fundraiser-nft')?.get(address1);
      expect(balance1, 'Balance Asset: ').toEqual(BigInt(2));
   
    });

    
  });

  describe("TEST.fundraiser-nft.2: Update Metadata", () => {

    it("TEST.fundraiser-nft.2.1: Update data", async () => {
      // Implement test for updating data

      const mint = await mintNFT();
      expect(mint.result, 'Mint: ').toBeOk(Cl.uint(1));

      const update = await updateData(1, address1);
      expect(update.result, 'Update data: ').toBeOk(Cl.bool(true));

      const metadata = await getMetadata(1);
      expect(Cl.prettyPrint(metadata.result), 'Check metadata: ').toContain('(ok (some { meta-type: u1, metadata: "new-test-data", negative-points: u0, negative-votes: u0, prositive-points: u0, prositive-votes: u0 }))');

      const treasuryBalance = simnet.getAssetsMap().get('STX')?.get(deployer + '.treasury');
      expect(treasuryBalance, 'Minting fee: ').toEqual(BigInt(Treasury.fee["FUNDRAISER-NFT-MINT"] + Treasury.fee["FUNDRAISER-NFT-UPDATE-DATA"]));
    });

    it("TEST.fundraiser-nft.2.2: Update data without permission", async () => {
      // Implement test for updating data without permission

      const mint = await mintNFT();
      expect(mint.result, 'Mint: ').toBeOk(Cl.uint(1));

      const update = await updateData(1, address2);
      expect(update.result, 'Update data: ').toBeErr(ERR_PERMISSION_DENIED);

      const metadata = await getMetadata(1);
      expect(Cl.prettyPrint(metadata.result), 'Check metadata: ').toContain('(ok (some { meta-type: u1, metadata: "nome-test", negative-points: u0, negative-votes: u0, prositive-points: u0, prositive-votes: u0 }))');

      const treasuryBalance = simnet.getAssetsMap().get('STX')?.get(deployer + '.treasury');
      expect(treasuryBalance, 'Minting fee: ').toEqual(BigInt(Treasury.fee["FUNDRAISER-NFT-MINT"]));
    });
  });

  describe("TEST.fundraiser-nft.3: Update manager", () => {

    it("TEST.fundraiser-nft.3.1: Update manager with permission", async () => {
      // Implement test for updating manager with permission
      const updateManager = await simnet.callPublicFn(
        "fundraiser-nft",
        "add-contract-manager",
        [
          Cl.address(address2)
        ],
        deployer
      );

      expect(updateManager.result, 'Update manager: ').toBeOk(Cl.bool(true));

      const isManager = await simnet.callReadOnlyFn(
        "fundraiser-nft",
        "is-contract-manager",
        [],
        address2
      );
      expect(isManager.result, 'Check manager: ').toBeBool(true);

    });

    it("TEST.fundraiser-nft.3.2: Update manager without permission", async () => {
      // Implement test for updating manager without permission
      const updateManager = await simnet.callPublicFn(
        "fundraiser-nft",
        "add-contract-manager",
        [
          Cl.address(address2)
        ],
        address1
      );

      expect(updateManager.result, 'Update manager: ').toBeErr(ERR_PERMISSION_DENIED);
    });
  });

  describe("TEST.fundraiser-nft.4: Transfer NFT", () => {

    it("TEST.fundraiser-nft.4.1: Valid transfer", async () => {
      // Implement test for valid transfer of NFT

      const mint = await mintNFT();
      expect(mint.result, 'Mint: ').toBeOk(Cl.uint(1));

      const transfer = await simnet.callPublicFn(
        "fundraiser-nft",
        "transfer",
        [
          Cl.uint(1),
          Cl.address(address1),
          Cl.address(address2)
        ],
        address1
      );

      expect(transfer.result, 'Transfer: ').toBeOk(Cl.bool(true));

      const owner = await simnet.callReadOnlyFn(
        "fundraiser-nft",
        "get-owner",
        [Cl.uint(1)],
        address3
      );
      expect(owner.result).toBeOk(Cl.some(Cl.address(address2)));

      const treasuryBalance = simnet.getAssetsMap().get('STX')?.get(deployer + '.treasury');
      expect(treasuryBalance, 'Minting fee: ').toEqual(BigInt(Treasury.fee["FUNDRAISER-NFT-MINT"] + Treasury.fee["FUNDRAISER-NFT-TRANSFER"]));
    });

    it("TEST.fundraiser-nft.4.2: Transfer without permission", async () => {
      // Implement test for transfer without permission

      const mint = await mintNFT();
      expect(mint.result, 'Mint: ').toBeOk(Cl.uint(1));

      const transfer = await simnet.callPublicFn(
        "fundraiser-nft",
        "transfer",
        [
          Cl.uint(1),
          Cl.address(address1),
          Cl.address(address2)
        ],
        address2
      );

      expect(transfer.result, 'Transfer: ').toBeErr(ERR_NOT_TOKEN_OWNER);

      const owner = await simnet.callReadOnlyFn(
        "fundraiser-nft",
        "get-owner",
        [Cl.uint(1)],
        address3
      );
      expect(owner.result).toBeOk(Cl.some(Cl.address(address1)));

      const treasuryBalance = simnet.getAssetsMap().get('STX')?.get(deployer + '.treasury');
      expect(treasuryBalance, 'Minting fee: ').toEqual(BigInt(Treasury.fee["FUNDRAISER-NFT-MINT"]));
    });
  });

  describe("TEST.fundraiser-nft.5: Vote", () => {

    it("TEST.fundraiser-nft.5.1: Add positive vote", async () => {
      // Implement test for adding positive vote
      const mint = await mintNFT();
      expect(mint.result, 'Mint: ').toBeOk(Cl.uint(1));

      const votePositive = await simnet.callPublicFn(
        "fundraiser-nft",
        "add-positive-vote",
        [
          Cl.uint(1),
          Cl.uint(333)
        ],
        deployer
      );
      expect(votePositive.result, 'Vote positive: ').toBeOk(Cl.bool(true));

      const metadata = await getMetadata(1);
      expect(Cl.prettyPrint(metadata.result), 'Check metadata: ').toContain('(ok (some { meta-type: u1, metadata: "nome-test", negative-points: u0, negative-votes: u0, prositive-points: u333, prositive-votes: u1 }))');

      const treasuryBalance = simnet.getAssetsMap().get('STX')?.get(deployer + '.treasury');
      expect(treasuryBalance, 'Minting fee: ').toEqual(BigInt(Treasury.fee["FUNDRAISER-NFT-MINT"]));

      const votePositive2 = await simnet.callPublicFn(
        "fundraiser-nft",
        "add-positive-vote",
        [
          Cl.uint(1),
          Cl.uint(20)
        ],
        deployer
      );
      expect(votePositive2.result, 'Vote positive: ').toBeOk(Cl.bool(true));

      const metadata2 = await getMetadata(1);
      expect(Cl.prettyPrint(metadata2.result), 'Check metadata: ').toContain('(ok (some { meta-type: u1, metadata: "nome-test", negative-points: u0, negative-votes: u0, prositive-points: u353, prositive-votes: u2 }))');

    });

    it("TEST.fundraiser-nft.5.2: Add negative vote", async () => {
      // Implement test for adding negative vote
      const mint = await mintNFT();
      expect(mint.result, 'Mint: ').toBeOk(Cl.uint(1));

      const voteNegative = await simnet.callPublicFn(
        "fundraiser-nft",
        "add-negative-vote",
        [
          Cl.uint(1),
          Cl.uint(50)
        ],
        deployer
      );
      expect(voteNegative.result, 'Vote negative: ').toBeOk(Cl.bool(true));

      const metadata = await getMetadata(1);
      expect(Cl.prettyPrint(metadata.result), 'Check metadata: ').toContain('(ok (some { meta-type: u1, metadata: "nome-test", negative-points: u50, negative-votes: u1, prositive-points: u0, prositive-votes: u0 }))');

      const treasuryBalance = simnet.getAssetsMap().get('STX')?.get(deployer + '.treasury');
      expect(treasuryBalance, 'Minting fee: ').toEqual(BigInt(Treasury.fee["FUNDRAISER-NFT-MINT"]));
    });

    it("TEST.fundraiser-nft.5.3: Swap vote from negative to positive", async () => {
      // Implement test for swapping vote from negative to positive
      const mint = await mintNFT();
      expect(mint.result, 'Mint: ').toBeOk(Cl.uint(1));

      const voteNegative = await simnet.callPublicFn(
        "fundraiser-nft",
        "add-negative-vote",
        [
          Cl.uint(1),
          Cl.uint(50)
        ],
        deployer
      );
      expect(voteNegative.result, 'Vote negative: ').toBeOk(Cl.bool(true));

      const swapVote = await simnet.callPublicFn(
        "fundraiser-nft",
        "swap-vote-to-positive",
        [
          Cl.uint(1),
          Cl.uint(50)
        ],
        deployer
      );
      expect(swapVote.result, 'Swap vote: ').toBeOk(Cl.bool(true));

      const metadata = await getMetadata(1);
      expect(Cl.prettyPrint(metadata.result), 'Check metadata: ').toContain('(ok (some { meta-type: u1, metadata: "nome-test", negative-points: u0, negative-votes: u0, prositive-points: u50, prositive-votes: u1 }))');


    });

    it("TEST.fundraiser-nft.5.4: Swap vote from positive to negative", async () => {
      // Implement test for swapping vote from positive to negative
      const mint = await mintNFT();
      expect(mint.result, 'Mint: ').toBeOk(Cl.uint(1));

      const votePositive = await simnet.callPublicFn(
        "fundraiser-nft",
        "add-positive-vote",
        [
          Cl.uint(1),
          Cl.uint(50)
        ],
        deployer
      );
      expect(votePositive.result, 'Vote positive: ').toBeOk(Cl.bool(true));

      const swapVote = await simnet.callPublicFn(
        "fundraiser-nft",
        "swap-vote-to-negative",
        [
          Cl.uint(1),
          Cl.uint(50)
        ],
        deployer
      );
      expect(swapVote.result, 'Swap vote: ').toBeOk(Cl.bool(true));

      const metadata = await getMetadata(1);
      expect(Cl.prettyPrint(metadata.result), 'Check metadata: ').toContain('(ok (some { meta-type: u1, metadata: "nome-test", negative-points: u50, negative-votes: u1, prositive-points: u0, prositive-votes: u0 }))');

    });
  });
});

// Helper functions (assuming similar to those in promoter-nft.test.ts)
function mintNFT() {
  return simnet.callPublicFn(
    "fundraiser-nft",
    "mint",
    [
      Cl.address(address1),
      Cl.uint(1),
      Cl.stringAscii("nome-test")
    ],
    address2
  );
}

function updateData(tokenId: number, principal: string) {
  return simnet.callPublicFn(
    "fundraiser-nft",
    "update-data",
    [
      Cl.uint(tokenId),
      Cl.uint(1),
      Cl.stringAscii("new-test-data")
    ],
    principal
  );
}

function getMetadata(tokenId: number) {
  return simnet.callReadOnlyFn(
    "fundraiser-nft",
    "get-metadata",
    [Cl.uint(tokenId)],
    address3
  );
}