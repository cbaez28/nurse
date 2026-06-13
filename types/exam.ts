export interface Question {
  id: number
  question: string
  options: Record<string, string>
  correctAnswer: string
  explanation: string
  requiresReview: boolean
}

export interface ExamState {
  answeredIds: number[]
  currentQuestionId: number | null
  correctCount: number
  incorrectCount: number
}