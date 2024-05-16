/** Routes for companies of biztime. */

import express from "express";
import db from "../db.js";
import { BadRequestError } from "../expressError.js";

const router = express.Router();

/** GET / - returns `{companies: [{code, name}, ...]}` */
router.get("",
  async function (req, res, next) {

    const results = await db.query(
      `SELECT code, name
       FROM companies`);
    const companies = results.rows;
    return res.json({ companies });
  });

/** GET /[code] - return data about one company:
 * `{company: {code, name, description}}` */

router.get("/:code",
  async function (req, res, next) {
    const code = req.params.code;

    const results = await db.query(
      `SELECT code, name, description
       FROM companies
       WHERE code = $1`, [code]);
    const company = results.rows[0];
    return res.json({ company });
  });


router.post('', async function (req, res, next) {
  if (req.body === undefined) throw new BadRequestError();
  const { code, name, description } = req.body;
  const result = await db.query(
    `INSERT INTO companies (code, name, description)
     VALUES ($1, $2, $3) RETURNING code, name, description`,
    [code, name, description]
  );

  const newCompany = result.rows[0];
  return res.status(201).json({ company: newCompany });
});

router.put('/:code', async function (req, res, next) {
  if (req.body === undefined) throw new BadRequestError();

  const code = req.params.code;
  const { name, description } = req.body;

  const result = await db.query(
    `UPDATE companies
     SET name=$1, description=$2
     WHERE code = $3 RETURNING code, name, description`,
    [name, description, code]
  );

  const changedCompany = result.rows[0];
  if (!changedCompany) throw new NotFoundError(`No matching company: ${code}`);

  return res.json({ company: changedCompany });
});

export default router;