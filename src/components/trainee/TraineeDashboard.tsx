import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, FileText, BookOpen, MessageSquare } from 'lucide-react';
import { QuizList } from './QuizList';
import { ManualViewer } from './ManualViewer';
import { FeedbackForm } from './FeedbackForm';

type Tab = 'quizzes' | 'manuals' | 'feedback';

export function TraineeDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('quizzes');

  const tabs = [
    { id: 'quizzes' as Tab, label: 'Knowledge Tests', icon: FileText },
    { id: 'manuals' as Tab, label: 'Dell Manuals', icon: BookOpen },
    { id: 'feedback' as Tab, label: 'Feedback', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dad&Dude Training</h1>
              <p className="text-sm text-gray-600 mt-1">Welcome, {user?.fullName}</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 font-medium transition border-b-2 ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600 bg-blue-50'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'quizzes' && <QuizList />}
            {activeTab === 'manuals' && <ManualViewer />}
            {activeTab === 'feedback' && <FeedbackForm />}
          </div>
        </div>
      </div>
    </div>
  );
}
