import { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { TrendingUp, Users, Award, Activity } from 'lucide-react';

interface QuizAnalytic {
  quizTitle: string;
  attempts: number;
  averageScore: number;
}

interface TopTrainee {
  userId: string;
  userName: string;
  attempts: number;
  averageScore: number;
}

interface AnalyticsData {
  totalAttempts: number;
  quizAnalytics: QuizAnalytic[];
  topTrainees: TopTrainee[];
}

export function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await apiService.getQuizAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Failed to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Analytics Dashboard</h2>
        <p className="text-gray-600">Track quiz performance and trainee progress</p>
      </div>

      <div className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Activity className="w-6 h-6" />
          <span className="text-sm font-medium">Total Quiz Attempts</span>
        </div>
        <p className="text-4xl font-bold">{analytics.totalAttempts}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Quiz Performance</h3>
          </div>

          {analytics.quizAnalytics.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No quiz attempts yet</p>
          ) : (
            <div className="space-y-4">
              {analytics.quizAnalytics.map((quiz, index) => (
                <div key={index} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900 flex-1">{quiz.quizTitle}</h4>
                    <span className="text-sm font-semibold text-slate-700">
                      {quiz.averageScore}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${quiz.averageScore}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600">
                      {quiz.attempts} {quiz.attempts === 1 ? 'attempt' : 'attempts'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-semibold text-gray-900">Top Trainees</h3>
          </div>

          {analytics.topTrainees.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No trainee attempts yet</p>
          ) : (
            <div className="space-y-3">
              {analytics.topTrainees.map((trainee, index) => (
                <div
                  key={trainee.userId}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-700 text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{trainee.userName}</p>
                    <p className="text-xs text-gray-600">
                      {trainee.attempts} {trainee.attempts === 1 ? 'quiz' : 'quizzes'} completed
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-700">{trainee.averageScore}%</p>
                    <p className="text-xs text-gray-600">avg score</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Users className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Analytics Insights</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>Quiz performance shows the average score across all attempts for each quiz</li>
              <li>Top trainees are ranked by their average score across all completed quizzes</li>
              <li>Use this data to identify which quizzes may need adjustments or which trainees might need additional support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
