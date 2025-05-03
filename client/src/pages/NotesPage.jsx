import { useContext, useEffect, useState, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import NoteForm  from '../components/NoteForm';
import NotesList from '../components/NotesList';


import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
} from '../services/noteService';


export default function NotesPage() {
  const { logout } = useContext(AuthContext);
  const formRef = useRef(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [sort, setSort]     = useState('newest');
  const searchRef = useRef();


// Fetch notes, optionally with search term
const fetchAll = async (term, sortBy) => {
  setLoading(true);
  setError('');
  try {
    const { data } = await getNotes(term, sortBy);
    setNotes(data);
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to load notes');
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchAll(search, sort);
  }, []);

  // Debounce search input
  useEffect(() => {
    // clear any pending
    clearTimeout(searchRef.current);
    // schedule fetch in 300ms
    searchRef.current = setTimeout(() => {
      fetchAll(search, sort);
    }, 300);
    return () => clearTimeout(searchRef.current);
  }, [search, sort]);


  const handleCreate = async note => {
    const { data } = await createNote(note);
    setNotes(prev => [data, ...prev]);
  };

  const handleUpdate = async note => {
    const { data } = await updateNote(editing._id, note);
    setNotes(prev =>
      prev.map(n => (n._id === data._id ? data : n))
    );
    setEditing(null);
  };

  const handleDelete = async id => {
    try {
      await deleteNote(id);
      setNotes(prev => prev.filter(n => n._id !== id));
      alert("🗑️ Note deleted successfully.");
    } catch (err) {
      const msg = err.response?.data?.message;
      
      if (msg?.includes("not the owner")) {
        alert("⚠️ You are not the owner of this note and cannot delete it.");
      } else if (msg?.includes("not found") || err.response?.status === 404) {
        alert("⚠️ You are not the owner of this note and cannot delete it.");
      } else {
        alert("⚠️ You are not the owner of this note and cannot delete it.");
      }
    }
  };
  

  return (
    <div className="notes-page">
      <header className="notes-header">
        <h1>CollabNote</h1>
        <button onClick={logout}>Log Out</button>
      </header>
      

      {error && <p className="error">{error}</p>}

      <p className="instruction">
  <span className="instruction-highlight">Collaborate in real time:</span> 
  When you save a note with “Share this note” checked, click its title 
  to open the live editor and share that URL with your collaborators.
</p>
<div ref={formRef}>
      <NoteForm
        initialData={editing || undefined}
        onSubmit={editing ? handleUpdate : handleCreate}
        onCancel={() => setEditing(null)}
      />
      </div>
      <input
       type="text"
       className="notes-search"
       placeholder="Search notes..."
       value={search}
       onChange={e => setSearch(e.target.value)}
     /> 


     {/* Sort dropdown */}
      <select
        className="notes-sort"
        value={sort}
        onChange={e => setSort(e.target.value)}
      >
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
        <option value="ownership">My notes first</option>
      </select>

      {loading ? (
        <p>Loading notes…</p>
      ) : (
        <NotesList
          notes={notes}
          onEdit={(note) => {
            setEditing(note);
            setTimeout(() => {
              formRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
          }}
          
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
