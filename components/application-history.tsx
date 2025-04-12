"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CandidateReveal } from "@/components/candidate-reveal"
import { getDbClient } from "@/lib/db"

interface ApplicationHistoryProps {
  jobId: number
}

interface Application {
  id: number
  user_id: number
  job_id: number
  status: string
  created_at: string
  user_name: string
  user_email: string
  revealed: boolean
  interview_score?: number
  interview_feedback?: string
}

export function ApplicationHistory({ jobId }: ApplicationHistoryProps) {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setIsLoading(true)
        const sql = getDbClient()

        if (!sql) {
          throw new Error("Database connection failed")
        }

        // Get applications for this job
        const result = await sql`
          SELECT ja.*, u.name as user_name, u.email as user_email
          FROM job_applications ja
          JOIN users u ON ja.user_id = u.id
          WHERE ja.job_id = ${jobId}
          ORDER BY ja.created_at DESC
        `

        // Transform the data
        const apps = result.map((app) => ({
          ...app,
          revealed: app.revealed || false,
        }))

        setApplications(apps)
      } catch (error) {
        console.error("Error fetching applications:", error)
        setError("Failed to load applications. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    if (jobId) {
      fetchApplications()
    }
  }, [jobId])

  const handleReveal = async (applicationId: number) => {
    try {
      const sql = getDbClient()
      if (!sql) {
        throw new Error("Database connection failed")
      }

      // Update the revealed status in the database
      await sql`
        UPDATE job_applications
        SET revealed = true
        WHERE id = ${applicationId}
      `

      // Update the local state
      setApplications((prev) => prev.map((app) => (app.id === applicationId ? { ...app, revealed: true } : app)))
    } catch (error) {
      console.error("Error revealing candidate:", error)
    }
  }

  const updateApplicationStatus = async (applicationId: number, newStatus: string) => {
    try {
      const sql = getDbClient()
      if (!sql) {
        throw new Error("Database connection failed")
      }

      // Update the status in the database
      await sql`
        UPDATE job_applications
        SET status = ${newStatus}
        WHERE id = ${applicationId}
      `

      // Update the local state
      setApplications((prev) => prev.map((app) => (app.id === applicationId ? { ...app, status: newStatus } : app)))
    } catch (error) {
      console.error("Error updating application status:", error)
    }
  }

  const filteredApplications = applications.filter((app) => {
    if (activeTab === "all") return true
    return app.status === activeTab
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "applied":
        return <Badge variant="outline">Applied</Badge>
      case "interviewed":
        return <Badge className="bg-blue-500">Interviewed</Badge>
      case "shortlisted":
        return <Badge className="bg-green-500">Shortlisted</Badge>
      case "hired":
        return <Badge className="bg-amber-500">Hired</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">Applied</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString()
    } catch (e) {
      return "Unknown date"
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
          <CardDescription>Loading applications...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-primary border-solid rounded-full border-t-transparent animate-spin"></div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
          <CardDescription>Error loading applications</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Applications</CardTitle>
        <CardDescription>Manage candidate applications for this job</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
            <TabsTrigger value="applied">
              Applied ({applications.filter((a) => a.status === "applied").length})
            </TabsTrigger>
            <TabsTrigger value="interviewed">
              Interviewed ({applications.filter((a) => a.status === "interviewed").length})
            </TabsTrigger>
            <TabsTrigger value="shortlisted">
              Shortlisted ({applications.filter((a) => a.status === "shortlisted").length})
            </TabsTrigger>
            <TabsTrigger value="hired">Hired ({applications.filter((a) => a.status === "hired").length})</TabsTrigger>
          </TabsList>
        </Tabs>

        {filteredApplications.length === 0 ? (
          <div className="text-center py-8 text-slate-400">No applications found in this category.</div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <div key={application.id} className="border rounded-lg p-4 bg-slate-800/20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {application.revealed ? application.user_name.substring(0, 2).toUpperCase() : "??"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      {application.revealed ? (
                        <>
                          <h3 className="font-medium">{application.user_name}</h3>
                          <p className="text-sm text-slate-400">{application.user_email}</p>
                        </>
                      ) : (
                        <CandidateReveal onReveal={() => handleReveal(application.id)} />
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(application.status)}
                        <span className="text-xs text-slate-400">Applied {formatDate(application.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {application.status !== "interviewed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateApplicationStatus(application.id, "interviewed")}
                      >
                        Mark Interviewed
                      </Button>
                    )}

                    {application.status !== "shortlisted" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-green-900/20 hover:bg-green-900/30 text-green-400"
                        onClick={() => updateApplicationStatus(application.id, "shortlisted")}
                      >
                        Shortlist
                      </Button>
                    )}

                    {application.status !== "hired" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-amber-900/20 hover:bg-amber-900/30 text-amber-400"
                        onClick={() => updateApplicationStatus(application.id, "hired")}
                      >
                        Hire
                      </Button>
                    )}

                    {application.status !== "rejected" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-red-900/20 hover:bg-red-900/30 text-red-400"
                        onClick={() => updateApplicationStatus(application.id, "rejected")}
                      >
                        Reject
                      </Button>
                    )}
                  </div>
                </div>

                {application.interview_score && (
                  <div className="mt-4 p-3 bg-slate-800/30 rounded">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Interview Score</span>
                      <span className="text-sm font-bold">{application.interview_score}/100</span>
                    </div>
                    {application.interview_feedback && (
                      <p className="text-sm text-slate-300 mt-2">{application.interview_feedback}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
