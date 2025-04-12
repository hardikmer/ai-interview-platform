"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Database, RefreshCw } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function DatabaseStatus() {
  const [status, setStatus] = useState<"connected" | "disconnected" | "loading">("loading")
  const [message, setMessage] = useState<string>("")
  const [details, setDetails] = useState<any>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const checkDatabaseConnection = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch("/api/db-status?t=" + Date.now()) // Add cache-busting parameter
      const data = await response.json()
      setStatus(data.connected ? "connected" : "disconnected")
      setMessage(data.message || "")
      setDetails(data)
      console.log("Database status:", data) // Log for debugging
    } catch (error) {
      console.error("Error checking database status:", error)
      setStatus("disconnected")
      setMessage("Failed to check database status")
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    checkDatabaseConnection()
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <Badge
                  variant={status === "connected" ? "default" : "outline"}
                  className={
                    status === "connected"
                      ? "bg-green-600 hover:bg-green-700"
                      : status === "disconnected"
                        ? "border-red-500 text-red-500"
                        : "border-yellow-500 text-yellow-500"
                  }
                >
                  {status === "connected"
                    ? "Database Connected"
                    : status === "disconnected"
                      ? "Using Mock Data"
                      : "Checking Database..."}
                </Badge>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="max-w-xs">
                <p>
                  {status === "connected"
                    ? "Connected to Neon PostgreSQL database"
                    : status === "disconnected"
                      ? message || "Using mock data as fallback"
                      : "Checking database connection..."}
                </p>

                {details?.envVars && (
                  <div className="mt-2 text-xs">
                    <div>Environment variables:</div>
                    <ul className="list-disc pl-4">
                      {Object.entries(details.envVars).map(([key, value]: [string, any]) => (
                        <li key={key}>
                          {key}: {value ? "✓" : "✗"}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {details?.error && (
                  <div className="mt-2 text-xs text-red-500">
                    <div>Error:</div>
                    <p className="break-words">{details.error}</p>
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={checkDatabaseConnection}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          <span className="sr-only">Refresh database status</span>
        </Button>
      </div>

      {status === "disconnected" && (
        <Alert variant="destructive">
          <AlertTitle>No database client available</AlertTitle>
          <AlertDescription>
            <p>The application cannot connect to the database. Please check the following:</p>
            <ol className="mt-2 list-decimal pl-5 space-y-1">
              <li>
                Verify that the <code className="bg-red-950 px-1 rounded">DATABASE_URL</code> environment variable is
                set correctly in your project settings.
              </li>
              <li>
                Check that your Neon database is active and accessible. You can verify this in the Neon dashboard.
              </li>
              <li>
                Ensure that your IP address is allowed in the Neon database settings if IP restrictions are enabled.
              </li>
              <li>Try redeploying your application after confirming the environment variables are set correctly.</li>
              <li>
                If using the application locally, make sure you've set up the environment variables in your{" "}
                <code className="bg-red-950 px-1 rounded">.env.local</code> file.
              </li>
            </ol>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
