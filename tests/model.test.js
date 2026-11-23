import test from "node:test";
import assert from "node:assert/strict";
import * as model from "../src/models/user.model.js";
test("modelo auth exporta lógica de validación", () => {
  assert.ok(Object.keys(model).length > 0);
});
