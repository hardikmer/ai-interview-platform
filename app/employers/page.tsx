"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Briefcase, CheckCircle, Users, Plus, Search } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"
import { useAuthContext } from "@/components/auth-provider"
import { useJobs } from "@/lib/jobs"
import Link from "next/link"

export default function EmployersPage() {
  const { user } = useAuthContext()
  const { jobs, getJobsByCompany, getApplicationsByJob } = useJobs()
  const [activeTab, setActiveTab] = useState("dashboard")

  // Get jobs for this employer
  const employerJobs = user ? getJobsByCompany(user.id) : []
  
  // Get applications for all jobs
  const applications = employerJobs.flatMap((job) => getApplicationsByJob(job.id))
  
  // Calculate stats
  const totalApplications = applications.length
  const interviewedApplications = applications.filter((app) => app.status === "interviewed").length
  const shortlistedApplications = applications.filter((app) => app.status === "shortlisted").length
  const hiredApplications = applications.filter((app) => app.status === "hired").length

  const formatSalary = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getInterviewModeIcon = (mode: string) => {
    switch (mode) {
      case "mystery-points":
        return <Brain className="h-4 w-4 text-purple-400" />
      case "custom-mysteries":
        return <Brain className="h-4 w-4 text-blue-400" />
      case "ai-interview":
        return <Brain className="h-4 w-4 text-green-400" />
      default:
        return <Brain className="h-4 w-4 text-purple-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "applied":
        return <Badge variant="outline">Applied</Badge>;
      case "interviewed":
        return <Badge className="bg-blue-500">Interviewed</Badge>;
      case "shortlisted":
        return <Badge className="bg-green-500">Shortlisted</Badge>;
      case "hired":
        return <Badge className="bg-amber-500">Hired</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Applied</Badge>;
    }
  };

  return (
    <ProtectedRoute requiredRole="employer">
      <div className="space-y-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold">Employer Dashboard</h1>
            <p className="text-slate-300">Manage your job postings and candidates</p>
          </div>
          <div>
            <Button className="bg-purple-600 hover:bg-purple-700" asChild>
              <Link href="/employers/jobs/post">
                <Plus className="mr-2 h-4 w-4" />
                Post a Job
              </Link>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Active Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold">
                      {employerJobs.filter((job) => job.active).length}
                    </div>
                    <Briefcase className="h-8 w-8 text-purple-400 opacity-50" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Total Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold">{totalApplications}</div>
                    <Users className="h-8 w-8 text-blue-400 opacity-50" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Shortlisted</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold">{shortlistedApplications}</div>
                    <CheckCircle className="h-8 w-8 text-green-400 opacity-50" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Hired</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold">{hiredApplications}</div>
                    <Briefcase className="h-8 w-8 text-amber-400 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {applications.length > 0 ? (
                    applications
                      .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
                      .slice(0, 5)
                      .map((application) => {
                        const job = employerJobs.find((j) => j.id === application.jobId)
                        return (
                          <div key={application.id} className="flex items-center gap-3">
                            <div className="rounded-full bg-purple-900/20 p-2">
                              <Users className="h-5 w-5 text-purple-400" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div className="font-medium">
                                  {application.revealed ? "John Doe" : "Anonymous Candidate"}
                                </div>
                                {getStatusBadge(application.status)}
                              </div>
                              <div className="text-sm text-slate-400">
                                Applied for {job?.title} • {new Date(application.appliedAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        )
                      })
                  ) : (
                    <div className="text-center py-4 text-slate-400">
                      No applications yet. Post a job to start receiving applications.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Button className="bg-purple-600 hover:bg-purple-700" asChild>
                      <Link href="/employers/jobs/post">
                        <Plus className="mr-2 h-4 w-4" />
                        Post a Job
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/employers/candidates">
                        <Search className="mr-2 h-4 w-4" />
                        Search Candidates
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/employers/jobs">
                        <Briefcase className="mr-2 h-4 w-4" />
                        Manage Jobs
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/employers/settings">
                        <Users className="mr-2 h-4 w-4" />
                        Company Profile
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                  <CardTitle>Hiring Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-blue-900/20 p-2">
                        <Brain className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <div className="font-medium">Use Custom Mysteries</div>
                        <div className="text-sm text-slate-400">
                          Create job-specific challenges to better assess candidates.
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-green-900/20 p-2">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      </div>
                      <div>
                        <div className="font-medium">Review AI Interview Transcripts</div>
                        <div className="text-sm text-slate-400">
                          Get detailed insights from AI-powered interviews.
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Your Job Postings</CardTitle>
                <Button className="bg-purple-600 hover:bg-purple-700" asChild>
                  <Link href="/employers/jobs/post">
                    <Plus className="mr-2 h-4 w-4" />
                    Post a Job
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {employerJobs.length > 0 ? (
                    employerJobs.map((job) => {
                      const jobApplications = getApplicationsByJob(job.id)
                      return (
                        <Card
                          key={job.id}
                          className={`border-slate-800 ${
                            job.active ? "bg-slate-900/50" : "bg-slate-900/20"
                          } hover:border-slate-700`}
                        >
                          <CardContent className="p-6">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                  <h3 className="text-lg font-bold">{job.title}</h3>
                                  {job.active ? (
                                    <Badge className="bg-green-600">Active</Badge>
                                  ) : (
                                    <Badge variant="outline" className="border-slate-700 text-slate-400">
                                      Inactive
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-slate-300">
                                  <Badge className="bg-purple-600">
                                    {job.category.charAt(0).toUpperCase() + job.category.slice(1)}
                                  </Badge>
                                  <span>•</span>
                                  <span>{job.location}</span>
                                </div>
                                <div className="flex flex-wrap gap-2 pt-1">
                                  {job.skills.slice(0, 3).map((skill) => (
                                    <Badge key={skill} variant="outline" className="border-slate-700 text-slate-300">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              <div className="flex flex-col gap-2 md:w-48">
                                <div className="flex items-center justify-between text-sm">
\
\
\
\
