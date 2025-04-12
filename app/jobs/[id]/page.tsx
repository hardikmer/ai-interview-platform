"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, ArrowLeft, Briefcase, Building, MapPin, DollarSign, Brain, Tag } from "lucide-react"
import { getDbClient } from "@/lib/db"
import { useAuthContext } from "@/components/auth-provider"

interface Job {
  id: number
  company_id: number
  company_name: string
  title: string
  description: string
  location: string
  category: string
  salary_min: number
  salary_max: number
  interview_mode: string
  min_iq_score: number
  min_domain_score: number
  created_at: string
  active: boolean
  skills: string[]
}

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuthContext()
  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [alreadyApplied, setAlreadyApplied] = useState(false)

  // Check if user is an employer
  const isEmployer = user?.role === "employer"

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setIsLoading(true)
        const jobId = Number.parseInt(params.id, 10)

        if (isNaN(jobId)) {
          setError("Invalid job ID")
          return
        }

        const sql = getDbClient()
        if (!sql) {
          setError("Database connection failed")
          return
        }

        const result = await sql`
          SELECT * FROM job_postings WHERE id = ${jobId} LIMIT 1
        `

        if (result.length === 0) {
          setError("Job not found")
          return
        }

        const jobData = result[0]

        // Parse skills if it's stored as JSON
        let skills = jobData.skills || []
        if (typeof skills === "string") {
          try {
            skills = JSON.parse(skills)
          } catch (e) {
            console.warn(`Failed to parse skills for job ${jobData.id}:`, e)
            skills = []
          }
        }

        const job = {
          ...jobData,
          skills,
          created_at: jobData.created_at || new Date().toISOString(),
        }

        setJob(job)

        // Check if user has already applied
        if (user?.id) {
          const applied = await sql`
            SELECT id FROM job_applications 
            WHERE job_id = ${jobId} AND user_id = ${user.id}
            LIMIT 1
          `
          setAlreadyApplied(applied.length > 0)
        }
      } catch (error) {
        console.error("Error fetching job:", error)
        setError("An unexpected error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchJob()
  }, [params.id, user?.id])

  const handleBack = () => {
    router.back()
  }

  const handleApply = () => {
    if (!user) {
      router.push("/login?redirect=" + encodeURIComponent(`/jobs/${params.id}/apply`))
      return
    }

    router.push(`/jobs/${params.id}/apply`)
  }

  const formatSalary = (min: number, max: number) => {
    return `${min.toLocaleString()} - ${max.toLocaleString()}`
  }

  if (isLoading) {
    return (
      <div className="container mx-auto flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-6 flex items-center">
          <Button variant="outline" onClick={handleBack} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-3xl font-bold">Job Not Found</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
            <p className="mb-4 text-center text-lg text-red-500">
              {error || "The job you're looking for doesn't exist or is no longer active."}
            </p>
            <Button onClick={() => router.push("/jobs")}>Browse Jobs</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center">
        <Button variant="outline" onClick={handleBack} className="mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <h1 className="text-3xl font-bold">Job Details</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="outline">{job.category}</Badge>
          </div>
          <CardTitle className="text-2xl">{job.title}</CardTitle>
          <CardDescription className="flex items-center">
            <Building className="mr-2 h-4 w-4" />
            {job.company_name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium">Location</p>
                <p>{job.location}</p>
              </div>
            </div>
            <div className="flex items-center">
              <DollarSign className="mr-2 h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium">Salary Range</p>
                <p>${formatSalary(job.salary_min, job.salary_max)}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Briefcase className="mr-2 h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium">Interview Mode</p>
                <p>{job.interview_mode.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="mb-2 text-lg font-medium">Job Description</h3>
            <div className="whitespace-pre-line text-slate-700">{job.description}</div>
          </div>

          {job.skills && job.skills.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="mb-2 text-lg font-medium">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center">
              <Brain className="mr-2 h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium">Minimum IQ Score</p>
                <p>{job.min_iq_score}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Tag className="mr-2 h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium">Minimum Domain Score</p>
                <p>{job.min_domain_score}</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleBack}>
            Back to Jobs
          </Button>
          {!isEmployer && (
            <Button onClick={handleApply} disabled={alreadyApplied}>
              {alreadyApplied ? "Already Applied" : "Apply Now"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
