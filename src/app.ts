import cors from "cors";
import express from "express";
import { xss } from "express-xss-sanitizer";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { allowedOrigins } from "./config/cors.config";
import { envConfig } from "./config/env.config";
import { swaggerSpec } from "./config/swagger.config";
import { apiRateLimiter } from "./lib/rateLimiter";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { notFoundHandler } from "./middlewares/notFound.middleware";
import alertRouter from "./routers/alert.router";
import authRouter from "./routers/auth.router";
import balanceRouter from "./routers/balance.router";
import categoriesRouter from "./routers/categories.router";
import projectsRouter from "./routers/projects.router";

// ============== SETTINGS ==================

export const app = express();
app.set("trust proxy", 1); // Required for Render/reverse proxy
// CORS: allows external clients (frontend, tools, other APIs) to call the API
app.use(cors({ origin: allowedOrigins }));
// Helmet reinforces headers — skipped on Swagger routes,
// otherwise its CSP blocks the documentation's inline scripts
app.use((req, res, next) => {
	if (req.path === "/" || req.path.startsWith("/-/")) return next();
	helmet()(req, res, next);
});
// Parses JSON request bodies: required to read req.body in POST / PATCH / PUT requests. Using a limit for payload attacks
app.use(express.json({ limit: envConfig.jsonLimit }));
// XSS sanitizer: protects against malicious scripts injected in user input
app.use(xss());
// Rate limiter: basic protection against abuse and brute-force attempts
app.use(apiRateLimiter);

// ============== ROUTES ====================
app.use("/", swaggerUi.serve);
app.get("/", swaggerUi.setup(swaggerSpec));
app.use("/api/auth", authRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/balance", balanceRouter);
app.use("/api/alertes", alertRouter);

// ============== ERRORS HANDLERS ===========
// Only for integration tests on error handler :
if (process.env.NODE_ENV === "test") {
	app.get("/test/error", () => {
		throw new Error("Test error");
	});
}
app.use(notFoundHandler);
app.use(errorHandler);
