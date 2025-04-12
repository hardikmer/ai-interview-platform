"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Briefcase, Building, DollarSign, MapPin, Tag, Layers, Brain } from "lucide-react"
import { directPostJob, listAllCompanies } from "@/lib/direct-job-post"

interface Company {
  id: number
  name: string
  industry: string
  size: string
}

export default function PostJobPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<number | null>(null)
  const [companyName, setCompanyName] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    category: "software-development",
    salary_min: 50000,
    salary_max: 100000,
    interview_mode: "ai_interview",
    min_iq_score: 70,
    min_domain_score: 70,
    skills: [""] as string[],
  })

  // Fetch companies on component mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const result = await listAllCompanies()
        if (result.success && result.companies) {
          setCompanies(result.companies as Company[])
        }
      } catch (error) {
        console.error("Error fetching companies:", error)
      }
    }

    fetchCompanies()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCompanyChange = (value: string) => {
    const companyId = Number.parseInt(value, 10)
    setSelectedCompany(companyId)

    // Set the company name based on the selected company
    const company = companies.find((c) => c.id === companyId)
    if (company) {
      setCompanyName(company.name)
    }
  }

  const handleSkillChange = (index: number, value: string) => {
    const updatedSkills = [...formData.skills]
    updatedSkills[index] = value
    setFormData((prev) => ({ ...prev, skills: updatedSkills }))
  }

  const addSkill = () => {
    setFormData((prev) => ({ ...prev, skills: [...prev.skills, ""] }))
  }

  const removeSkill = (index: number) => {
    const updatedSkills = formData.skills.filter((_, i) => i !== index)
    setFormData((prev) => ({ ...prev, skills: updatedSkills }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Validate form data
      if (!formData.title || !formData.description || !formData.location) {
        throw new Error("Please fill in all required fields")
      }

      if (!selectedCompany && !companyName) {
        throw new Error("Please select a company or enter a company name")
      }

      // Filter out empty skills
      const filteredSkills = formData.skills.filter((skill) => skill.trim() !== "")

      // Create job data object
      const jobData = {
        company_id: selectedCompany || 0,
        company_name: companyName,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        category: formData.category,
        salary_min: Number.parseInt(formData.salary_min.toString(), 10),
        salary_max: Number.parseInt(formData.salary_max.toString(), 10),
        interview_mode: formData.interview_mode,
        min_iq_score: Number.parseInt(formData.min_iq_score.toString(), 10),
        min_domain_score: Number.parseInt(formData.min_domain_score.toString(), 10),
        skills: filteredSkills,
      }

      console.log("Submitting job data:", jobData)

      // Post job to database
      const result = await directPostJob(jobData)

      if (!result.success) {
        throw new Error(`Failed to add job: ${result.error}`)
      }

      console.log("Job posted successfully with ID:", result.jobId)

      // Show success message (optional)
      alert("Job posted successfully!")
      // or use a toast notification if you have that set up

      // Redirect to jobs page
      router.push("/employers/dashboard")
    } catch (error) {
      console.error("Error posting job:", error)
      setError(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">Post a New Job</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>Select your company or enter a new one</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company">Select Company</Label>
                <Select onValueChange={(value) => handleCompanyChange(value)}>
                  <SelectTrigger id="company">
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id.toString()}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName">Or Enter Company Name</Label>
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-slate-400" />
                  <Input
                    id="companyName"
                    placeholder="Company name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
            <CardDescription>Provide information about the position</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <div className="flex items-center space-x-2">
                <Briefcase className="h-4 w-4 text-slate-400" />
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g. Senior Frontend Developer"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Job Description *</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe the role, responsibilities, and requirements"
                value={formData.description}
                onChange={handleInputChange}
                rows={5}
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <Input
                    id="location"
                    name="location"
                    placeholder="e.g. San Francisco, CA or Remote"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <div className="flex items-center space-x-2">
                  <Tag className="h-4 w-4 text-slate-400" />
                  <Select
                    name="category"
                    value={formData.category}
                    onValueChange={(value) => handleSelectChange("category", value)}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="software-development">Software Development</SelectItem>
                      <SelectItem value="data-science">Data Science</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="product-management">Product Management</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="customer-support">Customer Support</SelectItem>
                      <SelectItem value="operations">Operations</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="human-resources">Human Resources</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="salary_min">Minimum Salary</Label>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-slate-400" />
                  <Input
                    id="salary_min"
                    name="salary_min"
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.salary_min}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary_max">Maximum Salary</Label>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-slate-400" />
                  <Input
                    id="salary_max"
                    name="salary_max"
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.salary_max}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Skills Required</CardTitle>
            <CardDescription>List the skills required for this position</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.skills.map((skill, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Layers className="h-4 w-4 text-slate-400" />
                <Input
                  placeholder={`Skill ${index + 1}`}
                  value={skill}
                  onChange={(e) => handleSkillChange(index, e.target.value)}
                />
                {formData.skills.length > 1 && (
                  <Button type="button" variant="outline" size="sm" onClick={() => removeSkill(index)}>
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addSkill}>
              Add Skill
            </Button>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Interview Mode</CardTitle>
            <CardDescription>Select how candidates will be evaluated</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={formData.interview_mode}
              onValueChange={(value) => handleSelectChange("interview_mode", value)}
              className="space-y-4"
            >
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="ai_interview" id="ai_interview" />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="ai_interview" className="font-medium">
                    AI Interview
                  </Label>
                  <p className="text-sm text-slate-400">
                    Candidates will be interviewed by our AI system with custom questions for this role.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="mystery_challenge" id="mystery_challenge" />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="mystery_challenge" className="font-medium">
                    Mystery Challenge
                  </Label>
                  <p className="text-sm text-slate-400">
                    Candidates will solve mystery challenges to demonstrate their problem-solving skills.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="standard" id="standard" />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="standard" className="font-medium">
                    Standard Interview
                  </Label>
                  <p className="text-sm text-slate-400">
                    Traditional interview process with resume screening and in-person interviews.
                  </p>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Minimum Score Requirements</CardTitle>
            <CardDescription>Set minimum scores for candidate evaluation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="min_iq_score">Minimum IQ Score (0-100)</Label>
                <div className="flex items-center space-x-2">
                  <Brain className="h-4 w-4 text-slate-400" />
                  <Input
                    id="min_iq_score"
                    name="min_iq_score"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.min_iq_score}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="min_domain_score">Minimum Domain Score (0-100)</Label>
                <div className="flex items-center space-x-2">
                  <Brain className="h-4 w-4 text-slate-400" />
                  <Input
                    id="min_domain_score"
                    name="min_domain_score"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.min_domain_score}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Posting..." : "Post Job"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
