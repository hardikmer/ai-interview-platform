"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Camera, Mic, Monitor, AlertCircle, Info } from "lucide-react"
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

export default function InterviewSetupPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuthContext()
  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [permissionsGranted, setPermissionsGranted] = useState({
    camera: false,
    microphone: false,
    screen: false,
  })
  const [allPermissionsGranted, setAllPermissionsGranted] = useState(false)

  const cameraRef = useRef<HTMLVideoElement>(null)
  const screenRef = useRef<HTMLVideoElement>(null)
  const micVisualizerRef = useRef<HTMLCanvasElement>(null)

  const cameraStreamRef = useRef<MediaStream | null>(null)
  const screenStreamRef = useRef<MediaStream | null>(null)
  const micStreamRef = useRef<MediaStream | null>(null)

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
      } catch (error) {
        console.error("Error fetching job:", error)
        setError("An unexpected error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchJob()
  }, [params.id, user?.id, router])

  // Check if all required permissions are granted
  useEffect(() => {
    const allGranted = permissionsGranted.camera && permissionsGranted.microphone && permissionsGranted.screen

    setAllPermissionsGranted(allGranted)
  }, [permissionsGranted])

  // Visualize microphone input
  useEffect(() => {
    if (permissionsGranted.microphone && micVisualizerRef.current && micStreamRef.current) {
      const canvas = micVisualizerRef.current
      const canvasCtx = canvas.getContext("2d")

      if (!canvasCtx) return

      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256

      const source = audioContext.createMediaStreamSource(micStreamRef.current)
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

      return () => {
        source.disconnect()
        audioContext.close()
      }
    }
  }, [permissionsGranted.microphone])

  const requestCameraPermission = async () => {
    try {
      // Stop any existing stream
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((track) => track.stop())
      }

      // Request camera permission with explicit constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
      })

      cameraStreamRef.current = stream

      // Ensure the video element is properly set up
      if (cameraRef.current) {
        cameraRef.current.srcObject = stream
        cameraRef.current.onloadedmetadata = () => {
          cameraRef.current?.play().catch((e) => console.error("Error playing video:", e))
        }
      }

      setPermissionsGranted((prev) => ({ ...prev, camera: true }))
    } catch (error) {
      console.error("Error requesting camera permission:", error)
      alert("Camera access failed. Please ensure your camera is connected and permissions are granted in your browser.")
    }
  }

  const handleManualCameraConnect = () => {
    if (permissionsGranted.camera) {
      // If we think the camera is already connected but not showing,
      // try to reconnect
      requestCameraPermission()
    } else {
      // Show a more detailed message to help users
      alert(
        "To connect your camera:\n\n" +
          "1. Make sure your camera is not being used by another application\n" +
          "2. Check that you've allowed camera access in your browser settings\n" +
          "3. Try refreshing the page\n\n" +
          "We'll attempt to connect now.",
      )
      requestCameraPermission()
    }
  }

  const requestMicrophonePermission = async () => {
    try {
      // Stop any existing stream
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((track) => track.stop())
      }

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      micStreamRef.current = stream

      setPermissionsGranted((prev) => ({ ...prev, microphone: true }))
    } catch (error) {
      console.error("Error requesting microphone permission:", error)
    }
  }

  const requestScreenPermission = async () => {
    try {
      // Stop any existing stream
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop())
      }

      // Request screen sharing permission
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true })
      screenStreamRef.current = stream

      if (screenRef.current) {
        screenRef.current.srcObject = stream
      }

      setPermissionsGranted((prev) => ({ ...prev, screen: true }))
    } catch (error) {
      console.error("Error requesting screen permission:", error)
    }
  }

  const connectAllDevices = async () => {
    try {
      // Try to connect camera first
      await requestCameraPermission()

      // Then microphone
      await requestMicrophonePermission()

      // Finally screen sharing
      await requestScreenPermission()
    } catch (error) {
      console.error("Error connecting devices:", error)
      alert("Failed to connect all devices. Please try connecting them individually.")
    }
  }

  const startInterview = () => {
    // Clean up streams before navigating
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop())
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop())
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop())
    }

    router.push(`/jobs/${params.id}/interview`)
  }

  useEffect(() => {
    // Check if camera is already available
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        const hasCamera = devices.some((device) => device.kind === "videoinput")
        if (hasCamera && !permissionsGranted.camera) {
          console.log("Camera detected but not connected. Attempting to connect...")
          requestCameraPermission()
        }
      })
      .catch((err) => {
        console.error("Error checking devices:", err)
      })
  }, [])

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
      <div className="mb-6 flex items-center">
        <Button variant="outline" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <h1 className="text-3xl font-bold">AI Interview Setup</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader>
              <CardTitle>Prepare for Your Interview</CardTitle>
              <CardDescription>
                You're about to start an AI interview for the {job.title} position at {job.company_name}. Please ensure
                you're in a quiet environment with good lighting.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert variant="default" className="bg-slate-800 border-slate-700">
                <Info className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  This interview will require access to your camera, microphone, and screen. Please grant these
                  permissions when prompted.
                </AlertDescription>
              </Alert>

              <div className="grid gap-4 md:grid-cols-3">
                <Card
                  className={`border ${permissionsGranted.camera ? "border-green-500" : "border-slate-700"} bg-slate-800`}
                >
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm flex items-center">
                      <Camera className="mr-2 h-4 w-4" />
                      Camera
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="aspect-video bg-slate-900 rounded-md overflow-hidden">
                      {permissionsGranted.camera ? (
                        <video
                          ref={cameraRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                          onError={(e) => console.error("Video error:", e)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Camera className="h-8 w-8 text-slate-600" />
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex justify-center">
                      <Button
                        size="sm"
                        onClick={handleManualCameraConnect}
                        variant={permissionsGranted.camera ? "outline" : "default"}
                        className={permissionsGranted.camera ? "border-green-500 text-green-400" : ""}
                      >
                        {permissionsGranted.camera ? "Camera Connected" : "Connect Camera"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className={`border ${permissionsGranted.microphone ? "border-green-500" : "border-slate-700"} bg-slate-800`}
                >
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm flex items-center">
                      <Mic className="mr-2 h-4 w-4" />
                      Microphone
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="aspect-video bg-slate-900 rounded-md overflow-hidden flex items-center justify-center">
                      {permissionsGranted.microphone ? (
                        <canvas ref={micVisualizerRef} width="150" height="50" className="w-full" />
                      ) : (
                        <Mic className="h-8 w-8 text-slate-600" />
                      )}
                    </div>
                    <div className="mt-4 flex justify-center">
                      <Button
                        size="sm"
                        onClick={requestMicrophonePermission}
                        variant={permissionsGranted.microphone ? "outline" : "default"}
                        className={permissionsGranted.microphone ? "border-green-500 text-green-400" : ""}
                      >
                        {permissionsGranted.microphone ? "Microphone Connected" : "Connect Microphone"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className={`border ${permissionsGranted.screen ? "border-green-500" : "border-slate-700"} bg-slate-800`}
                >
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm flex items-center">
                      <Monitor className="mr-2 h-4 w-4" />
                      Screen Sharing
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="aspect-video bg-slate-900 rounded-md overflow-hidden">
                      {permissionsGranted.screen ? (
                        <video ref={screenRef} autoPlay muted className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Monitor className="h-8 w-8 text-slate-600" />
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex justify-center">
                      <Button
                        size="sm"
                        onClick={requestScreenPermission}
                        variant={permissionsGranted.screen ? "outline" : "default"}
                        className={permissionsGranted.screen ? "border-green-500 text-green-400" : ""}
                      >
                        {permissionsGranted.screen ? "Screen Connected" : "Share Screen"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-col items-center justify-center gap-4 pt-4">
                {!allPermissionsGranted && (
                  <Button size="lg" onClick={connectAllDevices}>
                    Connect All Devices
                  </Button>
                )}

                <Button
                  size="lg"
                  onClick={startInterview}
                  disabled={!allPermissionsGranted}
                  className={allPermissionsGranted ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {allPermissionsGranted ? "Start Interview" : "All Permissions Required"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader>
              <CardTitle>Interview Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-slate-400">Position</h3>
                <p className="font-medium">{job.title}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-400">Company</h3>
                <p className="font-medium">{job.company_name}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-400">Location</h3>
                <p className="font-medium">{job.location}</p>
              </div>

              <Separator className="bg-slate-800" />

              <div>
                <h3 className="text-sm font-medium text-slate-400">Interview Format</h3>
                <p className="text-sm">
                  This is an AI-conducted interview. You'll be asked 5 questions about your experience, skills, and fit
                  for the role. Your responses will be evaluated by our AI system.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-400">Duration</h3>
                <p className="text-sm">Approximately 10-15 minutes</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-400">Tips</h3>
                <ul className="text-sm list-disc pl-5 space-y-1 mt-2">
                  <li>Ensure good lighting so you're clearly visible</li>
                  <li>Use a quiet environment with minimal background noise</li>
                  <li>Speak clearly and at a moderate pace</li>
                  <li>Close unnecessary applications before sharing your screen</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
