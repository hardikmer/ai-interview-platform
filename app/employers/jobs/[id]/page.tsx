"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Briefcase, MapPin, DollarSign, ArrowLeft, Building, Tag, Brain } from "lucide-react"
import { getDbClient } from "@/lib/db"
import { formatDistanceToNow } from "date-fns"

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
  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

        setJob({
          ...jobData,
          skills,
          created_at: jobData.created_at || new Date().toISOString(),
        })
      } catch (error) {
        console.error("Error fetching job:", error)
        setError("An unexpected error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchJob()
  }, [params.id])

  const handleBack = () => {
    router.back()
  }

  const formatSalary = (min: number, max: number) => {
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`
  }

  const getTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return formatDistanceToNow(date, { addSuffix: true })
    } catch (error) {
      return "Recently"
    }
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
        <Button variant="outline" onClick={handleBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="mb-4 text-center text-lg text-red-500">{error || "Job not found"}</p>
            <Button onClick={() => router.push("/employers/jobs")}>View All Jobs</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Button variant="outline" onClick={handleBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Jobs
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="outline">{job.category}</Badge>
            <span className="text-sm text-slate-400">{getTimeAgo(job.created_at)}</span>
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
                <p>{formatSalary(job.salary_min, job.salary_max)}</p>
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
            Back
          </Button>
          <Button onClick={() => router.push(`/employers/jobs/${job.id}/edit`)}>Edit Job</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
