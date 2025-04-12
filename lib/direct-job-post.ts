import { getDbClient } from "./db"
import { getTableColumns, dropTable } from "./db-inspector"

export interface JobData {
  company_id: number
  company_name: string
  title: string
  description: string
  location: string
  category: string
  salary_min: number
  salary_max: number
  interview_mode: string
  min_iq_score: number
  min_domain_score: number
  skills: string[]
}

export async function recreateJobPostingsTable() {
  try {
    const sql = getDbClient()
    if (!sql) {
      return { success: false, error: "No database connection available" }
    }

    // Drop the table if it exists
    await dropTable("job_postings")

    // Create the table with the correct structure matching the existing schema
    await sql`
      CREATE TABLE job_postings (
        id SERIAL PRIMARY KEY,
        company_id INTEGER,
        company_name VARCHAR(255),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        location VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        salary_min INTEGER NOT NULL,
        salary_max INTEGER NOT NULL,
        interview_mode VARCHAR(50) NOT NULL,
        custom_mystery_ids TEXT[], 
        min_iq_score INTEGER NOT NULL DEFAULT 0,
        min_domain_score INTEGER NOT NULL DEFAULT 0,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        skills TEXT
      )
    `

    return { success: true, message: "Table recreated successfully" }
  } catch (error) {
    console.error("Error recreating job_postings table:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function createJobPostingsTable() {
  try {
    const sql = getDbClient()
    if (!sql) {
      return { success: false, error: "No database connection available" }
    }

    // Check if table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'job_postings'
      );
    `

    if (tableExists[0]?.exists) {
      return { success: true, message: "Table already exists" }
    }

    // Create the table with the correct structure
    await sql`
      CREATE TABLE job_postings (
        id SERIAL PRIMARY KEY,
        company_id INTEGER,
        company_name VARCHAR(255),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        location VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        salary_min INTEGER NOT NULL,
        salary_max INTEGER NOT NULL,
        interview_mode VARCHAR(50) NOT NULL,
        custom_mystery_ids TEXT[], 
        min_iq_score INTEGER NOT NULL DEFAULT 0,
        min_domain_score INTEGER NOT NULL DEFAULT 0,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        skills TEXT
      )
    `

    return { success: true, message: "Table created successfully" }
  } catch (error) {
    console.error("Error creating job_postings table:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function directPostJob(job: JobData) {
  try {
    console.log("Attempting direct job post:", job)

    const sql = getDbClient()
    if (!sql) {
      return { success: false, error: "No database connection available" }
    }

    // Get the actual table structure
    const tableInfo = await getTableColumns("job_postings")

    if (!tableInfo.success) {
      // Table doesn't exist, create it
      const createResult = await createJobPostingsTable()
      if (!createResult.success) {
        return { success: false, error: `Failed to create table: ${createResult.error}` }
      }
    }

    // Convert skills array to JSON string
    const skillsJson = JSON.stringify(job.skills)

    // Using tagged template literals for Neon SQL
    // Now including the company_name column
    const result = await sql`
      INSERT INTO job_postings (
        company_id, 
        company_name,
        title, 
        description, 
        location, 
        category, 
        salary_min, 
        salary_max, 
        interview_mode, 
        min_iq_score, 
        min_domain_score, 
        active,
        skills
      ) VALUES (
        ${job.company_id}, 
        ${job.company_name},
        ${job.title}, 
        ${job.description}, 
        ${job.location}, 
        ${job.category}, 
        ${job.salary_min}, 
        ${job.salary_max}, 
        ${job.interview_mode}, 
        ${job.min_iq_score}, 
        ${job.min_domain_score}, 
        ${true},
        ${skillsJson}
      ) RETURNING id
    `

    console.log("Direct job post result:", result)

    if (!result || result.length === 0) {
      return { success: false, error: "No result returned from database" }
    }

    const jobId = result[0]?.id
    if (jobId === undefined || jobId === null) {
      return { success: false, error: "No ID returned from database" }
    }

    return { success: true, jobId }
  } catch (error) {
    console.error("Error in direct job post:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function listAllJobs() {
  try {
    const sql = getDbClient()
    if (!sql) {
      return { success: false, error: "No database connection available", jobs: [] }
    }

    // Check if table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'job_postings'
      );
    `

    if (!tableExists[0]?.exists) {
      return { success: true, message: "Table doesn't exist yet", jobs: [] }
    }

    // Get all jobs
    const jobs = await sql`
      SELECT * FROM job_postings ORDER BY created_at DESC
    `

    // Process jobs to ensure consistent format
    const processedJobs = jobs.map((job) => {
      // Parse skills if it's stored as JSON
      let skills = job.skills || []
      if (typeof skills === "string") {
        try {
          skills = JSON.parse(skills)
        } catch (e) {
          console.warn(`Failed to parse skills for job ${job.id}:`, e)
          skills = []
        }
      }

      return {
        ...job,
        skills,
        active: job.active !== false, // Ensure active is a boolean
        created_at: job.created_at || new Date().toISOString(),
      }
    })

    return { success: true, jobs: processedJobs }
  } catch (error) {
    console.error("Error listing jobs:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      jobs: [],
    }
  }
}

export async function listAllCompanies() {
  try {
    const sql = getDbClient()
    if (!sql) {
      return { success: false, error: "No database connection available", companies: [] }
    }

    // Check if companies table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'companies'
      );
    `

    if (!tableExists[0]?.exists) {
      return { success: true, message: "Companies table doesn't exist yet", companies: [] }
    }

    // Get all companies
    const companies = await sql`
      SELECT id, name, industry, size FROM companies ORDER BY name
    `

    return { success: true, companies }
  } catch (error) {
    console.error("Error listing companies:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      companies: [],
    }
  }
}
