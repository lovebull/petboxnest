import type {
  IFileModuleService,
  MedusaContainer,
} from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils";
import { MEDIA_LIBRARY_MODULE } from "../modules/media-library";
import type MediaLibraryModuleService from "../modules/media-library/service";
import {
  isMediaSha256UniqueViolation,
  sha256FromBuffer,
} from "../utils/media-content-hash";

const PAGE_SIZE = 500;

type MediaAssetForBackfill = {
  id: string;
  file_key: string;
  filename: string;
  sha256: string | null;
};

async function listAllMediaAssets(service: MediaLibraryModuleService) {
  const assets: MediaAssetForBackfill[] = [];
  let skip = 0;

  while (true) {
    const page = (await service.listMediaAssets(
      {},
      {
        skip,
        take: PAGE_SIZE,
        order: { created_at: "ASC" },
        select: ["id", "file_key", "filename", "sha256"],
      },
    )) as MediaAssetForBackfill[];
    assets.push(...page);

    if (page.length < PAGE_SIZE) {
      return assets;
    }

    skip += PAGE_SIZE;
  }
}

export default async function backfillMediaContentHashes({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const mediaService =
    container.resolve<MediaLibraryModuleService>(MEDIA_LIBRARY_MODULE);
  const fileService = container.resolve<IFileModuleService>(Modules.FILE);
  const provider = fileService.getProvider();
  const assets = await listAllMediaAssets(mediaService);
  const canonicalByHash = new Map<string, string>();
  let backfilled = 0;
  let duplicates = 0;
  let failed = 0;

  for (const asset of assets) {
    if (asset.sha256) {
      canonicalByHash.set(asset.sha256, asset.id);
      continue;
    }

    try {
      const content = await provider.getAsBuffer({ fileKey: asset.file_key });
      const sha256 = sha256FromBuffer(content);

      if (canonicalByHash.has(sha256)) {
        duplicates += 1;
        logger.info(
          `Duplicate media left unhashed for cleanup: ${asset.filename} (${asset.id})`,
        );
        continue;
      }

      try {
        await mediaService.updateMediaAssets({ id: asset.id, sha256 });
        canonicalByHash.set(sha256, asset.id);
        backfilled += 1;
      } catch (error) {
        if (!isMediaSha256UniqueViolation(error)) {
          throw error;
        }

        duplicates += 1;
      }
    } catch (error) {
      failed += 1;
      logger.error(
        `Unable to hash media ${asset.filename} (${asset.id}): ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  logger.info(
    `Media hash backfill complete: ${backfilled} canonical, ${duplicates} duplicate, ${failed} failed.`,
  );

  if (failed) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      `${failed} media files could not be hashed`,
    );
  }
}
