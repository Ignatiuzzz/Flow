import { useState } from "react";
import { healthApi, HealthResponse } from "./api/healthApi";
import "./index.css";

function App() {
  const [backendStatus, setBackendStatus] = useState<HealthResponse | null>(null);
  const [databaseStatus, setDatabaseStatus] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const testConnection = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const backendResponse = await healthApi.checkBackend();
      const databaseResponse = await healthApi.checkDatabase();

      setBackendStatus(backendResponse);
      setDatabaseStatus(databaseResponse);
    } catch (error) {
      console.error(error);
      setErrorMessage(
        "No se pudo conectar con el backend. Revisa que FastAPI esté corriendo y que CORS permita localhost:3000."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-6">
      <section className="w-full max-w-2xl bg-white rounded-2xl shadow p-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Herramienta para Auditores
        </h1>

        <p className="text-slate-600 mb-6">
          Prueba inicial de conexión entre React y FastAPI.
        </p>

        <button
          onClick={testConnection}
          disabled={loading}
          className="px-5 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? "Probando conexión..." : "Probar conexión con backend"}
        </button>

        {errorMessage && (
          <div className="mt-6 p-4 rounded-lg bg-red-100 text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="mt-6 grid gap-4">
          <div className="p-4 rounded-lg border border-slate-200">
            <h2 className="font-semibold text-slate-800">Backend</h2>
            {backendStatus ? (
              <p className="text-green-700 mt-1">
                {backendStatus.status} - {backendStatus.message}
              </p>
            ) : (
              <p className="text-slate-500 mt-1">Sin comprobar todavía.</p>
            )}
          </div>

          <div className="p-4 rounded-lg border border-slate-200">
            <h2 className="font-semibold text-slate-800">Base de datos</h2>
            {databaseStatus ? (
              <p className="text-green-700 mt-1">
                {databaseStatus.status} - {databaseStatus.message}
              </p>
            ) : (
              <p className="text-slate-500 mt-1">Sin comprobar todavía.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;