import { createContext } from "react";
import type { AppContextValue } from "./AppContext.types";

const AppContextInstance = createContext<AppContextValue | null>(null);

export { AppContextInstance };
