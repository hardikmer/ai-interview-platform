"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Brain, Code, MessageSquare, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import ProtectedRoute from "@/components/protected-route"
import { useAuthContext } from "@/components/auth-provider"
import { useJobs, type InterviewMode } from "@/lib/jobs"
import { useMysteries } from "@/lib/mysteries"
import Link from "next/link"

export default function PostJobPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuthContext()
  const { addJob } = useJobs()
  const { mysteries } = useMysteries()

  const [title, setTitle] = useState("")
  const [location, setLocation] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [salaryMin, setSalaryMin] = useState("")
  const [salaryMax, setSalaryMax] = useState("")
  const [iqThreshold, setIqThreshold] = useState([70])
  const [domainThreshold, setDomainThreshold] = useState([70])
  const [interviewMode, setInterviewMode] = useState<InterviewMode>("mystery-points")
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState("")
  const [selectedMysteries, setSelectedMysteries] = useState<string[]>([])

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill("")
    }
  }

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill))
  }

  const handleToggleMystery = (mysteryId: string) => {
    if (selectedMysteries.includes(mysteryId)) {
      setSelectedMysteries(selectedMysteries.filter((id) => id !== mysteryId))
    } else {
      setSelectedMysteries([...selectedMysteries, mysteryId])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !location || !category || !description || !salaryMin || !salaryMax || skills.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (interviewMode === "custom-mysteries" && selectedMysteries.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one mystery for the custom mysteries interview mode",
        variant: "destructive",
      })
      return
    }

    try {
      // Add the job
      const jobId = addJob({
        companyId: user?.id || "unknown",
        companyName: user?.name || "Unknown Company",
        title,
        description,
        location,
        category,
        salaryRange: {
          min: Number.parseInt(salaryMin),
          max: Number.parseInt(salaryMax),
        },
        skills,
        interviewMode,
        customMysteryIds: interviewMode === "custom-mysteries" ? selectedMysteries : undefined,
        minIqScore: iqThreshold[0],
        minDomainScore: domainThreshold[0],
        active: true,
      })

      toast({
        title: "Success",
        description: "Your job has been posted successfully",
      })

      // Redirect to the job details page
      router.push(`/employers/jobs/${jobId}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while posting the job",
        variant: "destructive",
      })
    }
  }

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
            <h1 className="text-3xl font-bold">Post a New Job</h1>
            <p className="text-slate-300">Find candidates with verified skills</p>
          </div>
        </div>

        <Card className="border-slate-800 bg-slate-900/50">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
              <CardDescription>Provide information about the position you're hiring for</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g. Senior Software Engineer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    placeholder="e.g. Remote, New York, NY"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Job Category *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="development">Software Development</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="data">Data Science</SelectItem>
                      <SelectItem value="product">Product Management</SelectItem>
                      <SelectItem value="devops">DevOps</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="salaryMin">Minimum Salary *</Label>
                  <div className="flex items-center">
                    <span className="mr-2">$</span>
                    <Input
                      id="salaryMin"
                      type="number"
                      placeholder="e.g. 80000"
                      value={salaryMin}
                      onChange={(e) => setSalaryMin(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salaryMax">Maximum Salary *</Label>
                  <div className="flex items-center">
                    <span className="mr-2">$</span>
                    <Input
                      id="salaryMax"
                      type="number"
                      placeholder="e.g. 120000"
                      value={salaryMax}
                      onChange={(e) => setSalaryMax(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Job Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the role, responsibilities, and requirements..."
                  className="min-h-[150px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Required Skills *</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {skills.map((skill) => (
                    <Badge key={skill} className="bg-purple-600 flex items-center gap-1">
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="ml-1 rounded-full hover:bg-purple-700 p-0.5"
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove {skill}</span>
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddSkill()
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddSkill} variant="outline">
                    Add
                  </Button>
                </div>
              </div>

              <div className="space-y-6 pt-4">
                <CardTitle className="text-lg">Skill Requirements</CardTitle>
                <CardDescription>Set minimum thresholds for candidate skills</CardDescription>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Minimum IQ Score</Label>
                      <span className="text-sm font-medium">{iqThreshold[0]}</span>
                    </div>
                    <Slider defaultValue={[70]} max={100} step={1} value={iqThreshold} onValueChange={setIqThreshold} />
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>50</span>
                      <span>75</span>
                      <span>100</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Minimum Domain Score</Label>
                      <span className="text-sm font-medium">{domainThreshold[0]}</span>
                    </div>
                    <Slider
                      defaultValue={[70]}
                      max={100}
                      step={1}
                      value={domainThreshold}
                      onValueChange={setDomainThreshold}
                    />
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>50</span>
                      <span>75</span>
                      <span>100</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-base">Interview Mode *</Label>
                    <CardDescription>Select how candidates will be initially screened</CardDescription>
                  </div>

                  <RadioGroup value={interviewMode} onValueChange={(value) => setInterviewMode(value as InterviewMode)}>
                    <div className="flex flex-col space-y-4">
                      <div className="flex items-start space-x-3 rounded-md border border-slate-700 p-4">
                        <RadioGroupItem value="mystery-points" id="mystery-points" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="mystery-points" className="text-base font-medium">
                            <div className="flex items-center gap-2">
                              <Brain className="h-5 w-5 text-purple-400" />
                              Mystery Points Screening
                            </div>
                          </Label>
                          <p className="text-sm text-slate-400 mt-1">
                            Filter candidates based on their existing Mystery Challenge scores. Only candidates who meet
                            your minimum IQ and Domain score requirements will be shown.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 rounded-md border border-slate-700 p-4">
                        <RadioGroupItem value="custom-mysteries" id="custom-mysteries" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="custom-mysteries" className="text-base font-medium">
                            <div className="flex items-center gap-2">
                              <Code className="h-5 w-5 text-blue-400" />
                              Custom Mystery Challenges
                            </div>
                          </Label>
                          <p className="text-sm text-slate-400 mt-1">
                            Select specific mysteries that candidates must complete as part of the application process.
                            Candidates will be evaluated based on their performance in these challenges.
                          </p>

                          {interviewMode === "custom-mysteries" && (
                            <div className="mt-4 space-y-3">
                              <Label>Select Mysteries</Label>
                              <div className="grid gap-3 md:grid-cols-2">
                                {mysteries.map((mystery) => (
                                  <div
                                    key={mystery.id}
                                    className={`flex items-center gap-3 rounded-md border p-3 cursor-pointer transition-colors ${
                                      selectedMysteries.includes(mystery.id)
                                        ? "border-purple-500 bg-purple-900/20"
                                        : "border-slate-700 hover:border-slate-600"
                                    }`}
                                    onClick={() => handleToggleMystery(mystery.id)}
                                  >
                                    <div className={`h-10 w-10 rounded bg-gradient-to-br ${mystery.gradient}`}></div>
                                    <div className="flex-1">
                                      <div className="font-medium">{mystery.title}</div>
                                      <div className="text-xs text-slate-400">{mystery.duration}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 rounded-md border border-slate-700 p-4">
                        <RadioGroupItem value="ai-interview" id="ai-interview" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="ai-interview" className="text-base font-medium">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="h-5 w-5 text-green-400" />
                              AI Live Interview
                            </div>
                          </Label>
                          <p className="text-sm text-slate-400 mt-1">
                            Candidates will participate in an AI-powered interview with questions tailored to the job
                            requirements. The AI will evaluate responses and provide a comprehensive assessment.
                          </p>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-4">
              <Button variant="outline" type="button" asChild>
                <Link href="/employers">Cancel</Link>
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                Post Job
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
