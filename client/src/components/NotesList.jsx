import NoteItem from './NoteItem';

export default function NotesList({ notes, onEdit, onDelete }) {
  if (!notes.length) {
    return <p className="no-notes">You have no notes yet.</p>;
  }

  return (
    <div className="notes-list">
      {notes.map(note => (
        <NoteItem
          key={note._id}
          note={note}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
