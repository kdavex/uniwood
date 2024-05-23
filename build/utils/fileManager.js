"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveFile = exports.removeFiles = exports.storeFile = void 0;
const promises_1 = require("stream/promises");
const fs_1 = require("fs");
const promises_2 = require("fs/promises");
const crypto_1 = require("crypto");
const path_1 = __importDefault(require("path"));
/**
 * Stores a file a the server folder
 *
 * @param multFile multipart file
 * @param location  sets the location of the file 'public' (default) for server/public dir and 'private' for server/private dir
 * @returns promise from the pipeline stream
 */
async function storeFile(multFile, location = "public") {
    if (multFile == undefined) {
        throw Error("undefined argument");
    }
    const extension = multFile.filename.substring(multFile.filename.lastIndexOf(".") + 1);
    // If file is empty
    if (!extension)
        throw Error("File is empty");
    const filename = (0, crypto_1.randomBytes)(86).toString("base64url");
    try {
        await (0, promises_1.pipeline)(multFile.file, (0, fs_1.createWriteStream)(path_1.default.join(__dirname, `../${location}/${filename}.${extension}`)));
    }
    catch (error) {
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
exports.storeFile = storeFile;
/**
 * Cleans a folder by deleting all files in it
 *
 * @param filesInfo array of files to delete or a filename
 * @param folder folder to delete the files from
 */
function removeFiles(filesInfo = [], folder = "tmp") {
    filesInfo.forEach((filesInfo) => {
        console.log({ filesInfo });
        if (filesInfo === undefined)
            return;
        if (typeof filesInfo === "string")
            return (0, promises_2.unlink)(path_1.default.resolve(__dirname, `../${folder}/${filesInfo}`));
        (0, promises_2.unlink)(path_1.default.resolve(__dirname, `../${folder}/${filesInfo.filename}`));
    });
}
exports.removeFiles = removeFiles;
/**
 * Move Temporary File to public or private folder
 * @param filesInfo
 * @param currentFolder folder where the file is currently located
 * @param targetFolder folder where the file will be moved
 */
async function moveFile(filesInfo, currentFolder = "tmp", targetFolder = "public") {
    filesInfo.forEach(async (fileInfo) => {
        console.log({ fileInfo });
        if (!fileInfo)
            return;
        if (typeof fileInfo !== "string") {
            await (0, promises_2.rename)(path_1.default.resolve(__dirname, `../${currentFolder}/${fileInfo.filename}`), path_1.default.resolve(__dirname, `../${targetFolder}/${fileInfo.filename}`));
        }
        else {
            await (0, promises_2.rename)(path_1.default.resolve(__dirname, `../${currentFolder}/${fileInfo}`), path_1.default.resolve(__dirname, `../${targetFolder}/${fileInfo}`));
        }
    });
}
exports.moveFile = moveFile;
