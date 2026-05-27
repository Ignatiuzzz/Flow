import { FormEvent, useEffect, useState } from "react";
import { Evidence, EvidenceCreate } from "../../types/evidence";
import { Finding } from "../../types/finding";
import "../../styles/components/evidences/EvidenceForm.css";

interface EvidenceFormProps {
  projectId: string;
  findings: Finding[];
  selectedEvidence?: Evidence | null;
  onSubmit: (data: EvidenceCreate) => Promise<void>;
  onCancelEdit?: () => void;
}

function EvidenceForm({
  projectId,
  findings,
  selectedEvidence,
  onSubmit,
  onCancelEdit,
}: EvidenceFormProps) {
  const [hallazgoId, setHallazgoId] = useState("");
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [criterio, setCriterio] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [descripcionEvidencia, setDescripcionEvidencia] = useState("");
  const [documentoNombre, setDocumentoNombre] = useState("");
  const [subtitulo, setSubtitulo] = useState("");
  const [loading, setLoading] = useState(false);

  const isEditing = Boolean(selectedEvidence);

  useEffect(() => {
    if (selectedEvidence) {
      setHallazgoId(selectedEvidence.hallazgoId || "");
      setNombre(selectedEvidence.nombre);
      setCodigo(selectedEvidence.codigo);
      setCriterio(selectedEvidence.criterio || "");
      setObjetivo(selectedEvidence.objetivo || "");
      setDescripcionEvidencia(selectedEvidence.descripcionEvidencia || "");
      setDocumentoNombre(selectedEvidence.documentoNombre || "");
      setSubtitulo(selectedEvidence.subtitulo || "");
    } else {
      resetForm();
    }
  }, [selectedEvidence]);

  const resetForm = () => {
    setHallazgoId("");
    setNombre("");
    setCodigo("");
    setCriterio("");
    setObjetivo("");
    setDescripcionEvidencia("");
    setDocumentoNombre("");
    setSubtitulo("");
  };

  const handleFindingChange = (selectedFindingId: string) => {
    setHallazgoId(selectedFindingId);

    const selectedFinding = findings.find(
      (finding) => finding.id === selectedFindingId
    );

    if (!selectedFinding) return;

    if (!criterio.trim()) {
      setCriterio(selectedFinding.criterio || "");
    }

    if (!objetivo.trim()) {
      setObjetivo(selectedFinding.objetivo || "");
    }

    if (!codigo.trim()) {
      setCodigo(`E-${selectedFinding.codigo}`);
    }

    if (!nombre.trim()) {
      setNombre(`Evidencia de ${selectedFinding.nombre}`);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!nombre.trim() || !codigo.trim()) {
      alert("El nombre y el código de la evidencia son obligatorios.");
      return;
    }

    try {
      setLoading(true);

      await onSubmit({
        proyectoId: projectId,
        hallazgoId: hallazgoId || undefined,
        nombre: nombre.trim(),
        codigo: codigo.trim(),
        criterio: criterio.trim(),
        objetivo: objetivo.trim(),
        descripcionEvidencia: descripcionEvidencia.trim(),
        documentoNombre: documentoNombre.trim(),
        subtitulo: subtitulo.trim(),
      });

      if (!isEditing) {
        resetForm();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="evidence-form" onSubmit={handleSubmit}>
      <div className="evidence-form__header">
        <h2>{isEditing ? "Editar evidencia" : "Registrar evidencia"}</h2>
        <p>
          Puedes relacionar la evidencia con un hallazgo existente o registrarla
          como evidencia general del proyecto.
        </p>
      </div>

      <div className="evidence-form__group">
        <label>Hallazgo relacionado</label>
        <select
          value={hallazgoId}
          onChange={(event) => handleFindingChange(event.target.value)}
        >
          <option value="">Sin hallazgo relacionado</option>

          {findings.map((finding) => (
            <option key={finding.id} value={finding.id}>
              {finding.codigo} - {finding.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="evidence-form__grid evidence-form__grid--two">
        <div className="evidence-form__group">
          <label>Código</label>
          <input
            value={codigo}
            onChange={(event) => setCodigo(event.target.value)}
            placeholder="Ej. E-H-001"
          />
        </div>

        <div className="evidence-form__group">
          <label>Nombre</label>
          <input
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
            placeholder="Nombre de la evidencia"
          />
        </div>
      </div>

      <div className="evidence-form__grid evidence-form__grid--two">
        <div className="evidence-form__group">
          <label>Criterio</label>
          <textarea
            value={criterio}
            onChange={(event) => setCriterio(event.target.value)}
            rows={3}
          />
        </div>

        <div className="evidence-form__group">
          <label>Objetivo</label>
          <textarea
            value={objetivo}
            onChange={(event) => setObjetivo(event.target.value)}
            rows={3}
          />
        </div>
      </div>

      <div className="evidence-form__group">
        <label>Descripción de evidencia</label>
        <textarea
          value={descripcionEvidencia}
          onChange={(event) => setDescripcionEvidencia(event.target.value)}
          rows={4}
          placeholder="Describe el respaldo, documento o elemento revisado"
        />
      </div>

      <div className="evidence-form__grid evidence-form__grid--two">
        <div className="evidence-form__group">
          <label>Documento</label>
          <input
            value={documentoNombre}
            onChange={(event) => setDocumentoNombre(event.target.value)}
            placeholder="Ej. PESI Institucional"
          />
        </div>

        <div className="evidence-form__group">
          <label>Subtítulo o sección</label>
          <input
            value={subtitulo}
            onChange={(event) => setSubtitulo(event.target.value)}
            placeholder="Ej. 3. Gestión de Riesgos"
          />
        </div>
      </div>

      <div className="evidence-form__actions">
        <button type="submit" disabled={loading}>
          {loading
            ? "Guardando..."
            : isEditing
            ? "Actualizar evidencia"
            : "Crear evidencia"}
        </button>

        {isEditing && onCancelEdit && (
          <button
            type="button"
            className="evidence-form__cancel"
            onClick={onCancelEdit}
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

export default EvidenceForm;