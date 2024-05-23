"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const projectQuery_1 = require("../models/projectQuery");
const reqTools_1 = require("../utils/reqTools");
const fileManager_1 = require("../utils/fileManager");
// const createProject = async ({tags: string })
const createProject = async (req, res) => {
    // Check if required fields are present
    const missingFields = (0, reqTools_1.requestFieldChecker)(["title", "context", "tags", "media"], req);
    if (missingFields.length > 0)
        return res
            .code(400)
            .send({ status: "error", message: "Missing required fields" });
    await (0, projectQuery_1.createProject)({
        author_id: req.userId,
        title: req.body.title,
        context: req.body.context,
        media: req.body.media,
        tags: req.body.tags,
    }, req.prisma);
    // Move file to public folder
    req.body.media.forEach(async (elem) => {
        await (0, fileManager_1.moveFile)([elem.filename], "tmp", "public");
    });
    return res.code(201).send({
        status: "success",
        message: "Project created",
    });
};
const getProjectById = async (req, res) => {
    if (!req.params.projectId)
        return res
            .code(400)
            .send({ status: "error", message: "Project id is required" });
    const project = await (0, projectQuery_1.getProjectById)(req.params.projectId, req.prisma);
    return res.code(200).send({ status: "success", data: project });
};
const getProjects = async (req, res) => {
    const projects = await (0, projectQuery_1.getProjects)(req.prisma);
    return res.code(200).send({ status: "success", data: projects });
};
const deleteProject = async (req, res) => {
    if (!req.params.projectId)
        return res
            .code(404)
            .send({ status: "error", message: "Project id is required" });
    await (0, projectQuery_1.deleteProject)(req.params.projectId, req.prisma);
    return res.code(200).send({ status: "success", message: "Project deleted" });
};
const updateProject = async (req, res) => {
    // Check if project exist
    const missingFields = (0, reqTools_1.requestFieldChecker)(["projectId", "title", "tags", "context", "media"], req);
    if (missingFields.length > 0)
        return res.code(400).send({
            status: "error",
            message: "Missing required fields",
            error: missingFields,
        });
    try {
        await (0, projectQuery_1.updateProject)({
            projectId: req.body.projectId,
            title: req.body.title,
            tags: req.body.tags || [],
            context: req.body.context,
            media: req.body.media,
        }, req.prisma);
    }
    catch (error) {
        return res
            .code(500)
            .send({ status: "success", message: "Unexpected Error Occured", error });
    }
    req.body.media.forEach((elem) => {
        (0, fileManager_1.moveFile)([elem.filename], "tmp", "public");
    });
    return res.code(200).send({ status: "success", message: "Project updated" });
};
const projectLikeToggle = async (req, res) => {
    try {
        await (0, projectQuery_1.projectLikeToggle)({ userId: req.userId, projectId: req.params.projectId }, req.prisma);
    }
    catch (error) {
        console.log(error);
        return res.code(500).send({
            status: "fail",
            message: "Unexpected Error Occured",
            error: error.message,
        });
    }
    return res.code(200).send({ status: "success", message: "Project liked" });
};
const projectController = {
    createProject,
    getProjectById,
    getProjects,
    deleteProject,
    updateProject,
    projectLikeToggle,
};
exports.default = projectController;
