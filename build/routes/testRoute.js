"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestRoute = void 0;
const multipartConsumer_1 = require("../middlewares/multipartConsumer");
const fileManager_1 = require("../utils/fileManager");
function TestRoute(instance, _options, done) {
    instance.post("/test", { preHandler: multipartConsumer_1.arbitraryMultipartConsumer }, async (req, res) => {
        (0, fileManager_1.moveFile)(req.body.media, "tmp", "public");
        return res.send({ message: "success", body: { ...req.body } });
    });
    done();
}
exports.TestRoute = TestRoute;
