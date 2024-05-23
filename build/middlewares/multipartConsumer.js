"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arbitraryMultipartConsumer = exports.multipartConsumer = void 0;
const fileManager_1 = require("../utils/fileManager");
/**
 * Multipart Consumer for non-arbitrary files and fields
 * body type = Record<string, string>
 * @param req
 * @param res
 */
async function multipartConsumer(req, res) {
    let body = {};
    if (!req.isMultipart() || req.isMultipart() === undefined)
        return;
    const parts = req.parts();
    try {
        for await (const part of parts) {
            // Store file to a temporary Folder
            if (part.type === "file") {
                console.log("file entered");
                if (part.file.truncated)
                    return res.status(413).send({ message: "File too large" });
                if (part.filename === undefined ||
                    part.filename === null ||
                    part.filename === "") {
                    part.file.on("data", () => { });
                    part.file.on("end", () => { });
                    continue;
                }
                (0, fileManager_1.storeFile)(part, "tmp")
                    .then((fileInfo) => {
                    body[part.fieldname] = fileInfo;
                })
                    .catch((error) => {
                    console.error("Error in Multiaprt Consumer", error);
                    body[part.fieldname] = null;
                });
            }
            else if (part.type === "field") {
                console.log({ fields: part.fieldname });
                body[part.fieldname] = part.value;
            }
        }
    }
    catch (error) {
        console.error("Error in Multiaprt Consumer", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
    finally {
        req.body = body;
        console.log({ body });
    }
}
exports.multipartConsumer = multipartConsumer;
/**
 * Multipart Consumer for arbitrary numner of files and fields
 * body type = Record<string, string> & media: {caption?: string, filename: string}[]
 * ? Client Side must have a field in the form Data for uploading medias ie. caption-[hash], image-[hash], video-[hash]
 * @param req
 * @param res
 * @returns
 */
async function arbitraryMultipartConsumer(req, res) {
    console.log({ isMultipart: req.isMultipart() });
    if (!req.isMultipart() || req.isMultipart() === undefined)
        return;
    const parts = req.parts();
    let body = {};
    const media = {};
    try {
        for await (const part of parts) {
            if (part.type === "field") {
                console.log({ field: true, fields: part.fieldname });
                if (part.fieldname.includes("caption-")) {
                    const hash = part.fieldname.split("-")[1];
                    if (media[hash] === undefined)
                        media[hash] = { caption: part.value, filename: null };
                    media[hash].caption = part.value;
                }
                else if (part.fieldname === "tags" &&
                    typeof part.value === "string") {
                    const tags = part.value.replace(/(\s|\[|\]|#)/g, "").split(",");
                    body[part.fieldname] = tags;
                }
                else
                    body[part.fieldname] = part.value;
            }
            if (part.type === "file") {
                console.log(`file Entered: ${part.fieldname}`);
                if (part.file.truncated)
                    return res.status(413).send({ message: "File too large" });
                if (part.fieldname.includes("image-") ||
                    part.fieldname.includes("video-")) {
                    const hash = part.fieldname.split("-")[1];
                    if (media[hash] === undefined)
                        media[hash] = {
                            caption: null,
                            filename: (await (0, fileManager_1.storeFile)(part, "tmp")).filename,
                        };
                    else
                        media[hash].filename = (await (0, fileManager_1.storeFile)(part, "tmp")).filename;
                }
            }
        }
    }
    catch (error) {
        console.error(error);
        throw error;
    }
    finally {
        req.body = {
            ...body,
            media: Object.values(media).filter((elem) => elem.filename !== null) ||
                undefined,
        };
    }
}
exports.arbitraryMultipartConsumer = arbitraryMultipartConsumer;
// function partsConsumer(pstyd )
