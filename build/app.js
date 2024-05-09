export default function App(instance, _options, done) {
    // ===== Core Plugin ===== //
    instance.register(import("@fastify/cors"), {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type"],
    });
    instance.get("/test", async (_req, res) => {
        return res.code(200).send({ status: "success", message: "Test Route" });
    });
    instance.get("/", async (_req, res) => {
        return res
            .code(200)
            .send({ status: "success", message: "Welcome to the API" });
    });
    done();
}
