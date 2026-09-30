import type { FileDTO, IFileModuleService } from "@medusajs/framework/types";
import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { Modules } from "@medusajs/framework/utils";
import { MEDIA_LIBRARY_MODULE } from "../../modules/media-library";
import type MediaLibraryModuleService from "../../modules/media-library/service";
import {
  isMediaSha256UniqueViolation,
  sha256FromBase64,
} from "../../utils/media-content-hash";

export type UploadAdminMediaInput = {
  files: Array<{
    filename: string;
    mimeType: string;
    content: string;
    access: "public" | "private";
    size: number;
  }>;
  uploaded_by?: string | null;
};

type UploadCompensation = {
  assetIds: string[];
  fileIds: string[];
};

type MediaAssetResult = {
  id: string;
  file_key: string;
  url: string;
};

async function cleanUpCreatedMedia(
  mediaService: MediaLibraryModuleService,
  fileService: IFileModuleService,
  compensation: UploadCompensation,
) {
  if (compensation.assetIds.length) {
    await mediaService.deleteMediaAssets(compensation.assetIds);
  }

  if (compensation.fileIds.length) {
    await fileService.deleteFiles(compensation.fileIds);
  }
}

async function findMediaBySha256(
  mediaService: MediaLibraryModuleService,
  sha256: string,
) {
  const assets = await mediaService.listMediaAssets(
    { sha256 },
    { take: 1, order: { created_at: "ASC" } },
  );

  return assets[0] as MediaAssetResult | undefined;
}

const deduplicateAndUploadAdminMediaStep = createStep(
  "deduplicate-and-upload-admin-media",
  async (input: UploadAdminMediaInput, { container }) => {
    const mediaService =
      container.resolve<MediaLibraryModuleService>(MEDIA_LIBRARY_MODULE);
    const fileService = container.resolve<IFileModuleService>(Modules.FILE);
    const compensation: UploadCompensation = { assetIds: [], fileIds: [] };
    const resolvedByHash = new Map<string, MediaAssetResult>();
    const result: FileDTO[] = [];

    try {
      for (const inputFile of input.files) {
        const isImage = inputFile.mimeType.startsWith("image/");
        const sha256 = isImage
          ? sha256FromBase64(inputFile.content)
          : undefined;

        if (sha256) {
          const known =
            resolvedByHash.get(sha256) ||
            (await findMediaBySha256(mediaService, sha256));

          if (known) {
            resolvedByHash.set(sha256, known);
            result.push({ id: known.file_key, url: known.url });
            continue;
          }
        }

        const stored = await fileService.createFiles({
          filename: inputFile.filename,
          mimeType: inputFile.mimeType,
          content: inputFile.content,
          access: inputFile.access,
        });
        compensation.fileIds.push(stored.id);

        if (!sha256) {
          result.push(stored);
          continue;
        }

        try {
          const [asset] = await mediaService.createMediaAssets([
            {
              file_key: stored.id,
              url: stored.url,
              filename: inputFile.filename,
              mime_type: inputFile.mimeType,
              size: inputFile.size,
              sha256,
              uploaded_by: input.uploaded_by || null,
              source: "admin_upload" as const,
            },
          ]);

          compensation.assetIds.push(asset.id);
          resolvedByHash.set(sha256, asset as MediaAssetResult);
          result.push(stored);
        } catch (error) {
          if (!isMediaSha256UniqueViolation(error)) {
            throw error;
          }

          const winner = await findMediaBySha256(mediaService, sha256);
          if (!winner) {
            throw error;
          }

          await fileService.deleteFiles(stored.id);
          compensation.fileIds = compensation.fileIds.filter(
            (id) => id !== stored.id,
          );
          resolvedByHash.set(sha256, winner);
          result.push({ id: winner.file_key, url: winner.url });
        }
      }

      return new StepResponse(result, compensation);
    } catch (error) {
      await cleanUpCreatedMedia(mediaService, fileService, compensation).catch(
        () => undefined,
      );
      throw error;
    }
  },
  async (compensation: UploadCompensation | undefined, { container }) => {
    if (!compensation) {
      return;
    }

    await cleanUpCreatedMedia(
      container.resolve<MediaLibraryModuleService>(MEDIA_LIBRARY_MODULE),
      container.resolve<IFileModuleService>(Modules.FILE),
      compensation,
    );
  },
);

export const uploadAdminMediaWorkflow = createWorkflow(
  "upload-admin-media",
  function (input: UploadAdminMediaInput) {
    const files = deduplicateAndUploadAdminMediaStep(input);

    return new WorkflowResponse(files);
  },
);
