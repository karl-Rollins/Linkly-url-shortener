import test from "node:test";
import assert from "node:assert";
import { linkSchema } from "../src/schemas/linkSchema.js";

test("valid url passes validation", () => {
    const result = linkSchema.safeParse({
        target_url: "https://www.youtube.com/"
    })

    assert.strictEqual(result.success, true)
})

test("invalid url fails validation", () => {
    const result = linkSchema.safeParse({
        target_url: "karl"
    })

    assert.strictEqual(result.success, false)
})
