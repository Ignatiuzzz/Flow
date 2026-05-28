import toast from "react-hot-toast";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

  const queryClient = useQueryClient();

  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const currentProjectId = projectId || "";

  const { data: notes = [] as Note[], isLoading: loadingNotes } = useQuery({
    queryKey: ["notes", currentProjectId],
    queryFn: () => noteApi.getByProject(currentProjectId),
    enabled: !!currentProjectId,
  });

  const { data: findings = [] as Finding[], isLoading: loadingFindings } = useQuery({
    queryKey: ["findings", currentProjectId],
    queryFn: () => findingApi.getByProject(currentProjectId),
    enabled: !!currentProjectId,
  });

  const loading = loadingNotes || loadingFindings;

  const createMutation = useMutation({
    mutationFn: (data: NoteCreate) => noteApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", currentProjectId] });
    },
    onError: (error) => {
      console.error(error);
      toast.error("No se pudo guardar la nota.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: NoteCreate }) =>
      noteApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", currentProjectId] });
      setSelectedNote(null);
    },
    onError: (error) => {
      console.error(error);
      toast.error("No se pudo guardar la nota.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => noteApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", currentProjectId] });
    },
    onError: (error) => {
      console.error(error);
      toast.error("No se pudo eliminar la nota.");
    },
  });

  const handleSubmit = async (data: NoteCreate) => {
    if (selectedNote) {
      await updateMutation.mutateAsync({ id: selectedNote.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleDelete = (noteId: string) => {
    const confirmed = window.confirm("¿Estás seguro de eliminar esta nota?");
    if (!confirmed) return;
    deleteMutation.mutate(noteId);
  };

  const linkedNotes = notes.filter((note: Note) => note.hallazgoId).length;
  const documentNotes = notes.filter((note: Note) => note.documentoId).length;
  const generalNotes = notes.length - linkedNotes;

  return (
    <main className="notes-page">
      <button
        className="notes-page__back"
        onClick={() => navigate(`/projects/${currentProjectId}`)}
      >
        ← Volver al proyecto
      </button>

      <section className="notes-page__hero">
        <div className="notes-page__hero-content">
          <span className="notes-page__eyebrow">Módulo de observaciones</span>

          <h1>Notas</h1>

          <p>
            Registra comentarios, observaciones y apuntes del auditor. Las notas
            pueden quedar como referencias generales del proyecto o relacionarse
            con un hallazgo específico.
          </p>
        </div>

        <div className="notes-page__summary">
          <span>Total notas</span>
          <strong>{notes.length}</strong>
        </div>
      </section>

      <section className="notes-page__stats">
        <article>
          <strong>{notes.length}</strong>
          <span>Notas registradas</span>
        </article>

        <article>
          <strong>{linkedNotes}</strong>
          <span>Relacionadas a hallazgo</span>
        </article>

        <article>
          <strong>{generalNotes}</strong>
          <span>Generales del proyecto</span>
        </article>

        <article>
          <strong>{documentNotes}</strong>
          <span>Desde documento</span>
        </article>
      </section>

      <section className="notes-page__content">
        <aside className="notes-page__form">
          <NoteForm
            projectId={currentProjectId}
            findings={findings}
            selectedNote={selectedNote}
            onSubmit={handleSubmit}
            onCancelEdit={() => setSelectedNote(null)}
          />
        </aside>

        <section className="notes-page__main">
          <div className="notes-page__section-header">
            <div>
              <h2>Notas registradas</h2>
              <p>
                Administra las notas del proyecto y sus relaciones con hallazgos
                cuando corresponda.
              </p>
            </div>
          </div>

          <NoteList
            notes={notes}
            loading={loading}
            onEdit={setSelectedNote}
            onDelete={handleDelete}
          />
        </section>
      </section>
    </main>
  );
}

export default NotesPage;