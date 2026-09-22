const { neon } = require("@neondatabase/serverless");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, ".env") });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL missing");
}

const sql = neon(process.env.DATABASE_URL, {
  fetchOptions: {
    timeout: 60000, 
  },
  pool: {
    max: 10,             
    idleTimeoutMillis: 30000, 
  },
});

module.exports = { sql };
