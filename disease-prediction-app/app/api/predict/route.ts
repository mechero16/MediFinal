import { type NextRequest, NextResponse } from "next/server"
import axios from "axios"

const ML_MODEL_URL = "http://192.168.137.1:5000/predict"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { symptoms } = body

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return NextResponse.json({ error: "Symptoms array is required" }, { status: 400 })
    }

    console.log("[v0] Proxy: Calling ML model with symptoms:", symptoms)

    // Make the request to the ML model from the server side
    const mlResponse = await axios.post(
      ML_MODEL_URL,
      {
        symptoms: symptoms,
      },
      {
        timeout: 30000, // 30 second timeout
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

    console.log("[v0] Proxy: ML model response:", mlResponse.data)

    return NextResponse.json(mlResponse.data)
  } catch (error: any) {
    console.error("[v0] Proxy: Error calling ML model:", error)

    if (error.response) {
      // ML model returned an error response
      return NextResponse.json(
        {
          error: "ML model error",
          details: error.response.data,
          status: error.response.status,
        },
        { status: error.response.status },
      )
    } else if (error.request) {
      // Network error - couldn't reach ML model
      return NextResponse.json(
        { error: "Cannot connect to ML model server. Please check if the server is running." },
        { status: 503 },
      )
    } else {
      // Other error
      return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
    }
  }
}
