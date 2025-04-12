"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Briefcase, MapPin, DollarSign, Search } from "lucide-react"
import { listAllJobs } from "@/lib/direct-job-post"

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
  created_at: string
  skills: string[]
}

export default function JobsPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true)
        const result = await listAllJobs()

        if (result.success && result.jobs) {
          // Process jobs data
          const processedJobs = result.jobs.map((job: any) => {
            // Parse skills if it's stored as JSON
            let skills = job.skills || []
            if (typeof skills === "string") {
              try {
                skills = JSON.parse(skills)
              } catch (e) {
                console.warn(`Failed to parse skills for job ${job.id}:`, e)
                skills = []
              }
            }

            return {
              ...job,
              skills,
              created_at: job.created_at || new Date().toISOString(),
            }
          })

          setJobs(processedJobs)
          setFilteredJobs(processedJobs)
        } else {
          setError("Failed to fetch jobs")
        }
      } catch (error) {
        console.error("Error fetching jobs:", error)
        setError("An unexpected error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchJobs()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredJobs(jobs)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(term) ||
        job.company_name.toLowerCase().includes(term) ||
        job.location.toLowerCase().includes(term) ||
        job.description.toLowerCase().includes(term) ||
        job.category.toLowerCase().includes(term) ||
        (job.skills && job.skills.some((skill) => skill.toLowerCase().includes(term))),
    )

    setFilteredJobs(filtered)
  }, [searchTerm, jobs])

  const handleViewJob = (jobId: number) => {
    router.push(`/jobs/${jobId}`)
  }

  const formatSalary = (min: number, max: number) => {
    return `${min.toLocaleString()} - ${max.toLocaleString()}`
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="mb-4 text-3xl font-bold md:mb-0">Job Listings</h1>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search jobs..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
        </div>
      ) : filteredJobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="mb-4 text-center text-lg text-slate-500">
              {searchTerm ? "No jobs match your search criteria" : "No jobs available at the moment"}
            </p>
            {searchTerm && (
              <Button variant="outline" onClick={() => setSearchTerm("")}>
                Clear Search
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <Badge variant="outline" className="mb-2">
                    {job.category}
                  </Badge>
                </div>
                <CardTitle className="line-clamp-1">{job.title}</CardTitle>
                <CardDescription className="line-clamp-1">{job.company_name}</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="mb-4 space-y-2">
                  <div className="flex items-center text-sm">
                    <MapPin className="mr-2 h-4 w-4 text-slate-400" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <DollarSign className="mr-2 h-4 w-4 text-slate-400" />
                    <span>${formatSalary(job.salary_min, job.salary_max)}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Briefcase className="mr-2 h-4 w-4 text-slate-400" />
                    <span>
                      Interview: {job.interview_mode.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                  </div>
                </div>
                <div className="line-clamp-2 text-sm text-slate-600">{job.description}</div>
                {job.skills && job.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {job.skills.slice(0, 3).map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {job.skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{job.skills.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-2">
                <Button variant="outline" className="w-full" onClick={() => handleViewJob(job.id)}>
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
