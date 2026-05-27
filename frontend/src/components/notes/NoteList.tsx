import { Note } from "../../types/note";
import NoteCard from "./NoteCard";
import "../../styles/components/notes/NoteList.css";

interface NoteListProps {
  notes: Note[];
  loading: boolean;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
}

function NoteList({ notes, loading, onEdit, onDelete }: NoteListProps) {
  if (loading) {
    return <p className="note-list__message">Cargando notas...</p>;
  }

  if (notes.length === 0) {
    return (
      <p className="note-list__message">
        Todavía no hay notas registradas para este proyecto.
      </p>
    );
  }

  return (
    <div className="note-list">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default NoteList;