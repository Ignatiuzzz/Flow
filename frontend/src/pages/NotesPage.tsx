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
    <main className="notes-page relative min-h-screen overflow-hidden px-5 pt-5 pb-4 text-slate-900 md:px-6 md:pt-6 md:pb-4">
      <button
        className="notes-page__back mb-4 rounded-2xl bg-white/70 backdrop-blur-md px-4 py-2 text-sm font-bold text-emerald-950 shadow-lg ring-1 ring-emerald-900/10 transition-all hover:bg-white hover:-translate-x-1"
        onClick={() => navigate(`/projects/${currentProjectId}`)}
      >
        ← Volver al proyecto
      </button>

      <section className="notes-page__hero relative mb-4 flex flex-col gap-4 overflow-hidden rounded-3xl border bg-white/70 backdrop-blur-lg p-5 shadow-2xl lg:flex-row lg:items-center lg:justify-between animate-fade-in-up [&_h1]:mb-2 [&_h1]:text-3xl [&_h1]:font-extrabold [&_h1]:tracking-tight [&_h1]:text-slate-950 [&_p]:max-w-3xl [&_p]:text-sm [&_p]:leading-6 [&_p]:text-slate-600">
        <div className="notes-page__hero-content max-w-4xl">
          <span className="notes-page__eyebrow mb-2 inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide">Módulo de observaciones</span>

          <h1>Notas</h1>

          <p>
            Registra comentarios, observaciones y apuntes del auditor. Las notas
            pueden quedar como referencias generales del proyecto o relacionarse
            con un hallazgo específico.
          </p>
        </div>

        <div className="notes-page__summary flex min-w-[160px] flex-col items-center justify-center rounded-2xl px-4 py-4 text-center text-white shadow-xl ring-1 hover:shadow-[0_0_20px_rgba(122,46,73,0.3)] transition-all duration-300 [&_span]:text-center [&_span]:text-sm [&_span]:font-bold [&_span]:uppercase [&_span]:tracking-wide [&_span]:text-white [&_strong]:mt-1 [&_strong]:text-center [&_strong]:text-3xl [&_strong]:font-extrabold [&_strong]:text-white">
          <span>Total notas</span>
          <strong>{notes.length}</strong>
        </div>
      </section>

      <section className="notes-page__stats mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4 [&_article]:rounded-2xl [&_article]:border [&_article]:bg-white/80 [&_article]:backdrop-blur-sm [&_article]:px-5 [&_article]:py-4 [&_article]:shadow-xl [&_article]:animate-fade-in-up [&_article]:hover:-translate-y-1 [&_article]:hover:shadow-2xl [&_article]:transition-all [&_article]:duration-300 [&_strong]:block [&_strong]:text-2xl [&_strong]:font-extrabold [&_strong]:tracking-tight [&_span]:mt-1 [&_span]:block [&_span]:text-sm [&_span]:font-bold [&_span]:text-slate-500">
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

      <section className="notes-page__content grid grid-cols-1 gap-5 xl:grid-cols-[480px_1fr]">
        <aside className="notes-page__form">
          <NoteForm
            projectId={currentProjectId}
            findings={findings}
            selectedNote={selectedNote}
            onSubmit={handleSubmit}
            onCancelEdit={() => setSelectedNote(null)}
          />
        </aside>

        <section className="notes-page__main rounded-3xl border bg-white/80 backdrop-blur-md p-5 shadow-2xl animate-fade-in-up">
          <div className="notes-page__section-header mb-4 flex flex-col gap-1 border-b border-slate-100 pb-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-slate-950 [&_p]:mt-1 [&_p]:text-sm [&_p]:text-slate-500">
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