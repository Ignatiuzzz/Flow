import toast from "react-hot-toast";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
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

  const [reindexResult, setReindexResult] = useState<{ enCola: number; yaIndexados: number } | null>(null);

  const reindexMutation = useMutation({
    mutationFn: () => documentApi.reindexProject(currentProjectId),
    onSuccess: (data) => {
      setReindexResult({ enCola: data.enCola, yaIndexados: data.yaIndexados });
      if (data.enCola > 0) {
        toast.success(`Re-indexado iniciado: ${data.enCola} documento(s) en cola.`);
      } else {
        toast(`Todos los documentos ya estaban indexados (${data.yaIndexados}).`, { icon: "✅" });
      }
    },
    onError: () => {
      toast.error("No se pudo iniciar el re-indexado.");
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
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h2>Repositorio del proyecto</h2>
                <p>
                  Explora, filtra y visualiza los documentos asociados a esta
                  auditoría.
                </p>
              </div>
              <button
                type="button"
                onClick={() => reindexMutation.mutate()}
                disabled={reindexMutation.isPending}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 18px",
                  borderRadius: "12px",
                  border: "1.5px solid #6366f1",
                  background: reindexMutation.isPending ? "#e0e7ff" : "#f5f3ff",
                  color: "#4338ca",
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: reindexMutation.isPending ? "not-allowed" : "pointer",
                  transition: "background 0.2s",
                  whiteSpace: "nowrap",
                }}
                title="Re-indexar documentos para IA"
              >
                <Sparkles size={16} />
                {reindexMutation.isPending ? "Indexando..." : "Re-indexar IA"}
              </button>
            </div>
            {reindexResult && (
              <p style={{ fontSize: "13px", color: "#6366f1", marginTop: "6px" }}>
                Última indexación: {reindexResult.enCola} en cola · {reindexResult.yaIndexados} ya indexados
              </p>
            )}
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