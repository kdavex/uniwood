"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsRoute = void 0;
const projectController_1 = __importDefault(require("../controllers/projectController"));
const authorize_1 = require("../middlewares/authorize");
const projectHandler_1 = require("../services/projectHandler");
function ProjectsRoute(instance, _option, done) {
    instance.get("/", { preValidation: [(0, authorize_1.authorize)("ANY")] }, projectController_1.default.getProjects);
    instance.get("/:projectId", { preValidation: [(0, authorize_1.authorize)("ANY")] }, projectController_1.default.getProjectById);
    instance.post("/", {
        preValidation: [(0, authorize_1.authorize)("ANY"), projectHandler_1.projectsCustomMultipartConsumer],
        onResponse: [projectHandler_1.projectPostOnresponseHander],
    }, projectController_1.default.createProject);
    instance.put("/", {
        preValidation: [(0, authorize_1.authorize)("ANY"), projectHandler_1.projectsCustomMultipartConsumer],
        onResponse: [projectHandler_1.projectPutOnResponeseHandler],
    }, projectController_1.default.updateProject);
    instance.delete("/:projectId", { preValidation: [(0, authorize_1.authorize)("ANY")] }, projectController_1.default.deleteProject);
    instance.patch("/likeToggle/:projectId", { preValidation: [(0, authorize_1.authorize)("ANY")] }, projectController_1.default.projectLikeToggle);
    done();
}
exports.ProjectsRoute = ProjectsRoute;
