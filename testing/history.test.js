/**
 * @jest-environment jsdom
 */

const { allowEntry, removeNonGames } = require("../src/index");

describe("allowEntry function", () => {
  describe("allowed entries", () => {
    test("allow purchase", () => {
      const name = "Example Game";
      const type = "Purchase";
      const allowed = allowEntry(name, type);
      expect(allowed).toBeTruthy();
    });

    test("allow refund", () => {
      const name = "King Monster\nRefund";
      const type = "Refund";
      const allowed = allowEntry(name, type);
      expect(allowed).toBeTruthy();
    });

    test("allow In-Game Purchase", () => {
      const name = "Key Jumper";
      const type = "1000 Coins In-Game Purchase";
      const allowed = allowEntry(name, type);
      expect(allowed).toBeTruthy();
    });

    test("allow gift purchase", () => {
      const name = "Turbo Racing";
      const type = "Gift Purchase";
      const allowed = allowEntry(name, type);
      expect(allowed).toBeTruthy();
    });
  });

  describe("disallowed entries", () => {
    test("ignore gift cards", () => {
      const name = "Purchased $9.99 Digital Gift Card";
      const type = "Purchase";
      const allowed = allowEntry(name, type);
      expect(allowed).toBeFalsy();
    });

    test("ignore wallet credit", () => {
      const name = "Purchased $5.00 Wallet Credit";
      const type = "Purchase";
      const allowed = allowEntry(name, type);
      expect(allowed).toBeFalsy();
    });
  });
});

describe("removeNonGames function", () => {
  test("removes gift text", () => {
    let games = ["Deep Rock Galactic", "Gift sent to TasteTheRambo"];
    const allowed = removeNonGames(games);
    expect(allowed).toEqual(["Deep Rock Galactic"]);
  });

  test("removes shipment details text", () => {
    let games = ["Valve Index Headset + Controllers", "View Shipment Details"];
    const allowed = removeNonGames(games);
    expect(allowed).toEqual(["Valve Index Headset + Controllers"]);
  });
});
