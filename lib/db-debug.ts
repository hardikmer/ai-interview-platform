import { getDbClient } from "./db"

export async function checkTableStructure(tableName: string) {
  try {
    const sql = getDbClient()
    if (!sql) {
      return { success: false, message: "No database connection available" }
    }

    // Check if table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = ${tableName}
      );
    `

    const tableExists = tableCheck[0]?.exists || false

    if (!tableExists) {
      return {
        success: false,
        message: `Table ${tableName} does not exist`,
        exists: false,
      }
    }

    // Get table columns
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = ${tableName}
      ORDER BY ordinal_position;
    `

    return {
      success: true,
      exists: true,
      columns,
      message: `Found ${columns.length} columns in ${tableName}`,
    }
  } catch (error) {
    console.error(`Error checking table structure for ${tableName}:`, error)
    return {
      success: false,
      message: `Error checking table structure: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

export async function createJobPostingsTable() {
  try {
    const sql = getDbClient()
    if (!sql) {
      return { success: false, message: "No database connection available" }
    }

    // Drop the table if it exists
    await sql`DROP TABLE IF EXISTS job_postings CASCADE`

    // Create the table with a simplified structure
    await sql`
      CREATE TABLE job_postings (
        id SERIAL PRIMARY KEY,
        company_id INTEGER NOT NULL,
        company_name VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        location VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        salary_min INTEGER NOT NULL,
        salary_max INTEGER NOT NULL,
        interview_mode VARCHAR(50) NOT NULL,
        min_iq_score INTEGER NOT NULL DEFAULT 0,
        min_domain_score INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        skills TEXT
      )
    `

    return { success: true, message: "job_postings table created successfully" }
  } catch (error) {
    console.error("Error creating job_postings table:", error)
    return {
      success: false,
      message: `Error creating table: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

export async function testInsertJob() {
  try {
    const sql = getDbClient()
    if (!sql) {
      return { success: false, message: "No database connection available" }
    }

    // Try a simple insert
    const result = await sql`
      INSERT INTO job_postings (
        company_id, company_name, title, description, location, category, 
        salary_min, salary_max, interview_mode, min_iq_score, min_domain_score, active, skills
      ) VALUES (
        1, 'Test Company', 'Test Job', 'Test Description', 'Remote', 'development',
        50000, 100000, 'mystery-points', 70, 70, true, '["javascript", "react"]'
      ) RETURNING id, created_at
    `

    if (!result || result.length === 0) {
      return { success: false, message: "Insert failed - no rows returned" }
    }

    return {
      success: true,
      message: "Test insert successful",
      id: result[0].id,
      result,
    }
  } catch (error) {
    console.error("Error in test insert:", error)
    return {
      success: false,
      message: `Error in test insert: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}
