import { axiosClient } from "./axiosClient";
import { Note, NoteCreate, NoteUpdate } from "../types/note";
import { HighlightCoordinates } from "../types/highlight";

export interface NoteFromHighlightCreate {
  proyectoId: string;
  documentoId: string;

  hallazgoId?: string;

  textoSubrayado: string;
  subtitulo?: string;
  observacion?: string;
  coordenadas?: HighlightCoordinates;
}

export const noteApi = {
  create: async (data: NoteCreate): Promise<Note> => {
    const response = await axiosClient.post<Note>("/notes/", data);
    return response.data;
  },

  createFromHighlight: async (data: NoteFromHighlightCreate) => {
    const response = await axiosClient.post("/notes/from-highlight", data);
    return response.data;
  },

  getByProject: async (projectId: string): Promise<Note[]> => {
    const response = await axiosClient.get<Note[]>(
      `/notes/project/${projectId}`
    );
    return response.data;
  },

  getByFinding: async (findingId: string): Promise<Note[]> => {
    const response = await axiosClient.get<Note[]>(
      `/notes/finding/${findingId}`
    );
    return response.data;
  },

  getByDocument: async (documentId: string): Promise<Note[]> => {
    const response = await axiosClient.get<Note[]>(
      `/notes/document/${documentId}`
    );
    return response.data;
  },

  getById: async (noteId: string): Promise<Note> => {
    const response = await axiosClient.get<Note>(`/notes/${noteId}`);
    return response.data;
  },

  update: async (noteId: string, data: NoteUpdate): Promise<Note> => {
    const response = await axiosClient.put<Note>(`/notes/${noteId}`, data);
    return response.data;
  },

  delete: async (noteId: string): Promise<{ message: string }> => {
    const response = await axiosClient.delete<{ message: string }>(
      `/notes/${noteId}`
    );
    return response.data;
  },
};