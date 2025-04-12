"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Brain,
  Clock,
  Star,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Trophy,
  FileText,
  Lock,
  Loader2,
} from "lucide-react"
import { useMysteries, type MysteryChallenge } from "@/lib/mysteries"
import { useAuthContext } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import ProtectedRoute from "@/components/protected-route"
import Link from "next/link"

export default function MysteryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuthContext()
  const { mysteries, isLoading, error, fetchMysteries, getChallengesByMysteryId, updateProgress } = useMysteries()

  const mysteryId = params.id as string
  const [mystery, setMystery] = useState<any>(null)
  const [mysteryChallenges, setMysteryChallenges] = useState<MysteryChallenge[]>([])
  const [loadingChallenges, setLoadingChallenges] = useState(true)
  const [loadingMystery, setLoadingMystery] = useState(true)

  const [currentStep, setCurrentStep] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({})
  const [completed, setCompleted] = useState(false)
  const [score, setScore] = useState(0)
  const [showContextDetails, setShowContextDetails] = useState(false)

  // Check if user has already completed this mystery
  const isAlreadyCompleted = user?.completedMysteries?.includes(mysteryId) || false

  // First, fetch all mysteries if they're not already loaded
  useEffect(() => {
    console.log(`Mystery detail page loaded for mystery ID: ${mysteryId}`)
    if (mysteries.length === 0) {
      console.log("No mysteries loaded, fetching them...")
      setLoadingMystery(true)
      fetchMysteries()
        .then(() => {
          console.log("Mysteries fetched successfully")
          setLoadingMystery(false)
        })
        .catch((err) => {
          console.error("Error fetching mysteries:", err)
          setLoadingMystery(false)
          toast({
            title: "Error",
            description: "Failed to load mysteries. Please try again.",
            variant: "destructive",
          })
        })
    } else {
      setLoadingMystery(false)
    }
  }, [mysteries.length, mysteryId, fetchMysteries, toast])

  // Then, find the mystery by ID and set it
  useEffect(() => {
    if (!loadingMystery && mysteryId) {
      console.log(`Looking for mystery with ID: ${mysteryId} in ${mysteries.length} mysteries`)
      console.log("Available mysteries:", mysteries.map((m) => `${m.id} (${m.title})`).join(", "))

      const foundMystery = mysteries.find((m) => String(m.id) === String(mysteryId))

      if (foundMystery) {
        console.log(`Found mystery: ${foundMystery.title} (ID: ${foundMystery.id})`)
        setMystery(foundMystery)

        // If already completed, show the completion screen
        if (isAlreadyCompleted) {
          setCompleted(true)
          // Get the user's previous score from progress data
          const userProgress = foundMystery.completedBy?.find((id) => id === user?.id)
          if (userProgress) {
            setScore(userProgress.score || 0)
          }
        }
      } else {
        console.warn(`Mystery with ID ${mysteryId} not found among ${mysteries.length} mysteries`)
        toast({
          title: "Mystery Not Found",
          description: "The mystery you're looking for doesn't exist or has been removed.",
          variant: "destructive",
        })
      }
    }
  }, [loadingMystery, mysteryId, mysteries, isAlreadyCompleted, user?.id, toast])

  // Finally, load the challenges for the mystery
  useEffect(() => {
    if (mystery && mysteryId) {
      console.log(`Loading challenges for mystery ID: ${mysteryId}`)
      setLoadingChallenges(true)

      try {
        const myChallenges = getChallengesByMysteryId(mysteryId)
        console.log(`Got ${myChallenges.length} challenges for mystery ID ${mysteryId}`)

        if (myChallenges.length > 0) {
          // Process challenges to ensure content is properly formatted
          const processedChallenges = myChallenges.map((challenge) => {
            // Make a deep copy to avoid modifying the original
            const processedChallenge = { ...challenge }

            // Ensure content is properly initialized
            if (!processedChallenge.content) {
              processedChallenge.content = {}
            }

            // For code/coding challenges, ensure initialCode and hints exist
            if (processedChallenge.type === "code" || processedChallenge.type === "coding") {
              if (!processedChallenge.content.initialCode) {
                processedChallenge.content.initialCode =
                  processedChallenge.code_snippet ||
                  "// Write your code here\nfunction solution() {\n  // Your implementation\n  return 'Hello World';\n}"
              }

              if (
                !processedChallenge.content.hints ||
                !Array.isArray(processedChallenge.content.hints) ||
                processedChallenge.content.hints.length === 0
              ) {
                processedChallenge.content.hints = [
                  "Think about the problem step by step",
                  "Consider edge cases in your solution",
                ]
              }
            }

            return processedChallenge
          })

          setMysteryChallenges(processedChallenges)
          setLoadingChallenges(false)
        } else {
          console.log("No challenges found, fetching from database...")
          // If no challenges in store, try to fetch them directly from the database
          import("@/lib/actions").then(({ getChallengesByMysterySlug }) => {
            if (mystery.slug) {
              console.log(`Fetching challenges for mystery slug: ${mystery.slug}`)
              getChallengesByMysterySlug(mystery.slug)
                .then((result) => {
                  if (result.success && result.challenges && result.challenges.length > 0) {
                    console.log(`Fetched ${result.challenges.length} challenges for mystery slug ${mystery.slug}`)

                    // Process challenges to ensure content is properly formatted
                    const processedChallenges = result.challenges.map((challenge) => {
                      // Make a deep copy to avoid modifying the original
                      const processedChallenge = { ...challenge }

                      // Ensure content is properly initialized
                      if (!processedChallenge.content) {
                        processedChallenge.content = {}
                      }

                      // For code/coding challenges, ensure initialCode and hints exist
                      if (processedChallenge.type === "code" || processedChallenge.type === "coding") {
                        if (!processedChallenge.content.initialCode) {
                          processedChallenge.content.initialCode =
                            processedChallenge.code_snippet ||
                            "// Write your code here\nfunction solution() {\n  // Your implementation\n  return 'Hello World';\n}"
                        }

                        if (
                          !processedChallenge.content.hints ||
                          !Array.isArray(processedChallenge.content.hints) ||
                          processedChallenge.content.hints.length === 0
                        ) {
                          processedChallenge.content.hints = [
                            "Think about the problem step by step",
                            "Consider edge cases in your solution",
                          ]
                        }
                      }

                      return processedChallenge
                    })

                    setMysteryChallenges(processedChallenges)
                  } else {
                    console.warn(`No challenges found for mystery slug ${mystery.slug}`)
                    // Create sample challenges for testing
                    const sampleChallenges = createSampleChallenges(mysteryId)
                    setMysteryChallenges(sampleChallenges)
                  }
                  setLoadingChallenges(false)
                })
                .catch((error) => {
                  console.error(`Error fetching challenges for mystery slug ${mystery.slug}:`, error)
                  setLoadingChallenges(false)
                  toast({
                    title: "Error",
                    description: "Failed to load challenges. Please try again.",
                    variant: "destructive",
                  })
                })
            } else {
              console.warn(`Mystery with ID ${mysteryId} has no slug`)
              setLoadingChallenges(false)
            }
          })
        }
      } catch (error) {
        console.error("Error getting challenges:", error)
        setLoadingChallenges(false)
        toast({
          title: "Error",
          description: "Failed to load challenges. Please try again.",
          variant: "destructive",
        })
      }
    }
  }, [mystery, mysteryId, getChallengesByMysteryId, toast])

  // Helper function to create sample challenges
  const createSampleChallenges = (mysteryId: string | number) => {
    console.log(`Creating sample challenges for mystery ID: ${mysteryId}`)
    return [
      {
        id: `sample_mc_${Date.now()}`,
        mystery_id: mysteryId,
        title: "Sample Multiple Choice Challenge",
        description: "This is a sample multiple choice challenge to test your knowledge.",
        type: "multiple-choice",
        content: {
          question: "What is the primary purpose of React's useEffect hook?",
          options: [
            "To create new state variables",
            "To perform side effects in function components",
            "To optimize rendering performance",
            "To handle form submissions",
          ],
          correctAnswer: 1,
        },
        points: 100,
        order_index: 0,
      },
      {
        id: `sample_puzzle_${Date.now()}`,
        mystery_id: mysteryId,
        title: "Sample Puzzle Challenge",
        description: "This is a sample puzzle challenge to test your problem-solving skills.",
        type: "puzzle",
        content: {
          encryptedMessage: "Gur frperg pbqr vf: ernpgqri",
          hint: "This message is encrypted with ROT13 cipher.",
          solution: "reactdev",
        },
        points: 150,
        order_index: 1,
      },
      {
        id: `sample_coding_${Date.now()}`,
        mystery_id: mysteryId,
        title: "Sample Coding Challenge",
        description: "This is a sample coding challenge to test your programming skills.",
        type: "coding",
        content: {
          initialCode:
            "function reverseString(str) {\n  // Implement this function to reverse a string\n  // Example: 'hello' should return 'olleh'\n  \n  return str;\n}",
          hints: [
            "Try using string methods like split(), reverse(), and join()",
            "You can also use a for loop to iterate through the string backwards",
          ],
        },
        points: 200,
        order_index: 2,
      },
      {
        id: `sample_code_${Date.now() + 1}`,
        mystery_id: mysteryId,
        title: "Sample Code Challenge",
        description: "This is a sample code challenge to test your programming skills.",
        type: "code",
        content: {
          initialCode:
            "function findMax(numbers) {\n  // Implement this function to find the maximum number in an array\n  // Example: [1, 5, 3, 9, 2] should return 9\n  \n  return Math.max(...numbers);\n}",
          hints: [
            "You can use Math.max() with the spread operator",
            "You can also use a for loop to iterate through the array",
          ],
        },
        points: 200,
        order_index: 3,
      },
    ]
  }

  if (loadingMystery || isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500 mb-4" />
          <p className="text-slate-400">Loading mystery...</p>
        </div>
      </ProtectedRoute>
    )
  }

  if (!mystery) {
    return (
      <ProtectedRoute>
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-bold">Mystery Not Found</h1>
          <p className="text-slate-400">The mystery you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link href="/mysteries">Back to Mysteries</Link>
          </Button>
        </div>
      </ProtectedRoute>
    )
  }

  const currentChallenge = mysteryChallenges[currentStep]

  const handleAnswer = (challengeId: string | number, answer: any) => {
    setUserAnswers((prev) => ({
      ...prev,
      [challengeId.toString()]: answer,
    }))
  }

  const handleNext = async () => {
    if (currentStep < mysteryChallenges.length - 1) {
      setCurrentStep(currentStep + 1)
      setShowContextDetails(false)
    } else {
      // Calculate score
      let totalScore = 0
      let totalPoints = 0

      mysteryChallenges.forEach((challenge) => {
        totalPoints += challenge.points || 0

        if (challenge.type === "multiple-choice") {
          if (userAnswers[challenge.id] === challenge.content?.correctAnswer) {
            totalScore += challenge.points || 0
          }
        } else if (challenge.type === "puzzle") {
          if (userAnswers[challenge.id]?.toLowerCase() === challenge.content?.solution?.toLowerCase()) {
            totalScore += challenge.points || 0
          }
        } else if (challenge.type === "coding" || challenge.type === "code") {
          // In a real app, we would evaluate the code
          // For now, give partial credit
          totalScore += Math.floor((challenge.points || 0) * 0.8)
        }
      })

      const finalScore = totalPoints > 0 ? Math.round((totalScore / totalPoints) * 100) : 0
      setScore(finalScore)
      setCompleted(true)

      // Update progress in the database
      try {
        console.log(`Updating mystery progress: mysteryId=${mysteryId}, userId=${user?.id}, score=${finalScore}`)
        const result = await updateProgress(mysteryId, true, finalScore)
        console.log("Progress update result:", result)

        // Update user scores in context
        if (user) {
          // Calculate score impacts (these would normally come from the backend)
          const iqScoreImpact = Math.floor(finalScore / 20)
          const domainScoreImpact = Math.floor(finalScore / 15)
          const overallScoreImpact = Math.floor((iqScoreImpact + domainScoreImpact) / 2)

          // Update user context with new scores
          const updatedUser = {
            ...user,
            iqScore: (user.iqScore || 0) + iqScoreImpact,
            domainScore: (user.domainScore || 0) + domainScoreImpact,
            overallScore: (user.overallScore || 0) + overallScoreImpact,
            completedMysteries: [...(user.completedMysteries || []), mysteryId],
          }

          // Update the auth context
          if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(updatedUser))
            window.dispatchEvent(new Event("storage"))
          }
        }
      } catch (error) {
        console.error("Failed to update progress:", error)
      }

      toast({
        title: "Mystery Completed!",
        description: `Your score: ${finalScore}%`,
      })
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setShowContextDetails(false)
    }
  }

  const toggleContextDetails = () => {
    setShowContextDetails(!showContextDetails)
  }

  const renderChallengeContext = (challenge: MysteryChallenge) => {
    if (!challenge || !challenge.content) return null

    switch (challenge.type) {
      case "multiple-choice":
        if (challenge.content?.context || challenge.content?.serverLogs || challenge.content?.codeSnippet) {
          return (
            <div className="mb-4">
              <Button variant="outline" onClick={toggleContextDetails} className="mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {showContextDetails ? "Hide Details" : "Show Challenge Details"}
              </Button>

              {showContextDetails && (
                <div className="space-y-4 mt-4">
                  {challenge.content?.context && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Context:</h4>
                      <div className="p-3 bg-slate-800/50 rounded-md text-sm whitespace-pre-wrap">
                        {challenge.content.context}
                      </div>
                    </div>
                  )}

                  {challenge.content?.serverLogs && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Server Logs:</h4>
                      <pre className="p-3 bg-slate-800/50 rounded-md text-sm overflow-x-auto font-mono">
                        {challenge.content.serverLogs}
                      </pre>
                    </div>
                  )}

                  {challenge.content?.codeSnippet && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Code Snippet:</h4>
                      <pre className="p-3 bg-slate-800/50 rounded-md text-sm overflow-x-auto font-mono">
                        {challenge.content.codeSnippet}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        }
        return null

      case "puzzle":
        // For puzzles, the encrypted message is already shown
        return null

      case "coding":
      case "code":
        // For coding challenges, the initial code is already shown
        return null

      default:
        return null
    }
  }

  const renderChallenge = (challenge: MysteryChallenge) => {
    if (!challenge) {
      return <p>Challenge not available</p>
    }

    // Ensure content is properly initialized
    const content = challenge.content || {}

    switch (challenge.type) {
      case "multiple-choice":
        return (
          <div className="space-y-4">
            {renderChallengeContext(challenge)}
            <p className="text-lg">{content.question || challenge.description}</p>
            <div className="space-y-2">
              {(content.options || ["Option A", "Option B", "Option C", "Option D"]).map(
                (option: string, index: number) => (
                  <div
                    key={index}
                    className={`p-3 rounded-md border cursor-pointer transition-colors ${
                      userAnswers[challenge.id] === index
                        ? "border-purple-500 bg-purple-900/20"
                        : "border-slate-700 hover:border-slate-600"
                    }`}
                    onClick={() => handleAnswer(challenge.id, index)}
                  >
                    {option}
                  </div>
                ),
              )}
            </div>
          </div>
        )

      case "puzzle":
        return (
          <div className="space-y-4">
            <p className="text-lg">{challenge.description}</p>
            <div className="p-4 bg-slate-800/50 rounded-md">
              <p className="font-mono">{content.encryptedMessage || "Encrypted message not available"}</p>
            </div>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Hint</AlertTitle>
              <AlertDescription>{content.hint || "No hint available"}</AlertDescription>
            </Alert>
            <div className="pt-4">
              <label className="block text-sm font-medium mb-2">Your Solution:</label>
              <textarea
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded-md"
                rows={3}
                value={userAnswers[challenge.id] || ""}
                onChange={(e) => handleAnswer(challenge.id, e.target.value)}
                placeholder="Enter your solution here..."
              />
            </div>
          </div>
        )

      case "coding":
      case "code":
        // Get the initial code from content, code_snippet, or provide a default
        const initialCode =
          content.initialCode ||
          challenge.code_snippet ||
          "// Write your code here\nfunction solution() {\n  // Your implementation\n  return 'Hello World';\n}"

        // Get hints or provide defaults
        const hints =
          Array.isArray(content.hints) && content.hints.length > 0
            ? content.hints
            : ["Think about the problem step by step", "Consider edge cases in your solution"]

        return (
          <div className="space-y-4">
            <p className="text-lg">{challenge.description}</p>
            <div className="p-4 bg-slate-800/50 rounded-md">
              <pre className="font-mono text-sm overflow-x-auto whitespace-pre-wrap">{initialCode}</pre>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Your Optimized Code:</label>
              <textarea
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded-md font-mono"
                rows={10}
                value={userAnswers[challenge.id] || initialCode}
                onChange={(e) => handleAnswer(challenge.id, e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <p className="font-medium">Hints:</p>
              <ul className="list-disc pl-5 space-y-1">
                {hints.map((hint: string, index: number) => (
                  <li key={index} className="text-sm text-slate-300">
                    {hint}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )

      default:
        return (
          <div className="space-y-4">
            <p className="text-lg">{challenge.description}</p>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Unknown Challenge Type</AlertTitle>
              <AlertDescription>
                This challenge type ({challenge.type}) is not supported yet. Please try another mystery.
              </AlertDescription>
            </Alert>
          </div>
        )
    }
  }

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/mysteries">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{mystery.title}</h1>
            <div className="flex items-center gap-4 text-slate-300">
              <Badge className={mystery.badgeColor || mystery.badge_color}>
                {mystery.category.charAt(0).toUpperCase() + mystery.category.slice(1)}
              </Badge>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400" />
                <span>{mystery.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{mystery.duration}</span>
              </div>
              <Badge variant="outline">
                {mystery.difficulty.charAt(0).toUpperCase() + mystery.difficulty.slice(1)}
              </Badge>
            </div>
          </div>
        </div>

        {isAlreadyCompleted && !completed ? (
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-900/20">
                <Lock className="h-8 w-8 text-amber-400" />
              </div>
              <CardTitle className="text-2xl">Challenge Already Completed</CardTitle>
              <CardDescription>
                You've already completed this mystery challenge. Each challenge can only be taken once to maintain fair
                scoring.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-slate-300">
                Your previous score: <span className="font-bold text-amber-400">{score}%</span>
              </p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button className="bg-purple-600 hover:bg-purple-700" asChild>
                <Link href="/mysteries">Explore Other Mysteries</Link>
              </Button>
            </CardFooter>
          </Card>
        ) : loadingChallenges ? (
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Loading Challenges</CardTitle>
              <CardDescription>Please wait while we prepare the challenges for you.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </CardContent>
          </Card>
        ) : mysteryChallenges.length === 0 ? (
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">No Challenges Available</CardTitle>
              <CardDescription>This mystery doesn't have any challenges yet. Please check back later.</CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <Button className="bg-purple-600 hover:bg-purple-700" asChild>
                <Link href="/mysteries">Explore Other Mysteries</Link>
              </Button>
            </CardFooter>
          </Card>
        ) : !completed ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-400">
                Challenge {currentStep + 1} of {mysteryChallenges.length}
              </div>
              <div className="flex items-center gap-1 text-sm text-slate-400">
                <Brain className="h-4 w-4" />
                <span>Points: {currentChallenge?.points || 0}</span>
              </div>
            </div>

            <Progress
              value={(currentStep / mysteryChallenges.length) * 100}
              className="h-2 bg-slate-800"
              indicatorColor="bg-purple-600"
            />

            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader>
                <CardTitle>{currentChallenge?.title || "Challenge"}</CardTitle>
                <CardDescription>{currentChallenge?.description || "No description available"}</CardDescription>
              </CardHeader>
              <CardContent>
                {currentChallenge ? (
                  renderChallenge(currentChallenge)
                ) : (
                  <div className="text-center py-4">Challenge content not available</div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                <Button onClick={handleNext} className="bg-purple-600 hover:bg-purple-700">
                  {currentStep < mysteryChallenges.length - 1 ? (
                    <>
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Complete Mystery
                      <CheckCircle className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        ) : (
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-900/20">
                <Trophy className="h-8 w-8 text-purple-400" />
              </div>
              <CardTitle className="text-2xl">Mystery Completed!</CardTitle>
              <CardDescription>You've successfully solved {mystery.title}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center">
                <div className="text-4xl font-bold text-purple-400">{score}%</div>
                <div className="text-sm text-slate-400">Your Score</div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>IQ Score Impact</span>
                  <span className="text-green-400">+{Math.floor(score / 20)} points</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Domain Score Impact</span>
                  <span className="text-green-400">+{Math.floor(score / 15)} points</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Overall Score Impact</span>
                  <span className="text-green-400">
                    +{Math.floor((Math.floor(score / 20) + Math.floor(score / 15)) / 2)} points
                  </span>
                </div>
              </div>

              <Alert className="bg-purple-900/20 border-purple-900">
                <Trophy className="h-4 w-4 text-purple-400" />
                <AlertTitle>Achievement Unlocked!</AlertTitle>
                <AlertDescription>
                  {mystery.category.charAt(0).toUpperCase() + mystery.category.slice(1)} Specialist - Complete your
                  first {mystery.category} mystery
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex justify-center gap-4">
              <Button variant="outline" asChild>
                <Link href="/mysteries">More Mysteries</Link>
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700" asChild>
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  )
}
