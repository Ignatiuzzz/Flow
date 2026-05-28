import toast from "react-hot-toast";
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
      toast.error("Por ahora solo se permiten archivos PDF.");
      event.target.value = "";
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!selectedFile) {
      toast.error("Selecciona un archivo PDF antes de subir.");
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

  const selectedFileSize = selectedFile
    ? (selectedFile.size / (1024 * 1024)).toFixed(2)
    : null;

  return (
    <form className="document-uploader" onSubmit={handleSubmit}>
      <div className="document-uploader__header">
        <span>Nuevo documento</span>

        <h2>Subir archivo</h2>

        <p>
          Adjunta documentos PDF que serán usados como base documental
          del proyecto.
        </p>
      </div>

      <label className="document-uploader__dropzone">
        <input type="file" accept=".pdf,.docx" onChange={handleFileChange} />

        <div>
          <strong>Seleccionar archivo</strong>
          <small>Formatos permitidos: PDF</small>
        </div>
      </label>

      {selectedFile && (
        <div className="document-uploader__selected">
          <span>Archivo seleccionado</span>
          <strong>{selectedFile.name}</strong>
          {selectedFileSize && <small>{selectedFileSize} MB</small>}
        </div>
      )}

      <button type="submit" disabled={loading}>
        {loading ? "Subiendo documento..." : "Subir documento"}
      </button>
    </form>
  );
}

export default DocumentUploader;