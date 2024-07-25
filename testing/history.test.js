/**
 * @jest-environment jsdom
 */

import { allowEntry, removeNonGames } from "../src/index";

// const allowEntry = require("../src/index.mjs");

// function allowEntry(name, type) {
//   if (!type || !name) return false;
//   const allowedTypes = [
//     "Purchase",`
//     "Refund",
//     "In-Game Purchase",
//     "Gift Purchase",
//   ];
//   if (!allowedTypes.includes(type)) return false;
//   // ignored due to funds being used later
//   if (name.includes("Digital Gift Card")) return false;
//   if (name.includes("Wallet Credit")) return false;
//   return true;
// }

describe("allowEntry function", () => {
  describe("allowed entries", () => {
    test("allow purchase", () => {
      const name = "Example Game";
      const type = "Purchase";
      const allowed = allowEntry(name, type);
      console.log("true", allowed);
      expect(allowed).toBeTruthy();
    });

    test("allow refund", () => {
      const name = "King Monster\nRefund";
      const type = "Refund";
      const allowed = allowEntry(name, type);
      console.log("true", allowed);
      expect(allowed).toBeTruthy();
    });

    test("allow In-Game Purchase", () => {
      const name = "King Monster\nRefund";
      const type = "Refund";
      const allowed = allowEntry(name, type);
      console.log("true", allowed);
      expect(allowed).toBeTruthy();
    });

    test("allow gift purchase", () => {
      const name = "King Monster\nRefund";
      const type = "Refund";
      const allowed = allowEntry(name, type);
      console.log("true", allowed);
      expect(allowed).toBeTruthy();
    });
  });

  describe("disallowed entries", () => {
    test("ignore gift cards", () => {
      const name = "Purchased $9.99 Digital Gift Card";
      const type = "Purchase";
      const allowed = allowEntry(name, type);
      console.log("false", allowed);
      expect(allowed).toBeFalsy();
    });

    test("ignore wallet credit", () => {
      const name = "Purchased $5.00 Wallet Credit";
      const type = "Purchase";
      const allowed = allowEntry(name, type);
      console.log("false", allowed);
      expect(allowed).toBeFalsy();
    });
  });
});

// function removeNonGames(games) {
//   const removeIfPresent = ["View Shipment Details", "Gift sent to"];
//   return games.filter(
//     (item) => !removeIfPresent.some((substring) => item.includes(substring))
//   );
// }

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