import { Lightbulb, Volume2 } from 'lucide-react'
import React from 'react'

function QuestionsSection({ mockInterviewQuestion, activeQuestionIndex }) {
  
  // Convert input to array safely
  const questions = Array.isArray(mockInterviewQuestion) ? mockInterviewQuestion : []

  const textToSpeech = (text) => {
    if ('speechSynthesis' in window) {
      const speech = new SpeechSynthesisUtterance(text)
      window.speechSynthesis.speak(speech)
    } else {
      alert('Sorry, your browser does not support text to speech')
    }
  }

  if (questions.length === 0) {
    return (
      <div className='p-5 border rounded-lg my-10 text-center text-gray-500'>
        No questions available.
      </div>
    )
  }

  return (
    <div className='p-5 border rounded-lg my-10'>
      {/* Question selector buttons */}
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'>
        {questions.map((question, index) => (
          <h2
            key={index}
            className={`p-2 border rounded-full text-xs md:text-sm text-center cursor-pointer
            ${activeQuestionIndex === index && 'bg-primary text-white'}`}
          >
            Question #{index + 1}
          </h2>
        ))}
      </div>

      {/* Active question */}
      <div className='my-5 flex items-center gap-3'>
        <h2 className='text-md md:text-lg'>
          {questions[activeQuestionIndex]?.question || 'No question text available'}
        </h2>
        {questions[activeQuestionIndex]?.question && (
          <Volume2
            className='cursor-pointer'
            onClick={() => textToSpeech(questions[activeQuestionIndex]?.question)}
          />
        )}
      </div>

      {/* Note Section */}
      <div className='border rounded-lg p-5 bg-blue-100 mt-20'>
        <h2 className='flex gap-2 items-center text-primary'>
          <Lightbulb />
          <strong>Note:</strong>
        </h2>
        <h2 className='text-sm text-primary my-2'>
          {process.env.NEXT_PUBLIC_QUESTION_NOTE || 'No note provided.'}
        </h2>
      </div>
    </div>
  )
}

export default QuestionsSection
