import { ChangeEvent, FormEvent, useState } from "react";
import "../../styles/components/documents/DocumentUploader.css";

interface DocumentUploaderProps {
  onUpload: (file: File) => Promise<void>;
}

function DocumentUploader({ onUpload }: DocumentUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (extension !== "pdf") {
      alert("Por ahora solo se permiten archivos PDF.");
      event.target.value = "";
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!selectedFile) {
      alert("Selecciona un archivo PDF antes de subir.");
      return;
    }

    try {
      setLoading(true);
      await onUpload(selectedFile);
      setSelectedFile(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="document-uploader" onSubmit={handleSubmit}>
      <div className="document-uploader__header">
        <h2>Subir documento</h2>
        <p>
          Adjunta documentos PDF que servirán como respaldo del proyecto.
        </p>
      </div>

      <div className="document-uploader__field">
        <label>Archivo PDF</label>
        <input type="file" accept=".pdf,application/pdf" onChange={handleFileChange} />
      </div>

      {selectedFile && (
        <div className="document-uploader__selected">
          <span>Archivo seleccionado:</span>
          <strong>{selectedFile.name}</strong>
        </div>
      )}

      <button type="submit" disabled={loading}>
        {loading ? "Subiendo..." : "Subir documento"}
      </button>
    </form>
  );
}

export default DocumentUploader;