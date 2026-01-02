import { useState } from 'react';
import { Quiz, Question } from '../../types';
import { apiService } from '../../services/api';
import { Plus, Trash2, Save, X } from 'lucide-react';

interface Props {
  quiz: Quiz | null;
  onSave: () => void;
  onCancel: () => void;
}

export function QuizEditor({ quiz, onSave, onCancel }: Props) {
  const [title, setTitle] = useState(quiz?.title || '');
  const [description, setDescription] = useState(quiz?.description || '');
  const [timeLimit, setTimeLimit] = useState(quiz?.timeLimit?.toString() || '');
  const [questions, setQuestions] = useState<Omit<Question, 'id' | 'quizId'>[]>(
    quiz?.questions.map((q) => ({
      questionText: q.questionText,
      options: q.options,
      correctOptionId: q.correctOptionId,
      points: q.points,
    })) || []
  );
  const [saving, setSaving] = useState(false);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: '',
        options: [
          { id: Date.now() + 1, questionId: 0, optionText: '' },
          { id: Date.now() + 2, questionId: 0, optionText: '' },
        ],
        correctOptionId: 0,
        points: 1,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: string, value: string | number) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const addOption = (questionIndex: number) => {
    const updated = [...questions];
    updated[questionIndex].options.push({
      id: Date.now(),
      questionId: 0,
      optionText: '',
    });
    setQuestions(updated);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...questions];
    updated[questionIndex].options = updated[questionIndex].options.filter(
      (_, i) => i !== optionIndex
    );
    setQuestions(updated);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex].optionText = value;
    setQuestions(updated);
  };

  const setCorrectOption = (questionIndex: number, optionId: number) => {
    const updated = [...questions];
    updated[questionIndex].correctOptionId = optionId;
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const quizData = {
        title,
        description,
        timeLimit: timeLimit ? parseInt(timeLimit) : undefined,
        questions: questions as Question[],
      };

      if (quiz) {
        await apiService.updateQuiz(quiz.id, quizData);
      } else {
        await apiService.createQuiz(quizData);
      }

      onSave();
    } catch (error) {
      console.error('Failed to save quiz:', error);
      alert('Failed to save quiz. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          {quiz ? 'Edit Quiz' : 'Create New Quiz'}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-600 hover:text-gray-900 p-2"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Quiz Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
            required
            placeholder="Enter quiz title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none resize-none"
            required
            placeholder="Brief description of the quiz"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Limit (minutes, optional)
          </label>
          <input
            type="number"
            value={timeLimit}
            onChange={(e) => setTimeLimit(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
            min="1"
            placeholder="Leave blank for no time limit"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Questions</h3>
          <button
            type="button"
            onClick={addQuestion}
            className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-900 transition"
          >
            <Plus className="w-4 h-4" />
            Add Question
          </button>
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600 mb-4">No questions added yet</p>
            <button
              type="button"
              onClick={addQuestion}
              className="inline-flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-900 transition"
            >
              <Plus className="w-4 h-4" />
              Add Your First Question
            </button>
          </div>
        ) : (
          questions.map((question, qIndex) => (
            <div key={qIndex} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <h4 className="text-md font-semibold text-gray-900">Question {qIndex + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeQuestion(qIndex)}
                  className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Text
                  </label>
                  <textarea
                    value={question.questionText}
                    onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none resize-none"
                    required
                    placeholder="Enter the question"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Points</label>
                  <input
                    type="number"
                    value={question.points}
                    onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value))}
                    className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Options</label>
                    <button
                      type="button"
                      onClick={() => addOption(qIndex)}
                      className="text-sm text-slate-800 hover:text-slate-900 font-medium"
                    >
                      + Add Option
                    </button>
                  </div>

                  <div className="space-y-2">
                    {question.options.map((option, oIndex) => (
                      <div key={option.id} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${qIndex}`}
                          checked={question.correctOptionId === option.id}
                          onChange={() => setCorrectOption(qIndex, option.id)}
                          className="w-4 h-4 text-green-600 focus:ring-green-500"
                          title="Mark as correct answer"
                        />
                        <input
                          type="text"
                          value={option.optionText}
                          onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
                          required
                          placeholder={`Option ${oIndex + 1}`}
                        />
                        {question.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(qIndex, oIndex)}
                            className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Select the radio button to mark the correct answer
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || questions.length === 0}
          className="flex-1 flex items-center justify-center gap-2 bg-slate-800 text-white py-3 rounded-lg font-semibold hover:bg-slate-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : quiz ? 'Update Quiz' : 'Create Quiz'}
        </button>
      </div>
    </form>
  );
}
