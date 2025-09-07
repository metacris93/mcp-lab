import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express, { type Request, type Response } from "express";
import { getServer } from "./server.js";

const app = express();

app.use(express.json());

app.post("/mcp", async (req: Request, res: Response) => {
	try {
		const server = getServer();
		const transport: StreamableHTTPServerTransport =
			new StreamableHTTPServerTransport({
				sessionIdGenerator: undefined,
			});
		res.on("close", () => {
			console.log("Request closed");
			transport.close();
			server.close();
		});
		await server.connect(transport);
		await transport.handleRequest(req, res, req.body);
	} catch (error) {
		console.error("Error handling MCP request:", error);
		if (!res.headersSent) {
			res.status(500).json({
				jsonrpc: "2.0",
				error: {
					code: -32603,
					message: "Internal server error",
				},
				id: null,
			});
		}
	}
});

const PORT = 3001;

app.listen(PORT, (error) => {
	if (error) {
		console.error("Failed to start server:", error);
		process.exit(1);
	}
	console.log(
		`MCP Stateless Streamable HTTP Server listening on port ${PORT}`,
	);
});
