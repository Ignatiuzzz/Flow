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
    return (
      <div className="note-list__state">
        <div className="note-list__loader" />
        <p>Cargando notas...</p>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="note-list__state">
        <h3>No hay notas todavía</h3>
        <p>
          Registra la primera nota del proyecto para documentar observaciones o
          comentarios relevantes.
        </p>
      </div>
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