import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { documentApi } from "../api/documentApi";
import { evidenceApi } from "../api/evidenceApi";
import { findingApi } from "../api/findingApi";
import { noteApi } from "../api/noteApi";
import DocumentViewer from "../components/documents/DocumentViewer";
import HighlightEvidenceModal from "../components/documents/HighlightEvidenceModal";
import HighlightFindingModal from "../components/documents/HighlightFindingModal";
import HighlightNoteModal from "../components/documents/HighlightNoteModal";
import { AuditDocument } from "../types/document";
import { Evidence } from "../types/evidence";
import { Finding } from "../types/finding";
import "../styles/pages/DocumentViewerPage.css";

type HighlightMode = "finding" | "evidence" | "note" | null;

function DocumentViewerPage() {
    const { projectId, documentId } = useParams();
    const navigate = useNavigate();

    const [documentData, setDocumentData] = useState<AuditDocument | null>(null);
    const [findings, setFindings] = useState<Finding[]>([]);
    const [evidences, setEvidences] = useState<Evidence[]>([]);
    const [selectedText, setSelectedText] = useState("");
    const [mode, setMode] = useState<HighlightMode>(null);
    const [loading, setLoading] = useState(false);

    const currentProjectId = projectId || "";
    const currentDocumentId = documentId || "";

    const loadPageData = async () => {
        if (!currentProjectId || !currentDocumentId) return;

        try {
            setLoading(true);

            const [documentResponse, findingsResponse, evidencesResponse] =
                await Promise.all([
                    documentApi.getById(currentDocumentId),
                    findingApi.getByProject(currentProjectId),
                    evidenceApi.getByProject(currentProjectId),
                ]);

            setDocumentData(documentResponse);
            setFindings(findingsResponse);
            setEvidences(evidencesResponse);
        } catch (error) {
            console.error(error);
            alert("No se pudo cargar la información del visor.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPageData();
    }, [currentProjectId, currentDocumentId]);

    const closeModal = () => {
        setMode(null);
    };

    const clearSelection = () => {
        setSelectedText("");
        setMode(null);
    };

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
                <p className="document-viewer-page__message">Cargando documento...</p>
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
                        setSelectedText(text);
                        setMode("finding");
                    }}
                    onRelateEvidence={(text) => {
                        setSelectedText(text);
                        setMode("evidence");
                    }}
                    onCreateNote={(text) => {
                        setSelectedText(text);
                        setMode("note");
                    }}
                />
            )}

            {mode === "finding" && selectedText && (
                <HighlightFindingModal
                    selectedText={selectedText}
                    onClose={closeModal}
                    onSubmit={async (data) => {
                        const generatedCode = `H-DOC-${Date.now()}`;

                        await findingApi.createFromHighlight({
                            proyectoId: currentProjectId,
                            documentoId: currentDocumentId,
                            textoSubrayado: selectedText,
                            subtitulo: "",
                            observacion: "",
                            nombre: data.nombre,
                            codigo: generatedCode,
                            descripcion: data.descripcion,
                            criterio: "",
                            objetivo: "",
                            causa: "",
                            efecto: "",
                            conclusion: "",
                            impacto: 1,
                            urgencia: 1,
                            justificacionRiesgo: "",
                            recomendaciones: "",
                        });

                        alert("Hallazgo creado desde subrayado.");
                        await loadPageData();
                        clearSelection();
                    }}
                />
            )}

            {mode === "evidence" && selectedText && (
                <HighlightEvidenceModal
                    selectedText={selectedText}
                    evidences={evidences}
                    onClose={closeModal}
                    onSubmit={async (data) => {
                        await evidenceApi.relateFromHighlight({
                            proyectoId: currentProjectId,
                            documentoId: currentDocumentId,
                            evidenciaId: data.evidenciaId,
                            textoSubrayado: selectedText,
                            subtitulo: data.subtitulo,
                            observacion: data.observacion,
                        });

                        alert("Evidencia relacionada al subrayado.");
                        await loadPageData();
                        clearSelection();
                    }}
                />
            )}

            {mode === "note" && selectedText && (
                <HighlightNoteModal
                    selectedText={selectedText}
                    findings={findings}
                    onClose={closeModal}
                    onSubmit={async (data) => {
                        await noteApi.createFromHighlight({
                            proyectoId: currentProjectId,
                            documentoId: currentDocumentId,
                            hallazgoId: data.hallazgoId,
                            textoSubrayado: selectedText,
                            subtitulo: data.subtitulo,
                        });

                        alert("Nota creada desde subrayado.");
                        await loadPageData();
                        clearSelection();
                    }}
                />
            )}
        </main>
    );
}

export default DocumentViewerPage;