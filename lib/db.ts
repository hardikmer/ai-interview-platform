import { neon } from "@neondatabase/serverless"

// Create a singleton SQL client
const sqlClient: ReturnType<typeof neon> | null = null

// Function to get the database URL
function getDatabaseUrl() {
  // Check for the DATABASE_URL environment variable
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL

  if (!dbUrl) {
    console.warn("No database URL environment variable found")
    return null
  }

  return dbUrl
}

// Function to get the database client
// Function to get the database client
let sql: ReturnType<typeof neon> | null = null

export function getDbClient() {
  if (!sql) {
    try {
      const connectionString = process.env.DATABASE_URL
      if (!connectionString) {
        console.error("DATABASE_URL environment variable is not set")
        return null
      }

      console.log("Creating new database connection")
      sql = neon(connectionString)
    } catch (error) {
      console.error("Error creating database connection:", error)
      return null
    }
  }
  return sql
}

// Helper function to execute raw SQL queries with better error handling
export async function executeQuery<T = any>(query: string, params: any[] = []): Promise<T> {
  try {
    const sql = getDbClient()
    if (!sql) {
      throw new Error("No database connection available")
    }

    // Use the tagged template literal syntax for Neon
    // This is a workaround to convert from parameterized queries to tagged template literals
    let paramIndex = 0
    const taggedQuery = query.replace(/\$\d+/g, () => `$${params[paramIndex++]}`)

    // Execute the query using tagged template literals
    return (await sql(taggedQuery)) as T
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// Function to check if the database is connected
// Function to check if the database is connected
export async function checkDatabaseConnection() {
  try {
    const sql = getDbClient()
    if (!sql) {
      return { connected: false, message: "No database client available" }
    }

    // Try a simple query to check connection
    const result = await sql`SELECT 1 as connection_test`
    return {
      connected: result && result.length > 0 && result[0].connection_test === 1,
      message: "Database connection successful",
    }
  } catch (error) {
    console.error("Database connection check failed:", error)
    return {
      connected: false,
      message: `Database connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

// User-related database functions
export async function getUserByEmail(email: string) {
  try {
    const sql = getDbClient()
    if (!sql) throw new Error("No database connection available")

    const result = await sql`
      SELECT * FROM users 
      WHERE email = ${email}
      LIMIT 1
    `
    return result[0] || null
  } catch (error) {
    console.error("Error getting user by email:", error)
    return null
  }
}

export async function getUserById(id: string | number) {
  try {
    const sql = getDbClient()
    if (!sql) throw new Error("No database connection available")

    const result = await sql`
      SELECT * FROM users 
      WHERE id = ${id}
      LIMIT 1
    `
    return result[0] || null
  } catch (error) {
    console.error("Error getting user by ID:", error)
    return null
  }
}

export async function createUser(user: {
  name: string
  email: string
  password_hash: string
  role: string
}) {
  try {
    const sql = getDbClient()
    if (!sql) throw new Error("No database connection available")

    const result = await sql`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (${user.name}, ${user.email}, ${user.password_hash}, ${user.role})
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("Error creating user:", error)
    throw error
  }
}

// Mystery-related database functions
export async function getAllMysteries() {
  try {
    const sql = getDbClient()
    if (!sql) throw new Error("No database connection available")

    console.log("Fetching all mysteries from database...")
    const result = await sql`
      SELECT m.*, 
             array_agg(DISTINCT ms.skill) FILTER (WHERE ms.skill IS NOT NULL) as skills
      FROM mysteries m
      LEFT JOIN mystery_skills ms ON m.id = ms.mystery_id
      GROUP BY m.id
      ORDER BY m.created_at DESC
    `
    console.log(`Retrieved ${result.length} mysteries from database`)
    return result
  } catch (error) {
    console.error("Error getting all mysteries:", error)
    return []
  }
}

export async function getMysteryBySlug(slug: string) {
  try {
    const sql = getDbClient()
    if (!sql) throw new Error("No database connection available")

    console.log(`Fetching mystery with slug: ${slug}`)
    const result = await sql`
      SELECT m.*, 
             array_agg(DISTINCT ms.skill) FILTER (WHERE ms.skill IS NOT NULL) as skills
      FROM mysteries m
      LEFT JOIN mystery_skills ms ON m.id = ms.mystery_id
      WHERE m.slug = ${slug}
      GROUP BY m.id
    `
    console.log(`Mystery found: ${result.length > 0}`)
    return result[0] || null
  } catch (error) {
    console.error("Error getting mystery by slug:", error)
    return null
  }
}

export async function getMysteryById(id: number) {
  try {
    const sql = getDbClient()
    if (!sql) throw new Error("No database connection available")

    const result = await sql`
      SELECT m.*, 
             array_agg(DISTINCT ms.skill) FILTER (WHERE ms.skill IS NOT NULL) as skills
      FROM mysteries m
      LEFT JOIN mystery_skills ms ON m.id = ms.mystery_id
      WHERE m.id = ${id}
      GROUP BY m.id
    `
    return result[0] || null
  } catch (error) {
    console.error("Error getting mystery by ID:", error)
    return null
  }
}

export async function getChallengesByMysteryId(mysteryId: number) {
  try {
    const sql = getDbClient()
    if (!sql) throw new Error("No database connection available")

    console.log(`Fetching challenges for mystery ID: ${mysteryId}`)
    const result = await sql`
      SELECT *
      FROM mystery_challenges
      WHERE mystery_id = ${mysteryId}
      ORDER BY order_index ASC
    `
    console.log(`Retrieved ${result.length} challenges for mystery ID: ${mysteryId}`)
    return result
  } catch (error) {
    console.error(`Error getting challenges for mystery ID ${mysteryId}:`, error)
    return []
  }
}

// Update the getChallengesByMysterySlug function to add more detailed logging and better error handling

export async function getChallengesByMysterySlug(slug: string) {
  try {
    const sql = getDbClient()
    if (!sql) throw new Error("No database connection available")

    console.log(`Fetching challenges for mystery slug: ${slug}`)

    // First check if the mystery exists
    const mysteryCheck = await sql`
      SELECT id FROM mysteries WHERE slug = ${slug} LIMIT 1
    `

    if (mysteryCheck.length === 0) {
      console.warn(`Mystery with slug "${slug}" not found in database`)
      return []
    }

    const mysteryId = mysteryCheck[0].id
    console.log(`Found mystery with ID: ${mysteryId}, fetching challenges...`)

    const result = await sql`
      SELECT mc.*
      FROM mystery_challenges mc
      WHERE mc.mystery_id = ${mysteryId}
      ORDER BY mc.order_index ASC
    `

    console.log(`Retrieved ${result.length} challenges for mystery slug: ${slug}`)

    // If no challenges found, log a warning
    if (result.length === 0) {
      console.warn(`No challenges found for mystery with slug "${slug}" (ID: ${mysteryId})`)
    }

    return result
  } catch (error) {
    console.error(`Error getting challenges by mystery slug ${slug}:`, error)
    return []
  }
}

export async function getUserCompletedMysteries(userId: number) {
  try {
    const sql = getDbClient()
    if (!sql) throw new Error("No database connection available")

    console.log(`Fetching completed mysteries for user ID: ${userId}`)
    const result = await sql`
      SELECT m.slug
      FROM user_mysteries um
      JOIN mysteries m ON um.mystery_id = m.id
      WHERE um.user_id = ${userId} AND um.status = 'completed'
    `
    console.log(`Retrieved ${result.length} completed mysteries for user ID: ${userId}`)
    return result.map((row) => row.slug)
  } catch (error) {
    console.error(`Error getting completed mysteries for user ID ${userId}:`, error)
    return []
  }
}

export async function updateMysteryProgress(userId: number, mysteryId: number, status: string, score?: number) {
  try {
    const sql = getDbClient()
    if (!sql) throw new Error("No database connection available")

    // Check if progress already exists
    const existingProgress = await sql`
      SELECT * FROM user_mysteries
      WHERE user_id = ${userId} AND mystery_id = ${mysteryId}
      LIMIT 1
    `

    if (existingProgress.length > 0) {
      // Update existing progress
      const completed = status === "completed"
      const result = await sql`
        UPDATE user_mysteries
        SET status = ${status}, 
            score = ${score || existingProgress[0].score}, 
            completed_at = ${completed ? new Date() : null}
        WHERE user_id = ${userId} AND mystery_id = ${mysteryId}
        RETURNING *
      `
      return result[0]
    } else {
      // Create new progress
      const completed = status === "completed"
      const result = await sql`
        INSERT INTO user_mysteries (user_id, mystery_id, status, score, completed_at)
        VALUES (${userId}, ${mysteryId}, ${status}, ${score || 0}, ${completed ? new Date() : null})
        RETURNING *
      `
      return result[0]
    }
  } catch (error) {
    console.error("Error updating mystery progress:", error)
    throw error
  }
}

// Job-related database functions
export async function getAllJobs() {
  try {
    const sql = getDbClient()
    if (!sql) throw new Error("No database connection available")

    const result = await sql`
      SELECT j.*, 
             c.name as company_name,
             array_agg(DISTINCT js.skill) FILTER (WHERE js.skill IS NOT NULL) as skills
      FROM job_postings j
      JOIN companies c ON j.company_id = c.id
      LEFT JOIN job_skills js ON j.id = js.job_id
      GROUP BY j.id, c.name
      ORDER BY j.created_at DESC
    `
    console.log("Database jobs query result:", result.length)
    return result
  } catch (error) {
    console.error("Error getting all jobs:", error)
    return []
  }
}

export async function getJobById(id: number) {
  try {
    const sql = getDbClient()
    if (!sql) throw new Error("No database connection available")

    const result = await sql`
      SELECT j.*, 
             c.name as company_name,
             array_agg(DISTINCT js.skill) FILTER (WHERE js.skill IS NOT NULL) as skills
      FROM job_postings j
      JOIN companies c ON j.company_id = c.id
      LEFT JOIN job_skills js ON j.id = js.job_id
      WHERE j.id = ${id}
      GROUP BY j.id, c.name
    `
    return result[0] || null
  } catch (error) {
    console.error("Error getting job by ID:", error)
    return null
  }
}

// Application-related database functions
export async function applyToJob(application: {
  job_id: number
  user_id: number
  status: string
  screening_passed: boolean
}) {
  try {
    const sql = getDbClient()
    if (!sql) throw new Error("No database connection available")

    const result = await sql`
      INSERT INTO job_applications (job_id, user_id, status, screening_passed)
      VALUES (${application.job_id}, ${application.user_id}, ${application.status}, ${application.screening_passed})
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("Error applying to job:", error)
    throw error
  }
}

export async function updateApplicationStatus(id: number, status: string) {
  try {
    const sql = getDbClient()
    if (!sql) throw new Error("No database connection available")

    const result = await sql`
      UPDATE job_applications
      SET status = ${status}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("Error updating application status:", error)
    throw error
  }
}

// Add this function to check what's in the challenges table
export async function debugChallengesTable() {
  try {
    const sql = getDbClient()
    if (!sql) throw new Error("No database connection available")

    console.log("Checking challenges table...")
    const result = await sql`
      SELECT mystery_slug, COUNT(*) as count 
      FROM challenges 
      GROUP BY mystery_slug
    `
    console.log("Challenges in database by mystery_slug:", result)
    return result
  } catch (error) {
    console.error("Error debugging challenges table:", error)
    return []
  }
}
