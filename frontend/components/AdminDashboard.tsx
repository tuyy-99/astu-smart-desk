import React, { useState } from "react";
import { Document } from "../types";

interface AdminDashboardProps {
  docs: Document[];
  isLoading: boolean;
  error: string | null;
  onAdd: (payload: { title: string; content: string; category: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ docs, onAdd, onDelete, isLoading, error }) => {
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [category, setCategory] = useState("registrar");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;

    setIsSubmitting(true);
    try {
      await onAdd({ title: newTitle, content: newContent, category });
      setNewTitle("");
      setNewContent("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Knowledge Base Management</h1>
        <p className="text-slate-600 dark:text-slate-400">Manage documents used by the backend RAG assistant.</p>
      </header>

      {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 font-semibold">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-6">
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4"
          >
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Add Document</h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white font-medium"
                placeholder="e.g., Graduation Checklist"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white font-medium"
              >
                <option value="registrar">registrar</option>
                <option value="academic">academic</option>
                <option value="department">department</option>
                <option value="fees">fees</option>
                <option value="deadline">deadline</option>
                <option value="lab">lab</option>
                <option value="internship">internship</option>
                <option value="service">service</option>
                <option value="policy">policy</option>
                <option value="other">other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Content</label>
              <textarea
                rows={6}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white font-medium resize-none"
                placeholder="Paste the content here..."
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 dark:shadow-none disabled:opacity-50"
            >
              {isSubmitting ? "Uploading..." : "Upload & Index"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Indexed Documents</h2>
          {isLoading ? (
            <div className="text-slate-500 font-semibold">Loading documents...</div>
          ) : (
            <div className="space-y-3">
              {docs.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex justify-between items-center group transition-all hover:shadow-md"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-indigo-50 dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 rounded-xl">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{doc.title}</h3>
                      <div className="flex space-x-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                          {doc.category}
                        </span>
                        <span>Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onDelete(doc.id)}
                    className="p-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Document"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
