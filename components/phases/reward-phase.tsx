"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Gift, Square, Sparkles, Frown } from "lucide-react"

interface RewardPhaseProps {
  onNext?: () => void
  participantData: any
  updateParticipantData: (data: any) => void
}

export default function RewardPhase({ onNext, participantData, updateParticipantData }: RewardPhaseProps) {
  const [isRunning, setIsRunning] = useState(true)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [hasFinished, setHasFinished] = useState(false)
  const [hasMarkedComplete, setHasMarkedComplete] = useState(false)
  
  const requestRef = useRef<number>()
  const startTimeRef = useRef<number>(0)

  // Calculate Probability Points exactly as done in Performance Summary (ResultsPhase)
  const training2 = participantData.training2 || { totalPoints: 0, maxPoints: 20 }
  const benchmark = participantData.benchmark || { totalPoints: 0, maxPoints: 60 }
  const prediction = participantData.prediction || participantData.final || { totalPoints: 0, maxPoints: 60 }

  const benchmarkPoints = benchmark.totalPoints || 0
  const finalPoints = prediction.totalPoints || 0
  
  const useBenchmark = benchmarkPoints >= finalPoints
  const testForOverall = useBenchmark ? benchmark : prediction
  
  // Total Points (Base Points + 20 Completion Bonus)
  const basePoints = (training2.totalPoints || 0) + (testForOverall.totalPoints || 0)
  const probabilityPoints = basePoints + 20 // Out of 100

  // High precision fast clock using requestAnimationFrame
  const updateTime = (time: number) => {
    if (startTimeRef.current === 0) {
      startTimeRef.current = time
    }
    setCurrentTime(time)
    if (isRunning) {
      requestRef.current = requestAnimationFrame(updateTime)
    }
  }

  useEffect(() => {
    if (isRunning) {
      requestRef.current = requestAnimationFrame(updateTime)
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }
  }, [isRunning])

  const handleStopClock = () => {
    setIsRunning(false)
    if (requestRef.current) cancelAnimationFrame(requestRef.current)
    setHasFinished(true)
  }

  // Format time (hh:mm:ss:ms) - milliseconds as 3 digits
  const formatTime = (msRaw: number) => {
    const elapsed = msRaw - startTimeRef.current
    
    // We want realistic looking hours/mins/secs/ms that just spin quickly
    const hours = Math.floor(elapsed / 3600000).toString().padStart(2, '0')
    const mins = Math.floor((elapsed % 3600000) / 60000).toString().padStart(2, '0')
    const secs = Math.floor((elapsed % 60000) / 1000).toString().padStart(2, '0')
    
    // Milliseconds in 3 digits (000-999)
    const ms = Math.floor(elapsed % 1000).toString().padStart(3, '0')
    
    return { hours, mins, secs, ms, full: `${hours}:${mins}:${secs}:${ms}` }
  }

  const timeData = formatTime(currentTime)
  
  // The crucial winning number (last 2 digits of the 3-digit ms)
  // If ms is "282", we want "82".
  const lastTwoDigitsStr = timeData.ms.slice(-2)
  const lastTwoDigits = parseInt(lastTwoDigitsStr, 10)
  
  // Win condition: strictly less than probabilityPoints
  const isWinner = probabilityPoints >= 100 ? true : lastTwoDigits < probabilityPoints

  // Auto-complete study to backend after clock is stopped
  useEffect(() => {
    if (hasFinished && !hasMarkedComplete) {
      setHasMarkedComplete(true)
      
      const markStudyComplete = async () => {
        try {
          const participantId = sessionStorage.getItem('participantId')
          const prolificPid = sessionStorage.getItem('prolificPid')
          
          if (participantId && prolificPid) {
            const API_BASE = process.env.NODE_ENV === 'production' 
              ? "https://knapsack-expirement-3f13.onrender.com"
              : "http://localhost:8787"

            // Log outcome in participantData for local state tracking
            updateParticipantData({
              rewardOutcome: {
                probabilityPoints,
                stoppedMs: timeData.ms,
                lastTwoDigits,
                isWinner
              }
            });

            for (let attempt = 1; attempt <= 3; attempt++) {
              try {
                const controller = new AbortController()
                const timeoutId = setTimeout(() => controller.abort(), 30000)
                
                const res = await fetch(`${API_BASE}/api/v1/complete-participant`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({
                    participantId,
                    prolificPid,
                    completedAt: new Date().toISOString(),
                    probabilityPoints,
                    wonReward: isWinner
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
          console.error("[Reward] Failed to log outcome:", error)
        }
      }
      
      markStudyComplete()
    }
  }, [hasFinished, hasMarkedComplete])

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="shadow-lg border-t-4 border-t-emerald-500">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <Gift className="h-8 w-8 text-emerald-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">
            Bonus Reward Game
          </CardTitle>
          <p className="text-lg text-gray-600 mt-2">
            Based on your performance, your probability of winning the bonus is{" "}
            <span className="font-bold text-emerald-600 text-xl">{probabilityPoints}%</span>.
          </p>
        </CardHeader>

        <CardContent className="space-y-8 pt-6">
          <div className="bg-gray-900 rounded-2xl p-8 shadow-inner flex flex-col items-center justify-center space-y-6">
            <div className="text-white text-5xl md:text-7xl font-mono tracking-wider tabular-nums font-bold">
              {timeData.full}
            </div>
            
            {!hasFinished ? (
              <Button 
                onClick={handleStopClock}
                size="lg"
                className="w-48 h-16 text-xl bg-red-600 hover:bg-red-700 shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all animate-pulse"
              >
                <Square className="h-6 w-6 mr-3 fill-current" />
                Stop Clock
              </Button>
            ) : (
              <div className="w-full max-w-lg mt-8 animation-fade-in p-6 bg-white rounded-xl text-center space-y-4 shadow-xl">
                <div className="text-gray-600">
                  You stopped the clock on: <span className="font-mono bg-gray-100 px-3 py-1 rounded text-2xl tracking-widest text-gray-800">{timeData.full}</span>
                </div>
                
                <div className="space-y-1">
                  <div className="text-gray-600">
                    The last two digits are: <span className="font-bold text-3xl text-gray-900">{lastTwoDigitsStr}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    To win, this number must be strictly less than: <span className="font-semibold">{probabilityPoints}</span>
                  </div>
                </div>

                {probabilityPoints >= 100 ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <Sparkles className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                    <h3 className="text-xl font-bold text-emerald-800">You have scored the maximum number of points possible and won the reward!</h3>
                  </div>
                ) : isWinner ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <Gift className="h-8 w-8 text-emerald-500 mx-auto mb-2 animate-bounce" />
                    <h3 className="text-xl font-bold text-emerald-800">Congratulations! You won the reward.</h3>
                  </div>
                ) : (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <Frown className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                    <h3 className="text-xl font-bold text-orange-800">Sorry, you did not win the reward this time.</h3>
                  </div>
                )}
              </div>
            )}
          </div>

          {hasFinished && (
            <div className="text-center pt-8 border-t border-gray-200 mt-8">
              <Button 
                onClick={() => {
                  sessionStorage.removeItem('participantId')
                  sessionStorage.removeItem('prolificPid')
                  
                  // Redirect to Prolific completion page
                  const completionUrl = `https://app.prolific.co/submissions/complete?cc=KNAPSACK2024`
                  window.location.href = completionUrl
                }}
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg text-lg w-full max-w-sm"
              >
                Complete Study & Return to Prolific
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
