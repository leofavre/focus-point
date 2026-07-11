import type { PropsWithChildren } from "react";
import { Toaster } from "@/components/Toaster/Toaster";
import { UploadBackdropProvider } from "@/components/UploadBackdrop/UploadBackdropContext";
import { AppContextProvider } from "@/src/AppContext";
import { IndexedDBServiceRoot } from "@/src/services/IndexedDBServiceRoot";
import SharedLayout from "./(layout)/Layout";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <>
      <Toaster />
      <IndexedDBServiceRoot>
        <AppContextProvider>
          <UploadBackdropProvider>
            <SharedLayout>{children}</SharedLayout>
          </UploadBackdropProvider>
        </AppContextProvider>
      </IndexedDBServiceRoot>
    </>
  );
}
