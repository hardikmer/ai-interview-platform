import { neon } from "@neondatabase/serverless"

// Get a direct database connection
const getDirectDbConnection = () => {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set")
  }
  return neon(connectionString)
}

// Check if a table exists
export async function checkTableExists(tableName: string) {
  try {
    console.log(`Checking if table ${tableName} exists...`)
    const sql = getDirectDbConnection()

    // Use pg_tables to check if the table exists (more reliable than information_schema)
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = ${tableName}
      );
    `

    const exists = result[0]?.exists || false
    console.log(`Table ${tableName} exists: ${exists}`)

    if (exists) {
      // Get column count
      const columns = await sql`
        SELECT COUNT(*) as count
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = ${tableName};
      `
      const columnCount = columns[0]?.count || 0
      console.log(`Table ${tableName} has ${columnCount} columns`)

      return {
        success: true,
        exists,
        columnCount,
      }
    }

    return {
      success: true,
      exists,
      columnCount: 0,
    }
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error)
    return {
      success: false,
      exists: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// List all tables in the database
export async function listAllTables() {
  try {
    console.log("Listing all tables in the database...")
    const sql = getDirectDbConnection()

    const result = await sql`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `

    const tables = result.map((row) => row.tablename)
    console.log("Tables in database:", tables)

    return {
      success: true,
      tables,
    }
  } catch (error) {
    console.error("Error listing tables:", error)
    return {
      success: false,
      tables: [],
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Create the job_postings table
export async function createJobPostingsTable() {
  try {
    console.log("Creating job_postings table...")
    const sql = getDirectDbConnection()

    // Check if table exists first
    const tableExists = await checkTableExists("job_postings")
    if (tableExists.exists) {
      return {
        success: true,
        message: "Table already exists",
      }
    }

    // Create the job_postings table
    await sql`
      CREATE TABLE job_postings (
        id SERIAL PRIMARY KEY,
        company_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        location VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        salary_min INTEGER NOT NULL,
        salary_max INTEGER NOT NULL,
        interview_mode VARCHAR(50) NOT NULL,
        min_iq_score INTEGER NOT NULL DEFAULT 0,
        min_domain_score INTEGER NOT NULL DEFAULT 0,
        active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create the job_skills table
    await sql`
      CREATE TABLE IF NOT EXISTS job_skills (
        id SERIAL PRIMARY KEY,
        job_id INTEGER NOT NULL,
        skill VARCHAR(100) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(job_id, skill)
      )
    `

    // Create the job_mysteries table
    await sql`
      CREATE TABLE IF NOT EXISTS job_mysteries (
        id SERIAL PRIMARY KEY,
        job_id INTEGER NOT NULL,
        mystery_id INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(job_id, mystery_id)
      )
    `

    console.log("Job tables created successfully")

    return {
      success: true,
      message: "Tables created successfully",
    }
  } catch (error) {
    console.error("Error creating job_postings table:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
