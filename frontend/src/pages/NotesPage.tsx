import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { findingApi } from "../api/findingApi";
import { noteApi } from "../api/noteApi";
import NoteForm from "../components/notes/NoteForm";
import NoteList from "../components/notes/NoteList";
import { Finding } from "../types/finding";
import { Note, NoteCreate } from "../types/note";
import "../styles/pages/NotesPage.css";

function NotesPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [notes, setNotes] = useState<Note[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(false);

  const currentProjectId = projectId || "";

  const loadNotes = async () => {
    if (!currentProjectId) return;

    const data = await noteApi.getByProject(currentProjectId);
    setNotes(data);
  };

  const loadFindings = async () => {
    if (!currentProjectId) return;

    const data = await findingApi.getByProject(currentProjectId);
    setFindings(data);
  };

  const loadPageData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadNotes(), loadFindings()]);
    } catch (error) {
      console.error(error);
      alert("No se pudieron cargar las notas o hallazgos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, [currentProjectId]);

  const handleSubmit = async (data: NoteCreate) => {
    try {
      if (selectedNote) {
        await noteApi.update(selectedNote.id, data);
        setSelectedNote(null);
      } else {
        await noteApi.create(data);
      }

      await loadPageData();
    } catch (error) {
      console.error(error);
      alert("No se pudo guardar la nota.");
    }
  };

  const handleDelete = async (noteId: string) => {
    const confirmed = window.confirm("¿Estás seguro de eliminar esta nota?");

    if (!confirmed) return;

    try {
      await noteApi.delete(noteId);
      await loadPageData();
    } catch (error) {
      console.error(error);
      alert("No se pudo eliminar la nota.");
    }
  };

  return (
    <main className="notes-page">
      <button
        className="notes-page__back"
        onClick={() => navigate(`/projects/${currentProjectId}`)}
      >
        Volver al proyecto
      </button>

      <section className="notes-page__header">
        <div>
          <h1>Notas</h1>
          <p>
            Registra notas generales del proyecto o relaciónalas con un hallazgo
            específico.
          </p>
        </div>
      </section>

      <section className="notes-page__content">
        <div className="notes-page__form">
          <NoteForm
            projectId={currentProjectId}
            findings={findings}
            selectedNote={selectedNote}
            onSubmit={handleSubmit}
            onCancelEdit={() => setSelectedNote(null)}
          />
        </div>

        <div className="notes-page__list">
          <NoteList
            notes={notes}
            loading={loading}
            onEdit={setSelectedNote}
            onDelete={handleDelete}
          />
        </div>
      </section>
    </main>
  );
}

export default NotesPage;