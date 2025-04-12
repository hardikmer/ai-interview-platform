"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ArrowRight, Clock } from "lucide-react"
import { getDbClient } from "@/lib/db"

export default function ApplicationSuccessPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [jobTitle, setJobTitle] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [interviewMode, setInterviewMode] = useState("")

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const jobId = Number.parseInt(params.id, 10)
        if (isNaN(jobId)) return

        const sql = getDbClient()
        if (!sql) return

        const result = await sql`
          SELECT title, company_name, interview_mode FROM job_postings WHERE id = ${jobId} LIMIT 1
        `

        if (result.length > 0) {
          setJobTitle(result[0].title)
          setCompanyName(result[0].company_name)
          setInterviewMode(result[0].interview_mode)

          // If it's an AI interview, redirect to setup page
          if (result[0].interview_mode === "ai_interview") {
            router.push(`/jobs/${params.id}/interview/setup`)
          }
        }
      } catch (error) {
        console.error("Error fetching job details:", error)
      }
    }

    fetchJobDetails()
  }, [params.id, router])

  const handleStartInterview = () => {
    router.push(`/jobs/${params.id}/interview/setup`)
  }

  return (
    <div className="container mx-auto py-12">
      <Card className="max-w-md mx-auto border-slate-800 bg-slate-900/50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Application Submitted!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p>
            Your application for <span className="font-medium">{jobTitle}</span> at{" "}
            <span className="font-medium">{companyName}</span> has been successfully submitted.
          </p>

          {interviewMode === "ai_interview" && (
            <div className="bg-blue-900/20 border border-blue-800 p-4 rounded-md">
              <h3 className="font-medium text-blue-400 mb-2">Next Step: AI Interview</h3>
              <p className="text-sm text-blue-300 mb-4">
                This position requires an AI interview as part of the application process. You can start the interview
                now or come back later from your dashboard.
              </p>
              <Button onClick={handleStartInterview} className="bg-blue-600 hover:bg-blue-700">
                Start Interview <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {interviewMode === "mystery_challenge" && (
            <div className="bg-purple-900/20 border border-purple-800 p-4 rounded-md">
              <h3 className="font-medium text-purple-400 mb-2">Next Step: Mystery Challenge</h3>
              <p className="text-sm text-purple-300">
                This position requires completing a mystery challenge as part of the application process. You can access
                the challenge from your dashboard.
              </p>
            </div>
          )}

          {interviewMode === "standard" && (
            <div className="bg-slate-800 border border-slate-700 p-4 rounded-md flex items-center">
              <Clock className="h-5 w-5 text-slate-400 mr-3 flex-shrink-0" />
              <p className="text-sm text-slate-300">
                Your application will be reviewed by the hiring team. You'll be notified of any updates.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            variant="outline"
            className="mr-2 border-slate-700 bg-slate-800 hover:bg-slate-700"
            onClick={() => router.push("/jobs")}
          >
            Browse More Jobs
          </Button>
          <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
