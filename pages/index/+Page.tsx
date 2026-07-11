import { EditorControlsNav } from "@/pages/image/@imageId/EditorControlsNav";
import { EditPage } from "@/pages/image/@imageId/EditPage";
import { EditorContextProvider } from "@/src/EditorContext";

export default function Page() {
  return (
    <EditorContextProvider>
      <EditPage />
      <EditorControlsNav />
    </EditorContextProvider>
  );
}
