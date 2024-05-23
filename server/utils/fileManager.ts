import { MultipartFile } from "@fastify/multipart";
import { pipeline } from  "stream/promises";
import { createWriteStream } from "fs";
import { rename, unlink } from "fs/promises";
import { randomBytes } from "crypto";
import path from "path";
import type { FileInfo } from "../types/global.d";
/**
 * Stores a file a the server folder
 *
 * @param multFile multipart file
 * @param location  sets the location of the file 'public' (default) for server/public dir and 'private' for server/private dir
 * @returns promise from the pipeline stream
 */
export async function storeFile(
  multFile: MultipartFile | undefined,
  location: "public" | "private" | "tmp" = "public",
): Promise<FileInfo> {
  if (multFile == undefined) {
    throw Error("undefined argument");
  }

  const extension: string = multFile.filename.substring(
    multFile.filename.lastIndexOf(".") + 1,
  );

  // If file is empty
  if (!extension) throw Error("File is empty");

  const filename: string = randomBytes(86).toString("base64url");
  try {
    await pipeline(
      multFile.file,
      createWriteStream(
        path.join(
          __dirname,
          `../${location}/${filename}.${extension}`,
        ),
      ),
    );
  } catch (error) {
    throw error;
  }

  return {
    filename: `${filename}.${extension}`,
    location,
    mimetype: multFile.mimetype,
    fieldname: multFile.fieldname,
    encoding: multFile.encoding,
    extension,
  };
}

/**
 * Cleans a folder by deleting all files in it
 *
 * @param filesInfo array of files to delete or a filename
 * @param folder folder to delete the files from
 */
export function removeFiles(
  filesInfo: (FileInfo | undefined | string)[] = [],
  folder: "public" | "private" | "tmp" = "tmp",
) {
  filesInfo.forEach((filesInfo) => {
    console.log({ filesInfo });
    if (filesInfo === undefined) return;
    if (typeof filesInfo === "string")
      return unlink(
        path.resolve(__dirname, `../${folder}/${filesInfo}`),
      );
    unlink(
      path.resolve(__dirname, `../${folder}/${filesInfo.filename}`),
    );
  });
}

/**
 * Move Temporary File to public or private folder
 * @param filesInfo
 * @param currentFolder folder where the file is currently located
 * @param targetFolder folder where the file will be moved
 */
export async function moveFile(
  filesInfo: (FileInfo | undefined | string)[],
  currentFolder: "public" | "private" | "tmp" = "tmp",
  targetFolder: "public" | "private" = "public",
) {
  filesInfo.forEach(async (fileInfo) => {
    console.log({ fileInfo });
    if (!fileInfo) return;
    if (typeof fileInfo !== "string") {
      await rename(
        path.resolve(
          __dirname,
          `../${currentFolder}/${fileInfo.filename}`,
        ),
        path.resolve(
          __dirname,
          `../${targetFolder}/${fileInfo.filename}`,
        ),
      );
    } else {
      await rename(
        path.resolve(__dirname, `../${currentFolder}/${fileInfo}`),
        path.resolve(__dirname, `../${targetFolder}/${fileInfo}`),
      );
    }
  });
}
