"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Eye, Brain, Code, MessageSquare } from "lucide-react"
import { useJobs, type JobApplication, type JobPosting } from "@/lib/jobs"
import { useAuthContext } from "@/components/auth-provider"

interface CandidateRankingProps {
  jobId: string
  onRevealCandidate: (applicationId: string) => void
}

type SortOption = "score" | "interview" | "mystery" | "date"
type FilterOption = "all" | "passed" | "failed"

export function CandidateRanking({ jobId, onRevealCandidate }: CandidateRankingProps) {
  const { getJobById, getApplicationsByJob } = useJobs()
  const { user } = useAuthContext()

  const [sortBy, setSortBy] = useState<SortOption>("score")
  const [filterBy, setFilterBy] = useState<FilterOption>("all")
  const [activeTab, setActiveTab] = useState("all")

  const job = getJobById(jobId)
  if (!job) return null

  // Get applications for this job
  const applications = getApplicationsByJob(jobId)

  // Filter applications based on screening status
  const filteredApplications = applications.filter((app) => {
    if (filterBy === "all") return true
    if (filterBy === "passed") return app.screeningPassed
    if (filterBy === "failed") return !app.screeningPassed
    return true
  })

  // Sort applications
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    if (sortBy === "score") {
      return (b.interviewScore || 0) - (a.interviewScore || 0)
    }
    if (sortBy === "interview") {
      return (b.interviewScore || 0) - (a.interviewScore || 0)
    }
    if (sortBy === "mystery") {
      // In a real app, we would have mystery scores to sort by
      return (b.interviewScore || 0) - (a.interviewScore || 0)
    }
    // Default to date
    return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
  })

  // Group applications by status
  const applicationsByStatus = {
    applied: sortedApplications.filter((app) => app.status === "applied"),
    interviewed: sortedApplications.filter((app) => app.status === "interviewed"),
    shortlisted: sortedApplications.filter((app) => app.status === "shortlisted"),
    hired: sortedApplications.filter((app) => app.status === "hired"),
    rejected: sortedApplications.filter((app) => app.status === "rejected"),
  }

  // Get applications based on active tab
  const displayedApplications =
    activeTab === "all"
      ? sortedApplications
      : applicationsByStatus[activeTab as keyof typeof applicationsByStatus] || []

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Candidate Ranking</CardTitle>
            <CardDescription>
              {displayedApplications.length} candidate{displayedApplications.length !== 1 ? "s" : ""} for {job.title}
            </CardDescription>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="space-y-1">
              <Label htmlFor="sort-by" className="text-xs">
                Sort By
              </Label>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger id="sort-by" className="h-8">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score">Overall Score</SelectItem>
                  <SelectItem value="interview">Interview Score</SelectItem>
                  <SelectItem value="mystery">Mystery Score</SelectItem>
                  <SelectItem value="date">Application Date</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="filter-by" className="text-xs">
                Filter
              </Label>
              <Select value={filterBy} onValueChange={(value) => setFilterBy(value as FilterOption)}>
                <SelectTrigger id="filter-by" className="h-8">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Candidates</SelectItem>
                  <SelectItem value="passed">Passed Screening</SelectItem>
                  <SelectItem value="failed">Failed Screening</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-4">
            <TabsTrigger value="all">All ({sortedApplications.length})</TabsTrigger>
            <TabsTrigger value="applied">Applied ({applicationsByStatus.applied.length})</TabsTrigger>
            <TabsTrigger value="interviewed">Interviewed ({applicationsByStatus.interviewed.length})</TabsTrigger>
            <TabsTrigger value="shortlisted">Shortlisted ({applicationsByStatus.shortlisted.length})</TabsTrigger>
            <TabsTrigger value="hired">Hired ({applicationsByStatus.hired.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({applicationsByStatus.rejected.length})</TabsTrigger>
          </TabsList>

          <div className="space-y-4">
            {displayedApplications.length > 0 ? (
              displayedApplications.map((application, index) => (
                <CandidateRankingItem
                  key={application.id}
                  application={application}
                  job={job}
                  rank={index + 1}
                  onReveal={() => onRevealCandidate(application.id)}
                />
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No candidates found in this category.</p>
              </div>
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}

interface CandidateRankingItemProps {
  application: JobApplication
  job: JobPosting
  rank: number
  onReveal: () => void
}

function CandidateRankingItem({ application, job, rank, onReveal }: CandidateRankingItemProps) {
  const getStatusBadge = () => {
    switch (application.status) {
      case "applied":
        return <Badge className="bg-blue-600">Applied</Badge>
      case "interviewed":
        return <Badge className="bg-amber-600">Interviewed</Badge>
      case "shortlisted":
        return <Badge className="bg-green-600">Shortlisted</Badge>
      case "rejected":
        return (
          <Badge variant="outline" className="border-red-500 text-red-400">
            Rejected
          </Badge>
        )
      case "hired":
        return <Badge className="bg-purple-600">Hired</Badge>
    }
  }

  const getInterviewModeIcon = () => {
    switch (job.interviewMode) {
      case "mystery-points":
        return <Brain className="h-4 w-4 text-purple-400" />
      case "custom-mysteries":
        return <Code className="h-4 w-4 text-blue-400" />
      case "ai-interview":
        return <MessageSquare className="h-4 w-4 text-green-400" />
    }
  }

  return (
    <Card className="border-slate-800 bg-slate-900/50 hover:border-slate-700">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center justify-center">
            <div className="text-2xl font-bold">{rank}</div>
            <div className="text-xs text-muted-foreground">Rank</div>
          </div>

          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-purple-900 text-purple-100">
              {application.revealed ? "JD" : "?"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{application.revealed ? "John Doe" : "Anonymous Candidate"}</h3>
              {getStatusBadge()}
            </div>

            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getInterviewModeIcon()}
              <span>Applied {new Date(application.appliedAt).toLocaleDateString()}</span>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span>Interview</span>
                  <span>{application.interviewScore || 0}</span>
                </div>
                <Progress value={application.interviewScore || 0} className="h-1.5" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span>Overall</span>
                  <span>{application.interviewScore || 0}</span>
                </div>
                <Progress value={application.interviewScore || 0} className="h-1.5" />
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {application.screeningPassed ? (
              <Badge variant="outline" className="border-green-500 text-green-400">
                Passed Screening
              </Badge>
            ) : (
              <Badge variant="outline" className="border-red-500 text-red-400">
                Failed Screening
              </Badge>
            )}

            {!application.revealed && (
              <Button variant="outline" size="sm" className="text-xs" onClick={onReveal}>
                <Eye className="mr-1 h-3 w-3" />
                Reveal
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
