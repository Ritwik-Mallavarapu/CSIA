import { useState, useEffect } from 'react';
import { Quiz, QuizAttempt } from '../../types';
import { apiService } from '../../services/api';
import { Clock, CheckCircle, Play, FileText, TrendingUp, Award, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { QuizTaker } from './QuizTaker';
import { useAuth } from '../../contexts/AuthContext';

export function QuizList() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [quizAttempts, setQuizAttempts] = useState<Record<string, QuizAttempt[]>>({});
  const [expandedQuiz, setExpandedQuiz] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      const data = await apiService.getQuizzes();
      setQuizzes(data);

      if (user) {
        const attemptsMap: Record<string, QuizAttempt[]> = {};
        for (const quiz of data) {
          const attempts = await apiService.getQuizAttemptsForUser(quiz.id, user.id);
          attemptsMap[quiz.id] = attempts;
        }
        setQuizAttempts(attemptsMap);
      }
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

  const getAttemptStats = (attempts: QuizAttempt[]) => {
    if (attempts.length === 0) return null;

    const bestAttempt = attempts.reduce((best, current) =>
      ((current.score / current.totalPoints) * 100) > ((best.score / best.totalPoints) * 100) ? current : best
    );

    const avgScore = attempts.reduce((sum, att) => sum + ((att.score / att.totalPoints) * 100), 0) / attempts.length;

    return {
      bestScore: Math.round((bestAttempt.score / bestAttempt.totalPoints) * 100),
      avgScore: Math.round(avgScore),
      totalAttempts: attempts.length,
      lastAttempt: attempts[0],
    };
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Available Knowledge Tests</h2>
        <p className="text-gray-600 mt-1">Test your knowledge and track your progress</p>
      </div>

      <div className="grid gap-4">
        {quizzes.map((quiz) => {
          const attempts = quizAttempts[quiz.id] || [];
          const stats = getAttemptStats(attempts);
          const isExpanded = expandedQuiz === quiz.id;

          return (
            <div
              key={quiz.id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition bg-white"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{quiz.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{quiz.description}</p>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
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
                </div>

                {stats && (
                  <div className="flex items-center gap-4 ml-4">
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-green-600 font-semibold text-lg">
                        <Award className="w-5 h-5" />
                        {stats.bestScore}%
                      </div>
                      <div className="text-xs text-gray-500">Best</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-blue-600 font-semibold text-lg">
                        <TrendingUp className="w-5 h-5" />
                        {stats.avgScore}%
                      </div>
                      <div className="text-xs text-gray-500">Average</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedQuiz(quiz)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  {stats ? (
                    <>
                      <RotateCcw className="w-4 h-4" />
                      {attempts.length === 1 ? 'Take Again' : 'Retake Test'}
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Start Test
                    </>
                  )}
                </button>

                {stats && (
                  <button
                    onClick={() => setExpandedQuiz(isExpanded ? null : quiz.id)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        Hide History
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        View History ({attempts.length})
                      </>
                    )}
                  </button>
                )}
              </div>

              {isExpanded && attempts.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Attempt History
                  </h4>
                  <div className="space-y-2">
                    {attempts.map((attempt, index) => {
                      const percentage = Math.round((attempt.score / attempt.totalPoints) * 100);
                      const isPassing = quiz.passingScore ? percentage >= quiz.passingScore : false;

                      return (
                        <div
                          key={attempt.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-sm font-medium text-gray-500">
                              #{attempts.length - index}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                Score: {attempt.score}/{attempt.totalPoints} ({percentage}%)
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(attempt.completedAt).toLocaleDateString()} at{' '}
                                {new Date(attempt.completedAt).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                          <div>
                            {isPassing ? (
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                Passed
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                                {quiz.passingScore ? `Need ${quiz.passingScore}%` : 'Completed'}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
