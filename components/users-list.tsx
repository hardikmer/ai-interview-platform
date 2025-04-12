import { getUsers } from "@/lib/data-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export async function UsersList() {
  const { success, users, error } = await getUsers()

  if (!success) {
    return <div className="p-4 bg-red-50 text-red-500 rounded-md">Error loading users: {error}</div>
  }

  if (!users || users.length === 0) {
    return <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md">No users found in the database.</div>
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Users in Database</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle>{user.name}</CardTitle>
                <Badge variant={user.role === "candidate" ? "default" : "secondary"}>{user.role}</Badge>
              </div>
              <CardDescription>{user.email}</CardDescription>
            </CardHeader>
            <CardContent>
              {user.role === "candidate" && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Overall Score:</span>
                    <span className="font-medium">{user.overall_score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">IQ Score:</span>
                    <span className="font-medium">{user.iq_score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Domain Score:</span>
                    <span className="font-medium">{user.domain_score}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
