import test from "node:test";
import { after } from "node:test";
import assert from "node:assert";
import request from "supertest";
import app from "../src/app.js";
import { beforeEach } from "node:test";
import { query } from "../src/db/query.js";
import { pool } from "../src/db/pool.js";

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


test("GET /links/:code returns 404 when missing", async () => {
  const response = await request(app).get("/links/not-found")

  assert.strictEqual(response.status, 404)
})


test("Get /:code redirects", async () => {
  const createResponse = await request(app).post("/links").send({
    target_url: "https://www.canva.com",
  })

  const response = await request(app).get(`/${createResponse.body.code}`).redirects(0)

  assert.strictEqual(response.status, 302)

  assert.strictEqual(response.headers.location, "https://www.canva.com")
})


test("redirects increment click count", async () => {
  const createResponse = await request(app).post("/links").send({
    target_url: "https://www.canva.com",
  })

  const code = createResponse.body.code

  await request(app).get(`/${code}`).redirects(0)

  const analytics = await request(app).get(`/links/${code}`).redirects(0)

  assert.strictEqual(analytics.body.click_count, 1)
})


test("DELETE removes a link", async () => {
  const createResponse = await request(app).post("/links").send({
    target_url: "https://www.canva.com",
  })

  const code = createResponse.body.code

  const deleteResponse = await request(app).delete(`/links/${code}`)

  assert.strictEqual(deleteResponse.status, 204)

  const fetchResponse = await request(app).get(`/links/${code}`)

  assert.strictEqual(fetchResponse.status, 404)
})


test("Expire links return 410", async () => {
  await query(`
  INSERT INTO links (
    code,
    target_url,
    expires_at
  )
  VALUES (
    'expired-test',
    'https://github.com',
    NOW() - interval '1 day'
  )
`);


  const response = await request(app).get("/expired-test")

  assert.strictEqual(response.status, 410)
})

test("exports click history as csv", async () => {
  const createResponse =await request(app).post("/links").send({
    target_url: "https://github.com",
  })

  const code = createResponse.body.code

  await request(app).get(`/${code}`).redirects(0)

  const response = await request(app).get(`/links/${code}/clicks.csv`,);

  assert.strictEqual(response.status, 200)

  assert.match(response.text, /clicked_at/,);
});


test("concurrent redirects increment click count correctly",async () => {
      const createResponse =await request(app).post("/links").send({
            target_url:
              "https://github.com",
      });

      const code =createResponse.body.code;

      const requests = Array.from(
        { length: 50 },
        () =>
          request(app)
            .get(`/${code}`)
            .redirects(0),
      );

      await Promise.all(requests);

      const analytics = await request(app).get(`/links/${code}`);

      assert.strictEqual(
        analytics.body.click_count,
        50,
      );
  },
);

test("sql injection attempt is harmless", async () => {
  const response = await request(app).post("/links")
        .send({
          target_url: "https://github.com",
          code: "'; DROP TABLE links; --",  
        });

    assert.strictEqual(
      response.status,
      400,
    );

    const checkDb = await query("SELECT COUNT(*) FROM links;")

    assert.ok(Number(checkDb.rows[0].count) >= 0)
});

test(
  "sql injection payload is stored as data and does not affect the database",
  async () => {
    const createResponse =
      await request(app)
        .post("/links")
        .send({
          target_url:
            "https://github.com",
        });

    const code =
      createResponse.body.code;

    const maliciousReferrer =
      "'; DROP TABLE links; --";

    await request(app)
      .get(`/${code}`)
      .set(
        "Referer",
        maliciousReferrer,
      )
      .redirects(0);

    const clicksResponse =
      await request(app)
        .get(
          `/links/${code}/clicks`,
        );

    assert.strictEqual(
      clicksResponse.status,
      200,
    );

    assert.strictEqual(
      clicksResponse.body.data[0]
        .referrer,
      maliciousReferrer,
    );

    const tableCheck =
      await query(
        "SELECT COUNT(*) FROM links",
      );

    assert.ok(
      Number(
        tableCheck.rows[0].count,
      ) > 0,
    );
  },
);


after(async () => {
  await pool.end();
});


test("cursor pagination pages through all rows", async () => {
    const createResponse = await request(app).post("/links").send({
      target_url: "https://github.com",
    });

    const code = createResponse.body.code;

    const redirects = Array.from(
      { length: 25 },
      () =>
        request(app)
          .get(`/${code}`)
          .redirects(0),
    );

    await Promise.all(redirects);

    const ids = [];

    let cursor = null;

    while (true) {
      const queryString =
        cursor
          ? `?after=${cursor}&limit=7`
          : "?limit=7";

      const response =
        await request(app)
          .get(
            `/links/${code}/clicks${queryString}`,
          );

      ids.push(
        ...response.body.data.map(
          (row) => row.id,
        ),
      );

      if (
        response.body.next_cursor ===
        null
      ) {
        break;
      }

      cursor =
        response.body.next_cursor;
    }

    assert.strictEqual(
      ids.length,
      25,
    );

    assert.strictEqual(
      new Set(ids).size,
      25,
    );
});