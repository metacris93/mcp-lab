import cors from "@fastify/cors";
import fastify from "fastify";
import { closeDatabase } from "./database/connection.js";
import { productRoutes } from "./routes/products.js";

const server = fastify({
	logger: {
		level: "info",
		transport: {
			target: "pino-pretty",
			options: {
				translateTime: "HH:MM:ss Z",
				ignore: "pid,hostname",
			},
		},
	},
});

// Register CORS
await server.register(cors, {
	origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
	credentials: true,
});

// Health check endpoint
server.get("/health", async (_request, _reply) => {
	return {
		status: "ok",
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
	};
});

// Register API routes
server.register(productRoutes, { prefix: "/api" });

// Global error handler
server.setErrorHandler((error, _request, reply) => {
	server.log.error(error);

	const statusCode = error.statusCode || 500;
	const message = error.message || "Internal server error";

	reply.status(statusCode).send({
		success: false,
		error: message,
		statusCode,
	});
});

// Not found handler
server.setNotFoundHandler((request, reply) => {
	reply.status(404).send({
		success: false,
		error: "Route not found",
		statusCode: 404,
		path: request.url,
	});
});

const start = async () => {
	try {
		// Start server
		const port = Number(process.env.PORT) || 3000;
		const host = process.env.HOST || "0.0.0.0";

		await server.listen({ port, host });
		server.log.info(`Server running on http://${host}:${port}`);
		server.log.info(`Health check available at http://${host}:${port}/health`);
		server.log.info(`API endpoints available at http://${host}:${port}/api`);
	} catch (error) {
		server.log.error(error);
		process.exit(1);
	}
};

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
	server.log.info(`Received ${signal}, shutting down gracefully...`);

	try {
		await server.close();
		closeDatabase();
		server.log.info("Server closed successfully");
		process.exit(0);
	} catch (error) {
		server.log.error(error);
		process.exit(1);
	}
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
	server.log.fatal(error, "Uncaught exception");
	process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
	server.log.fatal({ reason, promise }, "Unhandled rejection");
	process.exit(1);
});

start();
