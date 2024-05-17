import { describe, test, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";

import app from "../app.js";
import db from "../db.js";

let company;

beforeEach(async function () {
  await db.query("DELETE FROM companies");
  let result = await db.query(`
    INSERT INTO companies (code, name, description)
    VALUES ('test_code', 'test_name', 'test_description')
    RETURNING code, name, description`);
  company = result.rows[0];
});

afterAll(async function () {
  await db.end();
});



// - Getting all cats
describe('GET /companies', function () {
  test('Gets companies', async function () {
    const resp = await request(app).get('/companies');
    const testCompanyAnswer =
    {
      companies:
        [{
          code: 'test_code',
          name: 'test_name',
        }
        ]
    };
    console.log(resp.body);
    expect(resp.body).toEqual(testCompanyAnswer);
  });
});


// - Getting a single cat

describe('GET /companies/:code', function () {
  //- What finding successfully looks like
  test('Gets single company', async function () {
    const resp = await request(app).get('/companies/test_code');
    const testCompanyAnswer =
    {
      company:
      {
        code: 'test_code',
        name: 'test_name',
        description: 'test_description',
        invoices: []
      }

    };
    console.log(resp.body);
    expect(resp.body).toEqual(testCompanyAnswer);
  });

  //     - What finding successfully looks like

});
//     - What finding successfully looks like
//     - What happens when it is not found
// - Deleting a cat
//     - What deleting successfully looks like
//     - What happens when it is not found
// - Adding a cat
//     - What creating successfully looks like
//     - What happens when you create a duplicate cat
//     - What happens when you are missing required data









































