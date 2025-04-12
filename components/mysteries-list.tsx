import { getMysteries } from "@/lib/data-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export async function MysteriesList() {
  const { success, mysteries, error } = await getMysteries()

  if (!success) {
    return <div className="p-4 bg-red-50 text-red-500 rounded-md">Error loading mysteries: {error}</div>
  }

  if (!mysteries || mysteries.length === 0) {
    return <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md">No mysteries found in the database.</div>
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Mysteries in Database</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mysteries.map((mystery) => (
          <Card key={mystery.id} className="overflow-hidden">
            <div className={`h-2 w-full ${mystery.gradient || "bg-blue-500"}`} />
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle>{mystery.title}</CardTitle>
                <Badge className={mystery.badge_color || "bg-blue-500"}>{mystery.difficulty}</Badge>
              </div>
              <CardDescription>{mystery.category}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">{mystery.description}</p>
              <div className="flex flex-wrap gap-2">
                {mystery.skills &&
                  mystery.skills.map((skill, index) => (
                    <Badge key={index} variant="outline">
                      {skill}
                    </Badge>
                  ))}
              </div>
              <div className="mt-4 flex justify-between text-sm">
                <span>{mystery.duration}</span>
                <span>Rating: {mystery.rating}/5</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
