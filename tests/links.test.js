import test from "node:test";
import assert from "node:assert";
import request from "supertest";
import app from "../src/app.js";
import { beforeEach } from "node:test";
import { query } from "../src/db/query.js";

beforeEach(async () => {
  await query('TRUNCATE TABLE links RESTART IDENTITY CASCADE')
})

test("POST /links rejects invalid URL", async () => {
  const response = await request(app).post("/links").send({
    target_url: "karl",
  });

  assert.strictEqual(response.status, 400)
});

test("POST /links creates link", async () => {
    const response = await request(app).post("/links").send({
        target_url: "https://www.canva.com",
        code: "canva-123"
    })

    assert.strictEqual(response.status, 201)
    assert.strictEqual(typeof response.body.code, "string")
})

test ("POST /links rejects duplicate vanity codes", async () => {
    const payload = {
      target_url: "https://www.canva.com",
      code: "mylink"
    }

    await request(app).post("/links").send(payload)

    const response = await request(app).post("/links").send(payload)

    assert.strictEqual(response.status, 409)
})

test ("GET /links/:code return links details", async () => {
  const createResponse = await request(app).post("/links").send({
    target_url: "https://www.canva.com",
  })

  const response = await request(app).get(`/links/${createResponse.body.code}`)

  assert.strictEqual(response.status, 200)

  assert.strictEqual(response.body.code, createResponse.body.code)
})