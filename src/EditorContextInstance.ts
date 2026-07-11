import { createContext } from "react";
import type { EditorContextValue } from "./EditorContext.types";

const EditorContextInstance = createContext<EditorContextValue | null>(null);

export { EditorContextInstance };
