import postgres from 'postgres'
import dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('No DATABASE_URL')

const sql = postgres(connectionString, {
  max: 1,
  prepare: false,
  ssl: { rejectUnauthorized: false },
})

async function main() {
  console.log('Checking foreign key constraints...')
  try {
    const constraints = await sql`
            SELECT
                tc.table_name, 
                kcu.column_name, 
                ccu.table_name AS foreign_table_name,
                rc.delete_rule 
            FROM 
                information_schema.table_constraints AS tc 
                JOIN information_schema.key_column_usage AS kcu
                  ON tc.constraint_name = kcu.constraint_name
                  AND tc.table_schema = kcu.table_schema
                JOIN information_schema.referential_constraints AS rc
                  ON tc.constraint_name = rc.constraint_name
                JOIN information_schema.constraint_column_usage AS ccu
                  ON ccu.constraint_name = tc.constraint_name
                  AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name IN ('contacts', 'runs', 'reports');
        `
    console.log('Constraints:', constraints)
  } catch (e) {
    console.error('Error:', e)
  } finally {
    await sql.end()
  }
}

main()
