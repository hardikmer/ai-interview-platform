"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash, Code, Brain, PenTool, Database, Puzzle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface MysteryCreatorProps {
  jobId: string
  jobTitle: string
  jobDescription: string
  skills: string[]
  onSave: (mysteryId: string) => void
}

type QuestionType = "multiple-choice" | "coding" | "puzzle"

interface Question {
  id: string
  type: QuestionType
  title: string
  description: string
  points: number
  content: any
}

export function MysteryCreator({ jobId, jobTitle, jobDescription, skills, onSave }: MysteryCreatorProps) {
  const [title, setTitle] = useState(`${jobTitle} Challenge`)
  const [description, setDescription] = useState(
    `A custom mystery designed to test skills for the ${jobTitle} position.`,
  )
  const [category, setCategory] = useState("development")
  const [difficulty, setDifficulty] = useState("medium")
  const [questions, setQuestions] = useState<Question[]>([])
  const [activeTab, setActiveTab] = useState("details")
  const { toast } = useToast()

  const handleAddQuestion = (type: QuestionType) => {
    const newQuestion: Question = {
      id: `q${Date.now()}`,
      type,
      title: "",
      description: "",
      points: 10,
      content:
        type === "multiple-choice"
          ? { question: "", options: ["", "", "", ""], correctAnswer: 0 }
          : type === "coding"
            ? { initialCode: "// Write your code here", hints: [""] }
            : { encryptedMessage: "", hint: "", solution: "" },
    }

    setQuestions([...questions, newQuestion])
  }

  const handleRemoveQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, ...updates } : q)))
  }

  const updateQuestionContent = (id: string, contentUpdates: any) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === id) {
          return { ...q, content: { ...q.content, ...contentUpdates } }
        }
        return q
      }),
    )
  }

  const handleSave = () => {
    if (!title.trim()) {
      toast({
        title: "Missing Title",
        description: "Please provide a title for your mystery challenge.",
        variant: "destructive",
      })
      return
    }

    if (questions.length === 0) {
      toast({
        title: "No Questions",
        description: "Please add at least one question to your mystery challenge.",
        variant: "destructive",
      })
      return
    }

    // In a real app, this would save to the database
    // For now, we'll just generate a mock ID
    const mysteryId = `custom_${Date.now()}`

    toast({
      title: "Mystery Created",
      description: "Your custom mystery challenge has been created successfully.",
    })

    onSave(mysteryId)
  }

  const getTotalPoints = () => {
    return questions.reduce((sum, q) => sum + q.points, 0)
  }

  const getCategoryIcon = () => {
    switch (category) {
      case "development":
        return <Code className="h-4 w-4" />
      case "design":
        return <PenTool className="h-4 w-4" />
      case "data":
        return <Database className="h-4 w-4" />
      default:
        return <Brain className="h-4 w-4" />
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create Custom Mystery Challenge</CardTitle>
        <CardDescription>
          Design a custom mystery challenge for candidates applying to the {jobTitle} position
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Mystery Details</TabsTrigger>
            <TabsTrigger value="questions">Questions ({questions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Mystery Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title for your mystery challenge"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this mystery challenge is about"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="data">Data Science</SelectItem>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger id="difficulty">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Related Skills</Label>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setActiveTab("questions")}>Continue to Questions</Button>
            </div>
          </TabsContent>

          <TabsContent value="questions" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Challenge Questions</h3>
              <div className="flex items-center text-sm">
                <span className="mr-2">Total Points:</span>
                <Badge variant="secondary">{getTotalPoints()}</Badge>
              </div>
            </div>

            <div className="space-y-4">
              {questions.map((question, index) => (
                <Card key={question.id} className="border-slate-200">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Badge variant="outline" className="mr-2">
                          {question.type === "multiple-choice"
                            ? "Multiple Choice"
                            : question.type === "coding"
                              ? "Coding"
                              : "Puzzle"}
                        </Badge>
                        <CardTitle className="text-base">{question.title || `Question ${index + 1}`}</CardTitle>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveQuestion(question.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`question-${question.id}-title`}>Question Title</Label>
                      <Input
                        id={`question-${question.id}-title`}
                        value={question.title}
                        onChange={(e) => updateQuestion(question.id, { title: e.target.value })}
                        placeholder="Enter question title"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`question-${question.id}-description`}>Description</Label>
                      <Textarea
                        id={`question-${question.id}-description`}
                        value={question.description}
                        onChange={(e) => updateQuestion(question.id, { description: e.target.value })}
                        placeholder="Describe the question"
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`question-${question.id}-points`}>Points</Label>
                        <Input
                          id={`question-${question.id}-points`}
                          type="number"
                          value={question.points}
                          onChange={(e) =>
                            updateQuestion(question.id, { points: Number.parseInt(e.target.value) || 0 })
                          }
                          min={1}
                          max={100}
                        />
                      </div>
                    </div>

                    {question.type === "multiple-choice" && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor={`question-${question.id}-prompt`}>Question Prompt</Label>
                          <Textarea
                            id={`question-${question.id}-prompt`}
                            value={question.content.question}
                            onChange={(e) => updateQuestionContent(question.id, { question: e.target.value })}
                            placeholder="Enter the question"
                            rows={2}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Options</Label>
                          {question.content.options.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center space-x-2">
                              <Input
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...question.content.options]
                                  newOptions[optIndex] = e.target.value
                                  updateQuestionContent(question.id, { options: newOptions })
                                }}
                                placeholder={`Option ${optIndex + 1}`}
                              />
                              <input
                                type="radio"
                                checked={question.content.correctAnswer === optIndex}
                                onChange={() => updateQuestionContent(question.id, { correctAnswer: optIndex })}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {question.type === "coding" && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor={`question-${question.id}-code`}>Initial Code</Label>
                          <Textarea
                            id={`question-${question.id}-code`}
                            value={question.content.initialCode}
                            onChange={(e) => updateQuestionContent(question.id, { initialCode: e.target.value })}
                            placeholder="Provide initial code for the candidate"
                            rows={5}
                            className="font-mono text-sm"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Hints</Label>
                          {question.content.hints.map((hint, hintIndex) => (
                            <div key={hintIndex} className="flex items-center space-x-2">
                              <Input
                                value={hint}
                                onChange={(e) => {
                                  const newHints = [...question.content.hints]
                                  newHints[hintIndex] = e.target.value
                                  updateQuestionContent(question.id, { hints: newHints })
                                }}
                                placeholder={`Hint ${hintIndex + 1}`}
                              />
                              {hintIndex === question.content.hints.length - 1 ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const newHints = [...question.content.hints, ""]
                                    updateQuestionContent(question.id, { hints: newHints })
                                  }}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const newHints = question.content.hints.filter((_, i) => i !== hintIndex)
                                    updateQuestionContent(question.id, { hints: newHints })
                                  }}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {question.type === "puzzle" && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor={`question-${question.id}-message`}>Encrypted Message</Label>
                          <Textarea
                            id={`question-${question.id}-message`}
                            value={question.content.encryptedMessage}
                            onChange={(e) => updateQuestionContent(question.id, { encryptedMessage: e.target.value })}
                            placeholder="Enter the encrypted message or puzzle"
                            rows={3}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`question-${question.id}-hint`}>Hint</Label>
                          <Input
                            id={`question-${question.id}-hint`}
                            value={question.content.hint}
                            onChange={(e) => updateQuestionContent(question.id, { hint: e.target.value })}
                            placeholder="Provide a hint for solving the puzzle"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`question-${question.id}-solution`}>Solution</Label>
                          <Input
                            id={`question-${question.id}-solution`}
                            value={question.content.solution}
                            onChange={(e) => updateQuestionContent(question.id, { solution: e.target.value })}
                            placeholder="Enter the solution to the puzzle"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              <div className="flex flex-col space-y-2">
                <p className="text-sm text-muted-foreground">Add a new question:</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleAddQuestion("multiple-choice")}
                    className="flex items-center"
                  >
                    <Brain className="mr-2 h-4 w-4" />
                    Multiple Choice
                  </Button>
                  <Button variant="outline" onClick={() => handleAddQuestion("coding")} className="flex items-center">
                    <Code className="mr-2 h-4 w-4" />
                    Coding
                  </Button>
                  <Button variant="outline" onClick={() => handleAddQuestion("puzzle")} className="flex items-center">
                    <Puzzle className="mr-2 h-4 w-4" />
                    Puzzle
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setActiveTab("details")}>
          Back
        </Button>
        <Button onClick={handleSave}>Save Mystery Challenge</Button>
      </CardFooter>
    </Card>
  )
}
