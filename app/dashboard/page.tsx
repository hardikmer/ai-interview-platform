"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ScoreChart } from "@/components/score-chart"
import { AlertCircle, Trophy, BookOpen, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"
import { getDbClient } from "@/lib/db"
import { Badge } from "@/components/ui/badge"

interface JobApplication {
  id: number
  job_id: number
  job_title: string
  company_name: string
  status: string
  applied_at: string
}

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [completedMysteries, setCompletedMysteries] = useState(user?.completedMysteries?.length || 0)
  const [inProgressMysteries, setInProgressMysteries] = useState(user?.inProgressMysteries?.length || 0)
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [isLoadingApplications, setIsLoadingApplications] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    } else if (user) {
      // Fetch user's progress data
      const fetchUserProgress = async () => {
        try {
          // This would normally be a server action to fetch progress
          // For now, we'll use the data from localStorage
          const storedUser = localStorage.getItem("user")
          if (storedUser) {
            const userData = JSON.parse(storedUser)

            // Update state with the latest user data
            if (userData.completedMysteries) {
              setCompletedMysteries(userData.completedMysteries.length)
            }

            if (userData.inProgressMysteries) {
              setInProgressMysteries(userData.inProgressMysteries.length)
            }
          }
        } catch (error) {
          console.error("Error fetching user progress:", error)
        }
      }

      fetchUserProgress()

      // Fetch user's job applications
      const fetchJobApplications = async () => {
        try {
          setIsLoadingApplications(true)
          const sql = getDbClient()
          if (sql && user.id) {
            const result = await sql`
              SELECT ja.id, ja.job_id, ja.status, ja.created_at as applied_at, 
                     jp.title as job_title, jp.company_name
              FROM job_applications ja
              JOIN job_postings jp ON ja.job_id = jp.id
              WHERE ja.user_id = ${Number.parseInt(user.id)}
              ORDER BY ja.created_at DESC
            `
            setApplications(result)
          }
        } catch (error) {
          console.error("Error fetching job applications:", error)
        } finally {
          setIsLoadingApplications(false)
        }
      }

      fetchJobApplications()
    }
  }, [isLoading, isAuthenticated, router, user])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-primary border-solid rounded-full border-t-transparent animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

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
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Candidate Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Overall Score</CardTitle>
            <CardDescription>Your performance across all challenges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-4xl font-bold">{user?.overallScore || 0}</div>
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">IQ Score</CardTitle>
            <CardDescription>Your problem-solving ability</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-4xl font-bold">{user?.iqScore || 0}</div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Domain Score</CardTitle>
            <CardDescription>Your technical expertise</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-4xl font-bold">{user?.domainScore || 0}</div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">My Progress</TabsTrigger>
          <TabsTrigger value="applications">Job Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>Your scores across different categories</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ScoreChart
                  data={[
                    { name: "Overall", value: user.overallScore || 0 },
                    { name: "IQ", value: user.iqScore || 0 },
                    { name: "Domain", value: user.domainScore || 0 },
                  ]}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mystery Challenges</CardTitle>
                <CardDescription>Your progress on mystery challenges</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Completed</span>
                    <span className="font-bold">{completedMysteries}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-green-600 h-2.5 rounded-full"
                      style={{
                        width: `${(completedMysteries / (completedMysteries + inProgressMysteries || 1)) * 100}%`,
                      }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>In Progress</span>
                    <span className="font-bold">{inProgressMysteries}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{
                        width: `${(inProgressMysteries / (completedMysteries + inProgressMysteries || 1)) * 100}%`,
                      }}
                    ></div>
                  </div>

                  <div className="pt-4">
                    <Link href="/mysteries">
                      <Button className="w-full">Explore More Mysteries</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle>My Progress</CardTitle>
              <CardDescription>Track your completed and in-progress mysteries</CardDescription>
            </CardHeader>
            <CardContent>
              {completedMysteries === 0 && inProgressMysteries === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No mysteries attempted yet</AlertTitle>
                  <AlertDescription>
                    Start solving mysteries to build your profile and improve your scores.
                    <div className="mt-4">
                      <Link href="/mysteries">
                        <Button>Explore Mysteries</Button>
                      </Link>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-6">
                  {completedMysteries > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-3">Completed Mysteries</h3>
                      <div className="space-y-2">
                        {user.completedMysteries?.map((id) => (
                          <div
                            key={id}
                            className="p-3 bg-green-50 border border-green-200 rounded-md flex justify-between items-center"
                          >
                            <span>Mystery #{id}</span>
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          </div>
                        )) || <p>No completed mysteries yet.</p>}
                      </div>
                    </div>
                  )}

                  {inProgressMysteries > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-3">In Progress</h3>
                      <div className="space-y-2">
                        {user.inProgressMysteries?.map((id) => (
                          <div
                            key={id}
                            className="p-3 bg-blue-50 border border-blue-200 rounded-md flex justify-between items-center"
                          >
                            <span>Mystery #{id}</span>
                            <Link href={`/mysteries/${id}`}>
                              <Button variant="outline" size="sm">
                                Continue
                              </Button>
                            </Link>
                          </div>
                        )) || <p>No mysteries in progress.</p>}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Job Applications</CardTitle>
              <CardDescription>Track your job applications</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingApplications ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-primary border-solid rounded-full border-t-transparent animate-spin"></div>
                </div>
              ) : applications.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No job applications yet</AlertTitle>
                  <AlertDescription>
                    Apply to jobs to see your applications here.
                    <div className="mt-4">
                      <Link href="/jobs">
                        <Button>Browse Jobs</Button>
                      </Link>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <div key={application.id} className="p-4 border rounded-lg bg-slate-800/20">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium text-lg">{application.job_title}</h3>
                          <p className="text-slate-400">{application.company_name}</p>
                        </div>
                        {getStatusBadge(application.status)}
                      </div>
                      <div className="flex items-center text-sm text-slate-400 mt-2">
                        <Clock className="h-4 w-4 mr-1" />
                        Applied on {formatDate(application.applied_at)}
                      </div>
                      <div className="mt-4">
                        <Link href={`/jobs/${application.job_id}`}>
                          <Button variant="outline" size="sm">
                            View Job
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
