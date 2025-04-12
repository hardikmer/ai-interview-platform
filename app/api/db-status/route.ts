import { NextResponse } from "next/server"
import { checkDatabaseConnection } from "@/lib/db"

export async function GET() {
  try {
    const status = await checkDatabaseConnection()

    // Add additional information for debugging
    return NextResponse.json({
      ...status,
      timestamp: new Date().toISOString(),
      envVars: {
        DATABASE_URL: !!process.env.DATABASE_URL,
        POSTGRES_URL: !!process.env.POSTGRES_URL,
        POSTGRES_PRISMA_URL: !!process.env.POSTGRES_PRISMA_URL,
        NODE_ENV: process.env.NODE_ENV,
      },
    })
  } catch (error) {
    console.error("Error checking database status:", error)
    return NextResponse.json(
      {
        connected: false,
        message: "Error checking database connection",
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
        envVars: {
          DATABASE_URL: !!process.env.DATABASE_URL,
          POSTGRES_URL: !!process.env.POSTGRES_URL,
          POSTGRES_PRISMA_URL: !!process.env.POSTGRES_PRISMA_URL,
          NODE_ENV: process.env.NODE_ENV,
        },
      },
      { status: 500 },
    )
  }
}
