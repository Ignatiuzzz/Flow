import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProjectsPage from "../pages/ProjectsPage";
import ProjectDetailPage from "../pages/ProjectDetailPage";
import FindingsPage from "../pages/FindingsPage";
import EvidencesPage from "../pages/EvidencesPage";
import NotesPage from "../pages/NotesPage";
import MatrixPage from "../pages/MatrixPage";
import DocumentsPage from "../pages/DocumentsPage";
import DocumentViewerPage from "../pages/DocumentViewerPage";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProjectsPage />} />
        <Route path="/projects/:projectId" element={<ProjectDetailPage />} />

        <Route
          path="/projects/:projectId/documents"
          element={<DocumentsPage />}
        />

        <Route
          path="/projects/:projectId/documents/:documentId/viewer"
          element={<DocumentViewerPage />}
        />

        <Route path="/projects/:projectId/findings" element={<FindingsPage />} />

        <Route
          path="/projects/:projectId/evidences"
          element={<EvidencesPage />}
        />

        <Route path="/projects/:projectId/notes" element={<NotesPage />} />
        <Route path="/projects/:projectId/matrix" element={<MatrixPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;