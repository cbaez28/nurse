'use client'

import { useState } from "react"
import { useExam } from "@/hook/useExam"

export default function HomePage() {
  const {
    currentQuestion,
    answerQuestion,
    nextQuestion,
    resetExam,
    correctCount,
    incorrectCount,
    answeredIds,
    totalQuestions,
    loading,
    error
  } = useExam()

  const [feedback, setFeedback] = useState<null | {
    isCorrect: boolean
    correctAnswer: string
    explanation: string
  }>(null)

  const [answered, setAnswered] = useState(false)

  function copyQuestion() {
    if (!currentQuestion) return
    navigator.clipboard.writeText(currentQuestion.question)
  }

  function handleAnswer(key: string) {
    if (answered) return

    const result = answerQuestion(key)
    if (!result) return

    setFeedback({
      isCorrect: result.isCorrect,
      correctAnswer: result.correctAnswer,
      explanation: result.explanation
    })

    setAnswered(true)
  }

  function handleNext() {
    setFeedback(null)      // 🔥 limpia banner
    setAnswered(false)     // 🔥 desbloquea respuestas
    nextQuestion()
  }

  if (loading) {
    return (
      <main className="container">
        <div className="card">
          <h1>Cargando preguntas...</h1>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="container">
        <div className="card">
          <h1>{error}</h1>
        </div>
      </main>
    )
  }

  if (!currentQuestion) {
    return (
      <main className="container">
        <div className="card">
          <h1>No hay preguntas disponibles</h1>
          <button onClick={resetExam}>Reiniciar</button>
        </div>
      </main>
    )
  }

  return (
    <main className="container">
      <div className="card">

        <div className="header">
          <h1>Examen de Enfermería</h1>
          <p>Practica tus conocimientos de forma interactiva</p>
        </div>

        <div className="stats">
          <div className="stat">
            <span>Total</span>
            <strong>{totalQuestions}</strong>
          </div>

          <div className="stat">
            <span>Correctas</span>
            <strong>{correctCount}</strong>
          </div>

          <div className="stat">
            <span>Incorrectas</span>
            <strong>{incorrectCount}</strong>
          </div>

          <div className="stat">
            <span>Pendientes</span>
            <strong>{totalQuestions - answeredIds.length}</strong>
          </div>
        </div>

        <div className="question">
          <div className="question-number">
            Pregunta #{currentQuestion.id}
          </div>

          <h2>{currentQuestion.question}</h2>

          {/* 🔥 BANNER MINI (SOLO SI EXISTE FEEDBACK) */}
          {feedback && (
            <div
              style={{
                padding: "10px 12px",
                margin: "12px 0",
                borderRadius: "10px",
                fontSize: "14px",
                background: feedback.isCorrect ? "#e8fff0" : "#fff1f1",
                border: feedback.isCorrect
                  ? "1px solid #22c55e"
                  : "1px solid #ef4444"
              }}
            >
              <strong>
                {feedback.isCorrect ? "✔ Correcto" : "❌ Incorrecto"}
              </strong>

              {!feedback.isCorrect && (
                <div style={{ marginTop: 6 }}>
                  <strong>Correcta:</strong> {feedback.correctAnswer}
                </div>
              )}

              <div style={{ marginTop: 6, color: "#555" }}>
                {feedback.explanation}
              </div>
            </div>
          )}

          <div className="options">
            {Object.entries(currentQuestion.options).map(
              ([key, value]) => (
                <button
                  key={key}
                  disabled={answered}   // 🔥 bloquea doble respuesta
                  onClick={() => handleAnswer(key)}
                >
                  {key}. {value}
                </button>
              )
            )}
          </div>
        </div>

        <div className="actions">
          <button
            className="primary"
            onClick={handleNext}
            disabled={!feedback}   // 🔥 solo siguiente si ya respondió
          >
            Siguiente
          </button>

          <button className="secondary" onClick={resetExam}>
            Reiniciar examen
          </button>
        </div>

      </div>
    </main>
  )
}