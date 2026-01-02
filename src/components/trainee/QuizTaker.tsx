import { useState, useEffect, useCallback } from 'react';
import { Quiz, QuizAttempt } from '../../types';
import { apiService } from '../../services/api';
import { ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Props {
  quiz: Quiz;
  onComplete: () => void;
  onBack: () => void;
}

export function QuizTaker({ quiz, onComplete, onBack }: Props) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: number; selectedOptionId: number }[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(quiz.timeLimit ? quiz.timeLimit * 60 : null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<QuizAttempt | null>(null);

  const handleSubmit = useCallback(async () => {
    try {
      const attemptResult = await apiService.submitQuizAttempt(quiz.id, answers);
      setResult(attemptResult);
      setSubmitted(true);
    } catch (error) {
      console.error('Failed to submit quiz:', error);
    }
  }, [quiz.id, answers]);

  useEffect(() => {
    if (timeRemaining === null || submitted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 0) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, submitted, handleSubmit]);

  const currentQuestion = quiz.questions[currentQuestionIndex];

  const handleSelectOption = (optionId: number) => {
    const existingIndex = answers.findIndex((a) => a.questionId === currentQuestion.id);

    if (existingIndex >= 0) {
      const newAnswers = [...answers];
      newAnswers[existingIndex] = { questionId: currentQuestion.id, selectedOptionId: optionId };
      setAnswers(newAnswers);
    } else {
      setAnswers([...answers, { questionId: currentQuestion.id, selectedOptionId: optionId }]);
    }
  };

  const getSelectedOptionId = () => {
    const answer = answers.find((a) => a.questionId === currentQuestion.id);
    return answer?.selectedOptionId;
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (submitted && result) {
    const percentage = Math.round((result.score / result.totalPoints) * 100);
    const passed = percentage >= 70;

    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${passed ? 'bg-green-100' : 'bg-red-100'}`}>
            {passed ? (
              <CheckCircle className="w-12 h-12 text-green-600" />
            ) : (
              <XCircle className="w-12 h-12 text-red-600" />
            )}
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {passed ? 'Congratulations!' : 'Keep Learning!'}
          </h2>
          <p className="text-gray-600">
            You scored {result.score} out of {result.totalPoints} points
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-8 mb-6">
          <div className="text-center mb-6">
            <div className="text-6xl font-bold text-blue-600 mb-2">{percentage}%</div>
            <p className="text-gray-600">Your Score</p>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Answer Review</h3>
            <div className="space-y-3">
              {quiz.questions.map((question, index) => {
                const userAnswer = result.answers.find((a) => a.questionId === question.id);
                const isCorrect = userAnswer?.isCorrect;

                return (
                  <div key={question.id} className="flex items-start gap-3">
                    <div className={`mt-1 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                      {isCorrect ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        Question {index + 1}: {question.questionText}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <button
          onClick={onComplete}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Back to Quizzes
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        {timeRemaining !== null && (
          <div className="flex items-center gap-2 text-gray-700 bg-gray-100 px-4 py-2 rounded-lg">
            <Clock className="w-5 h-5" />
            <span className="font-mono font-semibold">{formatTime(timeRemaining)}</span>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-8 mb-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </span>
            <span className="text-sm font-medium text-blue-600">
              {currentQuestion.points} {currentQuestion.points === 1 ? 'point' : 'points'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
            />
          </div>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-6">{currentQuestion.questionText}</h3>

        <div className="space-y-3">
          {currentQuestion.options.map((option) => {
            const isSelected = getSelectedOptionId() === option.id;

            return (
              <button
                key={option.id}
                onClick={() => handleSelectOption(option.id)}
                className={`w-full text-left p-4 rounded-lg border-2 transition ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'border-blue-600' : 'border-gray-300'
                    }`}
                  >
                    {isSelected && <div className="w-3 h-3 rounded-full bg-blue-600" />}
                  </div>
                  <span className="text-gray-900">{option.optionText}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        {currentQuestionIndex < quiz.questions.length - 1 ? (
          <button
            onClick={handleNext}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Next Question
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={answers.length !== quiz.questions.length}
            className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Quiz
          </button>
        )}
      </div>

      {answers.length !== quiz.questions.length && currentQuestionIndex === quiz.questions.length - 1 && (
        <p className="text-sm text-amber-600 mt-4 text-center">
          Please answer all questions before submitting
        </p>
      )}
    </div>
  );
}
