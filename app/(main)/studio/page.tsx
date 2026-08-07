import { fetchAPI } from "@/lib/api";
import StudioClient from "./StudioClient";

export default async function StudioPage() {
  let studioData = null;

  try {
    studioData = await fetchAPI('/studio');//Checar rutas
  } catch (error) {
    console.error("El backend no está disponible para el Estudio:", error);
  }
  return <StudioClient initialFiles={studioData} />;
}
