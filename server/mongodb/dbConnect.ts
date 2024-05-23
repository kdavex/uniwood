import { Db, MongoClient } from "mongodb";
import path from "node:path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export class MongodbInstane {
  private static client = new MongoClient(process.env.DATABASE_URL!);
  private static dbInstance: Db | null;

  async getDbInstance() {
    if (!MongodbInstane.dbInstance) {
      MongodbInstane.dbInstance = await (
        await MongodbInstane.client.connect()
      ).db(process.env.DATABASE_NAME!);
      console.log("Database Connected");
      // MongodbInstane.dbInstance = MongodbInstane.client.db("uniwood");
    }
    return MongodbInstane.dbInstance;
  }
}
