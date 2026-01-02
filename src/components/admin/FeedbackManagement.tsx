import { useState, useEffect } from 'react';
import { Feedback } from '../../types';
import { apiService } from '../../services/api';
import { MessageSquare, CheckCircle, Clock, AlertCircle, Send } from 'lucide-react';

export function FeedbackManagement() {
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    try {
      const data = await apiService.getFeedback();
      setFeedbackList(data);
    } catch (error) {
      console.error('Failed to load feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (feedbackId: number) => {
    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      await apiService.addAdminComment(feedbackId, comment);
      setComment('');
      await loadFeedback();
      const updated = feedbackList.find((f) => f.id === feedbackId);
      if (updated) {
        const refreshed = await apiService.getFeedback();
        const updatedFeedback = refreshed.find((f) => f.id === feedbackId);
        if (updatedFeedback) {
          setSelectedFeedback(updatedFeedback);
        }
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (feedbackId: number, status: 'pending' | 'reviewed' | 'resolved') => {
    try {
      await apiService.updateFeedbackStatus(feedbackId, status);
      await loadFeedback();
      const updated = feedbackList.find((f) => f.id === feedbackId);
      if (updated && selectedFeedback?.id === feedbackId) {
        setSelectedFeedback({ ...selectedFeedback, status });
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-amber-500" />;
      case 'reviewed':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <MessageSquare className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800"></div>
      </div>
    );
  }

  if (selectedFeedback) {
    return (
      <div>
        <button
          onClick={() => setSelectedFeedback(null)}
          className="mb-6 text-slate-800 hover:text-slate-900 font-medium"
        >
          ← Back to All Feedback
        </button>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedFeedback.subject}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>From: {selectedFeedback.userName}</span>
                <span>•</span>
                <span>{new Date(selectedFeedback.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedFeedback.status}
                onChange={(e) => handleUpdateStatus(selectedFeedback.id, e.target.value as 'pending' | 'reviewed' | 'resolved')}
                className={`px-4 py-2 rounded-lg font-medium text-sm ${getStatusColor(selectedFeedback.status)}`}
              >
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-gray-900 whitespace-pre-wrap">{selectedFeedback.message}</p>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Administrator Comments</h3>

            {selectedFeedback.adminComments.length > 0 && (
              <div className="space-y-3 mb-6">
                {selectedFeedback.adminComments.map((adminComment) => (
                  <div key={adminComment.id} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-900">{adminComment.adminName}</span>
                      <span className="text-xs text-slate-600">
                        {new Date(adminComment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{adminComment.comment}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Add Response</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none resize-none"
                placeholder="Type your response to the trainee..."
              />
              <button
                onClick={() => handleAddComment(selectedFeedback.id)}
                disabled={submitting || !comment.trim()}
                className="flex items-center gap-2 bg-slate-800 text-white px-6 py-2 rounded-lg font-semibold hover:bg-slate-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Sending...' : 'Send Response'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Trainee Feedback</h2>
        <p className="text-gray-600 mt-1">Review and respond to feedback from trainees</p>
      </div>

      {feedbackList.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No feedback received yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedbackList.map((feedback) => (
            <div
              key={feedback.id}
              className="border border-gray-200 rounded-lg p-6 bg-white hover:shadow-md transition cursor-pointer"
              onClick={() => setSelectedFeedback(feedback)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{feedback.subject}</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span>From: {feedback.userName}</span>
                    <span>•</span>
                    <span>{new Date(feedback.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(feedback.status)}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(feedback.status)}`}>
                    {feedback.status.charAt(0).toUpperCase() + feedback.status.slice(1)}
                  </span>
                </div>
              </div>

              <p className="text-gray-700 line-clamp-2 mb-3">{feedback.message}</p>

              {feedback.adminComments.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 px-3 py-2 rounded-lg inline-flex">
                  <MessageSquare className="w-4 h-4" />
                  <span>{feedback.adminComments.length} admin response(s)</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
