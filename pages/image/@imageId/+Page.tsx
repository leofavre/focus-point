import { EditorContextProvider } from "@/src/EditorContext";
import { EditorControlsNav } from "./EditorControlsNav";
import { EditPage } from "./EditPage";

export default function Page() {
  return (
    <EditorContextProvider>
      <EditPage />
      <EditorControlsNav />
    </EditorContextProvider>
  );
}
