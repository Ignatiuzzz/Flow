import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { documentApi } from "../api/documentApi";
import DocumentList from "../components/documents/DocumentList";
import DocumentUploader from "../components/documents/DocumentUploader";
import { AuditDocument } from "../types/document";
import "../styles/pages/DocumentsPage.css";

function DocumentsPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const currentProjectId = projectId || "";

  const { data: documents = [] as AuditDocument[], isLoading: loading } = useQuery({
    queryKey: ["documents", currentProjectId],
    queryFn: () => documentApi.getByProject(currentProjectId),
    enabled: !!currentProjectId,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => documentApi.upload(currentProjectId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", currentProjectId] });
    },
    onError: (error) => {
      console.error(error);
      toast.error("No se pudo subir el documento.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (documentId: string) => documentApi.delete(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", currentProjectId] });
    },
    onError: (error) => {
      console.error(error);
      toast.error("No se pudo eliminar el documento.");
    },
  });

  const handleUpload = async (file: File) => {
    await uploadMutation.mutateAsync(file);
  };

  const handleOpen = (documentId: string) => {
    navigate(`/projects/${currentProjectId}/documents/${documentId}/viewer`);
  };

  const handleDelete = (documentId: string) => {
    const confirmed = window.confirm(
      "¿Estás seguro de eliminar este documento?"
    );
    if (!confirmed) return;
    deleteMutation.mutate(documentId);
  };

  const pdfCount = documents.filter((document: AuditDocument) => document.tipoArchivo === "pdf").length;
  const docxCount = documents.filter((document: AuditDocument) => document.tipoArchivo === "docx").length;

  return (
    <main className="documents-page relative min-h-screen overflow-hidden px-5 pt-5 pb-4 text-slate-900 md:px-6 md:pt-6 md:pb-4">
      <button
        className="documents-page__back mb-4 rounded-2xl bg-white/70 backdrop-blur-md px-4 py-2 text-sm font-bold text-emerald-950 shadow-lg ring-1 ring-emerald-900/10 transition-all hover:bg-white hover:-translate-x-1"
        onClick={() => navigate(`/projects/${currentProjectId}`)}
      >
        ← Volver al proyecto
      </button>

      <section className="documents-page__hero relative mb-4 flex flex-col gap-4 overflow-hidden rounded-3xl border bg-white/70 backdrop-blur-lg p-5 shadow-2xl lg:flex-row lg:items-center lg:justify-between animate-fade-in-up [&_h1]:mb-2 [&_h1]:text-3xl [&_h1]:font-extrabold [&_h1]:tracking-tight [&_h1]:text-slate-950 [&_p]:max-w-3xl [&_p]:text-sm [&_p]:leading-6 [&_p]:text-slate-600">
        <div className="documents-page__hero-content max-w-4xl">
          <span className="documents-page__eyebrow mb-2 inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide">Módulo documental</span>

          <h1>Documentos</h1>

          <p>
            Sube y administra los documentos base del proyecto. Estos archivos
            servirán como respaldo para revisar, analizar y posteriormente
            generar subrayados relacionados con hallazgos, evidencias o notas.
          </p>
        </div>

        <div className="documents-page__summary flex min-w-[160px] flex-col items-center justify-center rounded-2xl px-4 py-4 text-center text-white shadow-xl ring-1 hover:shadow-[0_0_20px_rgba(15,89,99,0.3)] transition-all duration-300 [&_span]:text-center [&_span]:text-sm [&_span]:font-bold [&_span]:uppercase [&_span]:tracking-wide [&_span]:text-white [&_strong]:mt-1 [&_strong]:text-center [&_strong]:text-3xl [&_strong]:font-extrabold [&_strong]:text-white">
          <span>Total documentos</span>
          <strong>{documents.length}</strong>
        </div>
      </section>

      <section className="documents-page__stats mb-4 grid grid-cols-1 gap-3 md:grid-cols-3 [&_article]:rounded-2xl [&_article]:border [&_article]:bg-white/80 [&_article]:backdrop-blur-sm [&_article]:px-5 [&_article]:py-4 [&_article]:shadow-xl [&_article]:animate-fade-in-up [&_article]:hover:-translate-y-1 [&_article]:hover:shadow-2xl [&_article]:transition-all [&_article]:duration-300 [&_strong]:block [&_strong]:text-2xl [&_strong]:font-extrabold [&_strong]:tracking-tight [&_span]:mt-1 [&_span]:block [&_span]:text-sm [&_span]:font-bold [&_span]:text-slate-500">
        <article>
          <strong>{documents.length}</strong>
          <span>Archivos subidos</span>
        </article>

        <article>
          <strong>{pdfCount}</strong>
          <span>PDF</span>
        </article>

        <article>
          <strong>{docxCount}</strong>
          <span>Word</span>
        </article>
      </section>

      <section className="documents-page__content grid grid-cols-1 gap-5 xl:grid-cols-[420px_1fr]">
        <aside className="documents-page__uploader">
          <DocumentUploader onUpload={handleUpload} />
        </aside>

        <section className="documents-page__main rounded-3xl border bg-white/80 backdrop-blur-md p-5 shadow-2xl animate-fade-in-up">
          <div className="documents-page__section-header mb-4 flex flex-col gap-1 border-b border-slate-100 pb-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-slate-950 [&_p]:mt-1 [&_p]:text-sm [&_p]:text-slate-500">
            <div>
              <h2>Documentos registrados</h2>
              <p>
                Revisa los documentos cargados, abre el archivo original o
                elimínalo si ya no corresponde al proyecto.
              </p>
            </div>
          </div>

          <DocumentList
            documents={documents}
            loading={loading}
            onOpen={handleOpen}
            onDelete={handleDelete}
          />
        </section>
      </section>
    </main>
  );
}

export default DocumentsPage;