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



// - Getting all companies
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


// - Getting a single companies

describe('GET /companies/:code', function () {
  test('Successfully gets single company', async function () {
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

  test('Return 404 if company not found', async function () { //TODO: be explicit in how you are failing (400 404, bad request, etc)
    const resp = await request(app).get('/companies/bad_code');

    expect(resp.statusCode).toEqual(404);

  });

});


describe('POST /companies', function () {

  test('Successfully adds single company', async function () {
    const testCompany2 =
    {
      code: 'test_code2',
      name: 'test_name2',
      description: 'test_description2',
    };

    const resp = await request(app)
      .post('/companies')
      .send(testCompany2);

    console.log(resp.body);
    expect(resp.body).toEqual({ company: testCompany2 }); //FIXME: don't need to put quotes around keys in javascript
  });

  test('Returns 400 for empty request body', async function () { //TODO: return 400 for empty request body
    const testCompany2 = {};
    const resp = await request(app)
      .post('/companies')
      .send(testCompany2);

    expect(resp.statusCode).toEqual(400);

  });

  test('Returns 400 if missing required data', async function () {
    const testCompany2 =
    {
      name: 'test_name2',
      description: 'test_description2',
    };

    const resp = await request(app)
      .post('/companies')
      .send(testCompany2);

    expect(resp.statusCode).toEqual(400);

  });

  test('Returns 404 if attempting to create already existing company', async function () { //TODO: describe failure properly
    const duplicateCompany = {
      code: 'test_code',
      name: 'test_name',
      description: 'test_description',
      invoices: []
    };
    const resp = await request(app)
      .post('/companies')
      .send(duplicateCompany);

    expect(resp.statusCode).toEqual(401);

  });

});

describe('PUT /companies', function () { //FIXME: THIS IS A PUT
  test('Successfully updates a single company', async function () {
    const testCompany2 =
    {
      code: 'test_code2',
      name: 'test_walmart',
      description: 'test_description2',
    };

    const resp = await request(app)
      .put('/companies/test_code') //FIXME: THIS IS A PUT
      .send(testCompanyAnswer);

    console.log(resp.body);
    expect(resp.body).toEqual({ "company": testCompanyAnswer });
  });

  test('Fails to update a single company', async function () {
    const resp = await request(app).post('/companies/test_code2');  //FIXME: THIS IS A PUT

    expect(resp.statusCode).toEqual(400);

  });

});



// - Deleting a cat
//     - What deleting successfully looks like
//     - What happens when it is not found










































