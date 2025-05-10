// API endpoints
const API_ENDPOINTS = {
  analyze: "/api/analyze",
  followup: "/api/followup",
  extract: "/api/extract",
}

// Demo data for development mode
const DEMO_DATA = {
  analysis: {
    simplifiedExplanation:
      "This clause states that you (the contractor) must pay for any legal costs or damages that the company faces because of your work, even if the company is partially at fault. This is a very broad indemnification clause that puts significant financial risk on you if something goes wrong.",
    riskyTerms: [
      {
        term: "indemnify",
        severity: "high",
        explanation: "You're agreeing to cover all costs and damages, even if not entirely your fault.",
      },
      {
        term: "hold harmless",
        severity: "high",
        explanation: "You can't hold the company responsible, even if they contributed to the problem.",
      },
      {
        term: "in perpetuity",
        severity: "medium",
        explanation: "This obligation has no time limit and continues forever.",
      },
      {
        term: "reasonable attorney's fees",
        severity: "medium",
        explanation: "You'll have to pay for the company's legal representation, which can be very expensive.",
      },
    ],
  },
  followup: {
    answer:
      "'Indemnify' means you're agreeing to compensate the company for any losses they suffer related to your work. In this context, it creates a financial obligation for you to pay for damages, legal fees, and other costs if a third party makes a claim against the company because of your services. This is a very broad obligation and could potentially expose you to significant financial risk, especially since it's paired with 'hold harmless' language.",
  },
}

// Force real API calls unless explicitly in demo mode
const isDevelopment = process.env.NEXT_PUBLIC_APP_ENV === "demo"
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

console.log("")
// Simulate network delay for development mode
const simulateNetworkDelay = (min = 500, max = 2000) => {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min
  return new Promise((resolve) => setTimeout(resolve, delay))
}

// Error handling wrapper for fetch calls
const fetchWithErrorHandling = async (url: string, options: RequestInit) => {
  try {
    const response = await fetch(url, options)

    if (!response.ok) {
      // Try to parse error message from response
      let errorMessage
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || `Error: ${response.status} ${response.statusText}`
      } catch (e) {
        errorMessage = `Error: ${response.status} ${response.statusText}`
      }

      throw new Error(errorMessage)
    }

    return await response.json()
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error("An unknown error occurred")
  }
}

// API service functions
export const apiService = {
  // Analyze legal text
  analyzeText: async (text: string) => {
    if (isDevelopment) {
      await simulateNetworkDelay()
      return DEMO_DATA.analysis
    }

    return fetchWithErrorHandling(`${API_BASE_URL}${API_ENDPOINTS.analyze}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    })
  },

  // Process follow-up question
  askFollowUp: async (question: string, originalText: string) => {
    if (isDevelopment) {
      await simulateNetworkDelay()
      return DEMO_DATA.followup
    }

    return fetchWithErrorHandling(`${API_BASE_URL}${API_ENDPOINTS.followup}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question, originalText }),
    })
  },

  // Extract text from uploaded document
  extractTextFromDocument: async (file: File) => {
    if (isDevelopment) {
      await simulateNetworkDelay()
      return {
        text: "The Contractor shall indemnify, defend, and hold harmless the Company, its officers, directors, employees and agents from and against any and all claims, damages, losses, liabilities, suits, actions, demands, proceedings (whether legal or administrative), and expenses (including, but not limited to, reasonable attorney's fees) threatened, asserted, or filed by a third party against any of the indemnified parties arising out of or relating to the Contractor's performance under this Agreement, including any breach of this Agreement by Contractor. The terms of this section shall survive the termination of this Agreement in perpetuity.",
      }
    }

    const formData = new FormData()
    formData.append("file", file)

    return fetchWithErrorHandling(`${API_BASE_URL}${API_ENDPOINTS.extract}`, {
      method: "POST",
      body: formData,
    })
  },
}
