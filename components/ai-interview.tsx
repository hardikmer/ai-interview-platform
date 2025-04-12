"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mic, Camera, Monitor, Play, Pause, Send } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { startAIInterview, submitInterviewAnswer } from "@/lib/actions"

interface AIInterviewProps {
  jobId: number
  userId: number
  onComplete: (score: number) => void
}

export function AIInterview({ jobId, userId, onComplete }: AIInterviewProps) {
  const [step, setStep] = useState(1)
  const [deviceStatus, setDeviceStatus] = useState({
    camera: false,
    microphone: false,
    screen: false,
  })
  const [isRecording, setIsRecording] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState("")
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const [interviewScore, setInterviewScore] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(60)
  const [questions, setQuestions] = useState<any[]>([])
  const [answers, setAnswers] = useState<string[]>([])
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [feedback, setFeedback] = useState("")
  const videoRef = useRef<HTMLVideoElement>(null)
  const screenRef = useRef<HTMLVideoElement>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Request device permissions
  const requestDeviceAccess = async () => {
    try {
      // Request camera access
      const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = cameraStream
      }
      setDeviceStatus((prev) => ({ ...prev, camera: true }))

      // Request microphone access
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setDeviceStatus((prev) => ({ ...prev, microphone: true }))

      // Request screen sharing access
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true })
      if (screenRef.current) {
        screenRef.current.srcObject = screenStream
      }
      setDeviceStatus((prev) => ({ ...prev, screen: true }))

      toast({
        title: "Devices connected",
        description: "Camera, microphone, and screen sharing are now active.",
      })

      setStep(2)
    } catch (error) {
      toast({
        title: "Permission Error",
        description: "Please allow access to your camera, microphone, and screen.",
        variant: "destructive",
      })
    }
  }

  // Start the interview
  const startInterview = async () => {
    try {
      const result = await startAIInterview(jobId, userId)

      if (!result.success) {
        toast({
          title: "Error",
          description: result.message || "Failed to start interview",
          variant: "destructive",
        })
        return
      }

      setSessionId(result.sessionId)
      setQuestions(result.questions)
      setCurrentQuestion(result.questions[0].question)
      setIsRecording(true)

      // Start timer
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start interview",
        variant: "destructive",
      })
    }
  }

  // Submit answer and move to next question
  const submitAnswer = async () => {
    if (!sessionId || userAnswer.trim() === "") {
      toast({
        title: "Empty Answer",
        description: "Please provide an answer before continuing.",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await submitInterviewAnswer(sessionId, currentQuestionIndex, userAnswer)

      if (!result.success) {
        toast({
          title: "Error",
          description: result.message || "Failed to submit answer",
          variant: "destructive",
        })
        return
      }

      // Save the answer
      setAnswers((prev) => [...prev, userAnswer])
      setUserAnswer("")

      // Calculate progress
      const newProgress = Math.min(100, ((currentQuestionIndex + 1) / questions.length) * 100)
      setProgress(newProgress)

      if (result.completed) {
        // Interview is complete
        setInterviewScore(result.score)
        setFeedback(result.feedback)
        setIsRecording(false)
        setStep(3)
        onComplete(result.score)
      } else {
        // Move to next question
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        setCurrentQuestion(result.nextQuestion.question)
        setTimeRemaining(60)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit answer",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>AI Interview Session</CardTitle>
        <CardDescription>This interview will assess your skills and fit for the position.</CardDescription>
      </CardHeader>
      <CardContent>
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium">Device Setup</h3>
              <p className="text-sm text-muted-foreground mt-1">
                We need access to your camera, microphone, and screen to proceed with the interview.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className={deviceStatus.camera ? "border-green-500" : "border-gray-200"}>
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Camera</CardTitle>
                    <Camera className={deviceStatus.camera ? "text-green-500" : "text-gray-400"} size={18} />
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <video ref={videoRef} autoPlay muted className="w-full h-32 bg-gray-100 rounded-md object-cover" />
                </CardContent>
              </Card>

              <Card className={deviceStatus.microphone ? "border-green-500" : "border-gray-200"}>
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Microphone</CardTitle>
                    <Mic className={deviceStatus.microphone ? "text-green-500" : "text-gray-400"} size={18} />
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="w-full h-32 bg-gray-100 rounded-md flex items-center justify-center">
                    {deviceStatus.microphone ? (
                      <div className="flex flex-col items-center">
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className="w-1 bg-green-500 rounded-full animate-pulse"
                              style={{
                                height: `${Math.random() * 20 + 10}px`,
                                animationDelay: `${i * 0.1}s`,
                              }}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-green-500 mt-2">Microphone active</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500">Waiting for access...</span>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className={deviceStatus.screen ? "border-green-500" : "border-gray-200"}>
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Screen Sharing</CardTitle>
                    <Monitor className={deviceStatus.screen ? "text-green-500" : "text-gray-400"} size={18} />
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <video ref={screenRef} autoPlay muted className="w-full h-32 bg-gray-100 rounded-md object-cover" />
                </CardContent>
              </Card>
            </div>

            <Button
              onClick={requestDeviceAccess}
              className="w-full"
              disabled={deviceStatus.camera && deviceStatus.microphone && deviceStatus.screen}
            >
              {deviceStatus.camera && deviceStatus.microphone && deviceStatus.screen
                ? "Devices Connected"
                : "Connect Devices"}
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">Interview in Progress</h3>
                <p className="text-sm text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={isRecording ? "destructive" : "outline"}>{isRecording ? "Recording" : "Ready"}</Badge>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => (isRecording ? setIsRecording(false) : startInterview())}
                  disabled={isRecording && answers.length === 0}
                >
                  {isRecording ? <Pause size={16} /> : <Play size={16} />}
                </Button>
              </div>
            </div>

            <Progress value={progress} className="h-2" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-4">
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm font-medium">Current Question</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    {isRecording ? (
                      <div>
                        <p className="text-lg">{currentQuestion}</p>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Time remaining:</span>
                          <Badge variant={timeRemaining < 10 ? "destructive" : "secondary"}>
                            {timeRemaining} seconds
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">Click the play button to start the interview</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="space-y-2">
                  <Textarea
                    placeholder="Type your answer here..."
                    className="min-h-[120px]"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    disabled={!isRecording}
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={submitAnswer}
                      disabled={!isRecording || userAnswer.trim() === ""}
                      className="flex items-center"
                    >
                      <span>Submit Answer</span>
                      <Send size={16} className="ml-2" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      className="w-full h-40 bg-gray-100 rounded-md object-cover mb-2"
                    />
                    <p className="text-xs text-center text-muted-foreground">Camera Feed</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <video
                      ref={screenRef}
                      autoPlay
                      muted
                      className="w-full h-40 bg-gray-100 rounded-md object-cover mb-2"
                    />
                    <p className="text-xs text-center text-muted-foreground">Screen Share</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium">Interview Complete</h3>
              <p className="text-sm text-muted-foreground mt-1">Thank you for completing the AI interview session.</p>
            </div>

            <div className="flex justify-center">
              <div className="w-48 h-48 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold">{interviewScore}</span>
                </div>
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    className="text-gray-200"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                  <circle
                    className="text-primary"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - interviewScore / 100)}`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Interview Summary</h4>
              <Tabs defaultValue="questions">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="questions">Questions & Answers</TabsTrigger>
                  <TabsTrigger value="feedback">AI Feedback</TabsTrigger>
                </TabsList>
                <TabsContent value="questions" className="space-y-4 mt-4">
                  {questions.map((question, index) => (
                    <Card key={index}>
                      <CardHeader className="p-4">
                        <CardTitle className="text-sm font-medium">Question {index + 1}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="mb-2">{question.question}</p>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <p className="text-sm text-muted-foreground">Your Answer:</p>
                          <p>{answers[index] || "No answer provided"}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
                <TabsContent value="feedback" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm font-medium">Overall Feedback</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p>{feedback}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm font-medium">Strengths</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <ul className="list-disc pl-5 space-y-2">
                        <li>Clear communication and articulation of ideas</li>
                        <li>Strong technical knowledge in relevant areas</li>
                        <li>Thoughtful approach to problem-solving</li>
                      </ul>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm font-medium">Areas for Improvement</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <ul className="list-disc pl-5 space-y-2">
                        <li>Consider providing more specific examples</li>
                        <li>Expand on technical implementation details</li>
                        <li>Discuss collaboration and teamwork experiences</li>
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {step === 1 && (
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        )}

        {step === 2 && !isRecording && answers.length === 0 && (
          <Button onClick={startInterview} className="ml-auto">
            Start Interview
          </Button>
        )}

        {step === 3 && (
          <Button onClick={() => router.push("/dashboard")} className="ml-auto">
            Return to Dashboard
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
