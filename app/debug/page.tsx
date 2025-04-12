import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import DatabaseStatus from "@/components/database-status"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Database, User } from "lucide-react"
import { DebugPanel } from "@/components/debug-panel"

export default function DebugPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">System Diagnostics</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              <CardTitle>Database Connection Status</CardTitle>
            </div>
            <CardDescription>Check if the application can connect to the database</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading database status...</div>}>
              <div className="flex flex-col gap-4">
                <DatabaseStatus />

                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No database client available</AlertTitle>
                  <AlertDescription>
                    <div className="mt-2">
                      <p className="mb-2">
                        The application cannot connect to the database. Please check the following:
                      </p>
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>
                          Verify that the <code className="bg-gray-800 px-1 py-0.5 rounded">DATABASE_URL</code>{" "}
                          environment variable is set correctly in your project settings.
                        </li>
                        <li>
                          Check that your Neon database is active and accessible. You can verify this in the Neon
                          dashboard.
                        </li>
                        <li>
                          Ensure that your IP address is allowed in the Neon database settings if IP restrictions are
                          enabled.
                        </li>
                        <li>
                          Try redeploying your application after confirming the environment variables are set correctly.
                        </li>
                        <li>
                          If using the application locally, make sure you&apos;ve set up the environment variables in
                          your <code className="bg-gray-800 px-1 py-0.5 rounded">.env.local</code> file.
                        </li>
                      </ol>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            </Suspense>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>Current User</CardTitle>
            </div>
            <CardDescription>Information about the currently logged in user</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading user information...</div>}>
              <div className="text-amber-500">Not logged in</div>
            </Suspense>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <DebugPanel />
      </div>
    </div>
  )
}
