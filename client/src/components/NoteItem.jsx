import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import './NoteItem.css';

export default function NoteItem({ note, onEdit, onDelete }) {
  return (
    <div className="note-item">
      <h3>
       <Link to={`/notes/${note._id}`}>{note.title}</Link>
      </h3>
      <p>{note.content}</p>
      
      {note.apiData && (
        <div className="note-geo">
          <p><strong>Created from IP:</strong> {note.apiData.ip}</p>
          <p>
            <strong>Location:</strong> 
            {` ${note.apiData.city || '—'}, ${note.apiData.region || '—'}, ${note.apiData.country_name || '—'}`}
          </p>
        </div>
      )}

      <small>
        Created: {format(new Date(note.createdAt), 'PPpp')}
        <br />
        Updated: {format(new Date(note.updatedAt), 'PPpp')}
      </small>
      <div className="note-item-buttons">
        <button onClick={() => onEdit(note)}>Edit</button>
        <button onClick={() => onDelete(note._id)}>Delete</button>
      </div>
    </div>
  );
}
