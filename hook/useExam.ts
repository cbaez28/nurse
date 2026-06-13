'use client'

import { useEffect, useState } from 'react'
import { Question, ExamState } from '@/types/exam'
import { saveState, loadState, clearState } from '@/lib/storage'

export function useExam() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)

  const [answeredIds, setAnsweredIds] = useState<number[]>([])
  const [correctCount, setCorrectCount] = useState(0)
  const [incorrectCount, setIncorrectCount] = useState(0)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // LOAD QUESTIONS
  useEffect(() => {
    loadQuestions()
  }, [])

  // LOAD PROGRESS WHEN QUESTIONS READY
  useEffect(() => {
    if (questions.length > 0) {
      loadProgress()
    }
  }, [questions])

  async function loadQuestions() {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/questions.json')

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`)
      }

      const data: Question[] = await response.json()

      setQuestions(data)

      if (data.length > 0) {
        const first = data[0]
        setCurrentQuestion(first)
      }
    } catch (err) {
      console.error(err)
      setError('Error cargando preguntas')
    } finally {
      setLoading(false)
    }
  }

  function loadProgress() {
    const saved = loadState()

    if (!saved) {
      nextQuestion([])
      return
    }

    setAnsweredIds(saved.answeredIds ?? [])
    setCorrectCount(saved.correctCount ?? 0)
    setIncorrectCount(saved.incorrectCount ?? 0)

    const question = questions.find(
      q => q.id === saved.currentQuestionId
    )

    if (question) {
      setCurrentQuestion(question)
    } else {
      nextQuestion(saved.answeredIds ?? [])
    }
  }

  function nextQuestion(answered: number[] = answeredIds) {
    const remaining = questions.filter(
      q => !answered.includes(q.id)
    )

    if (remaining.length === 0) {
      setCurrentQuestion(null)
      return
    }

    const random =
      remaining[Math.floor(Math.random() * remaining.length)]

    setCurrentQuestion(random)

    saveState({
      answeredIds: answered,
      currentQuestionId: random.id,
      correctCount,
      incorrectCount
    })
  }

  function answerQuestion(selectedAnswer: string) {
    if (!currentQuestion) return null

    const isCorrect =
      selectedAnswer === currentQuestion.correctAnswer

    const newAnswered = [...answeredIds, currentQuestion.id]

    const newCorrect = isCorrect
      ? correctCount + 1
      : correctCount

    const newIncorrect = !isCorrect
      ? incorrectCount + 1
      : incorrectCount

    setAnsweredIds(newAnswered)
    setCorrectCount(newCorrect)
    setIncorrectCount(newIncorrect)

    saveState({
      answeredIds: newAnswered,
      currentQuestionId: currentQuestion.id,
      correctCount: newCorrect,
      incorrectCount: newIncorrect
    })

    return {
      isCorrect,
      correctAnswer: currentQuestion.correctAnswer,
      explanation: currentQuestion.explanation
    }
  }

  function resetExam() {
    clearState()

    setAnsweredIds([])
    setCorrectCount(0)
    setIncorrectCount(0)

    nextQuestion([])
  }

  return {
    currentQuestion,
    answerQuestion,
    nextQuestion,
    resetExam,
    correctCount,
    incorrectCount,
    answeredIds,
    totalQuestions: questions.length,
    loading,
    error
  }
}