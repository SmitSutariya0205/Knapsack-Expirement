"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Gift, Sparkles } from "lucide-react"

interface ResultsPhaseProps {
  onNext?: () => void
  participantData: any
  updateParticipantData: (data: any) => void
}

export default function ResultsPhase({ onNext, participantData }: ResultsPhaseProps) {
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

      {/* Study Completion */}
      <Card className="shadow-lg bg-gradient-to-br from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-center text-2xl">
            <Sparkles className="h-8 w-8 mr-3 text-green-600" />
            Study Complete
          </CardTitle>
        </CardHeader>

        <CardContent className="text-center space-y-6">
          <div className="bg-white p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-lg font-semibold mb-4 text-green-800">
              Thank you for your valuable contribution to our research!
            </h3>
            <p className="text-green-700">
              Your participation helps us understand how people approach complex problem-solving tasks.
              All data collected will be used to advance research in cognitive science and algorithm design.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Study Information */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-xl">About This Study</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-gray-700">
            This experiment investigated how people approach optimization problems under different conditions. The
            knapsack problem is a classic algorithmic challenge used in computer science and operations research.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-semibold mb-2">What we studied:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Problem-solving strategies under time pressure</li>
                <li>• How question ordering affects performance</li>
                <li>• Strategic decision-making in optimization tasks</li>
                <li>• Cognitive approaches to complex problems</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Your contribution:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Provided valuable data on human problem-solving</li>
                <li>• Helped understand cognitive strategies</li>
                <li>• Contributed to algorithm design research</li>
                <li>• Advanced our knowledge of decision-making</li>
              </ul>
            </div>
          </div>

          <div className="text-center pt-6">
            <Button 
              onClick={onNext}
              size="lg"
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200"
            >
              <Gift className="h-5 w-5 mr-2" />
              Continue
            </Button>
          </div>

          <div className="text-center pt-4">
            <p className="text-sm text-gray-500">
              Your experiment results have been saved.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
