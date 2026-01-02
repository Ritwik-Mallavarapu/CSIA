import { useState } from 'react';
import { Manual } from '../../types';
import { apiService } from '../../services/api';
import { Save, X, Plus, Trash2, Upload, FileText } from 'lucide-react';

interface Props {
  manual: Manual | null;
  onSave: () => void;
  onCancel: () => void;
}

export function ManualEditor({ manual, onSave, onCancel }: Props) {
  const [title, setTitle] = useState(manual?.title || '');
  const [category, setCategory] = useState(manual?.category || '');
  const [content, setContent] = useState(manual?.content || '');
  const [pdfUrl, setPdfUrl] = useState(manual?.pdfUrl || '');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [tags, setTags] = useState<string[]>(manual?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Please select a PDF file');
        return;
      }
      setPdfFile(file);
    }
  };

  const handleRemovePDF = () => {
    setPdfFile(null);
    setPdfUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setUploading(true);

    try {
      let uploadedPdfUrl = pdfUrl;

      const manualData = {
        title,
        category,
        content,
        pdfUrl: undefined as string | undefined,
        tags,
      };

      let savedManual;
      if (manual) {
        savedManual = await apiService.updateManual(manual.id, manualData);
      } else {
        savedManual = await apiService.createManual(manualData);
      }

      if (pdfFile && savedManual.id) {
        uploadedPdfUrl = await apiService.uploadPDF(pdfFile, savedManual.id);

        await apiService.updateManual(savedManual.id, {
          pdfUrl: uploadedPdfUrl,
        });
      }

      onSave();
    } catch (error) {
      console.error('Failed to save manual:', error);
      alert('Failed to save manual. Please try again.');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          {manual ? 'Edit Manual' : 'Add New Manual'}
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Manual Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
            required
            placeholder="e.g., Dell Latitude Motherboard Replacement"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
            required
            placeholder="e.g., Laptops, Desktops, Monitors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none resize-none font-mono text-sm"
            required
            placeholder="Enter the manual content with repair instructions, specifications, and troubleshooting steps..."
          />
          <p className="text-xs text-gray-600 mt-1">
            Include detailed step-by-step instructions for repairs
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PDF Manual (optional)
          </label>

          {!pdfFile && !pdfUrl ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="pdf-upload"
              />
              <label
                htmlFor="pdf-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="w-12 h-12 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600 mb-1">
                  Click to upload PDF manual
                </span>
                <span className="text-xs text-gray-500">
                  PDF files only, max 50MB
                </span>
              </label>
            </div>
          ) : (
            <div className="border border-gray-300 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded">
                  <FileText className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {pdfFile ? pdfFile.name : 'Existing PDF'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {pdfFile ? `${(pdfFile.size / 1024 / 1024).toFixed(2)} MB` : 'Currently uploaded'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemovePDF}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          )}

          <p className="text-xs text-gray-600 mt-1">
            Upload a PDF version of the manual that trainees can view
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
              placeholder="Add a tag (e.g., motherboard, screen, battery)"
            />
            <button
              type="button"
              onClick={addTag}
              className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-900 transition"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-700 rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-slate-600 hover:text-slate-900"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
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
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 bg-slate-800 text-white py-3 rounded-lg font-semibold hover:bg-slate-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          {uploading ? 'Uploading PDF...' : saving ? 'Saving...' : manual ? 'Update Manual' : 'Create Manual'}
        </button>
      </div>
    </form>
  );
}
