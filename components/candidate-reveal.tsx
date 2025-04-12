"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, Trophy, Calendar, Briefcase, Mail, Phone } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Candidate {
  id: string
  name: string
  email: string
  phone: string
  avatar: string
  score: number
  mysteryPoints: number
  interviewScore: number
  skills: string[]
  experience: number
  education: string
  previousApplications: {
    company: string
    position: string
    date: string
    status: "hired" | "rejected" | "withdrawn"
  }[]
}

interface CandidateRevealProps {
  candidate: Candidate
  jobId: string
  onHire: (candidateId: string) => void
  onReject: (candidateId: string) => void
}

export function CandidateReveal({ candidate, jobId, onHire, onReject }: CandidateRevealProps) {
  const [revealStage, setRevealStage] = useState<"anonymous" | "partial" | "full">("anonymous")
  const { toast } = useToast()

  const handleReveal = (stage: "partial" | "full") => {
    if (stage === "partial" && revealStage === "anonymous") {
      setRevealStage("partial")
      toast({
        title: "Candidate Partially Revealed",
        description: "You can now see the candidate's skills and experience.",
      })
    } else if (stage === "full" && revealStage === "partial") {
      setRevealStage("full")
      toast({
        title: "Candidate Fully Revealed",
        description: "You can now see the candidate's complete profile.",
      })
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>
              {revealStage === "anonymous"
                ? "Anonymous Candidate"
                : revealStage === "partial"
                  ? "Partially Revealed Candidate"
                  : candidate.name}
            </CardTitle>
            <CardDescription>
              {revealStage === "anonymous"
                ? "Candidate ID: " + candidate.id.substring(0, 8)
                : revealStage === "partial"
                  ? "Skills and Experience Revealed"
                  : "Full Profile Revealed"}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="flex items-center">
              <Trophy className="mr-1 h-3 w-3" />
              <span>Score: {candidate.score}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3 flex flex-col items-center">
            <div className="relative">
              {revealStage === "anonymous" ? (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                  <EyeOff className="h-12 w-12 text-gray-400" />
                </div>
              ) : (
                <Avatar className="w-32 h-32 border-4 border-primary/10">
                  {revealStage === "full" ? (
                    <AvatarImage src={candidate.avatar} alt={candidate.name} />
                  ) : (
                    <AvatarFallback className="text-2xl">
                      {candidate.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  )}
                </Avatar>
              )}
              <Badge className="absolute bottom-0 right-0 transform translate-x-1/4" variant="secondary">
                {revealStage === "anonymous" ? "Anonymous" : revealStage === "partial" ? "Partial" : "Revealed"}
              </Badge>
            </div>

            <div className="mt-6 space-y-4 w-full">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground flex justify-between">
                  <span>Mystery Points</span>
                  <span className="font-medium">{candidate.mysteryPoints}</span>
                </div>
                <Progress value={candidate.mysteryPoints} max={100} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground flex justify-between">
                  <span>Interview Score</span>
                  <span className="font-medium">{candidate.interviewScore}</span>
                </div>
                <Progress value={candidate.interviewScore} max={100} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground flex justify-between">
                  <span>Overall Score</span>
                  <span className="font-medium">{candidate.score}</span>
                </div>
                <Progress value={candidate.score} max={100} className="h-2" />
              </div>
            </div>
          </div>

          <div className="md:w-2/3 space-y-6">
            <Tabs defaultValue="skills">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="skills">Skills & Experience</TabsTrigger>
                <TabsTrigger value="history" disabled={revealStage === "anonymous"}>
                  Application History
                </TabsTrigger>
                <TabsTrigger value="contact" disabled={revealStage !== "full"}>
                  Contact Info
                </TabsTrigger>
              </TabsList>

              <TabsContent value="skills" className="space-y-4 mt-4">
                {revealStage === "anonymous" ? (
                  <div className="text-center py-8">
                    <EyeOff className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-muted-foreground">Reveal candidate to see skills and experience</p>
                    <Button variant="outline" className="mt-4" onClick={() => handleReveal("partial")}>
                      <Eye className="mr-2 h-4 w-4" />
                      Reveal Skills & Experience
                    </Button>
                  </div>
                ) : (
                  <>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {candidate.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Experience</h4>
                      <div className="flex items-center">
                        <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{candidate.experience} years</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Education</h4>
                      <p>{candidate.education}</p>
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="history" className="space-y-4 mt-4">
                {revealStage === "anonymous" ? (
                  <div className="text-center py-8">
                    <EyeOff className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-muted-foreground">Reveal candidate to see application history</p>
                  </div>
                ) : (
                  <div>
                    <h4 className="text-sm font-medium mb-4">Previous Applications</h4>
                    {candidate.previousApplications.length > 0 ? (
                      <div className="space-y-3">
                        {candidate.previousApplications.map((app, index) => (
                          <Card key={index}>
                            <CardContent className="p-4 flex justify-between items-center">
                              <div>
                                <p className="font-medium">{app.position}</p>
                                <p className="text-sm text-muted-foreground">{app.company}</p>
                                <div className="flex items-center mt-1">
                                  <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">{app.date}</span>
                                </div>
                              </div>
                              <Badge
                                variant={
                                  app.status === "hired"
                                    ? "default"
                                    : app.status === "rejected"
                                      ? "destructive"
                                      : "outline"
                                }
                              >
                                {app.status}
                              </Badge>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No previous applications found.</p>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="contact" className="space-y-4 mt-4">
                {revealStage !== "full" ? (
                  <div className="text-center py-8">
                    <EyeOff className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-muted-foreground">Fully reveal candidate to see contact information</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{candidate.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{candidate.phone}</span>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {revealStage === "anonymous" && (
          <Button variant="outline" className="w-full" onClick={() => handleReveal("partial")}>
            <Eye className="mr-2 h-4 w-4" />
            Reveal Skills & Experience
          </Button>
        )}

        {revealStage === "partial" && (
          <>
            <Button variant="outline" className="w-1/2 mr-2" onClick={() => handleReveal("full")}>
              <Eye className="mr-2 h-4 w-4" />
              Fully Reveal Candidate
            </Button>
            <Button variant="destructive" className="w-1/2" onClick={() => onReject(candidate.id)}>
              Reject Candidate
            </Button>
          </>
        )}

        {revealStage === "full" && (
          <>
            <Button variant="destructive" className="w-1/2 mr-2" onClick={() => onReject(candidate.id)}>
              Reject Candidate
            </Button>
            <Button
              variant="default"
              className="w-1/2 bg-green-600 hover:bg-green-700"
              onClick={() => onHire(candidate.id)}
            >
              Hire Candidate
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}
