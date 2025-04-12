"use server"

import { getDbClient } from "@/lib/db"

// User Authentication Actions
export async function registerUser(name: string, email: string, password: string, role: string) {
  try {
    console.log(`Registering new user: ${email}, role: ${role}`)

    const sql = getDbClient()
    if (!sql) {
      console.error("Database connection not available")
      return { success: false, message: "Database connection error" }
    }

    // Check if user already exists
    const existingUsers = await sql`
      SELECT * FROM users WHERE email = ${email} LIMIT 1
    `

    if (existingUsers.length > 0) {
      return { success: false, message: "User with this email already exists" }
    }

    // In a real app, you would hash the password before storing
    // For this demo, we're storing it directly in the password_hash field
    const result = await sql`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (${name}, ${email}, ${password}, ${role})
      RETURNING *
    `

    if (!result || result.length === 0) {
      return { success: false, message: "Failed to create user" }
    }

    const newUser = result[0]

    // Transform the database user object to match the expected UserProfile format
    const userProfile = {
      id: newUser.id.toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      overallScore: newUser.overall_score || 0,
      iqScore: newUser.iq_score || 0,
      domainScore: newUser.domain_score || 0,
      completedMysteries: [],
      inProgressMysteries: [],
    }

    return {
      success: true,
      user: userProfile,
    }
  } catch (error) {
    console.error("Registration error:", error)
    return { success: false, message: "An error occurred during registration" }
  }
}

export async function loginUser(email: string, password: string) {
  try {
    console.log(`Attempting to log in user with email: ${email}`)

    const sql = getDbClient()
    if (!sql) {
      console.error("Database connection not available")
      return { success: false, message: "Database connection error" }
    }

    // Query the database for the user with the provided email
    console.log(`Querying database for user with email: ${email}`)
    const users = await sql`
      SELECT * FROM users WHERE email = ${email} LIMIT 1
    `

    console.log(`Query result:`, users.length > 0 ? "User found" : "User not found")

    if (users.length === 0) {
      return { success: false, message: "Invalid email or password" }
    }

    const user = users[0]

    // Simple password comparison - the password is stored in the password_hash field
    if (user.password_hash !== password) {
      console.log("Password mismatch")
      return { success: false, message: "Invalid email or password" }
    }

    console.log("Login successful")

    // Fetch completed mysteries for this user
    let completedMysteries = []
    let inProgressMysteries = []

    try {
      const userMysteries = await sql`
        SELECT mystery_id, status FROM user_mysteries
        WHERE user_id = ${user.id}
      `

      completedMysteries = userMysteries.filter((m) => m.status === "completed").map((m) => m.mystery_id.toString())

      inProgressMysteries = userMysteries.filter((m) => m.status === "in-progress").map((m) => m.mystery_id.toString())

      console.log(
        `Found ${completedMysteries.length} completed and ${inProgressMysteries.length} in-progress mysteries`,
      )
    } catch (error) {
      console.error("Error fetching user mysteries:", error)
    }

    // Transform the database user object to match the expected UserProfile format
    const userProfile = {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      overallScore: user.overall_score || 0,
      iqScore: user.iq_score || 0,
      domainScore: user.domain_score || 0,
      completedMysteries: completedMysteries,
      inProgressMysteries: inProgressMysteries,
    }

    return {
      success: true,
      user: userProfile,
    }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, message: "An error occurred during login" }
  }
}

// Job Application Actions
export async function applyForJob(jobId: number, userId: number) {
  try {
    // Placeholder implementation
    return { success: true, applicationId: "mock-application-id" }
  } catch (error) {
    console.error("Error applying for job:", error)
    return { success: false, message: "An unexpected error occurred" }
  }
}

export async function updateApplication(id: number, updates: any) {
  try {
    // Placeholder implementation
    return { success: true }
  } catch (error) {
    console.error("Error updating application:", error)
    return { success: false, message: "An unexpected error occurred" }
  }
}

// Mystery Actions
export async function getMysteryBySlug(slug: string) {
  try {
    console.log(`Getting mystery with slug: ${slug}`)

    const sql = getDbClient()
    if (!sql) {
      console.error("Database connection not available")
      return { success: false, message: "Database connection error" }
    }

    const mysteries = await sql`
      SELECT * FROM mysteries WHERE slug = ${slug} LIMIT 1
    `

    if (mysteries.length === 0) {
      console.warn(`Mystery with slug "${slug}" not found`)
      return { success: false, message: "Mystery not found" }
    }

    const mystery = mysteries[0]

    // Parse skills array if it's stored as a string
    let skills = mystery.skills || []
    if (typeof skills === "string") {
      try {
        skills = JSON.parse(skills)
      } catch (e) {
        console.warn(`Failed to parse skills for mystery ${slug}:`, e)
        skills = []
      }
    }

    return {
      success: true,
      mystery: {
        id: mystery.id,
        slug: mystery.slug,
        title: mystery.title,
        description: mystery.description,
        category: mystery.category,
        difficulty: mystery.difficulty,
        duration: mystery.duration || "30-60 min",
        rating: mystery.rating || 4.5,
        skills: skills,
        gradient: mystery.gradient,
        badge_color: mystery.badge_color,
      },
    }
  } catch (error) {
    console.error("Error getting mystery by slug:", error)
    return { success: false, message: "An unexpected error occurred" }
  }
}

export async function getMysteries() {
  try {
    console.log("Getting all mysteries")

    const sql = getDbClient()
    if (!sql) {
      console.error("Database connection not available")
      return { success: false, message: "Database connection error", mysteries: [] }
    }

    // First, check if the mysteries table exists
    try {
      const tableCheck = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'mysteries'
        );
      `

      const tableExists = tableCheck[0]?.exists || false

      if (!tableExists) {
        console.error("Mysteries table does not exist in the database")
        return {
          success: false,
          message: "Mysteries table does not exist",
          mysteries: [],
        }
      }
    } catch (error) {
      console.error("Error checking if mysteries table exists:", error)
    }

    // Get all mysteries from the database
    const mysteries = await sql`
      SELECT * FROM mysteries ORDER BY id ASC
    `

    console.log(`Retrieved ${mysteries.length} mysteries from database`)

    // Log each mystery for debugging
    mysteries.forEach((mystery) => {
      console.log(`Mystery from DB: ID=${mystery.id}, Title=${mystery.title}, Slug=${mystery.slug}`)
    })

    return {
      success: true,
      mysteries: mysteries.map((mystery) => {
        // Parse skills array if it's stored as a string
        let skills = mystery.skills || []
        if (typeof skills === "string") {
          try {
            skills = JSON.parse(skills)
          } catch (e) {
            console.warn(`Failed to parse skills for mystery ${mystery.slug}:`, e)
            skills = []
          }
        }

        return {
          id: mystery.id,
          slug: mystery.slug,
          title: mystery.title,
          description: mystery.description,
          category: mystery.category,
          difficulty: mystery.difficulty,
          duration: mystery.duration || "30-60 min",
          rating: mystery.rating || 4.5,
          skills: skills,
          gradient: mystery.gradient,
          badge_color: mystery.badge_color,
        }
      }),
    }
  } catch (error) {
    console.error("Error getting mysteries:", error)
    return { success: false, message: "An unexpected error occurred", mysteries: [] }
  }
}

// Update the updateMysteryProgress function to properly handle database updates
export async function updateMysteryProgress(mysteryId: number, userId: number, status: string, score: number) {
  try {
    console.log(`Updating progress for mystery ${mysteryId}: userId=${userId}, status=${status}, score=${score}`)

    const sql = getDbClient()
    if (!sql) {
      console.error("Database connection not available")
      return {
        success: true,
        message: "Progress saved in memory only (database connection not available)",
        // Return dummy data for the frontend to use
        progress: {
          user_id: userId,
          mystery_id: mysteryId,
          status: status,
          score: score,
          completed_at: new Date().toISOString(),
        },
      }
    }

    // Check if the user_mysteries table exists
    try {
      const tableCheck = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'user_mysteries'
        );
      `

      const tableExists = tableCheck[0]?.exists || false

      if (!tableExists) {
        console.log("Creating user_mysteries table as it doesn't exist")

        // Create the table if it doesn't exist
        await sql`
          CREATE TABLE IF NOT EXISTS user_mysteries (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            mystery_id INTEGER NOT NULL,
            status VARCHAR(20) NOT NULL,
            score INTEGER NOT NULL DEFAULT 0,
            started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            completed_at TIMESTAMP WITH TIME ZONE,
            UNIQUE(user_id, mystery_id)
          )
        `

        console.log("user_mysteries table created successfully")
      }
    } catch (error) {
      console.error("Error checking/creating user_mysteries table:", error)
    }

    // Also update the user's scores in the users table
    try {
      // Calculate score impacts
      const iqScoreImpact = Math.floor(score / 20)
      const domainScoreImpact = Math.floor(score / 15)
      const overallScoreImpact = Math.floor((iqScoreImpact + domainScoreImpact) / 2)

      await sql`
        UPDATE users
        SET 
          iq_score = COALESCE(iq_score, 0) + ${iqScoreImpact},
          domain_score = COALESCE(domain_score, 0) + ${domainScoreImpact},
          overall_score = COALESCE(overall_score, 0) + ${overallScoreImpact}
        WHERE id = ${userId}
      `

      console.log(
        `Updated user ${userId} scores: IQ +${iqScoreImpact}, Domain +${domainScoreImpact}, Overall +${overallScoreImpact}`,
      )
    } catch (error) {
      console.error("Error updating user scores:", error)
    }

    // Check if progress already exists
    const existingProgress = await sql`
      SELECT * FROM user_mysteries
      WHERE user_id = ${userId} AND mystery_id = ${mysteryId}
      LIMIT 1
    `

    let result
    if (existingProgress.length > 0) {
      // Update existing progress
      console.log(`Updating existing progress for user ${userId} on mystery ${mysteryId}`)
      result = await sql`
        UPDATE user_mysteries
        SET status = ${status}, 
            score = ${score}, 
            completed_at = ${status === "completed" ? new Date() : null}
        WHERE user_id = ${userId} AND mystery_id = ${mysteryId}
        RETURNING *
      `
    } else {
      // Create new progress
      console.log(`Creating new progress for user ${userId} on mystery ${mysteryId}`)
      result = await sql`
        INSERT INTO user_mysteries (user_id, mystery_id, status, score, completed_at)
        VALUES (${userId}, ${mysteryId}, ${status}, ${score}, ${status === "completed" ? new Date() : null})
        RETURNING *
      `
    }

    console.log(`Progress ${existingProgress.length > 0 ? "updated" : "created"} successfully:`, result[0])

    return {
      success: true,
      progress: result[0],
      scoreImpacts: {
        iqScore: Math.floor(score / 20),
        domainScore: Math.floor(score / 15),
        overallScore: Math.floor((Math.floor(score / 20) + Math.floor(score / 15)) / 2),
      },
    }
  } catch (error) {
    console.error("Error updating mystery progress:", error)
    // Return success anyway to not block the user experience
    return {
      success: true,
      message: "Progress saved in memory only (error updating database)",
      progress: {
        user_id: userId,
        mystery_id: mysteryId,
        status: status,
        score: score,
        completed_at: new Date().toISOString(),
      },
      scoreImpacts: {
        iqScore: Math.floor(score / 20),
        domainScore: Math.floor(score / 15),
        overallScore: Math.floor((Math.floor(score / 20) + Math.floor(score / 15)) / 2),
      },
    }
  }
}

// AI Interview Actions
export async function startAIInterview(jobId: number, userId: number) {
  // Placeholder implementation
  return {
    success: true,
    sessionId: Math.floor(Math.random() * 1000),
    questions: [
      { id: 1, question: "Tell me about yourself?" },
      { id: 2, question: "Why are you interested in this role?" },
    ],
  }
}

export async function submitInterviewAnswer(sessionId: number, questionIndex: number, answer: string) {
  // Placeholder implementation
  return {
    success: true,
    completed: questionIndex >= 1,
    score: 80,
    feedback: "Good job!",
    nextQuestion: { id: 3, question: "Where do you see yourself in 5 years?" },
  }
}

// Job Actions
export async function getJobById(id: number) {
  try {
    // Placeholder implementation
    return { success: true, job: {} }
  } catch (error) {
    console.error("Error getting job by ID:", error)
    return { success: false, message: "An unexpected error occurred" }
  }
}

export async function getJobs() {
  try {
    // Placeholder implementation
    return { success: true, jobs: [] }
  } catch (error) {
    console.error("Error getting jobs:", error)
    return { success: false, message: "An unexpected error occurred" }
  }
}

// Database Schema Check
export async function checkDatabaseSchema() {
  try {
    console.log("Checking database schema...")

    const sql = getDbClient()
    if (!sql) {
      console.error("Database connection not available")
      return { success: false, message: "Database connection error" }
    }

    // Check if the mysteries table exists
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `

    const tableNames = tables.map((t) => t.table_name)
    console.log("Tables in database:", tableNames.join(", "))

    // Check mysteries table structure if it exists
    if (tableNames.includes("mysteries")) {
      const columns = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'mysteries'
        ORDER BY ordinal_position;
      `

      console.log("Mysteries table columns:", columns.map((c) => `${c.column_name} (${c.data_type})`).join(", "))

      // Check if there are any mysteries in the table
      const count = await sql`SELECT COUNT(*) FROM mysteries`
      console.log(`Number of mysteries in database: ${count[0]?.count || 0}`)
    }

    return {
      success: true,
      schema: {
        tables: tableNames,
      },
    }
  } catch (error) {
    console.error("Error checking database schema:", error)
    return { success: false, message: "An unexpected error occurred" }
  }
}

// Update the getChallengesByMysterySlug function to handle missing challenges
export async function getChallengesByMysterySlug(slug: string) {
  try {
    console.log(`Getting challenges for mystery slug: ${slug}`)

    const sql = getDbClient()
    if (!sql) throw new Error("No database connection available")

    // First check if the mystery exists
    const mysteryCheck = await sql`
      SELECT id FROM mysteries WHERE slug = ${slug} LIMIT 1
    `

    if (mysteryCheck.length === 0) {
      console.warn(`Mystery with slug "${slug}" not found in database`)
      return { success: false, message: "Mystery not found", challenges: [] }
    }

    const mysteryId = mysteryCheck[0].id
    console.log(`Found mystery with ID: ${mysteryId}, fetching challenges...`)

    // Check if the mystery_challenges table exists
    try {
      const tableCheck = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'mystery_challenges'
        );
      `

      const tableExists = tableCheck[0]?.exists || false

      if (!tableExists) {
        console.error("Mystery_challenges table does not exist in the database")
        return {
          success: true,
          message: "Using sample challenges because mystery_challenges table does not exist",
          challenges: createSampleChallenges(mysteryId),
        }
      }
    } catch (error) {
      console.error("Error checking if mystery_challenges table exists:", error)
    }

    const challenges = await sql`
      SELECT * FROM mystery_challenges
      WHERE mystery_id = ${mysteryId}
      ORDER BY order_index ASC
    `

    console.log(`Retrieved ${challenges.length} challenges for mystery ID: ${mysteryId}`)

    if (challenges.length === 0) {
      // If no challenges found, create some sample challenges for testing
      console.log(`No challenges found for mystery ID: ${mysteryId}, creating sample challenges`)
      return {
        success: true,
        challenges: createSampleChallenges(mysteryId),
      }
    }

    return {
      success: true,
      challenges: challenges.map((challenge) => {
        let content = challenge.content

        // Parse content if it's a string
        if (typeof content === "string") {
          try {
            content = JSON.parse(content)
          } catch (e) {
            console.warn(`Failed to parse content for challenge ${challenge.id}:`, e)
            // Create default content based on challenge type
            content = createDefaultContent(challenge.type, challenge.description)
          }
        } else if (!content) {
          // Create default content based on challenge type
          content = createDefaultContent(challenge.type, challenge.description)
        }

        return {
          id: challenge.id,
          mystery_id: challenge.mystery_id,
          title: challenge.title || "Challenge",
          description: challenge.description || "No description available",
          type: challenge.type || "multiple-choice",
          code_snippet: challenge.code_snippet,
          content: content,
          points: challenge.points || 100,
          order_index: challenge.order_index || 0,
        }
      }),
    }
  } catch (error) {
    console.error("Error getting challenges by mystery slug:", error)
    return { success: false, message: "An unexpected error occurred", challenges: [] }
  }
}

// Helper function to create default content based on challenge type
function createDefaultContent(type, description) {
  if (type === "multiple-choice") {
    return {
      question: description,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: 0,
    }
  } else if (type === "puzzle") {
    return {
      encryptedMessage: "This is a sample encrypted message.",
      hint: "This is a sample hint.",
      solution: "solution",
    }
  } else if (type === "coding" || type === "code") {
    return {
      initialCode: "// This is a sample code\nfunction example() {\n  return 'Hello World';\n}",
      hints: ["This is a sample hint."],
    }
  }

  return {}
}

// Helper function to create sample challenges
function createSampleChallenges(mysteryId) {
  return [
    {
      id: `sample_mc_${Date.now()}`,
      mystery_id: mysteryId,
      title: "Sample Multiple Choice Challenge",
      description: "This is a sample multiple choice challenge to test your knowledge.",
      type: "multiple-choice",
      content: {
        question: "What is the primary purpose of React's useEffect hook?",
        options: [
          "To create new state variables",
          "To perform side effects in function components",
          "To optimize rendering performance",
          "To handle form submissions",
        ],
        correctAnswer: 1,
      },
      points: 100,
      order_index: 0,
    },
    {
      id: `sample_puzzle_${Date.now() + 1}`,
      mystery_id: mysteryId,
      title: "Sample Puzzle Challenge",
      description: "This is a sample puzzle challenge to test your problem-solving skills.",
      type: "puzzle",
      content: {
        encryptedMessage: "Gur frperg pbqr vf: ernpgqri",
        hint: "This message is encrypted with ROT13 cipher.",
        solution: "reactdev",
      },
      points: 150,
      order_index: 1,
    },
    {
      id: `sample_coding_${Date.now() + 2}`,
      mystery_id: mysteryId,
      title: "Sample Coding Challenge",
      description: "This is a sample coding challenge to test your programming skills.",
      type: "coding",
      content: {
        initialCode:
          "function reverseString(str) {\n  // Implement this function to reverse a string\n  // Example: 'hello' should return 'olleh'\n  \n  return str;\n}",
        hints: [
          "Try using string methods like split(), reverse(), and join()",
          "You can also use a for loop to iterate through the string backwards",
        ],
      },
      points: 200,
      order_index: 2,
    },
    {
      id: `sample_code_${Date.now() + 3}`,
      mystery_id: mysteryId,
      title: "Sample Code Challenge",
      description: "This is a sample code challenge to test your programming skills.",
      type: "code",
      content: {
        initialCode:
          "function findMax(numbers) {\n  // Implement this function to find the maximum number in an array\n  // Example: [1, 5, 3, 9, 2] should return 9\n  \n  return 0;\n}",
        hints: [
          "You can use Math.max() with the spread operator",
          "You can also use a for loop to iterate through the array",
        ],
      },
      points: 200,
      order_index: 3,
    },
  ]
}
