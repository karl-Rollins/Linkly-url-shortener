import test from "node:test";
import { after } from "node:test";
import assert from "node:assert";
import request from "supertest"
import app from "../src/app.js";
import { pool } from "../src/db/pool.js";

after( async () => {
    await pool.end()
})

test("GET /health return 200", async () => {
    const response = await request(app).get("/health")

    assert.strictEqual(response.status, 200)
    assert.deepStrictEqual(
        response.body,
        {
            status: "ok",
            database: "ok"
        }
    )
})