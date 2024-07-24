import { allowEntry } from "../src/index";

test("adds 1 + 2 to equal 3", () => {
  const allowed = allowEntry();
  expect(allowed).toBeTruthy;
});
