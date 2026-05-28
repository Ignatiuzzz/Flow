import toast from "react-hot-toast";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { documentApi } from "../api/documentApi";
import { evidenceApi } from "../api/evidenceApi";
import { findingApi } from "../api/findingApi";
import { highlightApi } from "../api/highlightApi";
import { noteApi } from "../api/noteApi";
import DocumentViewer from "../components/documents/DocumentViewer";
import HighlightDeletePopup from "../components/documents/HighlightDeletePopup";
import HighlightEvidenceModal from "../components/documents/HighlightEvidenceModal";
import HighlightFindingModal from "../components/documents/HighlightFindingModal";
import HighlightInfoPopup from "../components/documents/HighlightInfoPopup";
import HighlightNoteModal from "../components/documents/HighlightNoteModal";
import { AuditDocument } from "../types/document";
import { Evidence } from "../types/evidence";
import { Finding } from "../types/finding";
import {
  Highlight,
  HighlightCoordinates,
  HighlightRelations,
} from "../types/highlight";
import "../styles/pages/DocumentViewerPage.css";

type HighlightMode = "finding" | "evidence" | "note" | null;

function DocumentViewerPage() {
  const { projectId, documentId } = useParams();
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const [selectedText, setSelectedText] = useState("");
  const [selectedCoordinates, setSelectedCoordinates] =
    useState<HighlightCoordinates | null>(null);

  const [mode, setMode] = useState<HighlightMode>(null);

  const [selectedRelationsList, setSelectedRelationsList] = useState<
    HighlightRelations[]
  >([]);
  const [relationsPosition, setRelationsPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const [deleteRelationsList, setDeleteRelationsList] = useState<
    HighlightRelations[]
  >([]);
  const [deletePosition, setDeletePosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const currentProjectId = projectId || "";
  const currentDocumentId = documentId || "";

  const { data: documentData, isLoading: loadingDoc } = useQuery({
    queryKey: ["document", currentDocumentId],
    queryFn: () => documentApi.getById(currentDocumentId),
    enabled: !!currentDocumentId,
  });

  const { data: findings = [] as Finding[], isLoading: loadingFindings } = useQuery({
    queryKey: ["findings", currentProjectId],
    queryFn: () => findingApi.getByProject(currentProjectId),
    enabled: !!currentProjectId,
  });

  const { data: evidences = [] as Evidence[], isLoading: loadingEvidences } = useQuery({
    queryKey: ["evidences", currentProjectId],
    queryFn: () => evidenceApi.getByProject(currentProjectId),
    enabled: !!currentProjectId,
  });

  const { data: highlights = [] as Highlight[], isLoading: loadingHighlights } = useQuery({
    queryKey: ["highlights", currentDocumentId],
    queryFn: () => highlightApi.getByDocument(currentDocumentId),
    enabled: !!currentDocumentId,
  });

  const loading = loadingDoc || loadingFindings || loadingEvidences || loadingHighlights;

  const reloadHighlights = () => {
    queryClient.invalidateQueries({ queryKey: ["highlights", currentDocumentId] });
  };

  const closeModal = () => {
    setMode(null);
  };

  const clearSelection = () => {
    setSelectedText("");
    setSelectedCoordinates(null);
    setMode(null);
  };

  const closeRelationsPopup = () => {
    setSelectedRelationsList([]);
    setRelationsPosition(null);
  };

  const closeDeletePopup = () => {
    setDeleteRelationsList([]);
    setDeletePosition(null);
  };

  const handleSavedHighlightClick = async (
    highlightIds: string[],
    position: { x: number; y: number }
  ) => {
    try {
      closeDeletePopup();

      const relations = await Promise.all(
        highlightIds.map((highlightId) => highlightApi.getRelations(highlightId))
      );

      setSelectedRelationsList(relations);
      setRelationsPosition(position);
    } catch (error) {
      console.error(error);
      toast.error("No se pudieron cargar las relaciones del subrayado.");
    }
  };

  const deleteHighlightById = async (highlightId: string) => {
    const confirmed = window.confirm("¿Deseas eliminar este subrayado?");

    if (!confirmed) return;

    try {
      await highlightApi.delete(highlightId);
      reloadHighlights();
      closeDeletePopup();
      closeRelationsPopup();
    } catch (error) {
      console.error(error);
      toast.error("No se pudo eliminar el subrayado.");
    }
  };

  const deleteAllSelectedHighlights = async () => {
    const confirmed = window.confirm(
      "¿Deseas eliminar todos los subrayados seleccionados?"
    );

    if (!confirmed) return;

    try {
      await Promise.all(
        deleteRelationsList.map((relations) =>
          highlightApi.delete(relations.subrayado.id)
        )
      );

      reloadHighlights();
      closeDeletePopup();
      closeRelationsPopup();
    } catch (error) {
      console.error(error);
      toast.error("No se pudieron eliminar todos los subrayados.");
    }
  };

  const handleEraseHighlightClick = async (
    highlightIds: string[],
    position: { x: number; y: number }
  ) => {
    try {
      closeRelationsPopup();

      const relations = await Promise.all(
        highlightIds.map((highlightId) => highlightApi.getRelations(highlightId))
      );

      if (relations.length === 1) {
        await deleteHighlightById(relations[0].subrayado.id);
        return;
      }

      setDeleteRelationsList(relations);
      setDeletePosition(position);
    } catch (error) {
      console.error(error);
      toast.error("No se pudieron cargar los subrayados para borrar.");
    }
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
          savedHighlights={highlights}
          onSavedHighlightClick={handleSavedHighlightClick}
          onEraseHighlightClick={handleEraseHighlightClick}
          onRegisterFinding={(text, coordinates) => {
            closeRelationsPopup();
            closeDeletePopup();
            setSelectedText(text);
            setSelectedCoordinates(coordinates);
            setMode("finding");
          }}
          onRelateEvidence={(text, coordinates) => {
            closeRelationsPopup();
            closeDeletePopup();
            setSelectedText(text);
            setSelectedCoordinates(coordinates);
            setMode("evidence");
          }}
          onCreateNote={(text, coordinates) => {
            closeRelationsPopup();
            closeDeletePopup();
            setSelectedText(text);
            setSelectedCoordinates(coordinates);
            setMode("note");
          }}
        />
      )}

      {selectedRelationsList.length > 0 && relationsPosition && (
        <HighlightInfoPopup
          relationsList={selectedRelationsList}
          position={relationsPosition}
          onClose={closeRelationsPopup}
        />
      )}

      {deleteRelationsList.length > 0 && deletePosition && (
        <HighlightDeletePopup
          relationsList={deleteRelationsList}
          position={deletePosition}
          onDeleteOne={deleteHighlightById}
          onDeleteAll={deleteAllSelectedHighlights}
          onClose={closeDeletePopup}
        />
      )}

      {mode === "finding" && selectedText && selectedCoordinates && (
        <HighlightFindingModal
          selectedText={selectedText}
          onClose={closeModal}
          onSubmit={async (data) => {
            await findingApi.createFromHighlight({
              proyectoId: currentProjectId,
              documentoId: currentDocumentId,
              textoSubrayado: selectedText,
              coordenadas: selectedCoordinates,
              subtitulo: data.subtitulo,
              observacion: data.observacion,
              nombre: data.nombre,
              codigo: data.codigo,
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

            toast.success("Hallazgo creado desde subrayado.");
            reloadHighlights();
            clearSelection();
          }}
        />
      )}

      {mode === "evidence" && selectedText && selectedCoordinates && (
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
              coordenadas: selectedCoordinates,
              subtitulo: data.subtitulo,
              observacion: data.observacion,
            });

            toast.success("Evidencia relacionada al subrayado.");
            reloadHighlights();
            clearSelection();
          }}
        />
      )}

      {mode === "note" && selectedText && selectedCoordinates && (
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
              coordenadas: selectedCoordinates,
              subtitulo: data.subtitulo,
            });

            toast.success("Nota creada desde subrayado.");
            reloadHighlights();
            clearSelection();
          }}
        />
      )}
    </main>
  );
}

export default DocumentViewerPage;