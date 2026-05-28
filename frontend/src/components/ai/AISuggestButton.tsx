import { useState } from "react";
import { Sparkles, X, Check, XCircle } from "lucide-react";
import { AISuggestionResponse } from "../../api/aiApi";
import "../../styles/components/ai/AISuggestButton.css";

interface AISuggestButtonProps {
  onSuggest: () => Promise<AISuggestionResponse>;
  onApply: (suggestions: Record<string, string>) => void;
  isLoading?: boolean;
}

export function AISuggestButton({ onSuggest, onApply, isLoading }: AISuggestButtonProps) {
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Record<string, string>>({});
  const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>({});

  const handleSuggest = async () => {
    setLoading(true);
    try {
      const response = await onSuggest();
      if (response.sugerencias && Object.keys(response.sugerencias).length > 0) {
        setSuggestions(response.sugerencias);
        const initialSelected: Record<string, boolean> = {};
        Object.keys(response.sugerencias).forEach(key => {
          initialSelected[key] = true;
        });
        setSelectedFields(initialSelected);
        setModalOpen(true);
      } else {
        alert("La IA no generó sugerencias para los campos actuales.");
      }
    } catch (error) {
      console.error("Error obteniendo sugerencias:", error);
      alert("Hubo un error al obtener sugerencias de la IA.");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    const appliedSuggestions: Record<string, string> = {};
    Object.entries(suggestions).forEach(([key, value]) => {
      if (selectedFields[key]) {
        appliedSuggestions[key] = value;
      }
    });
    
    if (Object.keys(appliedSuggestions).length > 0) {
      onApply(appliedSuggestions);
    }
    setModalOpen(false);
  };

  const toggleField = (field: string) => {
    setSelectedFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const getFieldLabel = (field: string) => {
    const labels: Record<string, string> = {
      criterio: "Criterio",
      objetivo: "Objetivo",
      causa: "Causa",
      efecto: "Efecto",
      conclusion: "Conclusión",
      recomendaciones: "Recomendaciones",
      justificacionRiesgo: "Justificación del Riesgo",
      descripcionEvidencia: "Descripción de Evidencia"
    };
    return labels[field] || field;
  };

  return (
    <>
      <button 
        type="button" 
        className="ai-suggest-button" 
        onClick={handleSuggest}
        disabled={loading || isLoading}
      >
        <Sparkles size={16} />
        {loading ? "Generando..." : "Sugerencias IA"}
      </button>

      {modalOpen && (
        <div className="ai-modal-overlay">
          <div className="ai-modal">
            <div className="ai-modal__header">
              <h3><Sparkles size={18} /> Sugerencias de la IA</h3>
              <button type="button" onClick={() => setModalOpen(false)} className="ai-modal__close">
                <X size={20} />
              </button>
            </div>
            
            <div className="ai-modal__content">
              <p className="ai-modal__desc">La IA ha generado las siguientes sugerencias basándose en el contexto. Selecciona las que deseas aplicar:</p>
              
              <div className="ai-suggestions-list">
                {Object.entries(suggestions).map(([field, text]) => (
                  <div 
                    key={field} 
                    className={`ai-suggestion-item ${selectedFields[field] ? 'ai-suggestion-item--selected' : ''}`}
                    onClick={() => toggleField(field)}
                  >
                    <div className="ai-suggestion-item__header">
                      <div className="ai-suggestion-item__title">
                        {selectedFields[field] ? (
                          <Check size={16} className="text-green" />
                        ) : (
                          <XCircle size={16} className="text-gray" />
                        )}
                        <strong>{getFieldLabel(field)}</strong>
                      </div>
                    </div>
                    <div className="ai-suggestion-item__text">{text}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="ai-modal__footer">
              <button type="button" className="ai-button-cancel" onClick={() => setModalOpen(false)}>
                Cancelar
              </button>
              <button 
                type="button" 
                className="ai-button-apply" 
                onClick={handleApply}
                disabled={!Object.values(selectedFields).some(v => v)}
              >
                Aplicar seleccionados
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
