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

  return (
    <main className="documents-page">
      <button
        className="documents-page__back"
        onClick={() => navigate(`/projects/${currentProjectId}`)}
      >
        Volver al proyecto
      </button>

      <section className="documents-page__header">
        <div>
          <h1>Documentos</h1>
          <p>
            Sube y administra los documentos base del proyecto. Luego estos
            documentos podrán ser visualizados y subrayados.
          </p>
        </div>
      </section>

      <section className="documents-page__content">
        <div className="documents-page__uploader">
          <DocumentUploader onUpload={handleUpload} />
        </div>

        <div className="documents-page__list">
          <DocumentList
            documents={documents}
            loading={loading}
            onDelete={handleDelete}
          />
        </div>
      </section>
    </main>
  );
}

export default DocumentsPage;