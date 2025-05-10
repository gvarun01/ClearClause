"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Upload, RefreshCw, Send, Scale, FileText, MessageSquare, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { motion } from "framer-motion"
import { apiService } from "@/lib/api-service"
import { useApiState } from "@/hooks/use-api-state"
import { ErrorDisplay } from "@/components/error-display"
import { LoadingSpinner } from "@/components/loading-spinner"

// Types
interface RiskyTerm {
  term: string
  severity: "high" | "medium" | "low"
  explanation: string
}

interface AnalysisResult {
  simplifiedExplanation: string
  riskyTerms: RiskyTerm[]
}

interface FollowUpResult {
  answer: string
}

export default function Home() {
  // State
  const [inputText, setInputText] = useState("")
  const [fileName, setFileName] = useState("")
  const [followUpQuestion, setFollowUpQuestion] = useState("")
  const [followUpAnswer, setFollowUpAnswer] = useState("")
  const [inputError, setInputError] = useState("")

  // API states using custom hook
  const analysisState = useApiState<AnalysisResult>()
  const followUpState = useApiState<FollowUpResult>()
  const fileUploadState = useApiState<{ text: string }>()

  // Derived state
  const showResults = !!analysisState.data

  // Handlers
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setInputError("")

    try {
      const result = await fileUploadState.execute(() => apiService.extractTextFromDocument(file))
      setInputText(result.text)
    } catch (error) {
      // Error is already handled in the hook
      setFileName("")
    }
  }

  const handleAnalyze = useCallback(async () => {
    console.log("button clicked")
    if (!inputText.trim()) {
      setInputError("Please enter legal text or upload a document.")
      return
    }
    console.log("button clicked")
    setInputError("")

    try {
      await analysisState.execute(() => apiService.analyzeText(inputText))
    } catch (error) {
      // Error is already handled in the hook
    }
  }, [inputText, analysisState])

  const handleFollowUpSubmit = useCallback(async () => {
    if (!followUpQuestion.trim() || !inputText.trim()) return

    try {
      const result = await followUpState.execute(() => apiService.askFollowUp(followUpQuestion, inputText))
      setFollowUpAnswer(result.answer)
    } catch (error) {
      // Error is already handled in the hook
    }
  }, [followUpQuestion, inputText, followUpState])

  const handleNewSession = useCallback(() => {
    setInputText("")
    setFileName("")
    setFollowUpQuestion("")
    setFollowUpAnswer("")
    setInputError("")
    analysisState.reset()
    followUpState.reset()
    fileUploadState.reset()
  }, [analysisState, followUpState, fileUploadState])

  const handleRetryAnalysis = useCallback(() => {
    if (inputText.trim()) {
      handleAnalyze()
    }
  }, [inputText, handleAnalyze])

  const handleRetryFollowUp = useCallback(() => {
    if (followUpQuestion.trim() && inputText.trim()) {
      handleFollowUpSubmit()
    }
  }, [followUpQuestion, inputText, handleFollowUpSubmit])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      case "medium":
        return "bg-orange-100 text-orange-800 hover:bg-orange-100"
      case "low":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-6 px-4 sm:py-12 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div className="text-center mb-8 sm:mb-10" initial="hidden" animate="visible" variants={fadeIn}>
          <div className="flex justify-center mb-4">
            <div className="bg-indigo-600 p-3 rounded-full">
              <Scale className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 sm:text-4xl md:text-5xl tracking-tight">
            ClearClause<span className="text-indigo-600">.</span>
          </h1>
          <p className="mt-3 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
            Understand legal clauses in plain English. No lawyer needed.
          </p>
        </motion.div>

        {!showResults ? (
          <motion.div initial="hidden" animate="visible" variants={fadeIn}>
            <Card className="shadow-lg border-0 overflow-hidden bg-white">
              <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
                <CardTitle className="text-xl sm:text-2xl">Enter Legal Text</CardTitle>
                <CardDescription className="text-indigo-100">
                  Paste a legal clause or upload a document for analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-6">
                <Tabs defaultValue="paste" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="paste" className="text-sm sm:text-base">
                      <FileText className="h-4 w-4 mr-2 hidden sm:inline" />
                      Paste Text
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="text-sm sm:text-base">
                      <Upload className="h-4 w-4 mr-2 hidden sm:inline" />
                      Upload Document
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="paste">
                    <Textarea
                      placeholder="Paste legal text here..."
                      className="min-h-[150px] sm:min-h-[200px] mb-4 text-base sm:text-lg"
                      value={inputText}
                      onChange={(e) => {
                        setInputText(e.target.value)
                        setInputError("")
                      }}
                      disabled={fileUploadState.isLoading}
                    />
                  </TabsContent>
                  <TabsContent value="upload">
                    <div className="border-2 border-dashed border-indigo-200 rounded-lg p-6 text-center mb-4">
                      <Input
                        type="file"
                        className="hidden"
                        id="file-upload"
                        accept=".txt,.pdf,.docx"
                        onChange={handleFileChange}
                        disabled={fileUploadState.isLoading}
                      />
                      <label
                        htmlFor="file-upload"
                        className={`cursor-pointer flex flex-col items-center justify-center p-4 ${
                          fileUploadState.isLoading ? "opacity-50 pointer-events-none" : ""
                        }`}
                      >
                        {fileUploadState.isLoading ? (
                          <LoadingSpinner size="md" text="Processing document..." />
                        ) : (
                          <>
                            <div className="bg-indigo-100 p-3 rounded-full mb-3">
                              <Upload className="h-6 w-6 text-indigo-600" />
                            </div>
                            <span className="text-sm font-medium text-slate-800 sm:text-base">
                              {fileName || "Tap to upload a document"}
                            </span>
                            <span className="text-xs text-slate-500 mt-1">Supports .txt, .pdf, .docx</span>
                          </>
                        )}
                      </label>
                    </div>
                    {fileName && !fileUploadState.isLoading && (
                      <div className="mt-2 text-sm text-slate-600 flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-indigo-500" />
                        File: {fileName}
                      </div>
                    )}

                    {fileUploadState.error && (
                      <ErrorDisplay
                        error={`Failed to process document: ${fileUploadState.error}`}
                        onRetry={() => {
                          const fileInput = document.getElementById("file-upload") as HTMLInputElement
                          if (fileInput && fileInput.files && fileInput.files[0]) {
                            fileUploadState
                              .execute(() => apiService.extractTextFromDocument(fileInput.files![0]))
                              .then((result) => setInputText(result.text))
                          }
                        }}
                      />
                    )}
                  </TabsContent>
                </Tabs>

                {inputError && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{inputError}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter className="flex justify-center p-4 sm:p-6 bg-slate-50">
                <Button
                  size="lg"
                  onClick={handleAnalyze}
                  disabled={analysisState.isLoading || fileUploadState.isLoading}
                  className="w-full sm:w-auto text-base py-6 bg-indigo-600 hover:bg-indigo-700"
                >
                  {analysisState.isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Simplify & Analyze"
                  )}
                </Button>
              </CardFooter>
            </Card>

            {analysisState.error && (
              <ErrorDisplay error={`Analysis failed: ${analysisState.error}`} onRetry={handleRetryAnalysis} />
            )}
          </motion.div>
        ) : (
          <>
            <motion.div className="mb-4 flex justify-end" initial="hidden" animate="visible" variants={fadeIn}>
              <Button
                variant="outline"
                onClick={handleNewSession}
                className="flex items-center text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Start New Analysis</span>
                <span className="sm:hidden">New</span>
              </Button>
            </motion.div>

            <motion.div initial="hidden" animate="visible" variants={fadeIn} className="space-y-6">
              <Card className="shadow-lg border-0 overflow-hidden bg-white">
                <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                  <CardTitle className="flex items-center text-xl">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Simplified Explanation
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 sm:p-6">
                  <p className="text-slate-700 leading-relaxed text-base sm:text-lg">
                    {analysisState.data?.simplifiedExplanation}
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 overflow-hidden bg-white">
                <CardHeader className="bg-gradient-to-r from-amber-600 to-orange-600 text-white">
                  <CardTitle className="flex items-center text-xl">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Risky Terms Detected
                  </CardTitle>
                  <CardDescription className="text-amber-100">
                    We've identified potentially problematic terms in this clause
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4">
                    {analysisState.data?.riskyTerms.map((term, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex flex-col p-4 bg-slate-50 rounded-lg border border-slate-100"
                      >
                        <div className="flex items-center mb-2">
                          <Badge
                            className={`${getSeverityColor(term.severity)} capitalize px-3 py-1 text-xs font-medium`}
                          >
                            {term.severity} Risk
                          </Badge>
                          <h4 className="font-medium text-slate-800 ml-3">"{term.term}"</h4>
                        </div>
                        <p className="text-sm text-slate-600">{term.explanation}</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 overflow-hidden bg-white">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <CardTitle className="flex items-center text-xl">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Ask Follow-up Questions
                  </CardTitle>
                  <CardDescription className="text-blue-100">
                    Need more clarity? Ask specific questions about this clause
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-2">
                    <Input
                      placeholder="E.g., What does 'indemnify' mean in more detail?"
                      value={followUpQuestion}
                      onChange={(e) => setFollowUpQuestion(e.target.value)}
                      className="flex-1 text-base"
                      disabled={followUpState.isLoading}
                    />
                    <Button
                      onClick={handleFollowUpSubmit}
                      disabled={followUpState.isLoading || !followUpQuestion.trim()}
                      className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                    >
                      {followUpState.isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Ask</span>
                        </>
                      )}
                    </Button>
                  </div>

                  {followUpState.error && (
                    <ErrorDisplay
                      error={`Failed to get answer: ${followUpState.error}`}
                      onRetry={handleRetryFollowUp}
                    />
                  )}

                  {followUpAnswer && !followUpState.error && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100"
                    >
                      <p className="text-slate-700 text-base">{followUpAnswer}</p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </div>
    </main>
  )
}
