import { NextResponse } from "next/server"
import { getDbClient } from "@/lib/db"
import { checkDatabaseSchema } from "@/lib/actions"

export async function GET() {
  try {
    console.log("Debug mysteries API route called")

    const sql = getDbClient()
    if (!sql) {
      return NextResponse.json({ error: "Database connection not available" }, { status: 500 })
    }

    // Check database schema
    const schemaResult = await checkDatabaseSchema()

    // Get all mysteries
    const mysteries = await sql`SELECT * FROM mysteries`
    console.log(`Found ${mysteries.length} mysteries in database`)

    // Check if mystery_challenges table exists and get count
    let challengesCount = 0
    let challengesTableExists = false

    try {
      const tableCheck = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'mystery_challenges'
        );
      `

      challengesTableExists = tableCheck[0]?.exists || false

      if (challengesTableExists) {
        const countResult = await sql`SELECT COUNT(*) FROM mystery_challenges`
        challengesCount = countResult[0]?.count || 0
      }
    } catch (error) {
      console.error("Error checking mystery_challenges table:", error)
    }

    return NextResponse.json({
      success: true,
      schema: schemaResult.schema,
      mysteriesCount: mysteries.length,
      mysteries: mysteries.map((m) => ({
        id: m.id,
        title: m.title,
        slug: m.slug,
        category: m.category,
      })),
      challengesTableExists,
      challengesCount,
    })
  } catch (error) {
    console.error("Error in debug-mysteries API route:", error)
    return NextResponse.json({ error: "An unexpected error occurred", details: error.message }, { status: 500 })
  }
}
