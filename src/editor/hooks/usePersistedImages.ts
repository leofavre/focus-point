import isEqual from "lodash/isEqual";
import { useCallback, useEffect, useEffectEvent, useState } from "react";
import type { Err, Result } from "../../helpers/errorHandling";
import { accept, processResults, reject } from "../../helpers/errorHandling";
import { isIndexedDBAvailable } from "../../helpers/indexedDBAvailability";
import { useIndexedDBService } from "../../services/indexedDBServiceContext";
import { getInMemoryStorageService } from "../../services/inMemoryStorageService";
import type {
  ImageDraftStateAndFile,
  ImageDraftStateAndUrl,
  ImageId,
  ImageRecord,
} from "../../types";
import { hasFile, hasUrl, isImageDraftStateAndUrl } from "../../types";
import { createImageId } from "../helpers/createImageId";

export type UsePersistedImagesOptions = {
  /** When true, use in-memory storage instead of IndexedDB (e.g. for ephemeral mode). */
  forceInMemoryStorage?: boolean;
  onRefreshImagesError?: (error: Err<"RefreshFailed">) => void;
};

type AddImagesOverwriteOptions = {
  /**
   * When true, use the base ID from the filename (no collision suffix).
   * If a record with that ID exists, it is overwritten.
   */
  overwrite?: boolean;
};

type AddImagesIdOptions = {
  /**
   * Explicit id for the image record (addImage only). When set, this id is
   * used instead of generating one from the filename, and any existing record
   * with that id is overwritten.
   */
  id?: ImageId;
};

type AddImageOptions = AddImagesOverwriteOptions | AddImagesIdOptions;

export type UsePersistedImagesReturn = {
  images: ImageRecord[] | undefined;
  addImage: (
    draftAndFileOrUrl: ImageDraftStateAndFile | ImageDraftStateAndUrl,
    options?: AddImageOptions,
  ) => Promise<Result<ImageId, "AddImageFailed">>;
  addImages: (
    draftsAndFilesOrUrls: (ImageDraftStateAndFile | ImageDraftStateAndUrl)[],
    options?: AddImagesOverwriteOptions,
  ) => Promise<{ accepted: ImageId[]; rejected: Err<"AddImageFailed">[] }>;
  getImage: (id: ImageId) => Promise<ImageRecord | undefined>;
  updateImage: (
    id: ImageId,
    updates: Partial<ImageRecord>,
  ) => Promise<Result<ImageId | undefined, "UpdateImageFailed">>;
  deleteImage: (id: ImageId) => Promise<ImageId | undefined>;
  refreshImages: () => Promise<Result<void, "RefreshFailed">>;
};

/**
 * Custom React hook for persisting image records in IndexedDB or in-memory storage.
 *
 * Storage: IndexedDB when available (unless forceInMemoryStorage is true), else in-memory.
 *
 * Unlike usePersistedUIRecord (one entry per id), this store holds many images
 * each identified by a human-friendly ID derived from the filename (with collision suffix).
 *
 * `onRefreshImagesError` can be passed to be called when the initial refresh fails.
 *
 * @returns Object with:
 * - `images`: all persisted image records (undefined until loaded).
 * - `addImage(draftAndFile, options?)`: saves a single image; returns Result with id or
 *   AddImageFailed. Options: either `{ overwrite?: boolean }` (generated ids, overwrite
 *   by base ID) or `{ id: ImageId }` (explicit id, overwrite implied). Pass one shape only.
 * - `addImages(draftsAndFiles, options?)`: saves multiple image records, then
 *   refreshes once; returns accepted ids and rejected reasons.
 *   Options: `{ overwrite?: boolean }`.
 * - `getImage`: fetches one image record by id.
 * - `updateImage`: merges partial image record into an existing record;
 *   returns Result.
 * - `deleteImage`: removes an image record by id.
 * - `refreshImages`: reloads the list from the database; returns Result.
 */
export function usePersistedImages(options?: UsePersistedImagesOptions): UsePersistedImagesReturn {
  const { forceInMemoryStorage = false, onRefreshImagesError } = options ?? {};

  const indexedDBServiceFromContext = useIndexedDBService();
  const inMemoryService = getInMemoryStorageService<ImageRecord>("images");
  const useIndexedDB = !forceInMemoryStorage && isIndexedDBAvailable();

  const service =
    useIndexedDB && indexedDBServiceFromContext != null
      ? indexedDBServiceFromContext
      : inMemoryService;

  const [images, setImages] = useState<ImageRecord[] | undefined>(undefined);

  const stableRefreshImages = useEffectEvent(async (): Promise<Result<void, "RefreshFailed">> => {
    const result = await service.getAllRecords();

    if (result.rejected != null) {
      return reject({ reason: "RefreshFailed", error: result.rejected.error });
    }

    setImages(result.accepted ?? []);
    return accept(undefined);
  });

  const stableOnRefreshImagesError = useEffectEvent((err: Err<"RefreshFailed">) =>
    onRefreshImagesError?.(err),
  );

  useEffect(() => {
    void indexedDBServiceFromContext;

    stableRefreshImages().then((res) => {
      if (res.rejected == null) return;
      stableOnRefreshImagesError(res.rejected);
    });
  }, [indexedDBServiceFromContext]);

  const addImages: UsePersistedImagesReturn["addImages"] = useCallback(
    async (draftsAndFilesOrUrls, options) => {
      const overwrite = options?.overwrite ?? false;

      let usedIds: Set<string> | undefined;
      if (!overwrite) {
        const allResult = await service.getAllRecords();

        if (allResult.rejected != null) {
          return processResults(
            draftsAndFilesOrUrls.map(() => reject({ reason: "AddImageFailed" })),
          );
        }

        const existing = allResult.accepted ?? [];
        usedIds = new Set(existing.map((r) => r.id));
      }

      const results: Result<ImageId, "AddImageFailed">[] = [];
      for (const item of draftsAndFilesOrUrls) {
        const id = createImageId(item.imageDraft.name, usedIds);

        const record: ImageRecord = isImageDraftStateAndUrl(item)
          ? { id, ...item.imageDraft, url: item.url }
          : { id, ...item.imageDraft, file: item.file };

        if (overwrite) {
          const upsertResult = await service.upsertRecord(record);

          if (upsertResult.rejected != null) {
            results.push(reject({ reason: "AddImageFailed", error: upsertResult.rejected.error }));
          } else {
            results.push(accept(id));
          }
        } else {
          const addResult = await service.addRecord(record);

          if (addResult.rejected != null) {
            results.push(reject({ reason: "AddImageFailed", error: addResult.rejected.error }));
          } else {
            results.push(accept(id));
            if (usedIds != null) usedIds.add(id);
          }
        }
      }

      const { accepted: ids } = processResults(results);

      if (ids.length > 0) await stableRefreshImages();

      return processResults(results);
    },
    [service],
  );

  const addImage: UsePersistedImagesReturn["addImage"] = useCallback(
    async (draftAndFileOrUrl, options) => {
      if (options != null && "id" in options && options.id != null) {
        // Explicit id (addImage only): overwrite implied; use upsertRecord.
        const id = options.id;

        const record: ImageRecord = isImageDraftStateAndUrl(draftAndFileOrUrl)
          ? { id, ...draftAndFileOrUrl.imageDraft, url: draftAndFileOrUrl.url }
          : { id, ...draftAndFileOrUrl.imageDraft, file: draftAndFileOrUrl.file };

        const upsertResult = await service.upsertRecord(record);

        if (upsertResult.rejected != null) {
          return reject({ reason: "AddImageFailed", error: upsertResult.rejected.error });
        }

        await stableRefreshImages();

        return accept(id);
      }

      const overwrite =
        options != null && "overwrite" in options ? (options.overwrite ?? false) : false;

      const { accepted: ids } = await addImages(
        [draftAndFileOrUrl],
        overwrite ? { overwrite: true } : undefined,
      );

      const id = ids[0];

      if (id != null) return accept(id);

      return reject({ reason: "AddImageFailed" });
    },
    [service, addImages],
  );

  const getImage: UsePersistedImagesReturn["getImage"] = useCallback(
    async (id) => {
      const result = await service.getRecord(id);
      return result.rejected != null ? undefined : result.accepted;
    },
    [service],
  );

  const updateImage: UsePersistedImagesReturn["updateImage"] = useCallback(
    async (id, updates) => {
      const getResult = await service.getRecord(id);
      if (getResult.rejected != null) return reject({ reason: "UpdateImageFailed" });

      const current = getResult.accepted;
      if (current == null) return accept(undefined);

      const updated: ImageRecord = hasFile(current)
        ? {
            ...current,
            ...updates,
            id,
            file: "file" in updates && updates.file !== undefined ? updates.file : current.file,
          }
        : hasUrl(current)
          ? {
              ...current,
              ...updates,
              id,
              url: "url" in updates && updates.url !== undefined ? updates.url : current.url,
            }
          : current;

      if (isEqual(current, updated)) return accept(id);

      const updateResult = await service.updateRecord(updated);

      if (updateResult.rejected != null) {
        return reject({ reason: "UpdateImageFailed", error: updateResult.rejected.error });
      }

      await stableRefreshImages();
      return accept(id);
    },
    [service],
  );

  const deleteImage: UsePersistedImagesReturn["deleteImage"] = useCallback(
    async (id) => {
      const result = await service.deleteRecord(id);
      if (result.rejected != null) return undefined;

      await stableRefreshImages();
      return id;
    },
    [service],
  );

  return {
    images,
    addImage,
    addImages,
    getImage,
    updateImage,
    deleteImage,
    refreshImages: stableRefreshImages,
  };
}
