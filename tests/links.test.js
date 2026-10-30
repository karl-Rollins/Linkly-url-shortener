import test from "node:test";
import assert from "node:assert";
import request from "supertest";
import app from "../src/app.js";

test("POST /links rejects invalid URL", async () => {
  const response = await request(app).post("/links").send({
    target_url: "karl",
  });

  assert.strictEqual(response.status, 400)
});

test("POST /links creates link", async () => {
    const response = await request(app).post("/links").send({
        target_url: "https://www.canva.com/"
    })

    assert.strictEqual(response.status, 201)
    assert.strictEqual(typeof response.body.code, "string")
})