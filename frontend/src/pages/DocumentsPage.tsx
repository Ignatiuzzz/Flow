import toast from "react-hot-toast";
import { useMemo } from "react";
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

  const pdfStats = useMemo(() => {
    return documents.filter((doc: AuditDocument) => doc.tipoArchivo === "pdf").length;
  }, [documents]);

  const docxStats = useMemo(() => {
    return documents.filter((doc: AuditDocument) => doc.tipoArchivo === "docx").length;
  }, [documents]);

  return (
    <main className="documents-page">
      <button
        className="documents-page__back"
        onClick={() => navigate(`/projects/${currentProjectId}`)}
      >
        ← Volver al proyecto
      </button>

      <section className="documents-page__hero">
        <div className="documents-page__hero-content">
          <span className="documents-page__eyebrow">Gestión documental</span>

          <h1>Documentos de respaldo</h1>

          <p>
            Sube y administra los archivos que respaldan la auditoría. Los
            documentos procesados serán analizados automáticamente para generar
            hallazgos sugeridos.
          </p>
        </div>

        <div className="documents-page__summary">
          <span>Total documentos</span>
          <strong>{documents.length}</strong>
        </div>
      </section>

      <section className="documents-page__stats">
        <article>
          <strong>{documents.length}</strong>
          <span>Total de archivos</span>
        </article>

        <article>
          <strong>{pdfStats}</strong>
          <span>Documentos PDF</span>
        </article>

        <article>
          <strong>{docxStats}</strong>
          <span>Documentos DOCX</span>
        </article>
      </section>

      <section className="documents-page__content">
        <aside className="documents-page__uploader">
          <DocumentUploader
            onUpload={handleUpload}
          />
        </aside>

        <section className="documents-page__main">
          <div className="documents-page__section-header">
            <h2>Repositorio del proyecto</h2>
            <p>
              Explora, filtra y visualiza los documentos asociados a esta
              auditoría.
            </p>
          </div>

          <DocumentList
            documents={documents}
            loading={loading}
            onOpen={handleOpen}
            onDelete={(id) => deleteMutation.mutate(id)}
          />
        </section>
      </section>
    </main>
  );
}

export default DocumentsPage;