
import { useState, useEffect } from 'react';

export default function NoteForm({
  initialData = { title: '', content: '', isShared: false },
  onSubmit,
  onCancel
}) {
  
  const init = {
      title:    initialData.title   || '',
      content:  initialData.content || '',
      isShared: initialData.isShared || false,
    };

  const [form, setForm] = useState(init);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // whenever the parent hands you new initialData, reset local state
  useEffect(() => {
    setForm(init);
  }, [init.title, init.content, init.isShared]);

  const handleChange = e => {
    const { name, type, value, checked } = e.target;
    setForm(f => ({
      ...f,
      // for checkboxes use `checked`, else `value`
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
       
        await onSubmit({ ...form });
        // reset back to blank for next new note
        setForm({ title: '', content: '', isShared: false });
      } catch (err) {
        setError(err.response?.data?.message || 'Error saving note');
      } finally {
        setSubmitting(false);
      }
    };

  return (
    <form className="note-form" onSubmit={handleSubmit}>
      <input
        name="title"
        placeholder="Title"
        value={form.title}
        onChange={handleChange}
        required maxLength="200"
      />
      <textarea
        name="content"
        placeholder="Content"
        value={form.content}
        onChange={handleChange}
        required
      />

<label className="share-toggle">
     <input
         type="checkbox"
         name="isShared"
         checked={form.isShared}
         onChange={e => setForm({ ...form, isShared: e.target.checked })}
       />
       Share this note for collaboration
     </label>
      <div className="note-form-buttons">
        <button type="submit" disabled={submitting}>
          {submitting
            ? initialData._id
              ? 'Updating…'
              : 'Creating…'
            : initialData._id
            ? 'Update Note'
            : 'Add Note'}
        </button>
        {initialData._id && (
          <button type="button" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
        )}
      </div>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
