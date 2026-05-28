import { FormEvent, useEffect, useState } from "react";
import { Finding, FindingCreate } from "../../types/finding";
import { AISuggestButton } from "../ai/AISuggestButton";
import { aiApi } from "../../api/aiApi";
import "../../styles/components/findings/FindingForm.css";

interface FindingFormProps {
  projectId: string;
  selectedFinding?: Finding | null;
  onSubmit: (data: FindingCreate) => Promise<void>;
  onCancelEdit?: () => void;
}

function FindingForm({
  projectId,
  selectedFinding,
  onSubmit,
  onCancelEdit,
}: FindingFormProps) {
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [criterio, setCriterio] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [causa, setCausa] = useState("");
  const [efecto, setEfecto] = useState("");
  const [conclusion, setConclusion] = useState("");
  const [impacto, setImpacto] = useState(1);
  const [urgencia, setUrgencia] = useState(1);
  const [justificacionRiesgo, setJustificacionRiesgo] = useState("");
  const [recomendaciones, setRecomendaciones] = useState("");
  const [loading, setLoading] = useState(false);

  const isEditing = Boolean(selectedFinding);

  useEffect(() => {
    if (selectedFinding) {
      setNombre(selectedFinding.nombre);
      setCodigo(selectedFinding.codigo);
      setDescripcion(selectedFinding.descripcion || "");
      setCriterio(selectedFinding.criterio || "");
      setObjetivo(selectedFinding.objetivo || "");
      setCausa(selectedFinding.causa || "");
      setEfecto(selectedFinding.efecto || "");
      setConclusion(selectedFinding.conclusion || "");
      setImpacto(selectedFinding.impacto);
      setUrgencia(selectedFinding.urgencia);
      setJustificacionRiesgo(selectedFinding.justificacionRiesgo || "");
      setRecomendaciones(selectedFinding.recomendaciones || "");
    } else {
      resetForm();
    }
  }, [selectedFinding]);

  const resetForm = () => {
    setNombre("");
    setCodigo("");
    setDescripcion("");
    setCriterio("");
    setObjetivo("");
    setCausa("");
    setEfecto("");
    setConclusion("");
    setImpacto(1);
    setUrgencia(1);
    setJustificacionRiesgo("");
    setRecomendaciones("");
  };

  const handleSuggest = async () => {
    return await aiApi.suggestFinding({
      proyectoId: projectId,
      nombre: nombre.trim(),
      codigo: codigo.trim(),
      descripcion: descripcion.trim(),
      camposExistentes: {
        criterio: criterio.trim(),
        objetivo: objetivo.trim(),
        causa: causa.trim(),
        efecto: efecto.trim(),
        conclusion: conclusion.trim(),
        justificacionRiesgo: justificacionRiesgo.trim(),
        recomendaciones: recomendaciones.trim(),
      }
    });
  };

  const handleApplySuggestions = (suggestions: Record<string, string>) => {
    if (suggestions.criterio) setCriterio(suggestions.criterio);
    if (suggestions.objetivo) setObjetivo(suggestions.objetivo);
    if (suggestions.causa) setCausa(suggestions.causa);
    if (suggestions.efecto) setEfecto(suggestions.efecto);
    if (suggestions.conclusion) setConclusion(suggestions.conclusion);
    if (suggestions.justificacionRiesgo) setJustificacionRiesgo(suggestions.justificacionRiesgo);
    if (suggestions.recomendaciones) setRecomendaciones(suggestions.recomendaciones);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!nombre.trim() || !codigo.trim()) {
      alert("El nombre y el código del hallazgo son obligatorios.");
      return;
    }

    try {
      setLoading(true);

      await onSubmit({
        proyectoId: projectId,
        nombre: nombre.trim(),
        codigo: codigo.trim(),
        descripcion: descripcion.trim(),
        criterio: criterio.trim(),
        objetivo: objetivo.trim(),
        causa: causa.trim(),
        efecto: efecto.trim(),
        conclusion: conclusion.trim(),
        impacto,
        urgencia,
        justificacionRiesgo: justificacionRiesgo.trim(),
        recomendaciones: recomendaciones.trim(),
      });

      if (!isEditing) {
        resetForm();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="finding-form" onSubmit={handleSubmit}>
      <div className="finding-form__header">
        <span>{isEditing ? "Modo edición" : "Nuevo hallazgo"}</span>

        <h2>{isEditing ? "Editar hallazgo" : "Registrar hallazgo"}</h2>

        <p>
          Completa la ficha del hallazgo. El riesgo se calcula a partir del
          impacto y la urgencia.
        </p>

        <div style={{ marginTop: '16px' }}>
          {isEditing && (
            <AISuggestButton 
              onSuggest={handleSuggest} 
              onApply={handleApplySuggestions} 
              isLoading={loading}
            />
          )}
        </div>
      </div>

      <div className="finding-form__grid finding-form__grid--two">
        <div className="finding-form__group">
          <label>Código</label>
          <input
            value={codigo}
            onChange={(event) => setCodigo(event.target.value)}
            placeholder="Ej. H-001"
          />
        </div>

        <div className="finding-form__group">
          <label>Nombre</label>
          <input
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
            placeholder="Nombre del hallazgo"
          />
        </div>
      </div>

      <div className="finding-form__group">
        <label>Descripción</label>
        <textarea
          value={descripcion}
          onChange={(event) => setDescripcion(event.target.value)}
          rows={3}
          placeholder="Describe el hallazgo identificado"
        />
      </div>

      <div className="finding-form__grid finding-form__grid--two">
        <div className="finding-form__group">
          <label>Criterio</label>
          <textarea
            value={criterio}
            onChange={(event) => setCriterio(event.target.value)}
            rows={3}
            placeholder="Norma, control o criterio evaluado"
          />
        </div>

        <div className="finding-form__group">
          <label>Objetivo</label>
          <textarea
            value={objetivo}
            onChange={(event) => setObjetivo(event.target.value)}
            rows={3}
            placeholder="Objetivo de control o evaluación"
          />
        </div>
      </div>

      <div className="finding-form__grid finding-form__grid--two">
        <div className="finding-form__group">
          <label>Causa</label>
          <textarea
            value={causa}
            onChange={(event) => setCausa(event.target.value)}
            rows={3}
          />
        </div>

        <div className="finding-form__group">
          <label>Efecto</label>
          <textarea
            value={efecto}
            onChange={(event) => setEfecto(event.target.value)}
            rows={3}
          />
        </div>
      </div>

      <div className="finding-form__group">
        <label>Conclusión</label>
        <textarea
          value={conclusion}
          onChange={(event) => setConclusion(event.target.value)}
          rows={3}
        />
      </div>

      <div className="finding-form__grid finding-form__grid--two">
        <div className="finding-form__group">
          <label>Impacto</label>
          <input
            type="number"
            min={1}
            max={5}
            value={impacto}
            onChange={(event) => {
              const value = Number(event.target.value);
              setImpacto(Math.min(Math.max(value, 1), 5));
            }}
          />
        </div>

        <div className="finding-form__group">
          <label>Urgencia</label>
          <input
            type="number"
            min={1}
            max={5}
            value={urgencia}
            onChange={(event) => {
              const value = Number(event.target.value);
              setUrgencia(Math.min(Math.max(value, 1), 5));
            }}
          />
        </div>
      </div>

      <div className="finding-form__group">
        <label>Justificación del riesgo</label>
        <textarea
          value={justificacionRiesgo}
          onChange={(event) => setJustificacionRiesgo(event.target.value)}
          rows={3}
        />
      </div>

      <div className="finding-form__group">
        <label>Recomendaciones</label>
        <textarea
          value={recomendaciones}
          onChange={(event) => setRecomendaciones(event.target.value)}
          rows={3}
        />
      </div>

      <div className="finding-form__actions">
        <button type="submit" disabled={loading}>
          {loading
            ? "Guardando..."
            : isEditing
              ? "Guardar cambios"
              : "Crear hallazgo"}
        </button>

        {isEditing && onCancelEdit && (
          <button
            type="button"
            className="finding-form__cancel"
            onClick={onCancelEdit}
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

export default FindingForm;