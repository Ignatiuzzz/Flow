import { Finding } from "../../types/finding";
import "../../styles/components/matrix/MatrixTable.css";

interface MatrixTableProps {
  findings: Finding[];
  loading: boolean;
}

function MatrixTable({ findings, loading }: MatrixTableProps) {
  if (loading) {
    return (
      <div className="matrix-table__state flex min-h-[260px] flex-col items-center justify-center rounded-3xl border border-dashed bg-white p-8 text-center [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-extrabold [&_h3]:tracking-tight [&_h3]:text-slate-900 [&_p]:max-w-md [&_p]:text-sm [&_p]:leading-6 [&_p]:text-slate-500">
        <div className="matrix-table__loader mb-4 h-10 w-10 animate-spin rounded-full border-4" />
        <p>Cargando matriz...</p>
      </div>
    );
  }

  if (findings.length === 0) {
    return (
      <div className="matrix-table__state flex min-h-[260px] flex-col items-center justify-center rounded-3xl border border-dashed bg-white p-8 text-center [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-extrabold [&_h3]:tracking-tight [&_h3]:text-slate-900 [&_p]:max-w-md [&_p]:text-sm [&_p]:leading-6 [&_p]:text-slate-500">
        <h3>No hay hallazgos todavía</h3>
        <p>
          Registra hallazgos en el proyecto para generar automáticamente la
          matriz consolidada.
        </p>
      </div>
    );
  }

  return (
    <div className="matrix-table__wrapper w-full overflow-x-auto rounded-3xl border bg-white/80 backdrop-blur-md shadow-lg animate-fade-in-up">
      <table className="matrix-table min-w-[1450px] w-full border-collapse text-left text-sm [&_th]:border-b [&_th]:px-4 [&_th]:py-3 [&_th]:text-xs [&_th]:font-extrabold [&_th]:uppercase [&_th]:tracking-wide [&_td]:border-b [&_td]:px-4 [&_td]:py-3 [&_td]:align-top [&_td]:text-slate-600">
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
              <td>
                <span className="matrix-table__code inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase">{finding.codigo}</span>
              </td>
              <td>{finding.nombre}</td>
              <td>{finding.descripcion || "-"}</td>
              <td>{finding.criterio || "-"}</td>
              <td>{finding.objetivo || "-"}</td>
              <td>{finding.causa || "-"}</td>
              <td>{finding.efecto || "-"}</td>
              <td>{finding.conclusion || "-"}</td>
              <td>{finding.impacto}</td>
              <td>{finding.urgencia}</td>
              <td>
                <strong className="matrix-table__risk text-sm font-extrabold">{finding.riesgo}</strong>
              </td>
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