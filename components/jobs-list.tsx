import { getJobPostings } from "@/lib/data-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export async function JobsList() {
  const { success, jobs, error } = await getJobPostings()

  if (!success) {
    return <div className="p-4 bg-red-50 text-red-500 rounded-md">Error loading jobs: {error}</div>
  }

  if (!jobs || jobs.length === 0) {
    return <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md">No job postings found in the database.</div>
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Job Postings in Database</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {jobs.map((job) => (
          <Card key={job.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle>{job.title}</CardTitle>
                <Badge variant={job.active ? "default" : "outline"}>{job.active ? "Active" : "Inactive"}</Badge>
              </div>
              <CardDescription>
                {job.company_name} • {job.location}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4 line-clamp-3">{job.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {job.skills &&
                  job.skills.map((skill, index) => (
                    <Badge key={index} variant="outline">
                      {skill}
                    </Badge>
                  ))}
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Category:</span> {job.category}
                </div>
                <div>
                  <span className="text-gray-500">Interview:</span> {job.interview_mode.replace(/_/g, " ")}
                </div>
                <div>
                  <span className="text-gray-500">Min IQ Score:</span> {job.min_iq_score}
                </div>
                <div>
                  <span className="text-gray-500">Min Domain Score:</span> {job.min_domain_score}
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <div className="w-full flex justify-between items-center">
                <span className="text-sm text-gray-500">Posted: {new Date(job.created_at).toLocaleDateString()}</span>
                <span className="font-medium">
                  ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}
                </span>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
