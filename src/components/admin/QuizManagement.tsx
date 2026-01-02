import { useState, useEffect } from 'react';
import { Quiz } from '../../types';
import { apiService } from '../../services/api';
import { Plus, Edit, Trash2, FileText } from 'lucide-react';
import { QuizEditor } from './QuizEditor';

export function QuizManagement() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [isCreating, setIsCreating] = useState(false);

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

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return;
    }

    try {
      await apiService.deleteQuiz(id);
      await loadQuizzes();
    } catch (error) {
      console.error('Failed to delete quiz:', error);
    }
  };

  const handleSave = async () => {
    setEditingQuiz(null);
    setIsCreating(false);
    await loadQuizzes();
  };

  if (isCreating || editingQuiz) {
    return (
      <QuizEditor
        quiz={editingQuiz}
        onSave={handleSave}
        onCancel={() => {
          setEditingQuiz(null);
          setIsCreating(false);
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Quiz Management</h2>
          <p className="text-gray-600 mt-1">Create, edit, and manage knowledge tests</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 bg-slate-800 text-white px-6 py-2 rounded-lg font-semibold hover:bg-slate-900 transition"
        >
          <Plus className="w-5 h-5" />
          Create Quiz
        </button>
      </div>

      {quizzes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-4">No quizzes created yet</p>
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center gap-2 bg-slate-800 text-white px-6 py-2 rounded-lg font-semibold hover:bg-slate-900 transition"
          >
            <Plus className="w-5 h-5" />
            Create Your First Quiz
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="border border-gray-200 rounded-lg p-6 bg-white hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{quiz.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{quiz.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{quiz.questions.length} questions</span>
                    {quiz.timeLimit && <span>{quiz.timeLimit} min time limit</span>}
                    <span>Updated {new Date(quiz.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingQuiz(quiz)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Edit quiz"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(quiz.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete quiz"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
