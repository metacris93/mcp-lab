import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ProductService } from "./ProductService.js";

// Configuration
const API_BASE_URL = process.env.PRODUCT_API_URL || "http://localhost:3000/api";

// Initialize ProductService
const productService = new ProductService(API_BASE_URL);

const createServer = () => {
	const server = new McpServer({
		name: "Product Management",
		version: "0.1.0",
		capabilities: {
			resources: {},
			tools: {},
		},
	});
	// Create Product Tool
	server.registerTool(
		"create_product",
		{
			title: "Create Product",
			description: "Create a new product in the inventory",
			inputSchema: {
				name: z.string().describe("Product name"),
				description: z.string().describe("Product description"),
				price: z.number().min(0).describe("Product price"),
				sku: z.string().describe("Product SKU (unique identifier)"),
				stockQuantity: z
					.number()
					.int()
					.min(0)
					.optional()
					.describe("Initial stock quantity (default: 0)"),
			},
		},
		async ({ name, description, price, sku, stockQuantity = 0 }) => {
			try {
				const product = await productService.createProduct({
					name,
					description,
					price,
					sku,
					stockQuantity,
				});

				return {
					content: [
						{
							type: "text",
							text: `✅ Product created successfully!\n\nID: ${product.id}\nName: ${product.name}\nSKU: ${product.sku}\nPrice: $${product.price}\nStock: ${product.stockQuantity}`,
						},
					],
				};
			} catch (error) {
				return {
					content: [
						{
							type: "text",
							text: `❌ Error creating product: ${error instanceof Error ? error.message : "Unknown error"}`,
						},
					],
				};
			}
		},
	);

	// Get Products Tool
	server.registerTool(
		"get_products",
		{
			title: "Get Products",
			description: "Retrieve products from inventory with optional filtering",
			inputSchema: {
				name: z
					.string()
					.optional()
					.describe("Filter by product name (partial match)"),
				sku: z.string().optional().describe("Filter by SKU (partial match)"),
				minPrice: z.number().min(0).optional().describe("Minimum price filter"),
				maxPrice: z.number().min(0).optional().describe("Maximum price filter"),
				minStock: z
					.number()
					.int()
					.min(0)
					.optional()
					.describe("Minimum stock quantity"),
				maxStock: z
					.number()
					.int()
					.min(0)
					.optional()
					.describe("Maximum stock quantity"),
				limit: z
					.number()
					.int()
					.min(1)
					.max(100)
					.optional()
					.describe("Number of products to return (max 100)"),
				offset: z
					.number()
					.int()
					.min(0)
					.optional()
					.describe("Number of products to skip"),
			},
		},
		async ({
			name,
			sku,
			minPrice,
			maxPrice,
			minStock,
			maxStock,
			limit,
			offset,
		}) => {
			try {
				const filters = {
					name,
					sku,
					minPrice,
					maxPrice,
					minStock,
					maxStock,
					limit,
					offset,
				};

				const result = await productService.getProducts(filters);

				if (result.data.length === 0) {
					return {
						content: [
							{
								type: "text",
								text: "📦 No products found matching the criteria.",
							},
						],
					};
				}

				const productList = result.data
					.map(
						(product) =>
							`• **${product.name}** (${product.sku})\n  Price: $${product.price} | Stock: ${product.stockQuantity}\n  ${product.description}`,
					)
					.join("\n\n");

				const paginationInfo = result.pagination
					? `\n\n📊 **Pagination**: ${result.pagination.offset + 1}-${Math.min(result.pagination.offset + result.pagination.limit, result.pagination.total)} of ${result.pagination.total} products`
					: "";

				return {
					content: [
						{
							type: "text",
							text: `📦 **Products Found:**\n\n${productList}${paginationInfo}`,
						},
					],
				};
			} catch (error) {
				return {
					content: [
						{
							type: "text",
							text: `❌ Error retrieving products: ${error instanceof Error ? error.message : "Unknown error"}`,
						},
					],
				};
			}
		},
	);

	// Get Product by ID Tool
	server.registerTool(
		"get_product_by_id",
		{
			title: "Get Product by ID",
			description: "Retrieve a specific product by its ID",
			inputSchema: {
				id: z.string().describe("Product ID (UUID)"),
			},
		},
		async ({ id }) => {
			try {
				const product = await productService.getProductById(id);

				return {
					content: [
						{
							type: "text",
							text: `📦 **Product Details:**\n\n**ID:** ${product.id}\n**Name:** ${product.name}\n**SKU:** ${product.sku}\n**Description:** ${product.description}\n**Price:** $${product.price}\n**Stock:** ${product.stockQuantity}\n**Created:** ${new Date(product.createdAt).toLocaleString()}\n**Updated:** ${new Date(product.updatedAt).toLocaleString()}`,
						},
					],
				};
			} catch (error) {
				return {
					content: [
						{
							type: "text",
							text: `❌ Error retrieving product: ${error instanceof Error ? error.message : "Unknown error"}`,
						},
					],
				};
			}
		},
	);

	// Update Product Tool
	server.registerTool(
		"update_product",
		{
			title: "Update Product",
			description: "Update an existing product's information",
			inputSchema: {
				id: z.string().describe("Product ID (UUID)"),
				name: z.string().optional().describe("New product name"),
				description: z.string().optional().describe("New product description"),
				price: z.number().min(0).optional().describe("New product price"),
				sku: z.string().optional().describe("New product SKU"),
				stockQuantity: z
					.number()
					.int()
					.min(0)
					.optional()
					.describe("New stock quantity"),
			},
		},
		async ({ id, name, description, price, sku, stockQuantity }) => {
			try {
				const updates = {
					name,
					description,
					price,
					sku,
					stockQuantity,
				};

				// Remove undefined values
				const filteredUpdates = Object.fromEntries(
					Object.entries(updates).filter(([_, v]) => v !== undefined),
				);

				if (Object.keys(filteredUpdates).length === 0) {
					return {
						content: [
							{
								type: "text",
								text: "⚠️ No fields provided for update. Please specify at least one field to update.",
							},
						],
					};
				}

				const product = await productService.updateProduct(id, filteredUpdates);

				return {
					content: [
						{
							type: "text",
							text: `✅ Product updated successfully!\n\n**Updated Product:**\n**ID:** ${product.id}\n**Name:** ${product.name}\n**SKU:** ${product.sku}\n**Price:** $${product.price}\n**Stock:** ${product.stockQuantity}\n**Description:** ${product.description}`,
						},
					],
				};
			} catch (error) {
				return {
					content: [
						{
							type: "text",
							text: `❌ Error updating product: ${error instanceof Error ? error.message : "Unknown error"}`,
						},
					],
				};
			}
		},
	);

	// Delete Product Tool
	server.registerTool(
		"delete_product",
		{
			title: "Delete Product",
			description: "Delete a product from the inventory",
			inputSchema: {
				id: z.string().describe("Product ID (UUID)"),
			},
		},
		async ({ id }) => {
			try {
				await productService.deleteProduct(id);

				return {
					content: [
						{
							type: "text",
							text: `✅ Product with ID ${id} has been deleted successfully.`,
						},
					],
				};
			} catch (error) {
				return {
					content: [
						{
							type: "text",
							text: `❌ Error deleting product: ${error instanceof Error ? error.message : "Unknown error"}`,
						},
					],
				};
			}
		},
	);

	// Update Stock Tool
	server.registerTool(
		"update_product_stock",
		{
			title: "Update Product Stock",
			description: "Add or subtract stock quantity for a product",
			inputSchema: {
				id: z.string().describe("Product ID (UUID)"),
				quantity: z
					.number()
					.int()
					.describe("Quantity to add (positive) or subtract (negative)"),
			},
		},
		async ({ id, quantity }) => {
			try {
				const product = await productService.updateProductStock(id, quantity);

				const action = quantity > 0 ? "added to" : "removed from";
				const absQuantity = Math.abs(quantity);

				return {
					content: [
						{
							type: "text",
							text: `✅ Stock updated successfully!\n\n${absQuantity} units ${action} inventory.\n\n**Updated Product:**\n**Name:** ${product.name}\n**SKU:** ${product.sku}\n**Current Stock:** ${product.stockQuantity}`,
						},
					],
				};
			} catch (error) {
				return {
					content: [
						{
							type: "text",
							text: `❌ Error updating stock: ${error instanceof Error ? error.message : "Unknown error"}`,
						},
					],
				};
			}
		},
	);
    return server;
};

export const getServer = () => createServer();
