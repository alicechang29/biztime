/** Database setup for BizTime. */

import pg from "pg"; //importing pg from pg in node_modules
const { Client } = pg; //destructuring Client class from pg

//checks which environment you are in (test or not)
const DB_URI = process.env.NODE_ENV === "test"  // 1 - checking if using test DB or regular DB
  ? "postgresql:///biztime_test"
  : "postgresql:///biztime";

//creating a new client class that has connection to the DB
const db = new Client({
  connectionString: DB_URI,
});

//connect to the server
await db.connect();                             // 2

export default db;                              // 3