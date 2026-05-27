import { Finding } from "./finding";

export interface ProjectMatrix {
  projectId: string;
  totalFilas: number;
  matriz: Finding[];
}