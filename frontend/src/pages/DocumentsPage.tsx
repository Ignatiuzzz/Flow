import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { documentApi } from "../api/documentApi";
import DocumentList from "../components/documents/DocumentList";
import DocumentUploader from "../components/documents/DocumentUploader";
import { AuditDocument } from "../types/document";
import "../styles/pages/DocumentsPage.css";

function DocumentsPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [documents, setDocuments] = useState<AuditDocument[]>([]);
  const [loading, setLoading] = useState(false);

  const currentProjectId = projectId || "";

  const loadDocuments = async () => {
    if (!currentProjectId) return;

    try {
      setLoading(true);
      const data = await documentApi.getByProject(currentProjectId);
      setDocuments(data);
    } catch (error) {
      console.error(error);
      alert("No se pudieron cargar los documentos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [currentProjectId]);

  const handleUpload = async (file: File) => {
    try {
      await documentApi.upload(currentProjectId, file);
      await loadDocuments();
    } catch (error) {
      console.error(error);
      alert("No se pudo subir el documento.");
    }
  };

  const handleOpen = (documentId: string) => {
    navigate(`/projects/${currentProjectId}/documents/${documentId}/viewer`);
  };

  const handleDelete = async (documentId: string) => {
    const confirmed = window.confirm(
      "¿Estás seguro de eliminar este documento?"
    );

    if (!confirmed) return;

    try {
      await documentApi.delete(documentId);
      await loadDocuments();
    } catch (error) {
      console.error(error);
      alert("No se pudo eliminar el documento.");
    }
  };

  const pdfCount = documents.filter((document) => document.tipoArchivo === "pdf").length;
  const docxCount = documents.filter((document) => document.tipoArchivo === "docx").length;

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
          <span className="documents-page__eyebrow">Módulo documental</span>

          <h1>Documentos</h1>

          <p>
            Sube y administra los documentos base del proyecto. Estos archivos
            servirán como respaldo para revisar, analizar y posteriormente
            generar subrayados relacionados con hallazgos, evidencias o notas.
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

      <section className="documents-page__content">
        <aside className="documents-page__uploader">
          <DocumentUploader onUpload={handleUpload} />
        </aside>

        <section className="documents-page__main">
          <div className="documents-page__section-header">
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