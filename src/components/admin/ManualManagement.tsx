import { useState, useEffect } from 'react';
import { Manual } from '../../types';
import { apiService } from '../../services/api';
import { Plus, Edit, Trash2, BookOpen, Search } from 'lucide-react';
import { ManualEditor } from './ManualEditor';

export function ManualManagement() {
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingManual, setEditingManual] = useState<Manual | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadManuals();
  }, []);

  const loadManuals = async () => {
    try {
      const data = await apiService.getManuals();
      setManuals(data);
    } catch (error) {
      console.error('Failed to load manuals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this manual? This action cannot be undone.')) {
      return;
    }

    try {
      await apiService.deleteManual(id);
      await loadManuals();
    } catch (error) {
      console.error('Failed to delete manual:', error);
    }
  };

  const handleSave = async () => {
    setEditingManual(null);
    setIsCreating(false);
    await loadManuals();
  };

  const categories = ['all', ...Array.from(new Set(manuals.map((m) => m.category)))];

  const filteredManuals = manuals.filter((manual) => {
    const matchesSearch =
      manual.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      manual.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      manual.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      manual.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || manual.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (isCreating || editingManual) {
    return (
      <ManualEditor
        manual={editingManual}
        onSave={handleSave}
        onCancel={() => {
          setEditingManual(null);
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
          <h2 className="text-xl font-bold text-gray-900">Manual Management</h2>
          <p className="text-gray-600 mt-1">Manage Dell repair manuals and documentation</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 bg-slate-800 text-white px-6 py-2 rounded-lg font-semibold hover:bg-slate-900 transition"
        >
          <Plus className="w-5 h-5" />
          Add Manual
        </button>
      </div>

      {manuals.length > 0 && (
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search manuals by title, content, category, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
      )}

      {manuals.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-4">No manuals added yet</p>
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center gap-2 bg-slate-800 text-white px-6 py-2 rounded-lg font-semibold hover:bg-slate-900 transition"
          >
            <Plus className="w-5 h-5" />
            Add Your First Manual
          </button>
        </div>
      ) : filteredManuals.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-2">No manuals found</p>
          <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredManuals.map((manual) => (
            <div
              key={manual.id}
              className="border border-gray-200 rounded-lg p-6 bg-white hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{manual.title}</h3>
                      <p className="text-sm text-gray-600">{manual.category}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {manual.content.substring(0, 200)}...
                  </p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {manual.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    Updated {new Date(manual.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingManual(manual)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Edit manual"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(manual.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete manual"
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
