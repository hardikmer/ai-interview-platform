import { UsersList } from "@/components/users-list"
import { MysteriesList } from "@/components/mysteries-list"
import { JobsList } from "@/components/jobs-list"
import { getDbClient } from "@/lib/db"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default async function DatabaseDemoPage() {
  const dbClient = getDbClient()
  const isConnected = !!dbClient

  return (
    <div className="container mx-auto py-8 space-y-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">MystHire Database Demo</h1>
        <p className="text-xl text-gray-600">This page demonstrates data fetched from our Neon PostgreSQL database</p>
      </div>

      {!isConnected && (
        <Alert variant="destructive" className="mb-8">
          <AlertTitle>Database Connection Error</AlertTitle>
          <AlertDescription>
            <p>Could not connect to the database. Using mock data instead.</p>
            <p className="mt-2">
              Please check your environment variables and make sure the DATABASE_URL is set correctly.
            </p>
          </AlertDescription>
        </Alert>
      )}

      <UsersList />

      <MysteriesList />

      <JobsList />
    </div>
  )
}
