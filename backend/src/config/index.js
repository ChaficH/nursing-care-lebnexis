require("dotenv").config();




console.log("POSTGRES_USER:", process.env.POSTGRES_USER);
console.log("POSTGRES_DB:", process.env.POSTGRES_DB);
console.log("POSTGRES_PASSWORD EXISTS:", !!process.env.POSTGRES_PASSWORD);
console.log("POSTGRES_PORT:", process.env.POSTGRES_PORT);



module.exports = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || process.env.BACKEND_PORT || "3000", 10),

  database: {
    // Prefer an explicit connection string (DATABASE_URL) if provided.
    connectionString: process.env.DATABASE_URL,
    user: process.env.POSTGRES_USER,
    host: process.env.PGHOST || "localhost",
    database: process.env.PGDATABASE || process.env.POSTGRES_DB,
    password: process.env.PGPASSWORD || process.env.POSTGRES_PASSWORD,
    port: parseInt(
      process.env.PGPORT || process.env.POSTGRES_PORT || "5432",
      10
    ),
    ssl: process.env.PGSSL === "true",
    max: parseInt(process.env.PGPOOL_MAX || "10", 10),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  },

  jwt: {
    secret: process.env.JWT_SECRET || "change-me-in-production",
    expiresIn: process.env.JWT_EXPIRES_IN || "12h",
  },

  mlServiceUrl: process.env.ML_SERVICE_URL || "http://localhost:8000",
};
