/** Routes for invoices of biztime. */

import express from "express";
import db from "../db.js";
import { BadRequestError, NotFoundError } from "../expressError.js";

const invoices = express.Router();


/** GET / - returns `{invoices: [{id, comp_name}, ...]}` */
invoices.get("",
  async function (req, res, next) {

    const results = await db.query(
      `SELECT id, comp_code
        FROM invoices
        ORDER BY id`);
    const invoices = results.rows;

    return res.json({ invoices });
  });

/** GET /[id] - return data about one company:
 * input: id
 * return:
 * `{invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}}`
 * */

invoices.get("/:id",
  async function (req, res, next) {
    const id = req.params.id;

    const results = await db.query(
      `SELECT i.id,
                i.amt,
                i.paid,
                i.add_date,
                i.paid_date,
                i.comp_code,
                c.name.
                c.description
        FROM invoices i
                JOIN companies c
                  ON i.comp_code = c.code
        WHERE id = $1`, [id]);

    const data = results.rows[0];

    if (!data) throw new NotFoundError(`No matching invoice: #${id}`);

    const invoice = {
      id: data.id,
      amt: data.amt,
      paid: data.paid,
      add_date: data.add_date,
      paid_date: data.paid_date,
      company: {
        name: data.name,
        description: data.description
      }
    };

    return res.json({ invoice });
  });

/** POST - add an invoice to db
 *Input: comp_code, amt into json body
 *Output:  `{invoice: {id, comp_code, amt, paid, add_date, paid_date}}` */

invoices.post('', async function (req, res, next) {

  if (
    !req.body ||
    req.body.comp_code === undefined ||
    req.body.amt === undefined ||
    isNaN(Number(req.body.amt))) {
    throw new BadRequestError();
  }

  const { comp_code, amt } = req.body;

  const companyResult = await db.query(
    `SELECT code
       FROM companies
       WHERE code = $1`, [comp_code]);
  const company = companyResult.rows[0];
  if (!company) throw new NotFoundError();


  const result = await db.query(
    `INSERT INTO invoices (comp_code, amt)
      VALUES ($1, $2)
      RETURNING id, comp_code, amt, paid, add_date, paid_date`,
    [comp_code, amt]
  );
  const invoice = result.rows[0];
  //TODO: can check the error.message to catch that error without having to write a query to search for company

  return res.status(201).json({ invoice });
});

/** PUT /[code] - update a company to the database:
 * Input: code
 * Output: `{company: {code, name, description}}` */

invoices.put('/:id', async function (req, res, next) {

  if (
    !req.body ||
    req.body.amt === undefined ||
    isNaN(Number(req.body.amt))) {
    throw new BadRequestError();
  }

  const id = req.params.id;
  const { amt } = req.body;

  const result = await db.query(
    `UPDATE invoices
      SET amt = $1
      WHERE id = $2
      RETURNING id, comp_code, amt, paid, add_date, paid_date`,
    [amt, id]
  );
  const invoice = result.rows[0];

  if (!invoice) throw new NotFoundError(`No matching invoice: #${id}`);

  return res.json({ invoice });
});

/** Delete invoice,
 * input invoice id
 * returning {status: "deleted"} */

invoices.delete("/:id", async function (req, res, next) {

  const id = req.params.id;

  const result = await db.query(
    `DELETE FROM invoices
      WHERE id = $1
      RETURNING id`,
    [id],
  );
  const invoice = result.rows[0];
  if (!invoice) throw new NotFoundError(`No matching invoice: #${id}`);

  return res.json({ message: "deleted" });
});

export default invoices;