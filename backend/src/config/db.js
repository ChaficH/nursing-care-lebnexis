const { Pool } = require("pg");
const config = require("./index");

const poolConfig = { ...config.database };

// If DATABASE_URL / connectionString is set, pg accepts it directly, but we
// can still pass the individual PG vars as fallback. Prefer connectionString.
if (poolConfig.connectionString) {
  delete poolConfig.user;
  delete poolConfig.host;
  delete poolConfig.database;
  delete poolConfig.password;
  delete poolConfig.port;
} else {
  delete poolConfig.connectionString;
}

// ssl: node-postgres accepts boolean|object; only include when explicitly set.
if (!poolConfig.ssl) {
  delete poolConfig.ssl;
}

const pool = new Pool(poolConfig);

pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client", err.stack);
});

/** Run a single parameterized query. */
async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.DEBUG_SQL === "true") {
    console.log("Executed", { text, params, duration: `${duration}ms` });
  }
  return res;
}

/**
 * Execute a callback within a DB transaction.
 * Usage:
 *   await withTransaction(async (client) => {
 *     await client.query("INSERT ...", [...]);
 *   });
 */
async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { pool, query, withTransaction };
