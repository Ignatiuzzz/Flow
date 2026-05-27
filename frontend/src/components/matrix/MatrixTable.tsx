import { Finding } from "../../types/finding";
import "../../styles/components/matrix/MatrixTable.css";

interface MatrixTableProps {
  findings: Finding[];
  loading: boolean;
}

function MatrixTable({ findings, loading }: MatrixTableProps) {
  if (loading) {
    return <p className="matrix-table__message">Cargando matriz...</p>;
  }

  if (findings.length === 0) {
    return (
      <p className="matrix-table__message">
        Todavía no hay hallazgos registrados para generar la matriz.
      </p>
    );
  }

  return (
    <div className="matrix-table__wrapper">
      <table className="matrix-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Criterio</th>
            <th>Objetivo</th>
            <th>Causa</th>
            <th>Efecto</th>
            <th>Conclusión</th>
            <th>Impacto</th>
            <th>Urgencia</th>
            <th>Riesgo</th>
            <th>Nivel</th>
            <th>Recomendaciones</th>
          </tr>
        </thead>

        <tbody>
          {findings.map((finding) => (
            <tr key={finding.id}>
              <td>{finding.codigo}</td>
              <td>{finding.nombre}</td>
              <td>{finding.descripcion || "-"}</td>
              <td>{finding.criterio || "-"}</td>
              <td>{finding.objetivo || "-"}</td>
              <td>{finding.causa || "-"}</td>
              <td>{finding.efecto || "-"}</td>
              <td>{finding.conclusion || "-"}</td>
              <td>{finding.impacto}</td>
              <td>{finding.urgencia}</td>
              <td>{finding.riesgo}</td>
              <td>
                <span
                  className={`matrix-table__level matrix-table__level--${finding.nivel
                    .replace(" ", "-")
                    .toLowerCase()}`}
                >
                  {finding.nivel}
                </span>
              </td>
              <td>{finding.recomendaciones || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MatrixTable;