import test from "node:test";
import assert from "node:assert";
import { generateCode } from "../src/utils/generator.js";

test("generateCode returns correct length", () => {
    const code = generateCode(6);

    assert.strictEqual(code.length, 6)
})

test("generateCode returns a string", () => {
    const code = generateCode();

    assert.strictEqual(typeof code, "string")
})

test("generateCode does not return an empty value", () => {
    const code = generateCode();

    assert.notStrictEqual(code, "")
})