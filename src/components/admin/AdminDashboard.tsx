import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, FileText, BookOpen, MessageSquare } from 'lucide-react';
import { QuizManagement } from './QuizManagement';
import { ManualManagement } from './ManualManagement';
import { FeedbackManagement } from './FeedbackManagement';

type Tab = 'quizzes' | 'manuals' | 'feedback';

export function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('quizzes');

  const tabs = [
    { id: 'quizzes' as Tab, label: 'Quiz Management', icon: FileText },
    { id: 'manuals' as Tab, label: 'Manual Management', icon: BookOpen },
    { id: 'feedback' as Tab, label: 'Feedback Review', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-slate-800 to-slate-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Dad&Dude Admin Panel</h1>
              <p className="text-slate-300 mt-1">Administrator: {user?.fullName}</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-white hover:bg-slate-700 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50">
            <nav className="flex">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 font-medium transition border-b-2 ${
                      activeTab === tab.id
                        ? 'border-slate-800 text-slate-900 bg-white'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
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
            {activeTab === 'quizzes' && <QuizManagement />}
            {activeTab === 'manuals' && <ManualManagement />}
            {activeTab === 'feedback' && <FeedbackManagement />}
          </div>
        </div>
      </div>
    </div>
  );
}
