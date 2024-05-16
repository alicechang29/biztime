/** Routes for companies of biztime. */

import express from "express";
import db from "../db.js";
import { BadRequestError } from "../expressError.js";

const router = express.Router();

router.get("",
  async function (req, res, next) {

    const results = await db.query(
      `SELECT code, name
       FROM companies`);
    const companies = results.rows;
    return res.json({ companies });
  });

router.get("/:code",
  async function (req, res, next) {
    if (req.body === undefined) throw new BadRequestError();
    const code = req.params.code;

    const results = await db.query(
      `SELECT code, name, description
       FROM companies
       WHERE code = $1`, [code]);
    const company = results.rows[0];
    return res.json({ company });
  });


export default router;