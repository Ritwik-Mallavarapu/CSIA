import { useState, useEffect } from 'react';
import { Quiz } from '../../types';
import { apiService } from '../../services/api';
import { Clock, CheckCircle, Play, FileText } from 'lucide-react';
import { QuizTaker } from './QuizTaker';

export function QuizList() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      const data = await apiService.getQuizzes();
      setQuizzes(data);
    } catch (error) {
      console.error('Failed to load quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizComplete = () => {
    setSelectedQuiz(null);
    loadQuizzes();
  };

  if (selectedQuiz) {
    return <QuizTaker quiz={selectedQuiz} onComplete={handleQuizComplete} onBack={() => setSelectedQuiz(null)} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">No quizzes available yet</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Available Knowledge Tests</h2>
        <p className="text-gray-600 mt-1">Test your knowledge and track your progress</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {quizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition bg-white"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{quiz.title}</h3>
            <p className="text-gray-600 text-sm mb-4">{quiz.description}</p>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                <span>{quiz.questions.length} questions</span>
              </div>
              {quiz.timeLimit && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{quiz.timeLimit} min</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedQuiz(quiz)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              Start Test
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
