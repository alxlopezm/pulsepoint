import { useState } from 'react';
import { Send } from 'lucide-react';

interface UpdateFormProps {
  onSubmit: (content: string) => Promise<void>;
}

export default function UpdateForm({ onSubmit }: UpdateFormProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Update content is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit(content.trim());
      setContent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post update');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          if (error) setError('');
        }}
        placeholder="Add a progress update..."
        rows={3}
        className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-secondary dark:text-white placeholder-secondary-light focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm resize-none"
      />
      {error && <p className="text-xs text-primary">{error}</p>}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {isSubmitting ? 'Posting...' : 'Post Update'}
        </button>
      </div>
    </form>
  );
}
