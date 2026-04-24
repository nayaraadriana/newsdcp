const { neon } = require('@neondatabase/serverless');

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    await sql`ALTER TABLE clicks ALTER COLUMN recipient_id DROP NOT NULL`;
    console.log("Success: recipient_id is now nullable in clicks table.");
  } catch (err) {
    console.error("Error altering table:", err);
  }
}

main();
