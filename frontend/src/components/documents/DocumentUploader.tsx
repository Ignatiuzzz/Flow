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
    <form className="document-uploader rounded-3xl border border-white/20 bg-white/70 backdrop-blur-md p-6 shadow-2xl animate-slide-in-left [&_button]:w-full [&_button]:rounded-2xl [&_button]:px-5 [&_button]:py-3 [&_button]:text-sm [&_button]:font-bold [&_button]:text-white [&_button]:shadow-lg [&_button]:transition-all [&_button]:duration-300 [&_button]:disabled:opacity-60" onSubmit={handleSubmit}>
      <div className="document-uploader__header mb-5 border-b border-slate-100 pb-5 [&_span]:mb-3 [&_span]:inline-flex [&_span]:rounded-full [&_span]:border [&_span]:px-3 [&_span]:py-1 [&_span]:text-xs [&_span]:font-bold [&_span]:uppercase [&_span]:tracking-wide [&_h2]:mb-2 [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:tracking-tight [&_h2]:text-slate-950 [&_p]:text-sm [&_p]:leading-6 [&_p]:text-slate-500">
        <span>Nuevo documento</span>

        <h2>Subir archivo</h2>

        <p>
          Adjunta documentos PDF que serán usados como base documental
          del proyecto.
        </p>
      </div>

      <label className="document-uploader__dropzone mb-4 flex min-h-[150px] cursor-pointer items-center justify-center rounded-3xl border border-dashed px-5 py-6 text-center transition-all duration-300 hover:bg-white/80 hover:shadow-[0_0_20px_rgba(15,89,99,0.15)] hover:-translate-y-0.5 hover:border-[#0f5963] [&_input]:hidden [&_strong]:block [&_strong]:text-base [&_strong]:font-extrabold [&_small]:mt-1 [&_small]:block [&_small]:text-sm [&_small]:font-semibold [&_small]:text-slate-500">
        <input type="file" accept=".pdf,.docx" onChange={handleFileChange} />

        <div>
          <strong>Seleccionar archivo</strong>
          <small>Formatos permitidos: PDF</small>
        </div>
      </label>

      {selectedFile && (
        <div className="document-uploader__selected mb-4 rounded-2xl border px-4 py-3 text-sm [&_span]:block [&_span]:text-xs [&_span]:font-bold [&_span]:uppercase [&_span]:tracking-wide [&_span]:text-slate-400 [&_strong]:mt-1 [&_strong]:block [&_strong]:break-words [&_strong]:text-sm [&_strong]:font-extrabold [&_strong]:text-slate-900 [&_small]:mt-1 [&_small]:block [&_small]:text-xs [&_small]:font-semibold [&_small]:text-slate-500">
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