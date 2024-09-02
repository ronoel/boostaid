import { describe, expect, it } from "vitest";
import { Cl, ClarityValue, ResponseOkCV } from '@stacks/transactions';
import { Treasury } from "./treasury.test";

const accounts = simnet.getAccounts();

const deployer = accounts.get("deployer")!;
const address1 = accounts.get("wallet_1")!;
const address2 = accounts.get("wallet_2")!;
const address3 = accounts.get("wallet_3")!;

// Constants error
const ERR_PERMISSION_DENIED = Cl.uint(1200);
const ERR_NOT_TOKEN_OWNER = Cl.uint(1201);
const ERR_TOKEN_NOT_EXIST = Cl.uint(1202);


describe("Test Promoter NFT", () => {

  describe("TEST.promoter-nft.1: Mint", async () => {

    it("TEST.promoter-nft.1.1: Valid mint", async () => {

      const mint = await mintNFT();
      expect(mint.result, 'Mint 1: ').toBeOk(Cl.uint(1));

      const mint2 = await mintNFT();
      expect(mint2.result, 'Check mintting sequence: ').toBeOk(Cl.uint(2));

      const metadata = await simnet.callReadOnlyFn(
        "promoter-nft",
        "get-metadata",
        [Cl.uint(1)],
        address3
      );
      expect(Cl.prettyPrint(metadata.result), 'Check metadata: ').toContain('(ok (some { meta-type: u1, metadata: "nome-test", top-1: u0, top-2: u0, top-3: u0 }))');

      const treasury = simnet.getAssetsMap().get('STX')?.get(deployer + '.treasury');
      expect(treasury, 'Mint Tax: ').toEqual(BigInt(Treasury.fee["PROMOTER-NFT-MINT"] * 2));
      expect(simnet.getAssetsMap().get('.promoter-nft.promoter-nft')?.get(address1), 'NFT Balance: ').toEqual(BigInt(2));

    });

  });

  describe("TEST.promoter-nft.2: Update Metadata", async () => {


    it("TEST.promoter-nft.2.1: Update data", async () => {

      const mint = await mintNFT();
      expect(mint.result, 'Mint 1: ').toBeOk(Cl.uint(1));

      const update = await simnet.callPublicFn(
        "promoter-nft",
        "update-data",
        [
          Cl.uint(1),
          Cl.uint(1),
          Cl.stringAscii("novo-nome")
        ],
        address1
      );
      expect(update.result, 'Update data: ').toBeOk(Cl.bool(true));

      const treasury = simnet.getAssetsMap().get('STX')?.get(deployer + '.treasury');
      expect(treasury, 'Update data Tax: ').toEqual(BigInt(Treasury.fee["PROMOTER-NFT-MINT"] + Treasury.fee["PROMOTER-NFT-UPDATE-DATA"]));

    });

    it("TEST.promoter-nft.2.2: Update data without permission", async () => {

      const mint = await mintNFT();
      expect(mint.result, 'Mint: ').toBeOk(Cl.uint(1));

      const update = await simnet.callPublicFn(
        "promoter-nft",
        "update-data",
        [
          Cl.uint(1),
          Cl.uint(1),
          Cl.stringAscii("novo-nome")
        ],
        address2
      );
      expect(update.result, 'Update data without permission: ').toBeErr(ERR_PERMISSION_DENIED);
      const treasury = simnet.getAssetsMap().get('STX')?.get(deployer + '.treasury');
      expect(treasury, 'Update data Tax: ').toEqual(BigInt(Treasury.fee["PROMOTER-NFT-MINT"]));

    });

  });

  describe("TEST.promoter-nft.3: Add Top", async () => {

    it("TEST.promoter-nft.3.1: Add with success", async () => {

      const mint = await mintNFT();
      expect(mint.result, 'Mint: ').toBeOk(Cl.uint(1));

      let update = await addTop(1, deployer, 1);
      expect(update.result, 'Add top 1: ').toBeOk(Cl.bool(true));

      let metadata = await getMetadata(1);
      expect(Cl.prettyPrint(metadata.result), 'Check metadata: ').toContain('(ok (some { meta-type: u1, metadata: "nome-test", top-1: u1, top-2: u0, top-3: u0 }))');

      update = await addTop(1, deployer, 1);
      expect(update.result, 'Add top 1+: ').toBeOk(Cl.bool(true));
      metadata = await getMetadata(1);
      expect(Cl.prettyPrint(metadata.result), 'Check metadata: ').toContain('(ok (some { meta-type: u1, metadata: "nome-test", top-1: u2, top-2: u0, top-3: u0 }))');

      update = await addTop(2, deployer, 1);
      expect(update.result, 'Add top 2: ').toBeOk(Cl.bool(true));
      metadata = await getMetadata(1);
      expect(Cl.prettyPrint(metadata.result), 'Check metadata: ').toContain('(ok (some { meta-type: u1, metadata: "nome-test", top-1: u2, top-2: u1, top-3: u0 }))');

      update = await addTop(3, deployer, 1);
      expect(update.result, 'Add top 3: ').toBeOk(Cl.bool(true));
      metadata = await getMetadata(1);
      expect(Cl.prettyPrint(metadata.result), 'Check metadata: ').toContain('(ok (some { meta-type: u1, metadata: "nome-test", top-1: u2, top-2: u1, top-3: u1 }))');

      update = await addTop(2, deployer, 1);
      expect(update.result, 'Add top 2+: ').toBeOk(Cl.bool(true));
      metadata = await getMetadata(1);
      expect(Cl.prettyPrint(metadata.result), 'Check metadata: ').toContain('(ok (some { meta-type: u1, metadata: "nome-test", top-1: u2, top-2: u2, top-3: u1 }))');

      update = await addTop(3, deployer, 1);
      expect(update.result, 'Add top 3+: ').toBeOk(Cl.bool(true));
      metadata = await getMetadata(1);
      expect(Cl.prettyPrint(metadata.result), 'Check metadata: ').toContain('(ok (some { meta-type: u1, metadata: "nome-test", top-1: u2, top-2: u2, top-3: u2 }))');


      const treasury = simnet.getAssetsMap().get('STX')?.get(deployer + '.treasury');
      expect(treasury, 'Add top Tax: ').toEqual(BigInt(Treasury.fee["PROMOTER-NFT-MINT"]));

    });

    it("TEST.promoter-nft.3.2: Add top 1 without permission", async () => {

      const mint = await mintNFT();
      expect(mint.result, 'Mint: ').toBeOk(Cl.uint(1));

      let update = await addTop(1, address1, 1);
      expect(update.result, 'Add top: ').toBeErr(ERR_PERMISSION_DENIED);

      let metadata = await getMetadata(1);
      expect(Cl.prettyPrint(metadata.result), 'Check metadata: ').toContain('(ok (some { meta-type: u1, metadata: "nome-test", top-1: u0, top-2: u0, top-3: u0 }))');

      const treasury = simnet.getAssetsMap().get('STX')?.get(deployer + '.treasury');
      expect(treasury, 'Add top Tax: ').toEqual(BigInt(Treasury.fee["PROMOTER-NFT-MINT"]));

    });

    it("TEST.promoter-nft.3.3: Add top 2 without permission", async () => {

      const mint = await mintNFT();
      expect(mint.result, 'Mint: ').toBeOk(Cl.uint(1));

      let update = await addTop(2, address1, 1);
      expect(update.result, 'Add top: ').toBeErr(ERR_PERMISSION_DENIED);

      let metadata = await getMetadata(1);
      expect(Cl.prettyPrint(metadata.result), 'Check metadata: ').toContain('(ok (some { meta-type: u1, metadata: "nome-test", top-1: u0, top-2: u0, top-3: u0 }))');

      const treasury = simnet.getAssetsMap().get('STX')?.get(deployer + '.treasury');
      expect(treasury, 'Add top Tax: ').toEqual(BigInt(Treasury.fee["PROMOTER-NFT-MINT"]));

    });

    it("TEST.promoter-nft.3.4: Add top 3 without permission", async () => {

      const mint = await mintNFT();
      expect(mint.result, 'Mint: ').toBeOk(Cl.uint(1));

      let update = await addTop(3, address1, 1);
      expect(update.result, 'Add top: ').toBeErr(ERR_PERMISSION_DENIED);

      let metadata = await getMetadata(1);
      expect(Cl.prettyPrint(metadata.result), 'Check metadata: ').toContain('(ok (some { meta-type: u1, metadata: "nome-test", top-1: u0, top-2: u0, top-3: u0 }))');

      const treasury = simnet.getAssetsMap().get('STX')?.get(deployer + '.treasury');
      expect(treasury, 'Add top Tax: ').toEqual(BigInt(Treasury.fee["PROMOTER-NFT-MINT"]));

    });

  });

  describe("TEST.promoter-nft.4: Transfer", async () => {

    it("TEST.promoter-nft.4.1: Transfer with success", async () => {

      const mint = await mintNFT();
      expect(mint.result, 'Mint: ').toBeOk(Cl.uint(1));

      let transfer = await simnet.callPublicFn(
        "promoter-nft",
        "transfer",
        [
          Cl.uint(1),
          Cl.address(address1),
          Cl.address(address2)
        ],
        address1
      );
      expect(transfer.result, 'Transfer: ').toBeOk(Cl.bool(true));

      const balance1 = simnet.getAssetsMap().get('.promoter-nft.promoter-nft')?.get(address1);
      expect(balance1, 'Balance 1: ').toEqual(BigInt(0));

      const balance2 = simnet.getAssetsMap().get('.promoter-nft.promoter-nft')?.get(address2);
      expect(balance2, 'Balance 2: ').toEqual(BigInt(1));

      const treasury = simnet.getAssetsMap().get('STX')?.get(deployer + '.treasury');
      expect(treasury, 'Add top Tax: ').toEqual(BigInt(Treasury.fee["PROMOTER-NFT-MINT"] + Treasury.fee["PROMOTER-NFT-TRANSFER"]));

    });

    it("TEST.promoter-nft.4.2: Transfer without permission", async () => {

      const mint = await mintNFT();
      expect(mint.result, 'Mint: ').toBeOk(Cl.uint(1));

      let transfer = await simnet.callPublicFn(
        "promoter-nft",
        "transfer",
        [
          Cl.uint(1),
          Cl.address(address1),
          Cl.address(address2)
        ],
        deployer
      );
      expect(transfer.result, 'Transfer: ').toBeErr(ERR_NOT_TOKEN_OWNER);

      const balance1 = simnet.getAssetsMap().get('.promoter-nft.promoter-nft')?.get(address1);
      expect(balance1, 'Balance 1: ').toEqual(BigInt(1));

      const balance2 = simnet.getAssetsMap().get('.promoter-nft.promoter-nft')?.get(address2);
      expect(balance2, 'Balance 2: ').toBeUndefined();

      const treasury = simnet.getAssetsMap().get('STX')?.get(deployer + '.treasury');
      expect(treasury, 'Add top Tax: ').toEqual(BigInt(Treasury.fee["PROMOTER-NFT-MINT"]));

    });

  });

});

function mintNFT() {
  return simnet.callPublicFn(
    "promoter-nft",
    "mint",
    [
      Cl.address(address1),
      Cl.uint(1),
      Cl.stringAscii("nome-test")
    ],
    address2
  );
}

function addTop(top: number, principalAddress: string, tokenId: number) {
  return simnet.callPublicFn(
    "promoter-nft",
    "add-top-" + top,
    [
      Cl.uint(tokenId)
    ],
    principalAddress
  );
}

function getMetadata(tokenId: number) {
  return simnet.callReadOnlyFn(
    "promoter-nft",
    "get-metadata",
    [Cl.uint(tokenId)],
    address3
  );
}