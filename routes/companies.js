/** Routes for companies of biztime. */

import express from "express";
import db from "../db.js";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../expressError.js";

const companies = express.Router();


/** GET / - returns `{companies: [{code, name}, ...]}` */
companies.get("",
  async function (req, res, next) {

    const results = await db.query(
      `SELECT code, name
        FROM companies
        ORDER BY code`);
    const companies = results.rows;

    return res.json({ companies });
  });

/** GET /[code] - return data about one company:
 * input: code
 * `{company: {code, name, description, invoices}}` */

companies.get("/:code",
  async function (req, res, next) {
    const code = req.params.code;

    const results = await db.query(
      `SELECT code, name, description
       FROM companies
       WHERE code = $1`, [code]);
    const company = results.rows[0];

    if (!company) throw new NotFoundError(`No matching company: ${code}`);

    const invoices = await db.query(
      `SELECT id
        FROM invoices
        WHERE invoices.comp_code = $1`, [code]);

    company.invoices = invoices.rows.map(invoice => invoice.id);

    return res.json({ company });

  });

/** POST - add a company to the database
 *Input: code, name, description into json body
 *Output:  `{company: {code, name, description}}` */

companies.post('', async function (req, res, next) {

  if (
    !req.body ||
    req.body.code === undefined ||
    req.body.name === undefined ||
    req.body.description === undefined) {
    throw new BadRequestError();
  }

  const { code, name, description } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO companies (code, name, description)
        VALUES ($1, $2, $3)
        RETURNING code, name, description`,
      [code, name, description]
    );

    const newCompany = result.rows[0];

    return res.status(201).json({ company: newCompany });

  } catch (err) {

    if (err.detail.includes("already exists")) {
      throw new UnauthorizedError();
    }

  }



});

/** PUT /[code] - update a company to the database:
 * Input: code
 * Output: `{company: {code, name, description}}` */

companies.put('/:code', async function (req, res, next) {

  if (
    !req.body ||
    req.body.name === undefined ||
    req.body.description === undefined) {
    throw new BadRequestError();
  }

  const code = req.params.code;
  const { name, description } = req.body;

  const result = await db.query(
    `UPDATE companies
      SET name=$1, description=$2
      WHERE code = $3
      RETURNING code, name, description`,
    [name, description, code]
  );
  const changedCompany = result.rows[0];

  if (!changedCompany) throw new NotFoundError(`No matching company: ${code}`);

  return res.json({ company: changedCompany });
});

/** Delete company,
 * input company "code"
 * returning {status: "deleted"} */

companies.delete("/:code", async function (req, res, next) {

  const code = req.params.code;

  const result = await db.query(
    `DELETE FROM companies
      WHERE code = $1
      RETURNING code, name, description`,
    [code],
  );
  const deletedCompany = result.rows[0];
  if (!deletedCompany) throw new NotFoundError(`No matching company: ${code}`);

  return res.json({ status: "deleted" });
});

export default companies;