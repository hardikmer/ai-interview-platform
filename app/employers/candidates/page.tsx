"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Search, Filter, Brain, Code, ArrowLeft, MessageSquare } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"
import Link from "next/link"

// Mock candidate data
const mockCandidates = [
  {
    id: "1",
    name: "John Doe",
    title: "Senior Software Engineer",
    skills: ["JavaScript", "React", "Node.js"],
    iqScore: 92,
    domainScore: 84,
    overallScore: 87,
    location: "New York, NY",
    experience: "5 years",
    availability: "2 weeks",
    lastActive: "2 days ago",
  },
  {
    id: "2",
    name: "Jane Smith",
    title: "UX/UI Designer",
    skills: ["Figma", "UI Design", "User Research"],
    iqScore: 88,
    domainScore: 90,
    overallScore: 89,
    location: "San Francisco, CA",
    experience: "4 years",
    availability: "Immediate",
    lastActive: "1 day ago",
  },
  {
    id: "3",
    name: "Michael Johnson",
    title: "Data Scientist",
    skills: ["Python", "Machine Learning", "SQL"],
    iqScore: 95,
    domainScore: 88,
    overallScore: 91,
    location: "Remote",
    experience: "3 years",
    availability: "1 month",
    lastActive: "3 days ago",
  },
  {
    id: "4",
    name: "Emily Chen",
    title: "Product Manager",
    skills: ["Product Strategy", "Agile", "User Stories"],
    iqScore: 90,
    domainScore: 86,
    overallScore: 88,
    location: "Boston, MA",
    experience: "6 years",
    availability: "2 months",
    lastActive: "5 days ago",
  },
  {
    id: "5",
    name: "David Wilson",
    title: "DevOps Engineer",
    skills: ["Docker", "Kubernetes", "AWS"],
    iqScore: 87,
    domainScore: 92,
    overallScore: 90,
    location: "Seattle, WA",
    experience: "4 years",
    availability: "3 weeks",
    lastActive: "1 week ago",
  },
]

export default function CandidatesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [minIqScore, setMinIqScore] = useState([70])
  const [minDomainScore, setMinDomainScore] = useState([70])

  // Filter candidates based on search and score thresholds
  const filteredCandidates = mockCandidates.filter(
    (candidate) =>
      (candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase()))) &&
      candidate.iqScore >= minIqScore[0] &&
      candidate.domainScore >= minDomainScore[0],
  )

  return (
    <ProtectedRoute requiredRole="employer">
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/employers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Candidate Search</h1>
            <p className="text-slate-300">Find talent with verified skills</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Filters */}
          <Card className="border-slate-800 bg-slate-900/50 lg:col-span-1">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Minimum IQ Score</label>
                <div className="flex items-center justify-between">
                  <Slider
                    defaultValue={[70]}
                    max={100}
                    step={1}
                    value={minIqScore}
                    onValueChange={setMinIqScore}
                    className="w-4/5"
                  />
                  <span className="w-8 text-right text-sm font-medium">{minIqScore[0]}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Minimum Domain Score</label>
                <div className="flex items-center justify-between">
                  <Slider
                    defaultValue={[70]}
                    max={100}
                    step={1}
                    value={minDomainScore}
                    onValueChange={setMinDomainScore}
                    className="w-4/5"
                  />
                  <span className="w-8 text-right text-sm font-medium">{minDomainScore[0]}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Skills</label>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="cursor-pointer hover:bg-slate-800">
                    JavaScript
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-slate-800">
                    React
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-slate-800">
                    Python
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-slate-800">
                    UI/UX
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-slate-800">
                    + Add
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input placeholder="Any location" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Availability</label>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="cursor-pointer hover:bg-slate-800">
                    Immediate
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-slate-800">
                    2 Weeks
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-slate-800">
                    1 Month
                  </Badge>
                </div>
              </div>

              <Button variant="outline" className="w-full">
                Reset Filters
              </Button>
            </CardContent>
          </Card>

          {/* Candidates List */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search candidates by name, title, or skills..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            <Tabs defaultValue="all">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All Candidates</TabsTrigger>
                <TabsTrigger value="shortlisted">Shortlisted</TabsTrigger>
                <TabsTrigger value="contacted">Contacted</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <div className="space-y-4">
                  {filteredCandidates.length > 0 ? (
                    filteredCandidates.map((candidate) => (
                      <Card
                        key={candidate.id}
                        className="border-slate-800 bg-slate-900/50 hover:border-purple-900/50 transition-colors"
                      >
                        <CardContent className="p-6">
                          <div className="flex flex-col gap-4 md:flex-row md:items-center">
                            <Avatar className="h-16 w-16">
                              <AvatarFallback className="bg-purple-900 text-purple-100 text-xl">
                                {candidate.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold">{candidate.name}</h3>
                                <Badge className="bg-purple-600">Top Talent</Badge>
                              </div>
                              <p className="text-slate-300">{candidate.title}</p>
                              <div className="flex flex-wrap gap-2">
                                {candidate.skills.map((skill) => (
                                  <Badge key={skill} variant="outline" className="border-slate-700 text-slate-300">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-3 md:w-48">
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-slate-400">IQ Score</span>
                                  <span>{candidate.iqScore}</span>
                                </div>
                                <Progress
                                  value={candidate.iqScore}
                                  className="h-1.5 bg-slate-800"
                                  indicatorColor="bg-blue-600"
                                />
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-slate-400">Domain Score</span>
                                  <span>{candidate.domainScore}</span>
                                </div>
                                <Progress
                                  value={candidate.domainScore}
                                  className="h-1.5 bg-slate-800"
                                  indicatorColor="bg-pink-600"
                                />
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-slate-400">Overall Score</span>
                                  <span>{candidate.overallScore}</span>
                                </div>
                                <Progress
                                  value={candidate.overallScore}
                                  className="h-1.5 bg-slate-800"
                                  indicatorColor="bg-purple-600"
                                />
                              </div>
                            </div>

                            <div className="flex flex-col gap-2">
                              <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Contact
                              </Button>
                              <Button size="sm" variant="outline">
                                View Profile
                              </Button>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-400">
                            <div>Location: {candidate.location}</div>
                            <div>Experience: {candidate.experience}</div>
                            <div>Availability: {candidate.availability}</div>
                            <div>Last active: {candidate.lastActive}</div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="py-12 text-center text-slate-400">
                      <Brain className="mx-auto h-12 w-12 opacity-20" />
                      <p className="mt-4">No candidates match your search criteria.</p>
                      <p>Try adjusting your filters or search terms.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="shortlisted">
                <div className="py-12 text-center text-slate-400">
                  <Code className="mx-auto h-12 w-12 opacity-20" />
                  <p className="mt-4">You haven't shortlisted any candidates yet.</p>
                  <p>Browse candidates and add them to your shortlist.</p>
                </div>
              </TabsContent>

              <TabsContent value="contacted">
                <div className="py-12 text-center text-slate-400">
                  <MessageSquare className="mx-auto h-12 w-12 opacity-20" />
                  <p className="mt-4">You haven't contacted any candidates yet.</p>
                  <p>Find candidates and reach out to them.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
