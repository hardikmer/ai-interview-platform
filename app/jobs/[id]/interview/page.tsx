"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  ScreenShare,
  PhoneOff,
  Send,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  User,
  Bot,
  Clock,
  Volume2,
  VolumeX,
} from "lucide-react"
import { getDbClient } from "@/lib/db"
import { useAuthContext } from "@/components/auth-provider"

interface Job {
  id: number
  company_id: number
  company_name: string
  title: string
  description: string
  location: string
  category: string
  interview_mode: string
}

// Pre-recorded audio files for interview questions
const audioFiles = {
  intro: "/audio/intro.mp3",
  question1: "/audio/question1.mp3",
  question2: "/audio/question2.mp3",
  question3: "/audio/question3.mp3",
  question4: "/audio/question4.mp3",
  question5: "/audio/question5.mp3",
  closing: "/audio/closing.mp3",
}

export default function AIInterviewPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuthContext()
  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [interviewStarted, setInterviewStarted] = useState(false)
  const [interviewEnded, setInterviewEnded] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState("")
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(12)
  const [userAnswer, setUserAnswer] = useState("")
  const [conversation, setConversation] = useState<{ role: string; content: string; isPlaying?: boolean }[]>([])
  const [isMicActive, setIsMicActive] = useState(true)
  const [isCameraActive, setIsCameraActive] = useState(true)
  const [isScreenActive, setIsScreenActive] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [interviewScore, setInterviewScore] = useState(0)
  const [isAISpeaking, setIsAISpeaking] = useState(false)
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [useFallbackAudio, setUseFallbackAudio] = useState(false)
  const [speechSynthesisSupported, setSpeechSynthesisSupported] = useState(true)
  const [audioInitialized, setAudioInitialized] = useState(false)
  const [userIsSpeaking, setUserIsSpeaking] = useState(false)
  const [pausedSpeech, setPausedSpeech] = useState<{ text: string; position: number } | null>(null)
  const [speechDetectionTimeout, setSpeechDetectionTimeout] = useState<NodeJS.Timeout | null>(null)
  const [lastTranscriptLength, setLastTranscriptLength] = useState(0)
  const [waitingForNextQuestion, setWaitingForNextQuestion] = useState(false)
  const [questionAnswered, setQuestionAnswered] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const screenRef = useRef<HTMLVideoElement>(null)
  const micVisualizerRef = useRef<HTMLCanvasElement>(null)
  const aiVideoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Mock questions for the interview
  const mockQuestions = [
    "Tell me about yourself and your professional background.",
    "What are your greatest professional strengths?",
    "What do you consider to be your weaknesses?",
    "Why are you interested in this position?",
    "Where do you see yourself professionally in five years?",
    "Describe your ideal work environment.",
    "How do you handle stress and pressure in the workplace?",
    "Tell me about a time you demonstrated leadership skills.",
    "How do you prioritize work when handling multiple projects?",
    "How do you stay updated with the latest trends in your field?",
    "What achievement are you most proud of in your career?",
    "How do you handle feedback and criticism?",
  ]

  // Mock AI responses
  const mockAIResponses = [
    "Thank you for sharing that. Your background is interesting.",
    "Those are valuable strengths for this position.",
    "That's a great example of self-awareness and growth mindset.",
    "Your interest in this role aligns well with what we're looking for.",
    "I appreciate your long-term vision and ambition.",
    "That helps us understand how you would fit into our team culture.",
    "Your approach to stress management is important for this role.",
    "That's a good example of your leadership capabilities.",
    "Effective prioritization is crucial in our fast-paced environment.",
    "Continuous learning is highly valued in our organization.",
    "That's an impressive achievement that demonstrates your capabilities.",
    "Your approach to feedback shows maturity and professionalism.",
  ]

  // Initialize audio context for browser compatibility
  useEffect(() => {
    // Initialize audio context to enable audio on first user interaction
    const initAudio = () => {
      if (!audioInitialized) {
        const AudioContext = window.AudioContext || window.webkitAudioContext
        if (AudioContext) {
          const audioCtx = new AudioContext()
          // Create and play a silent sound to unlock audio
          const oscillator = audioCtx.createOscillator()
          const gainNode = audioCtx.createGain()
          gainNode.gain.value = 0 // Silent
          oscillator.connect(gainNode)
          gainNode.connect(audioCtx.destination)
          oscillator.start(0)
          oscillator.stop(0.001)
          setAudioInitialized(true)

          // Test speech synthesis
          if (window.speechSynthesis) {
            const testUtterance = new SpeechSynthesisUtterance("")
            testUtterance.volume = 0 // Silent test
            window.speechSynthesis.speak(testUtterance)
          }
        }
      }
    }

    // Add event listeners to initialize audio on first user interaction
    const handleUserInteraction = () => {
      initAudio()
      document.removeEventListener("click", handleUserInteraction)
      document.removeEventListener("touchstart", handleUserInteraction)
      document.removeEventListener("keydown", handleUserInteraction)
    }

    document.addEventListener("click", handleUserInteraction)
    document.addEventListener("touchstart", handleUserInteraction)
    document.addEventListener("keydown", handleUserInteraction)

    return () => {
      document.removeEventListener("click", handleUserInteraction)
      document.removeEventListener("touchstart", handleUserInteraction)
      document.removeEventListener("keydown", handleUserInteraction)
    }
  }, [audioInitialized])

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check if speech synthesis is supported
      if ("speechSynthesis" in window) {
        setSpeechSynthesis(window.speechSynthesis)
        setSpeechSynthesisSupported(true)

        // Get available voices
        const loadVoices = () => {
          const availableVoices = window.speechSynthesis.getVoices()
          if (availableVoices.length > 0) {
            setVoices(availableVoices)

            // Try to find a female voice
            const femaleVoice = availableVoices.find(
              (voice) =>
                voice.name.includes("female") ||
                voice.name.includes("Samantha") ||
                voice.name.includes("Google UK English Female") ||
                voice.name.includes("Microsoft Zira"),
            )

            setSelectedVoice(femaleVoice || availableVoices[0])
          } else {
            // If no voices are available, use fallback audio
            setUseFallbackAudio(true)
          }
        }

        // Chrome loads voices asynchronously
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = loadVoices
        }

        loadVoices()

        // Test if speech synthesis actually works
        setTimeout(() => {
          try {
            const testUtterance = new SpeechSynthesisUtterance("Test")
            testUtterance.volume = 0.1 // Very quiet test
            testUtterance.onend = () => {
              console.log("Speech synthesis test successful")
            }
            testUtterance.onerror = (e) => {
              console.error("Speech synthesis test failed:", e)
              setUseFallbackAudio(true)
            }
            window.speechSynthesis.speak(testUtterance)

            // If speech doesn't start within 1 second, use fallback
            setTimeout(() => {
              if (!window.speechSynthesis.speaking) {
                console.warn("Speech synthesis not starting, using fallback")
                setUseFallbackAudio(true)
              }
            }, 1000)
          } catch (e) {
            console.error("Speech synthesis error:", e)
            setUseFallbackAudio(true)
          }
        }, 1000)
      } else {
        console.warn("Speech synthesis not supported, using fallback audio")
        setSpeechSynthesisSupported(false)
        setUseFallbackAudio(true)
      }
    }

    return () => {
      if (speechSynthesis) {
        speechSynthesis.cancel()
      }
    }
  }, [])

  // Speech recognition setup
  useEffect(() => {
    if ((typeof window !== "undefined" && "SpeechRecognition" in window) || "webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()

      recognition.continuous = true
      recognition.interimResults = true

      recognition.onresult = (event) => {
        let interimTranscript = ""
        let finalTranscript = ""

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          } else {
            interimTranscript += event.results[i][0].transcript
          }
        }

        const currentTranscript = finalTranscript || interimTranscript
        setTranscript(currentTranscript)
        setUserAnswer(currentTranscript)

        // Detect if user is speaking by checking if transcript is growing
        if (currentTranscript.length > lastTranscriptLength) {
          setLastTranscriptLength(currentTranscript.length)

          // User started speaking
          if (!userIsSpeaking) {
            setUserIsSpeaking(true)

            // Pause AI speech if it's speaking
            if (isAISpeaking && speechSynthesis) {
              // Save current speech state
              const utterance = speechSynthesis.speaking
                ? { text: currentQuestion, position: speechSynthesis.speaking ? 1 : 0 }
                : null
              setPausedSpeech(utterance)

              // Pause speech
              speechSynthesis.pause()
            }
          }

          // Reset the timeout for detecting when user stops speaking
          if (speechDetectionTimeout) {
            clearTimeout(speechDetectionTimeout)
          }

          const timeout = setTimeout(() => {
            // User stopped speaking
            setUserIsSpeaking(false)

            // Resume AI speech if there was paused speech
            if (pausedSpeech && speechSynthesis && !speechSynthesis.speaking) {
              speechSynthesis.resume()
            }
          }, 1500) // 1.5 seconds of silence indicates user stopped speaking

          setSpeechDetectionTimeout(timeout)
        }

        // If user has spoken enough, enable the next question button
        if (currentTranscript.length > 20 && !questionAnswered) {
          setQuestionAnswered(true)
        }
      }

      recognition.onend = () => {
        if (isListening) {
          recognition.start()
        }
      }

      if (isListening) {
        recognition.start()
      }

      return () => {
        recognition.stop()
        if (speechDetectionTimeout) {
          clearTimeout(speechDetectionTimeout)
        }
      }
    }
  }, [
    isListening,
    userIsSpeaking,
    pausedSpeech,
    isAISpeaking,
    speechSynthesis,
    currentQuestion,
    lastTranscriptLength,
    speechDetectionTimeout,
    questionAnswered,
  ])

  // Speak text using speech synthesis or fallback audio
  const speakText = (text: string, audioKey?: string) => {
    if (!isAudioEnabled) return

    // Don't start speaking if user is currently speaking
    if (userIsSpeaking) {
      setPausedSpeech({ text, position: 0 })
      return
    }

    setIsAISpeaking(true)

    // If we're using fallback audio and have a matching audio file
    if (useFallbackAudio && audioKey && audioFiles[audioKey as keyof typeof audioFiles]) {
      if (audioRef.current) {
        audioRef.current.src = audioFiles[audioKey as keyof typeof audioFiles]
        audioRef.current.onended = () => setIsAISpeaking(false)
        audioRef.current.onerror = () => {
          console.error("Error playing audio:", audioRef.current?.error)
          setIsAISpeaking(false)
        }

        // Play the audio with user interaction handling
        const playPromise = audioRef.current.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Audio playback started successfully")
            })
            .catch((error) => {
              console.error("Audio playback failed:", error)
              // Try again with user interaction
              const playOnInteraction = () => {
                if (audioRef.current) {
                  audioRef.current
                    .play()
                    .then(() => {
                      document.removeEventListener("click", playOnInteraction)
                    })
                    .catch((e) => console.error("Retry failed:", e))
                }
              }
              document.addEventListener("click", playOnInteraction, { once: true })
            })
        }
      }
    }
    // Use speech synthesis if available
    else if (speechSynthesis && selectedVoice && speechSynthesisSupported) {
      // Cancel any ongoing speech
      speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.voice = selectedVoice
      utterance.rate = 1
      utterance.pitch = 1
      utterance.volume = 1

      utterance.onstart = () => console.log("Speech started")
      utterance.onend = () => {
        console.log("Speech ended")
        setIsAISpeaking(false)
        setPausedSpeech(null)
      }
      utterance.onpause = () => {
        console.log("Speech paused")
      }
      utterance.onresume = () => {
        console.log("Speech resumed")
      }
      utterance.onerror = (e) => {
        console.error("Speech error:", e)
        setIsAISpeaking(false)
        setPausedSpeech(null)

        // If speech synthesis fails, try fallback audio
        if (audioKey && audioFiles[audioKey as keyof typeof audioFiles] && audioRef.current) {
          setUseFallbackAudio(true)
          audioRef.current.src = audioFiles[audioKey as keyof typeof audioFiles]
          audioRef.current.play().catch((e) => console.error("Fallback audio failed:", e))
        }
      }

      try {
        speechSynthesis.speak(utterance)

        // Safety timeout in case onend doesn't fire
        setTimeout(() => {
          if (isAISpeaking && !userIsSpeaking) {
            setIsAISpeaking(false)
            setPausedSpeech(null)
          }
        }, text.length * 100) // Rough estimate based on text length
      } catch (e) {
        console.error("Speech synthesis exception:", e)
        setIsAISpeaking(false)
        setPausedSpeech(null)
        setUseFallbackAudio(true)
      }
    } else {
      // If all else fails, just update the UI without audio
      console.warn("No speech synthesis available")
      setTimeout(() => {
        if (!userIsSpeaking) {
          setIsAISpeaking(false)
        }
      }, 2000)
    }
  }

  // Simulate AI video animation
  const animateAIVideo = (duration: number) => {
    if (aiVideoRef.current) {
      aiVideoRef.current.play()

      setTimeout(() => {
        if (aiVideoRef.current) {
          aiVideoRef.current.pause()
        }
      }, duration)
    }
  }

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

        setJob(result[0])

        // Check if user has an application for this job
        if (user?.id) {
          const applications = await sql`
            SELECT * FROM job_applications 
            WHERE job_id = ${jobId} AND user_id = ${user.id}
            LIMIT 1
          `

          if (applications.length === 0) {
            setError("You need to apply for this job before starting the interview")
            router.push(`/jobs/${jobId}/apply`)
            return
          }
        } else {
          setError("You need to be logged in to start the interview")
          router.push("/login")
          return
        }

        // Start the interview automatically
        startInterview()
      } catch (error) {
        console.error("Error fetching job:", error)
        setError("An unexpected error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchJob()

    // Initialize media devices
    const initializeDevices = async () => {
      try {
        // Initialize camera
        // Initialize camera with better error handling
        try {
          const cameraStream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: "user",
            },
          })

          if (videoRef.current) {
            videoRef.current.srcObject = cameraStream
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play().catch((e) => console.error("Error playing video:", e))
            }
          }
        } catch (error) {
          console.error("Error initializing camera:", error)
          setIsCameraActive(false)
        }

        // Initialize microphone for visualization
        const micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
        if (micVisualizerRef.current) {
          const canvas = micVisualizerRef.current
          const canvasCtx = canvas.getContext("2d")

          if (canvasCtx) {
            const audioContext = new AudioContext()
            const analyser = audioContext.createAnalyser()
            analyser.fftSize = 256

            const source = audioContext.createMediaStreamSource(micStream)
            source.connect(analyser)

            const bufferLength = analyser.frequencyBinCount
            const dataArray = new Uint8Array(bufferLength)

            const WIDTH = canvas.width
            const HEIGHT = canvas.height

            const draw = () => {
              requestAnimationFrame(draw)

              analyser.getByteFrequencyData(dataArray)

              canvasCtx.fillStyle = "rgb(30, 30, 30)"
              canvasCtx.fillRect(0, 0, WIDTH, HEIGHT)

              const barWidth = (WIDTH / bufferLength) * 2.5
              let barHeight
              let x = 0

              for (let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i] / 2

                canvasCtx.fillStyle = `rgb(50, 205, ${barHeight + 100})`
                canvasCtx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight)

                x += barWidth + 1
              }
            }

            draw()
          }
        }

        // Initialize screen sharing
        try {
          const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true })
          if (screenRef.current) {
            screenRef.current.srcObject = screenStream
          }
        } catch (error) {
          console.error("Error initializing screen sharing:", error)
          setIsScreenActive(false)
        }
      } catch (error) {
        console.error("Error initializing devices:", error)
      }
    }

    initializeDevices()

    // Cleanup function
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
      }

      if (screenRef.current && screenRef.current.srcObject) {
        const stream = screenRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
      }

      // Stop speech synthesis
      if (speechSynthesis) {
        speechSynthesis.cancel()
      }

      // Stop speech recognition
      setIsListening(false)

      // Clear speech detection timeout
      if (speechDetectionTimeout) {
        clearTimeout(speechDetectionTimeout)
      }
    }
  }, [params.id, user?.id, router, speechSynthesis, speechDetectionTimeout])

  const startInterview = () => {
    setInterviewStarted(true)
    setCurrentQuestion(mockQuestions[0])

    // Add initial AI greeting to conversation
    const introMessage = `Hello ${user?.name || "there"}! I'm your AI interviewer for the ${job?.title} position at ${job?.company_name}. Let's get started with the first question.`

    setConversation([
      {
        role: "assistant",
        content: introMessage,
        isPlaying: true,
      },
    ])

    // Speak the introduction
    setTimeout(() => {
      speakText(introMessage, "intro")
      animateAIVideo(5000)

      // After intro, ask the first question
      setTimeout(() => {
        setConversation((prev) => [
          ...prev,
          {
            role: "assistant",
            content: mockQuestions[0],
            isPlaying: true,
          },
        ])

        speakText(mockQuestions[0], "question1")
        animateAIVideo(4000)

        // Start listening for user's answer
        setIsListening(true)
      }, 6000)
    }, 500)
  }

  const submitAnswer = () => {
    if (!userAnswer.trim()) return

    // Stop listening while AI responds
    setIsListening(false)

    // Add user's answer to conversation
    setConversation((prev) => [...prev, { role: "user", content: userAnswer }])

    // If this is the last question, end the interview
    if (currentQuestionIndex >= mockQuestions.length - 1) {
      setTimeout(() => {
        const closingMessage =
          "Thank you for completing this interview. I've recorded all your responses and will share them with the hiring team. They'll be in touch soon with next steps."

        setConversation((prev) => [
          ...prev,
          {
            role: "assistant",
            content: closingMessage,
            isPlaying: true,
          },
        ])

        speakText(closingMessage, "closing")
        animateAIVideo(7000)

        setTimeout(() => {
          endInterview()
        }, 8000)
      }, 1000)
    } else {
      // Add AI response and next question
      setTimeout(() => {
        // First, add the AI response to the previous answer
        setConversation((prev) => [
          ...prev,
          {
            role: "assistant",
            content: mockAIResponses[currentQuestionIndex],
            isPlaying: true,
          },
        ])

        speakText(mockAIResponses[currentQuestionIndex])
        animateAIVideo(3000)

        // Then, after a short delay, ask the next question
        setTimeout(() => {
          const nextQuestion = mockQuestions[currentQuestionIndex + 1]
          const nextQuestionAudioKey = `question${currentQuestionIndex + 2}` as keyof typeof audioFiles

          setConversation((prev) => [
            ...prev,
            {
              role: "assistant",
              content: nextQuestion,
              isPlaying: true,
            },
          ])

          setCurrentQuestionIndex((prev) => prev + 1)
          setCurrentQuestion(nextQuestion)
          setUserAnswer("")
          setTranscript("")
          setLastTranscriptLength(0)
          setQuestionAnswered(false)

          speakText(nextQuestion, nextQuestionAudioKey)
          animateAIVideo(4000)

          // Resume listening for the next answer
          setTimeout(() => {
            setIsListening(true)
          }, 4000)
        }, 4000)
      }, 1000)
    }
  }

  // Function to handle Next Question button click
  const handleNextQuestion = () => {
    if (waitingForNextQuestion) return

    setWaitingForNextQuestion(true)

    // Add user's answer to conversation if not empty
    if (userAnswer.trim()) {
      setConversation((prev) => [...prev, { role: "user", content: userAnswer }])
    }

    // If this is the last question, end the interview
    if (currentQuestionIndex >= mockQuestions.length - 1) {
      const closingMessage =
        "Thank you for completing this interview. I've recorded all your responses and will share them with the hiring team. They'll be in touch soon with next steps."

      setConversation((prev) => [
        ...prev,
        {
          role: "assistant",
          content: closingMessage,
          isPlaying: true,
        },
      ])

      speakText(closingMessage, "closing")
      animateAIVideo(7000)

      setTimeout(() => {
        endInterview()
      }, 8000)
    } else {
      // Add AI response to the previous answer
      const aiResponse = mockAIResponses[currentQuestionIndex]
      setConversation((prev) => [
        ...prev,
        {
          role: "assistant",
          content: aiResponse,
          isPlaying: true,
        },
      ])

      speakText(aiResponse)
      animateAIVideo(3000)

      // After a delay, ask the next question
      setTimeout(() => {
        const nextIndex = currentQuestionIndex + 1
        const nextQuestion = mockQuestions[nextIndex]

        setConversation((prev) => [
          ...prev,
          {
            role: "assistant",
            content: nextQuestion,
            isPlaying: true,
          },
        ])

        setCurrentQuestionIndex(nextIndex)
        setCurrentQuestion(nextQuestion)
        setUserAnswer("")
        setTranscript("")
        setLastTranscriptLength(0)
        setQuestionAnswered(false)
        setWaitingForNextQuestion(false)

        speakText(nextQuestion, `question${nextIndex + 1}` as keyof typeof audioFiles)
        animateAIVideo(4000)
      }, 4000)
    }
  }

  const toggleMic = () => {
    setIsMicActive(!isMicActive)
    setIsListening(!isListening)
  }

  const toggleCamera = () => {
    setIsCameraActive(!isCameraActive)
  }

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled)

    if (speechSynthesis && isAudioEnabled) {
      speechSynthesis.cancel()
    }

    if (audioRef.current && isAudioEnabled) {
      audioRef.current.pause()
    }
  }

  const endInterview = async () => {
    setInterviewEnded(true)
    setInterviewScore(Math.floor(Math.random() * 30) + 70) // Random score between 70-100

    // Stop listening
    setIsListening(false)

    // Stop all media streams
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
    }

    if (screenRef.current && screenRef.current.srcObject) {
      const stream = screenRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
    }

    try {
      // Update application status in database
      if (user?.id && job?.id) {
        const sql = getDbClient()
        if (sql) {
          await sql`
            UPDATE job_applications 
            SET status = 'interviewed', interview_score = ${interviewScore}
            WHERE job_id = ${job.id} AND user_id = ${user.id}
          `
        }
      }
    } catch (error) {
      console.error("Error updating application status:", error)
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
          <Button variant="outline" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-3xl font-bold">Error</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
            <p className="mb-4 text-center text-lg text-red-500">{error || "An unexpected error occurred."}</p>
            <Button onClick={() => router.push("/jobs")}>Browse Jobs</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      {interviewEnded ? (
        // Post-interview screen
        <>
          <div className="mb-6 flex items-center">
            <h1 className="text-3xl font-bold">Interview Complete</h1>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                  <CardTitle>Interview Summary</CardTitle>
                  <CardDescription>
                    Thank you for completing your interview for the {job.title} position at {job.company_name}.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex justify-center py-6">
                    <div className="relative w-48 h-48">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-5xl font-bold">{interviewScore}</div>
                          <div className="text-sm text-slate-500">Interview Score</div>
                        </div>
                      </div>
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle
                          className="text-slate-800"
                          strokeWidth="8"
                          stroke="currentColor"
                          fill="transparent"
                          r="40"
                          cx="50"
                          cy="50"
                        />
                        <circle
                          className="text-blue-500"
                          strokeWidth="8"
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

                  <Tabs defaultValue="feedback">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="feedback">AI Feedback</TabsTrigger>
                      <TabsTrigger value="transcript">Interview Transcript</TabsTrigger>
                    </TabsList>

                    <TabsContent value="feedback" className="space-y-4 mt-4">
                      <Card className="border-slate-800 bg-slate-900/50">
                        <CardHeader>
                          <CardTitle className="text-base">Overall Assessment</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p>
                            Based on your interview responses, you demonstrated strong communication skills and relevant
                            experience for the {job.title} position. Your answers were clear, concise, and showed good
                            understanding of the role requirements.
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="border-slate-800 bg-slate-900/50">
                        <CardHeader>
                          <CardTitle className="text-base">Strengths</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Clear communication and articulation of ideas</li>
                            <li>Relevant experience in the field</li>
                            <li>Problem-solving approach demonstrated in examples</li>
                            <li>Good understanding of industry trends</li>
                          </ul>
                        </CardContent>
                      </Card>

                      <Card className="border-slate-800 bg-slate-900/50">
                        <CardHeader>
                          <CardTitle className="text-base">Areas for Improvement</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Consider providing more specific examples in your responses</li>
                            <li>Elaborate more on technical skills relevant to the position</li>
                            <li>Highlight collaborative experiences and teamwork</li>
                          </ul>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="transcript" className="mt-4">
                      <Card className="border-slate-800 bg-slate-900/50">
                        <CardContent className="p-4">
                          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                            {conversation.map((message, index) => (
                              <div
                                key={index}
                                className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
                              >
                                <div
                                  className={`max-w-[80%] rounded-lg p-3 ${
                                    message.role === "assistant"
                                      ? "bg-slate-800 text-slate-200"
                                      : "bg-blue-600 text-white"
                                  }`}
                                >
                                  <div className="flex items-center mb-1">
                                    {message.role === "assistant" ? (
                                      <>
                                        <Bot className="h-4 w-4 mr-1" />
                                        <span className="text-xs font-medium">AI Interviewer</span>
                                      </>
                                    ) : (
                                      <>
                                        <User className="h-4 w-4 mr-1" />
                                        <span className="text-xs font-medium">You</span>
                                      </>
                                    )}
                                  </div>
                                  <p className="text-sm">{message.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button onClick={() => router.push("/dashboard")}>Return to Dashboard</Button>
                </CardFooter>
              </Card>
            </div>

            <div>
              <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                  <CardTitle>Next Steps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <h3 className="font-medium">Interview Completed</h3>
                    </div>
                    <p className="text-sm pl-7">Your interview has been successfully recorded and scored.</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-blue-500 mr-2" />
                      <h3 className="font-medium">Application Review</h3>
                    </div>
                    <p className="text-sm pl-7">The hiring team will review your application and interview results.</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <MessageSquare className="h-5 w-5 text-purple-500 mr-2" />
                      <h3 className="font-medium">Follow-up</h3>
                    </div>
                    <p className="text-sm pl-7">You'll be contacted within 5-7 business days regarding next steps.</p>
                  </div>

                  <Separator className="bg-slate-800" />

                  <div>
                    <h3 className="text-sm font-medium mb-2">Your Application Status</h3>
                    <Badge className="bg-blue-600">Interview Completed</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      ) : (
        // Active interview screen
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card className="h-full flex flex-col border-slate-800 bg-slate-900/50">
              <CardHeader className="flex-none">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>AI Interview: {job.title}</CardTitle>
                    <CardDescription>{job.company_name}</CardDescription>
                  </div>
                  <Badge className="bg-red-600">
                    <div className="flex items-center">
                      <span className="h-2 w-2 rounded-full bg-white mr-1 animate-pulse"></span>
                      Live
                    </div>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col">
                <div className="flex-grow overflow-y-auto mb-4 space-y-4 max-h-[400px] pr-2">
                  {/* AI Video */}
                  <div className="w-full aspect-video bg-slate-950 rounded-lg overflow-hidden mb-4">
                    <div className="relative w-full h-full">
                      {/* AI Avatar Video */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`w-full h-full ${isAISpeaking ? "animate-pulse-subtle" : ""}`}>
                          <video ref={aiVideoRef} className="w-full h-full object-cover" loop muted playsInline>
                            <source src="/placeholder.svg?height=480&width=640" type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>

                          {/* Fallback AI representation */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-slate-800 rounded-full p-8">
                              <Bot className={`h-16 w-16 text-blue-400 ${isAISpeaking ? "animate-pulse" : ""}`} />
                            </div>
                          </div>

                          {/* Speaking indicator */}
                          {isAISpeaking && (
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-slate-900/80 rounded-full px-3 py-1">
                              <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
                                <span className="text-xs text-blue-400">Speaking...</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Conversation Messages */}
                  {conversation.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === "assistant" ? "bg-slate-800 text-slate-200" : "bg-blue-600 text-white"
                        } ${message.isPlaying && message.role === "assistant" ? "border-l-4 border-blue-400" : ""}`}
                      >
                        <div className="flex items-center mb-1">
                          {message.role === "assistant" ? (
                            <>
                              <Bot className="h-4 w-4 mr-1" />
                              <span className="text-xs font-medium">AI Interviewer</span>
                              {message.isPlaying && (
                                <span className="ml-2 text-xs text-blue-400 flex items-center">
                                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping mr-1"></span>
                                  Speaking
                                </span>
                              )}
                            </>
                          ) : (
                            <>
                              <User className="h-4 w-4 mr-1" />
                              <span className="text-xs font-medium">You</span>
                            </>
                          )}
                        </div>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex-none">
                  <div className="flex items-end gap-2">
                    <Textarea
                      placeholder={
                        isListening
                          ? userIsSpeaking
                            ? "You are speaking..."
                            : "Listening... Speak your answer"
                          : "Type your answer here..."
                      }
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      className={`flex-grow resize-none bg-slate-800 border-slate-700 ${
                        isListening
                          ? userIsSpeaking
                            ? "border-green-500 animate-pulse-subtle"
                            : "border-blue-500 animate-pulse-subtle"
                          : ""
                      }`}
                      rows={3}
                    />
                    <Button className="flex-none" size="icon" onClick={submitAnswer} disabled={!userAnswer.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex justify-between mt-4">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={toggleMic}
                        className={
                          !isMicActive
                            ? "bg-red-900/20 border-red-800"
                            : "border-slate-700 bg-blue-900/20 border-blue-800"
                        }
                      >
                        {isMicActive ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4 text-red-500" />}
                      </Button>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={toggleCamera}
                        className={!isCameraActive ? "bg-red-900/20 border-red-800" : "border-slate-700"}
                      >
                        {isCameraActive ? (
                          <Camera className="h-4 w-4" />
                        ) : (
                          <CameraOff className="h-4 w-4 text-red-500" />
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={toggleAudio}
                        className={!isAudioEnabled ? "bg-red-900/20 border-red-800" : "border-slate-700"}
                      >
                        {isAudioEnabled ? (
                          <Volume2 className="h-4 w-4" />
                        ) : (
                          <VolumeX className="h-4 w-4 text-red-500" />
                        )}
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={handleNextQuestion}
                        disabled={waitingForNextQuestion}
                        className="border-slate-700 bg-blue-900/20 hover:bg-blue-900/30"
                      >
                        Next Question
                      </Button>
                      <Button variant="destructive" size="sm" onClick={endInterview}>
                        <PhoneOff className="h-4 w-4 mr-2" />
                        End Interview
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm">Your Camera</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="aspect-video bg-slate-800 rounded-md overflow-hidden">
                  {isCameraActive ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                      onError={(e) => console.error("Video error:", e)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-900">
                      <CameraOff className="h-8 w-8 text-slate-600" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm">Screen Sharing</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="aspect-video bg-slate-800 rounded-md overflow-hidden">
                  {isScreenActive ? (
                    <video ref={screenRef} autoPlay muted className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-900">
                      <ScreenShare className="h-8 w-8 text-slate-600" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm">
                  Audio Levels
                  {userIsSpeaking && (
                    <span className="ml-2 text-xs text-green-400 inline-flex items-center">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping mr-1"></span>
                      You're speaking
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="aspect-video bg-slate-800 rounded-md overflow-hidden flex items-center justify-center p-4">
                  {isMicActive ? (
                    <canvas ref={micVisualizerRef} width="300" height="100" className="w-full" />
                  ) : (
                    <MicOff className="h-8 w-8 text-slate-600" />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm">Interview Progress</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>
                      Question {currentQuestionIndex + 1} of {totalQuestions}
                    </span>
                    <span>{Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}%</span>
                  </div>
                  <Progress value={((currentQuestionIndex + 1) / totalQuestions) * 100} className="bg-slate-800" />
                </div>

                <div className="text-sm">
                  <p className="font-medium">Current Question:</p>
                  <p className="text-slate-400">{currentQuestion}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Hidden audio element for pre-recorded audio files */}
      <audio
        ref={audioRef}
        className="hidden"
        controls={false}
        onError={(e) => console.error("Audio error:", e)}
        onPlay={() => console.log("Audio started playing")}
        onEnded={() => {
          console.log("Audio finished playing")
          setIsAISpeaking(false)
        }}
      />

      {/* Audio initialization button (hidden but needed for some browsers) */}
      <button
        className="hidden"
        id="audio-init-button"
        onClick={() => {
          if (audioRef.current) {
            audioRef.current.play().catch((e) => console.error("Manual audio play failed:", e))
          }
          if (speechSynthesis) {
            const u = new SpeechSynthesisUtterance("")
            u.volume = 0
            speechSynthesis.speak(u)
          }
        }}
      />
    </div>
  )
}
