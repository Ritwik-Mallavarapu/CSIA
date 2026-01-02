import { useState, useEffect } from 'react';
import { Manual } from '../../types';
import { apiService } from '../../services/api';
import { BookOpen, Search, FileText, Tag } from 'lucide-react';

export function ManualViewer() {
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedManual, setSelectedManual] = useState<Manual | null>(null);
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

  const categories = ['all', ...Array.from(new Set(manuals.map((m) => m.category)))];

  const filteredManuals = manuals.filter((manual) => {
    const matchesSearch =
      manual.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      manual.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      manual.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || manual.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (selectedManual) {
    return (
      <div>
        <button
          onClick={() => setSelectedManual(null)}
          className="mb-6 text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Back to Manuals
        </button>

        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Tag className="w-4 h-4" />
              <span>{selectedManual.category}</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{selectedManual.title}</h2>
            <div className="flex flex-wrap gap-2">
              {selectedManual.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {selectedManual.pdfUrl ? (
            <div className="mt-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">PDF Manual</h3>
                <a
                  href={selectedManual.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  <FileText className="w-5 h-5" />
                  Open in New Tab
                </a>
              </div>
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <iframe
                  src={selectedManual.pdfUrl}
                  className="w-full h-[800px]"
                  title={selectedManual.title}
                />
              </div>
            </div>
          ) : (
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {selectedManual.content}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Dell Repair Manuals</h2>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search manuals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredManuals.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No manuals found</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredManuals.map((manual) => (
            <button
              key={manual.id}
              onClick={() => setSelectedManual(manual)}
              className="text-left border border-gray-200 rounded-lg p-6 hover:shadow-md transition bg-white"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1 truncate">{manual.title}</h3>
                  <p className="text-sm text-gray-600">{manual.category}</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {manual.content.substring(0, 120)}...
              </p>

              <div className="flex flex-wrap gap-2">
                {manual.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
                {manual.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    +{manual.tags.length - 3} more
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
