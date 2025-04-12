"use server"

import { getDbClient } from "./db"

export async function seedChallengesForDatabaseDilemma() {
  try {
    const sql = getDbClient()
    if (!sql) {
      console.error("No database connection available")
      return { success: false, message: "No database connection available" }
    }

    // Check if the mystery exists
    const mysteryCheck = await sql`
      SELECT id FROM mysteries WHERE slug = 'database-dilemma' LIMIT 1
    `

    if (mysteryCheck.length === 0) {
      console.error("Mystery 'database-dilemma' not found")
      return { success: false, message: "Mystery not found" }
    }

    const mysteryId = mysteryCheck[0].id

    // Check if challenges already exist
    const existingChallenges = await sql`
      SELECT COUNT(*) as count FROM mystery_challenges WHERE mystery_id = ${mysteryId}
    `

    if (existingChallenges[0].count > 0) {
      console.log(`${existingChallenges[0].count} challenges already exist for database-dilemma, skipping seed`)
      return { success: true, message: "Challenges already exist" }
    }

    // Create sample challenges
    const challenges = [
      {
        mystery_id: mysteryId,
        title: "Database Connection Issue",
        description: "Identify the issue in the database connection code",
        type: "multiple-choice",
        content: JSON.stringify({
          question: "What's the issue with the following database connection code?",
          codeSnippet: `
const connectToDatabase = async () => {
  const client = new Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  
  client.connect();
  return client;
}`,
          options: [
            "Missing error handling for the connection",
            "Not using environment variables correctly",
            "Using deprecated connection method",
            "Not closing the connection properly",
          ],
          correctAnswer: 0,
        }),
        points: 10,
        order_index: 0,
      },
      {
        mystery_id: mysteryId,
        title: "SQL Injection Vulnerability",
        description: "Find the SQL injection vulnerability in the code",
        type: "multiple-choice",
        content: JSON.stringify({
          question: "Which of the following code snippets contains an SQL injection vulnerability?",
          options: [
            "db.query('SELECT * FROM users WHERE id = $1', [userId])",
            "db.query(`SELECT * FROM users WHERE id = ${userId}`)",
            "db.query(sql`SELECT * FROM users WHERE id = ${userId}`)",
            "db.query(prepared('SELECT * FROM users WHERE id = ?', [userId]))",
          ],
          correctAnswer: 1,
          context:
            "SQL injection is a code injection technique that exploits a security vulnerability in an application's software. It allows attackers to inject malicious SQL statements into entry fields for execution.",
        }),
        points: 15,
        order_index: 1,
      },
      {
        mystery_id: mysteryId,
        title: "Database Performance Puzzle",
        description: "Solve the puzzle to optimize the database query",
        type: "puzzle",
        content: JSON.stringify({
          encryptedMessage:
            "XFMFDU * GSPN VTFST KPJO PSEFST PO VTFST.JE = PSEFST.VTFS_JE XIFSF PSEFST.TUBUVT = 'DPNQMFUFE'",
          hint: "Each letter has been shifted one position forward in the alphabet",
          solution: "SELECT * FROM USERS JOIN ORDERS ON USERS.ID = ORDERS.USER_ID WHERE ORDERS.STATUS = 'COMPLETED'",
        }),
        points: 20,
        order_index: 2,
      },
      {
        mystery_id: mysteryId,
        title: "Optimize Database Query",
        description: "Optimize the given database query for better performance",
        type: "coding",
        content: JSON.stringify({
          initialCode: `
// Current slow query
const getProductsWithCategories = async () => {
  const products = await db.query('SELECT * FROM products');
  
  // For each product, get its category
  for (const product of products) {
    const category = await db.query('SELECT * FROM categories WHERE id = $1', [product.category_id]);
    product.category = category[0];
  }
  
  return products;
}`,
          hints: [
            "Consider using a JOIN operation instead of multiple queries",
            "Fetching only needed columns can improve performance",
            "Adding appropriate indexes can speed up the query",
          ],
        }),
        points: 25,
        order_index: 3,
      },
    ]

    // Insert challenges
    for (const challenge of challenges) {
      await sql`
        INSERT INTO mystery_challenges 
        (mystery_id, title, description, type, content, points, order_index)
        VALUES 
        (${challenge.mystery_id}, ${challenge.title}, ${challenge.description}, 
         ${challenge.type}, ${challenge.content}, ${challenge.points}, ${challenge.order_index})
      `
    }

    console.log(`Successfully seeded ${challenges.length} challenges for database-dilemma mystery`)
    return { success: true, message: `Seeded ${challenges.length} challenges` }
  } catch (error) {
    console.error("Error seeding challenges:", error)
    return { success: false, message: "Failed to seed challenges" }
  }
}
