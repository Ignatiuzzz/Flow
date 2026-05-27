import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { documentApi } from "../api/documentApi";
import DocumentViewer from "../components/documents/DocumentViewer";
import { AuditDocument } from "../types/document";
import "../styles/pages/DocumentViewerPage.css";

function DocumentViewerPage() {
    const { projectId, documentId } = useParams();
    const navigate = useNavigate();

    const [documentData, setDocumentData] = useState<AuditDocument | null>(null);
    const [loading, setLoading] = useState(false);

    const currentProjectId = projectId || "";
    const currentDocumentId = documentId || "";

    const loadDocument = async () => {
        if (!currentDocumentId) return;

        try {
            setLoading(true);
            const data = await documentApi.getById(currentDocumentId);
            setDocumentData(data);
        } catch (error) {
            console.error(error);
            alert("No se pudo cargar la información del documento.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDocument();
    }, [currentDocumentId]);

    const fileUrl = currentDocumentId
        ? documentApi.fileUrl(currentDocumentId)
        : "";

    return (
        <main className="document-viewer-page">
            <button
                className="document-viewer-page__back"
                onClick={() => navigate(`/projects/${currentProjectId}/documents`)}
            >
                Volver a documentos
            </button>

            {loading && (
                <p className="document-viewer-page__message">
                    Cargando documento...
                </p>
            )}

            {!loading && !documentData && (
                <p className="document-viewer-page__message">
                    No se encontró el documento.
                </p>
            )}

            {!loading && documentData && (
                <DocumentViewer
                    fileUrl={fileUrl}
                    documentName={documentData.nombreOriginal}
                    onRegisterFinding={(text) => {
                        console.log("Registrar hallazgo:", text);
                        alert("Luego conectaremos esta opción con Registrar Hallazgo.");
                    }}
                    onRelateEvidence={(text) => {
                        console.log("Relacionar evidencia:", text);
                        alert("Luego conectaremos esta opción con Relacionar Evidencia.");
                    }}
                    onCreateNote={(text) => {
                        console.log("Crear nota:", text);
                        alert("Luego conectaremos esta opción con Nota.");
                    }}
                />
            )}
        </main>
    );
}

export default DocumentViewerPage;