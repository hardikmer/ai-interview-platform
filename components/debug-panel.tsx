"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { checkDatabaseConnection } from "@/lib/db"

export function DebugPanel() {
  const [dbStatus, setDbStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const checkDatabase = async () => {
    setIsLoading(true)
    try {
      const status = await checkDatabaseConnection()
      setDbStatus(status)
    } catch (error) {
      setDbStatus({ connected: false, message: "Error checking connection", error })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-slate-800 bg-slate-900/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between">
          <span>Debug Panel</span>
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? "Hide Details" : "Show Details"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={checkDatabase} disabled={isLoading}>
              {isLoading ? "Checking..." : "Check Database Connection"}
            </Button>
          </div>

          {dbStatus && isExpanded && (
            <div className="mt-4 space-y-2 text-sm">
              <div className="rounded bg-slate-800 p-3">
                <p className="font-semibold">
                  Status:{" "}
                  <span className={dbStatus.connected ? "text-green-400" : "text-red-400"}>
                    {dbStatus.connected ? "Connected" : "Not Connected"}
                  </span>
                </p>
                <p className="mt-1">{dbStatus.message}</p>
                {dbStatus.error && (
                  <pre className="mt-2 overflow-auto rounded bg-slate-900 p-2 text-xs text-red-400">
                    {typeof dbStatus.error === "object" ? JSON.stringify(dbStatus.error, null, 2) : dbStatus.error}
                  </pre>
                )}
                {dbStatus.envVars && (
                  <div className="mt-2">
                    <p className="font-semibold">Environment Variables:</p>
                    <pre className="mt-1 overflow-auto rounded bg-slate-900 p-2 text-xs">
                      {JSON.stringify(dbStatus.envVars, null, 2)}
                    </pre>
                  </div>
                )}
                {dbStatus.test && (
                  <div className="mt-2">
                    <p className="font-semibold">Test Result:</p>
                    <pre className="mt-1 overflow-auto rounded bg-slate-900 p-2 text-xs">
                      {JSON.stringify(dbStatus.test, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
