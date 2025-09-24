"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Activity,
  FileText,
  Shield,
  UserIcon,
  LogOut,
  Calendar,
  TrendingUp,
  UserPlus,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Trash2,
} from "lucide-react"
import { SymptomSelector } from "@/components/symptom-selector"
import axios from "axios"

const API_BASE_URL = "http://192.168.137.64:5001/api"

interface Report {
  _id: string
  userId: string
  symptoms: string[]
  diagnosis: { disease: string; percentage: number }[]
  predicted: string
  date: string
  time: string
  status: boolean
  createdAt: string
  updatedAt: string
  modelOutput?: { predicted: string; prediction: { [key: string]: number }; confidence: number }
}

export default function DiseasePredictionApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [showDeleteAccount, setShowDeleteAccount] = useState(false)
  const [user, setUser] = useState<{ _id: string; username: string; fullName: string; age: number } | null>(null)
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [viewingReport, setViewingReport] = useState<string | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("predict")
  const [expandedReports, setExpandedReports] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    if (isLoggedIn && user) {
      loadUserReports()
    }
  }, [isLoggedIn, user])

  const loadUserReports = async () => {
    if (!user) return

    try {
      const response = await axios.get(`${API_BASE_URL}/report/${user._id}`)
      const reportsData = response.data

      if (Array.isArray(reportsData)) {
        setReports(reportsData)
      } else if (reportsData && typeof reportsData === "object") {
        if (reportsData.reports && Array.isArray(reportsData.reports)) {
          setReports(reportsData.reports)
        } else if (reportsData.data && Array.isArray(reportsData.data)) {
          setReports(reportsData.data)
        } else {
          setReports([reportsData])
        }
      } else {
        setReports([])
      }
    } catch (error) {
      console.error("Error loading reports:", error)
      setReports([])
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.target as HTMLFormElement)
      const username = formData.get("username") as string
      const password = formData.get("password") as string

      if (!username || !password) {
        alert("Please enter both username and password")
        setLoading(false)
        return
      }

      console.log("[v0] Attempting login with:", { username, passwordLength: password.length })

      const response = await axios.post(`${API_BASE_URL}/login`, {
        username,
        password,
      })

      console.log("[v0] Login response:", response.data)

      if (response.data.user) {
        setUser(response.data.user)
        setIsLoggedIn(true)
      } else if (response.data.message) {
        alert(response.data.message)
      }
    } catch (error: any) {
      console.error("[v0] Login error:", error)

      if (error.response) {
        const errorMessage = error.response.data?.message || error.response.data?.error || "Login failed"
        alert(`Login failed: ${errorMessage}`)
        console.log("[v0] Server error response:", error.response.data)
      } else if (error.request) {
        alert("Cannot connect to server. Please check if the server is running.")
        console.log("[v0] Network error - no response received")
      } else {
        alert("Login failed. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.target as HTMLFormElement)
      const fullName = formData.get("fullName") as string
      const username = formData.get("username") as string
      const password = formData.get("password") as string
      const confirmPassword = formData.get("confirmPassword") as string
      const age = Number.parseInt(formData.get("age") as string)

      if (!fullName || !username || !password || !age) {
        alert("Please fill in all required fields")
        setLoading(false)
        return
      }

      if (password !== confirmPassword) {
        alert("Passwords do not match")
        setLoading(false)
        return
      }

      console.log("[v0] Attempting registration with:", { fullName, username, age, passwordLength: password.length })

      const response = await axios.post(`${API_BASE_URL}/register`, {
        fullName,
        age,
        username,
        password,
      })

      console.log("[v0] Registration response:", response.data)

      if (response.data.user || response.data.message === "User registered successfully") {
        alert("Account created successfully! Please sign in with your credentials.")
        setShowRegister(false)
      } else if (response.data.message) {
        alert(response.data.message)
      }
    } catch (error: any) {
      console.error("[v0] Registration error:", error)

      if (error.response) {
        const errorMessage = error.response.data?.message || error.response.data?.error || "Registration failed"
        alert(`Registration failed: ${errorMessage}`)
        console.log("[v0] Server error response:", error.response.data)
      } else if (error.request) {
        alert("Cannot connect to server. Please check if the server is running.")
      } else {
        alert("Registration failed. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setShowRegister(false)
    setUser(null)
    setReports([])
  }

  const handlePrediction = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedSymptoms.length === 0) {
      alert("Please select at least one symptom")
      return
    }

    if (!user) {
      alert("User not logged in")
      return
    }

    setLoading(true)

    try {
      console.log("[v0] Calling ML model proxy with symptoms:", selectedSymptoms)

      const mlResponse = await axios.post("/api/predict", {
        symptoms: selectedSymptoms,
      })

      console.log("[v0] ML model response:", mlResponse.data)

      const { predicted, probabilities, confidence } = mlResponse.data

      const diagnosisArray = Object.entries(probabilities)
        .map(([disease, percentage]) => ({
          disease,
          percentage: Number(percentage), // Keep as-is since ML model returns percentages (23, 16, etc.)
        }))
        .sort((a, b) => b.percentage - a.percentage)

      const reportData = {
        userId: user._id,
        symptoms: selectedSymptoms,
        modelOutput: {
          predicted,
          prediction: probabilities,
          confidence: confidence || diagnosisArray[0]?.percentage || 0,
        },
        objectName: "Health Report",
      }

      console.log("[v0] Saving report with data:", reportData)

      const response = await axios.post(`${API_BASE_URL}/report/save`, reportData)

      console.log("[v0] Report saved successfully:", response.data)

      await loadUserReports()
      setSelectedSymptoms([])
      setActiveTab("reports")
    } catch (error: any) {
      console.error("[v0] Error in prediction process:", error)

      if (error.response) {
        console.log("[v0] Error response data:", error.response.data)
        const errorMessage = error.response.data?.error || error.response.data?.message || "Unknown error"
        alert(`Prediction failed: ${errorMessage}`)
      } else if (error.request) {
        alert("Cannot connect to prediction service. Please check your internet connection.")
      } else {
        alert("Prediction failed. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm("Are you sure you want to delete this report? This action cannot be undone.")) {
      return
    }

    try {
      setLoading(true)
      await axios.delete(`${API_BASE_URL}/report/${reportId}`)

      // Remove the deleted report from the local state
      setReports(reports.filter((report) => report._id !== reportId))

      // If we're currently viewing the deleted report, go back to reports list
      if (viewingReport === reportId) {
        setViewingReport(null)
      }

      console.log("[v0] Report deleted successfully")
    } catch (error: any) {
      console.error("[v0] Error deleting report:", error)

      if (error.response) {
        const errorMessage = error.response.data?.message || error.response.data?.error || "Failed to delete report"
        alert(`Delete failed: ${errorMessage}`)
      } else {
        alert("Failed to delete report. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) return

    if (
      !confirm(
        "Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data including reports.",
      )
    ) {
      return
    }

    try {
      setLoading(true)
      await axios.delete(`${API_BASE_URL}/${user.username}`)

      alert("Account deleted successfully.")
      handleLogout()
    } catch (error: any) {
      console.error("[v0] Error deleting account:", error)

      if (error.response) {
        const errorMessage = error.response.data?.message || error.response.data?.error || "Failed to delete account"
        alert(`Delete account failed: ${errorMessage}`)
      } else {
        alert("Failed to delete account. Please try again.")
      }
    } finally {
      setLoading(false)
      setShowDeleteAccount(false)
    }
  }

  const getCurrentReport = () => {
    return reports.find((report) => report._id === viewingReport)
  }

  const formatSymptomForDisplay = (symptom: string) => {
    return symptom.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const toggleReportExpansion = (reportId: string) => {
    setExpandedReports((prev) => ({
      ...prev,
      [reportId]: !prev[reportId],
    }))
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">MediAssist</CardTitle>
            <CardDescription>Advanced Disease Prediction Platform</CardDescription>
          </CardHeader>
          <CardContent>
            {!showRegister ? (
              <>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" name="username" type="text" placeholder="Enter your username" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" placeholder="Enter your password" required />
                  </div>
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                    {loading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setShowRegister(true)}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Create one here
                    </button>
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center mb-4">
                  <UserPlus className="w-5 h-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Create Account</h3>
                </div>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" name="fullName" type="text" placeholder="Enter your full name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" name="username" type="text" placeholder="Choose a username" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input id="age" name="age" type="number" placeholder="Enter your age" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <Input id="reg-password" name="password" type="password" placeholder="Create a password" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                    {loading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setShowRegister(false)}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Sign in here
                    </button>
                  </p>
                </div>
              </>
            )}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">Secure • HIPAA Compliant • AI-Powered</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (viewingReport) {
    const report = getCurrentReport()
    if (!report) {
      setViewingReport(null)
      return null
    }

    const isExpanded = expandedReports[report._id] || false

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="sm" onClick={() => setViewingReport(null)} className="mr-2">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">MediAssist - Report #{report._id.slice(-6)}</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteReport(report._id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  disabled={loading}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <div className="flex items-center space-x-2">
                  <UserIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{user?.fullName}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">Disease Prediction Report</CardTitle>
                    <CardDescription className="flex items-center space-x-4 mt-2">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {report.date} at {report.time}
                        </span>
                      </span>
                      <Badge
                        variant={report.status ? "default" : "secondary"}
                        className={report.status ? "bg-green-100 text-green-800" : ""}
                      >
                        {report.status ? "Shared" : "Private"}
                      </Badge>
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(
                        report.modelOutput?.confidence ||
                          (report.diagnosis.length > 0 ? report.diagnosis[0].percentage : 0),
                      )}
                      %
                    </div>
                    <div className="text-sm text-gray-500">Model Confidence</div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Primary Prediction</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6">
                    <div className="text-3xl font-bold text-gray-900 mb-2">{report.predicted}</div>
                    <div className="flex items-center justify-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-lg font-medium text-green-600">
                        {Math.round(
                          report.modelOutput?.confidence ||
                            (report.diagnosis.length > 0 ? report.diagnosis[0].percentage : 0),
                        )}
                        % Model Confidence
                      </span>
                    </div>
                    <div className="mt-4 text-sm text-gray-600">
                      Based on analysis of {report.symptoms.length} reported symptoms
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <span>Top Predictions</span>
                  </CardTitle>
                  <CardDescription>
                    Showing {isExpanded ? "all" : "top"} predictions from {report.diagnosis.length} analyzed conditions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(isExpanded ? report.diagnosis : report.diagnosis.slice(0, 8)).map((diag, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className={`text-gray-700 ${index === 0 ? "font-semibold" : ""}`}>{diag.disease}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                index === 0 ? "bg-blue-600" : index < 3 ? "bg-blue-500" : "bg-gray-400"
                              }`}
                              style={{ width: `${Math.max(Math.min(diag.percentage, 100), 2)}%` }}
                            ></div>
                          </div>
                          <span className={`text-sm font-medium ${index === 0 ? "text-blue-600" : "text-gray-900"}`}>
                            {Math.round(diag.percentage)}%
                          </span>
                        </div>
                      </div>
                    ))}
                    {report.diagnosis.length > 8 && (
                      <div className="text-center pt-2">
                        <button
                          onClick={() => toggleReportExpansion(report._id)}
                          className="text-sm text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                        >
                          {isExpanded ? "Show less" : `+${report.diagnosis.length - 8} more conditions analyzed`}
                        </button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Reported Symptoms</CardTitle>
                <CardDescription>Symptoms analyzed for this prediction</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {report.symptoms.map((symptom, index) => (
                    <Badge key={index} variant="outline" className="text-sm py-1 px-3">
                      {formatSymptomForDisplay(symptom)}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-orange-900 mb-2">Important Medical Disclaimer</h4>
                    <p className="text-sm text-orange-800">
                      This AI-generated prediction is for informational purposes only and should not replace
                      professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare
                      provider for proper medical evaluation and treatment decisions. If you are experiencing a medical
                      emergency, please seek immediate medical attention.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">MediAssist</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <UserIcon className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">{user?.fullName}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteAccount(true)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="predict" className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>New Prediction</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>My Reports</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="predict">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <span>Disease Prediction Analysis</span>
                </CardTitle>
                <CardDescription>Select your symptoms to receive an AI-powered health assessment</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePrediction} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input id="age" name="age" type="number" placeholder="Enter your age" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <select
                        name="gender"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Symptoms</Label>
                    <SymptomSelector selectedSymptoms={selectedSymptoms} onSymptomsChange={setSelectedSymptoms} />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={selectedSymptoms.length === 0 || loading}
                  >
                    {loading
                      ? "Generating Report..."
                      : `Generate Prediction Report (${selectedSymptoms.length} symptoms selected)`}
                  </Button>
                </form>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Medical Disclaimer</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        This AI prediction is for informational purposes only and should not replace professional
                        medical advice. Always consult with a healthcare provider for proper diagnosis and treatment.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Prediction Reports</h2>
                <Badge variant="secondary" className="text-sm">
                  {reports.length} Total Reports
                </Badge>
              </div>

              <div className="grid gap-4">
                {reports && Array.isArray(reports) && reports.length > 0 ? (
                  reports.map((report) => (
                    <Card key={report._id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">Report #{report._id.slice(-6)}</h3>
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {report.date} at {report.time}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={report.status ? "default" : "secondary"}
                              className={report.status ? "bg-green-100 text-green-800" : ""}
                            >
                              {report.status ? "Shared" : "Private"}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteReport(report._id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1"
                              disabled={loading}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">Symptoms</h4>
                            <div className="flex flex-wrap gap-1">
                              {report.symptoms.slice(0, 3).map((symptom, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {formatSymptomForDisplay(symptom)}
                                </Badge>
                              ))}
                              {report.symptoms.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{report.symptoms.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">Primary Prediction</h4>
                            <p className="text-sm font-medium text-gray-900">{report.predicted}</p>
                          </div>

                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">Confidence</h4>
                            <div className="flex items-center space-x-2">
                              <TrendingUp className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium text-gray-900">
                                {Math.round(
                                  report.modelOutput?.confidence ||
                                    (report.diagnosis.length > 0 ? report.diagnosis[0].percentage : 0),
                                )}
                                %
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <Button variant="outline" size="sm" onClick={() => setViewingReport(report._id)}>
                            View Full Report
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="text-center py-12">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Yet</h3>
                      <p className="text-gray-500 mb-4">
                        Generate your first disease prediction report to get started.
                      </p>
                      <Button onClick={() => setActiveTab("predict")}>Create New Report</Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {showDeleteAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <span>Delete Account</span>
              </CardTitle>
              <CardDescription>
                This action cannot be undone. This will permanently delete your account and all associated data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-900 mb-2">What will be deleted:</h4>
                <ul className="text-sm text-red-800 space-y-1">
                  <li>• Your account and profile information</li>
                  <li>• All prediction reports ({reports.length} reports)</li>
                  <li>• All saved symptoms and preferences</li>
                  <li>• Access to MediAssist platform</li>
                </ul>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteAccount(false)}
                  className="flex-1"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button onClick={handleDeleteAccount} className="flex-1 bg-red-600 hover:bg-red-700" disabled={loading}>
                  {loading ? "Deleting..." : "Delete Account"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
