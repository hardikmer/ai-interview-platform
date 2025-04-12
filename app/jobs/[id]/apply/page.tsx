"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, ArrowLeft, Briefcase, Building, Camera, MapPin, Mic, Monitor } from "lucide-react"
import { getDbClient } from "@/lib/db"
import { useJobs } from "@/lib/jobs"
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

export default function JobApplyPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuthContext()
  const { applyToJob, hasApplied } = useJobs()
  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [applying, setApplying] = useState(false)
  const [permissionsGranted, setPermissionsGranted] = useState({
    camera: false,
    microphone: false,
    screen: false,
  })
  const [permissionsChecked, setPermissionsChecked] = useState(false)
  const [alreadyApplied, setAlreadyApplied] = useState(false)

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

  const formatSalary = (min: number, max: number) => {
    return `${min.toLocaleString()} - ${max.toLocaleString()}`
  }

  const needsPermissions = (mode: string) => {
    return mode === "ai_interview" || mode === "mystery_challenge"
  }

  const getRequiredPermissions = (mode: string) => {
    switch (mode) {
      case "ai_interview":
        return { camera: true, microphone: true, screen: true }
      case "mystery_challenge":
        return { camera: false, microphone: true, screen: true }
      default:
        return { camera: false, microphone: false, screen: false }
    }
  }

  const checkPermissions = async () => {
    const required = getRequiredPermissions(job?.interview_mode || "")
    const permissions: { [key: string]: boolean } = { camera: false, microphone: false, screen: false }

    try {
      // Check camera and microphone permissions
      if (required.camera || required.microphone) {
        const constraints: MediaStreamConstraints = {
          video: required.camera,
          audio: required.microphone,
        }

        const stream = await navigator.mediaDevices.getUserMedia(constraints)

        // Check which permissions were granted
        if (required.camera) {
          permissions.camera = stream.getVideoTracks().length > 0
        }

        if (required.microphone) {
          permissions.microphone = stream.getAudioTracks().length > 0
        }

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop())
      }

      // Check screen sharing permission
      if (required.screen) {
        try {
          const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true })
          permissions.screen = true
          screenStream.getTracks().forEach((track) => track.stop())
        } catch (error) {
          console.error("Screen sharing permission denied:", error)
          permissions.screen = false
        }
      }

      setPermissionsGranted(permissions)
      setPermissionsChecked(true)
    } catch (error) {
      console.error("Error checking permissions:", error)
      setPermissionsChecked(true)
    }
  }

  // Update the handleApply function to redirect to the interview setup page for AI interviews
  const handleApply = async () => {
    if (!user?.id) {
      router.push("/login?redirect=" + encodeURIComponent(`/jobs/${params.id}/apply`))
      return
    }

    if (alreadyApplied) {
      router.push("/dashboard")
      return
    }

    try {
      setApplying(true)

      if (!job) {
        throw new Error("Job not found")
      }

      const jobId = job.id
      const userId = user.id

      // Apply to job
      const sql = getDbClient()
      if (!sql) {
        throw new Error("Database connection failed")
      }

      // Check if already applied
      const existingApplication = await sql`
        SELECT id FROM job_applications 
        WHERE job_id = ${jobId} AND user_id = ${userId}
        LIMIT 1
      `

      if (existingApplication.length > 0) {
        // If already applied and it's an AI interview, go to interview setup
        if (job.interview_mode === "ai_interview") {
          router.push(`/jobs/${params.id}/interview/setup`)
        } else {
          router.push("/dashboard")
        }
        return
      }

      // Insert application
      const result = await sql`
        INSERT INTO job_applications (job_id, user_id, status, screening_passed, revealed)
        VALUES (${jobId}, ${userId}, 'applied', false, false)
        RETURNING id
      `

      if (!result || result.length === 0) {
        throw new Error("Failed to apply for job")
      }

      // Redirect based on interview mode
      if (job.interview_mode === "ai_interview") {
        router.push(`/jobs/${params.id}/interview/setup`)
      } else {
        router.push(`/jobs/${params.id}/apply/success`)
      }
    } catch (error) {
      console.error("Error applying for job:", error)
      setError("Failed to apply for job. Please try again.")
    } finally {
      setApplying(false)
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

  const requiredPermissions = getRequiredPermissions(job.interview_mode)

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center">
        <Button variant="outline" onClick={handleBack} className="mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <h1 className="text-3xl font-bold">Apply for Job</h1>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
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
                  <Briefcase className="mr-2 h-5 w-5 text-slate-400" />
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
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Application Process</CardTitle>
              <CardDescription>
                {job.interview_mode === "ai_interview"
                  ? "You'll be interviewed by our AI system"
                  : job.interview_mode === "mystery_challenge"
                    ? "You'll solve mystery challenges"
                    : "Standard application process"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {needsPermissions(job.interview_mode) && (
                <div className="space-y-4">
                  <h3 className="font-medium">Required Permissions</h3>

                  {requiredPermissions.camera && (
                    <div className="flex items-start space-x-2">
                      <Checkbox id="camera" checked={permissionsGranted.camera} disabled={true} />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor="camera"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          <div className="flex items-center">
                            <Camera className="mr-2 h-4 w-4" />
                            Camera Access
                          </div>
                        </label>
                        <p className="text-sm text-muted-foreground">Required for video interview</p>
                      </div>
                    </div>
                  )}

                  {requiredPermissions.microphone && (
                    <div className="flex items-start space-x-2">
                      <Checkbox id="microphone" checked={permissionsGranted.microphone} disabled={true} />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor="microphone"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          <div className="flex items-center">
                            <Mic className="mr-2 h-4 w-4" />
                            Microphone Access
                          </div>
                        </label>
                        <p className="text-sm text-muted-foreground">Required for audio responses</p>
                      </div>
                    </div>
                  )}

                  {requiredPermissions.screen && (
                    <div className="flex items-start space-x-2">
                      <Checkbox id="screen" checked={permissionsGranted.screen} disabled={true} />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor="screen"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          <div className="flex items-center">
                            <Monitor className="mr-2 h-4 w-4" />
                            Screen Sharing
                          </div>
                        </label>
                        <p className="text-sm text-muted-foreground">Required for coding challenges</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <h3 className="font-medium">Minimum Requirements</h3>
                <p className="text-sm">
                  <span className="font-medium">IQ Score:</span> {job.min_iq_score}+
                </p>
                <p className="text-sm">
                  <span className="font-medium">Domain Score:</span> {job.min_domain_score}+
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleApply} disabled={applying || alreadyApplied}>
                {applying
                  ? "Applying..."
                  : alreadyApplied
                    ? "Already Applied"
                    : needsPermissions(job.interview_mode) && !permissionsChecked
                      ? "Check Permissions"
                      : "Apply Now"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
