"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Briefcase, Users, Clock, CheckCircle } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"
import { useJobs } from "@/lib/jobs"
import { useAuthContext } from "@/components/auth-provider"
import { listAllJobs } from "@/lib/direct-job-post"
import { useRouter } from "next/navigation"

export default function EmployerDashboardPage() {
  const { jobs, applications, fetchJobs, isLoading } = useJobs()
  const { user } = useAuthContext()
  const [directJobs, setDirectJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // Fetch jobs using the store method
        await fetchJobs()

        // Also fetch jobs directly from the database
        const result = await listAllJobs()
        if (result.success) {
          setDirectJobs(result.jobs || [])
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [fetchJobs])

  // Get all jobs - we'll display all jobs regardless of company_id for now
  // This ensures jobs show up even if company_id is null or doesn't match user.id
  const allJobs = directJobs.length > 0 ? directJobs : jobs

  // Count active jobs
  const activeJobsCount = allJobs.filter((job) => job.active !== false).length

  // Get applications for this employer's jobs
  const jobIds = allJobs.map((job) => job.id)
  const employerApplications = applications.filter((app) => jobIds.includes(app.job_id))

  // Count applications by status
  const shortlistedCount = employerApplications.filter(
    (app) => app.status === "screening" || app.status === "interview",
  ).length
  const hiredCount = employerApplications.filter((app) => app.status === "offer").length

  return (
    <ProtectedRoute requiredRole="employer">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Employer Dashboard</h1>
            <p className="text-slate-300">Manage your job postings and applications</p>
          </div>
          <Button asChild className="bg-purple-600 hover:bg-purple-700">
            <Link href="/employers/post-job">
              <Plus className="mr-2 h-4 w-4" /> Post New Job
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="hover:bg-slate-50">
            <CardHeader>
              <CardTitle>Job Listings</CardTitle>
              <CardDescription>View and manage your job postings</CardDescription>
            </CardHeader>
            <CardContent>
              <Briefcase className="h-8 w-8 text-blue-500" />
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => router.push("/employers/jobs")}>
                View Jobs
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Active Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Briefcase className="h-5 w-5 text-purple-500 mr-2" />
                <div className="text-4xl font-bold">{activeJobsCount}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Total Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-blue-500 mr-2" />
                <div className="text-4xl font-bold">{employerApplications.length}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Shortlisted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-amber-500 mr-2" />
                <div className="text-4xl font-bold">{shortlistedCount}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Hired</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <div className="text-4xl font-bold">{hiredCount}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="jobs">
          <TabsList className="bg-slate-800">
            <TabsTrigger value="jobs">Your Jobs</TabsTrigger>
            <TabsTrigger value="applications">Recent Applications</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="mt-4">
            <Card className="border-slate-800 bg-slate-900/50">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
                  </div>
                  <p className="text-slate-400">Loading jobs...</p>
                </div>
              ) : allJobs.length > 0 ? (
                <div className="divide-y divide-slate-800">
                  {allJobs.map((job) => (
                    <div key={job.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium">{job.title}</h3>
                          <div className="text-sm text-slate-400">
                            {job.company_name || "Your Company"} • {job.location} • {job.category}
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-xs bg-slate-800 px-2 py-1 rounded">
                              ${job.salary_min?.toLocaleString() || 0} - ${job.salary_max?.toLocaleString() || 0}
                            </span>
                            {job.active !== false ? (
                              <span className="text-xs bg-green-900/50 text-green-400 px-2 py-1 rounded">Active</span>
                            ) : (
                              <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded">Inactive</span>
                            )}
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/employers/jobs/${job.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <Briefcase className="h-12 w-12 text-slate-500" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">You haven't posted any jobs yet.</h3>
                  <p className="text-slate-400 mb-4">Start by posting your first job to attract candidates.</p>
                  <Button asChild className="bg-purple-600 hover:bg-purple-700">
                    <Link href="/employers/post-job">Post Your First Job</Link>
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="applications" className="mt-4">
            <Card className="border-slate-800 bg-slate-900/50">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
                  </div>
                  <p className="text-slate-400">Loading applications...</p>
                </div>
              ) : employerApplications.length > 0 ? (
                <div className="divide-y divide-slate-800">
                  {employerApplications.map((app) => {
                    const job = allJobs.find((j) => j.id === app.job_id)
                    return (
                      <div key={app.id} className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-medium">{job?.title || "Unknown Job"}</h3>
                            <div className="text-sm text-slate-400">
                              Application ID: {app.id} • Applied: {new Date(app.applied_at).toLocaleDateString()}
                            </div>
                            <div className="mt-1">
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  app.status === "applied"
                                    ? "bg-blue-900/50 text-blue-400"
                                    : app.status === "screening"
                                      ? "bg-amber-900/50 text-amber-400"
                                      : app.status === "interview"
                                        ? "bg-purple-900/50 text-purple-400"
                                        : app.status === "offer"
                                          ? "bg-green-900/50 text-green-400"
                                          : "bg-red-900/50 text-red-400"
                                }`}
                              >
                                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                              </span>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/employers/applications/${app.id}`}>View Application</Link>
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <Users className="h-12 w-12 text-slate-500" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">No applications yet</h3>
                  <p className="text-slate-400">You haven't received any applications for your job postings yet.</p>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}
