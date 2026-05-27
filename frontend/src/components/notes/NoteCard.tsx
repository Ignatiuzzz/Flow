import { Note } from "../../types/note";
import "../../styles/components/notes/NoteCard.css";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
}

function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  return (
    <article className="note-card">
      <div className="note-card__main">
        <div className="note-card__top">
          <span className="note-card__badge">
            {note.hallazgoId ? "Relacionada a hallazgo" : "Nota general"}
          </span>

          {note.documentoId && (
            <span className="note-card__document">Desde documento</span>
          )}
        </div>

        <h3>{note.subtitulo || "Sin subtítulo"}</h3>

        <p>{note.texto}</p>
      </div>

      <div className="note-card__actions">
        <button onClick={() => onEdit(note)}>Editar</button>

        <button className="note-card__delete" onClick={() => onDelete(note.id)}>
          Eliminar
        </button>
      </div>
    </article>
  );
}

export default NoteCard;