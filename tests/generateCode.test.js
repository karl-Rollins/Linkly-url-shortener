import test from "node:test";
import assert from "node:assert";
import { generateCode } from "../src/utils/generator.js";

test("generateCode returns correct length", () => {
    const code = generateCode(6);

    assert.strictEqual(code.length, 6)
})