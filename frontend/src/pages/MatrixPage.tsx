import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { matrixApi } from "../api/matrixApi";
import MatrixTable from "../components/matrix/MatrixTable";
import { Finding } from "../types/finding";
import "../styles/pages/MatrixPage.css";

function MatrixPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [findings, setFindings] = useState<Finding[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);

  const currentProjectId = projectId || "";

  const loadMatrix = async () => {
    if (!currentProjectId) return;

    try {
      setLoading(true);

      const data = await matrixApi.getByProject(currentProjectId);

      setFindings(data.matriz);
      setTotalRows(data.totalFilas);
    } catch (error) {
      console.error(error);
      alert("No se pudo cargar la matriz.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatrix();
  }, [currentProjectId]);

  return (
    <main className="matrix-page">
      <button
        className="matrix-page__back"
        onClick={() => navigate(`/projects/${currentProjectId}`)}
      >
        Volver al proyecto
      </button>

      <section className="matrix-page__header">
        <div>
          <h1>Matriz de hallazgos</h1>
          <p>
            La matriz se genera automáticamente a partir de los hallazgos
            registrados en el proyecto.
          </p>
          <span>Total de filas: {totalRows}</span>
        </div>

        <a
          className="matrix-page__download"
          href={matrixApi.downloadExcelUrl(currentProjectId)}
          target="_blank"
          rel="noreferrer"
        >
          Descargar Excel
        </a>
      </section>

      <MatrixTable findings={findings} loading={loading} />
    </main>
  );
}

export default MatrixPage;