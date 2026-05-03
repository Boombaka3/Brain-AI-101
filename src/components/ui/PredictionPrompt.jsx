import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './predictionPrompt.css'

export default function PredictionPrompt({
  question,
  options = [
    { label: 'Yes', value: true },
    { label: 'No', value: false },
  ],
  onPredict,
  result,
  resultLabel,
  explanation,
  locked = false,
}) {
  const [choice, setChoice] = useState(null)
  const hasChosen = choice !== null
  const isRevealed = result !== undefined && result !== null
  const wasCorrect = hasChosen && isRevealed && choice === result

  const handleChoice = (value) => {
    if (locked || isRevealed) return
    setChoice(value)
    onPredict?.(value)
  }

  const reset = () => {
    setChoice(null)
  }

  return (
    <div className={`pp ${isRevealed ? 'pp--revealed' : ''}`}>
      <p className="pp-question">{question}</p>

      <div className="pp-options">
        {options.map((opt) => (
          <button
            key={String(opt.value)}
            className={`pp-option${choice === opt.value ? ' pp-option--selected' : ''}${isRevealed && opt.value === result ? ' pp-option--correct' : ''}${isRevealed && choice === opt.value && opt.value !== result ? ' pp-option--wrong' : ''}`}
            onClick={() => handleChoice(opt.value)}
            disabled={locked || isRevealed}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {hasChosen && !isRevealed && (
        <p className="pp-status">
          You predicted: <strong>{options.find((o) => o.value === choice)?.label}</strong>
        </p>
      )}

      <AnimatePresence>
        {isRevealed && (
          <motion.div
            className={`pp-result ${wasCorrect ? 'pp-result--correct' : 'pp-result--wrong'}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <span className="pp-result-icon">{wasCorrect ? '✓' : '✗'}</span>
            <div className="pp-result-text">
              <strong>{wasCorrect ? 'Correct!' : 'Not quite.'}</strong>
              {resultLabel && <span> Answer: {resultLabel}</span>}
              {explanation && <p className="pp-explanation">{explanation}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
