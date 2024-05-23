"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchRoute = void 0;
const searchController_1 = require("../controllers/searchController");
function SearchRoute(fastify, _options, done) {
    fastify.get("/:search", {}, searchController_1.searchController.search);
    done();
}
exports.SearchRoute = SearchRoute;
