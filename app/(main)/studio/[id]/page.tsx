import { canvas } from "framer-motion/client"
import EditorClient from "./EditorClient"

export default function StudioEditorPage({params} :{params: {id: string}} ){
    return < EditorClient canvasId= {params.id} />;
}