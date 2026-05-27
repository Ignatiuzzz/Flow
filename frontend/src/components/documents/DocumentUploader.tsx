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

    const allowedExtensions = ["pdf", "docx"];
    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!extension || !allowedExtensions.includes(extension)) {
      alert("Solo se permiten archivos PDF o DOCX.");
      event.target.value = "";
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!selectedFile) {
      alert("Selecciona un archivo antes de subir.");
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
          Adjunta documentos PDF o DOCX que servirán como respaldo del proyecto.
        </p>
      </div>

      <div className="document-uploader__field">
        <label>Archivo</label>
        <input
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileChange}
        />
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