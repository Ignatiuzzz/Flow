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
      <div className="note-list__state flex min-h-[260px] flex-col items-center justify-center rounded-3xl border border-dashed bg-white p-8 text-center [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-extrabold [&_h3]:tracking-tight [&_h3]:text-slate-900 [&_p]:max-w-md [&_p]:text-sm [&_p]:leading-6 [&_p]:text-slate-500">
        <div className="note-list__loader mb-4 h-10 w-10 animate-spin rounded-full border-4" />
        <p>Cargando notas...</p>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="note-list__state flex min-h-[260px] flex-col items-center justify-center rounded-3xl border border-dashed bg-white p-8 text-center [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-extrabold [&_h3]:tracking-tight [&_h3]:text-slate-900 [&_p]:max-w-md [&_p]:text-sm [&_p]:leading-6 [&_p]:text-slate-500">
        <h3>No hay notas todavía</h3>
        <p>
          Registra la primera nota del proyecto para documentar observaciones o
          comentarios relevantes.
        </p>
      </div>
    );
  }

  return (
    <div className="note-list flex flex-col gap-4">
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