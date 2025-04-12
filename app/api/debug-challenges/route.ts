import { NextResponse } from "next/server"
import { getDbClient } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const sql = getDbClient()
    if (!sql) {
      return NextResponse.json({ error: "No database connection available" }, { status: 500 })
    }

    // Check challenges table
    const challenges = await sql`
      SELECT mystery_slug, COUNT(*) as count 
      FROM challenges 
      GROUP BY mystery_slug
    `

    // Check if specific mystery has challenges
    const url = new URL(request.url)
    const slug = url.searchParams.get("slug")

    let specificChallenges = []
    if (slug) {
      specificChallenges = await sql`
        SELECT * FROM challenges 
        WHERE mystery_slug = ${slug}
        ORDER BY order_index ASC
      `
    }

    return NextResponse.json({
      success: true,
      challenges_by_mystery: challenges,
      specific_challenges: specificChallenges,
      database_url_exists: !!process.env.DATABASE_URL,
      postgres_url_exists: !!process.env.POSTGRES_URL,
    })
  } catch (error: any) {
    console.error("Error in debug-challenges route:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
