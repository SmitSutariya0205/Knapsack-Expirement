"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Gift, Sparkles, Target, BrainCircuit, Activity } from "lucide-react"

interface ResultsPhaseProps {
  onNext?: () => void
  participantData: any
  updateParticipantData: (data: any) => void
}

export default function ResultsPhase({ onNext, participantData }: ResultsPhaseProps) {
  const [isCompleting, setIsCompleting] = useState(false)

  // Calculate scores
  const training2 = participantData.training2 || { totalPoints: 0, maxPoints: 20 }
  const benchmark = participantData.benchmark || { totalPoints: 0, maxPoints: 60 }
  const prediction = participantData.prediction || participantData.final || { totalPoints: 0, maxPoints: 60 }

  const test1Points = training2.totalPoints || 0
  const test2Points = benchmark.totalPoints || 0
  const test3Points = prediction.totalPoints || 0
  
  const totalEarnedPoints = test1Points + test2Points + test3Points
  const totalPossiblePoints = training2.maxPoints + benchmark.maxPoints + prediction.maxPoints

  const completeProlificStudy = async () => {
    setIsCompleting(true)
    
    try {
      const participantId = sessionStorage.getItem('participantId')
      const prolificPid = sessionStorage.getItem('prolificPid')
      
      if (participantId && prolificPid) {
        const API_BASE = process.env.NODE_ENV === 'production' 
          ? "https://knapsack-expirement-3f13.onrender.com"
          : "http://localhost:8787"

        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 15000)
            
            const res = await fetch(`${API_BASE}/api/v1/complete-participant`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                participantId,
                prolificPid,
                completedAt: new Date().toISOString()
              }),
              signal: controller.signal
            })
            
            clearTimeout(timeoutId)
            if (res.ok) break
          } catch (e) {
            if (attempt < 3) await new Promise(r => setTimeout(r, 2000))
          }
        }
      }
    } catch (error) {
      console.error("[Completion] Failed to log outcome:", error)
    } finally {
      sessionStorage.removeItem('participantId')
      sessionStorage.removeItem('prolificPid')
      
      // Redirect to Prolific completion page
      window.location.href = `https://app.prolific.co/submissions/complete?cc=KNAPSACK2024`
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <Card className="text-center shadow-lg bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader>
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
            <Trophy className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">Experiment Complete</CardTitle>
          <p className="text-lg text-gray-600 mt-2">Thank you for participating in the Knapsack Challenge</p>
        </CardHeader>
      </Card>

      {/* Performance Summary */}
      <Card className="shadow-lg border-t-4 border-t-blue-500">
        <CardHeader className="bg-blue-50 border-b border-blue-100 pb-4">
          <CardTitle className="flex items-center text-2xl text-blue-900">
            <Activity className="h-7 w-7 mr-3 text-blue-600" />
            Your Performance Summary
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Target className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Test 1</h3>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-4xl font-bold text-gray-900">{test1Points}</span>
                  <span className="text-gray-500 font-medium ml-1">/ {training2.maxPoints} pts</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <BrainCircuit className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Test 2</h3>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-4xl font-bold text-gray-900">{test2Points}</span>
                  <span className="text-gray-500 font-medium ml-1">/ {benchmark.maxPoints} pts</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <Sparkles className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Test 3</h3>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-4xl font-bold text-gray-900">{test3Points}</span>
                  <span className="text-gray-500 font-medium ml-1">/ {prediction.maxPoints} pts</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg text-center">
            <h3 className="text-xl font-medium text-blue-100 mb-2">Total Points Earned</h3>
            <div className="text-6xl font-black tabular-nums tracking-tight">
              {totalEarnedPoints} <span className="text-3xl text-blue-200 font-medium">/ {totalPossiblePoints}</span>
            </div>
            <p className="mt-4 text-blue-100 max-w-2xl mx-auto">
              This score evaluates your ability to make optimal tradeoffs and maximize rewards within the given capacity constraint across all phases of the study.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Complete Study Section */}
      <div className="text-center pt-8 border-t border-gray-200">
        <Button 
          onClick={completeProlificStudy}
          disabled={isCompleting}
          size="lg"
          className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-8 py-5 rounded-2xl font-bold shadow-xl text-xl w-full max-w-lg transform hover:scale-[1.02] transition-all"
        >
          {isCompleting ? "Completing Study..." : "Complete Study & Return to Prolific"}
        </Button>
        <p className="text-sm text-gray-500 mt-4">
          Clicking this will record your participation and seamlessly redirect you back to Prolific to claim your compensation.
        </p>
      </div>
    </div>
  )
}

