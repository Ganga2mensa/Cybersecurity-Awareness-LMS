"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { calculateQuizScore, isQuizPassing } from "@/lib/quiz"
import { completeLessonAndUpdateProgress } from "@/actions/enrollments"

interface QuizOption {
  text: string
  isCorrect: boolean
}

interface QuizQuestion {
  id: string
  questionText: string
  options: Record<string, QuizOption>
  order: number
}

interface QuizFormProps {
  questions: QuizQuestion[]
  passingScore: number
  enrollmentId: string
  lessonId: string
  isCompleted: boolean
}

export function QuizForm({ questions, passingScore, enrollmentId, lessonId, isCompleted }: QuizFormProps) {
  const sortedQuestions = [...questions].sort((a, b) => a.order - b.order)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(isCompleted)
  const [score, setScore] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSelect = (questionId: string, optionKey: string) => {
    if (submitted) return
    setAnswers((prev) => ({ ...prev, [questionId]: optionKey }))
  }

  const handleSubmit = () => {
    if (sortedQuestions.length === 0) return

    // Calculate score
    let correct = 0
    for (const question of sortedQuestions) {
      const selectedKey = answers[question.id]
      if (selectedKey && question.options[selectedKey]?.isCorrect) {
        correct++
      }
    }

    const calculatedScore = calculateQuizScore(correct, sortedQuestions.length)
    setScore(calculatedScore)
    setSubmitted(true)

    // Mark lesson as complete regardless of pass/fail
    startTransition(async () => {
      try {
        await completeLessonAndUpdateProgress(enrollmentId, lessonId)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save progress")
      }
    })
  }

  const passing = score !== null ? isQuizPassing(score, passingScore) : null

  return (
    <div className="space-y-6">
      {sortedQuestions.map((question, qIndex) => {
        const optionEntries = Object.entries(question.options).sort(([a], [b]) => a.localeCompare(b))
        const selectedKey = answers[question.id]

        return (
          <div key={question.id} className="space-y-3">
            <p className="font-medium text-foreground">
              {qIndex + 1}. {question.questionText}
            </p>
            <div className="space-y-2">
              {optionEntries.map(([key, option]) => {
                const isSelected = selectedKey === key
                const showResult = submitted
                const isCorrect = option.isCorrect

                let optionClass = "flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors"
                if (showResult) {
                  if (isCorrect) {
                    optionClass += " border-green-500 bg-green-50 dark:bg-green-900/20"
                  } else if (isSelected && !isCorrect) {
                    optionClass += " border-red-500 bg-red-50 dark:bg-red-900/20"
                  } else {
                    optionClass += " border-border bg-background opacity-60"
                  }
                } else {
                  optionClass += isSelected
                    ? " border-primary bg-primary/10"
                    : " border-border bg-background hover:bg-muted"
                }

                return (
                  <label key={key} className={optionClass}>
                    <input
                      type="radio"
                      name={question.id}
                      value={key}
                      checked={isSelected}
                      onChange={() => handleSelect(question.id, key)}
                      disabled={submitted}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium text-muted-foreground uppercase w-4">{key}</span>
                    <span className="text-sm text-foreground flex-1">{option.text}</span>
                    {showResult && isCorrect && (
                      <span className="text-green-600 text-xs font-medium">✓ Correct</span>
                    )}
                    {showResult && isSelected && !isCorrect && (
                      <span className="text-red-600 text-xs font-medium">✗ Wrong</span>
                    )}
                  </label>
                )
              })}
            </div>
          </div>
        )
      })}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {!submitted ? (
        <Button
          onClick={handleSubmit}
          disabled={isPending || Object.keys(answers).length < sortedQuestions.length}
        >
          {isPending ? "Submitting..." : "Submit Quiz"}
        </Button>
      ) : (
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-foreground">{score}%</span>
            {passing !== null && (
              <Badge variant={passing ? "success" : "destructive"}>
                {passing ? "Passed" : "Failed"}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Passing score: {passingScore}%
          </p>
          {passing === false && (
            <p className="text-sm text-muted-foreground">
              Review the correct answers above and try again next time.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
