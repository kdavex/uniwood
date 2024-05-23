"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongodbInstane = void 0;
const mongodb_1 = require("mongodb");
const node_path_1 = __importDefault(require("node:path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: node_path_1.default.resolve(__dirname, "../../.env") });
class MongodbInstane {
    async getDbInstance() {
        if (!MongodbInstane.dbInstance) {
            MongodbInstane.dbInstance = await (await MongodbInstane.client.connect()).db(process.env.DATABASE_NAME);
            console.log("Database Connected");
            // MongodbInstane.dbInstance = MongodbInstane.client.db("uniwood");
        }
        return MongodbInstane.dbInstance;
    }
}
exports.MongodbInstane = MongodbInstane;
MongodbInstane.client = new mongodb_1.MongoClient(process.env.DATABASE_URL);
