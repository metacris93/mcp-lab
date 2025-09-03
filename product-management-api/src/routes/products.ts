import type { FastifyInstance } from "fastify";
import { ProductController } from "../controllers/ProductController.js";

export async function productRoutes(fastify: FastifyInstance) {
	const productController = new ProductController();

	// GET /api/products - Get all products with optional filters
	fastify.get("/products", {
		schema: {
			description: "Get all products with optional filtering and pagination",
			tags: ["products"],
			querystring: {
				type: "object",
				properties: {
					name: { type: "string", description: "Filter by product name" },
					sku: { type: "string", description: "Filter by SKU" },
					minPrice: { type: "number", description: "Minimum price filter" },
					maxPrice: { type: "number", description: "Maximum price filter" },
					minStock: { type: "integer", description: "Minimum stock quantity" },
					maxStock: { type: "integer", description: "Maximum stock quantity" },
					limit: { type: "integer", minimum: 1, maximum: 100, default: 50 },
					offset: { type: "integer", minimum: 0, default: 0 },
				},
			},
			response: {
				200: {
					type: "object",
					properties: {
						success: { type: "boolean" },
						data: {
							type: "array",
							items: {
								type: "object",
								properties: {
									id: { type: "string" },
									name: { type: "string" },
									description: { type: "string" },
									price: { type: "number" },
									sku: { type: "string" },
									stockQuantity: { type: "integer" },
									createdAt: { type: "string" },
									updatedAt: { type: "string" },
								},
							},
						},
						pagination: {
							type: "object",
							properties: {
								total: { type: "integer" },
								limit: { type: "integer" },
								offset: { type: "integer" },
								hasMore: { type: "boolean" },
							},
						},
					},
				},
			},
		},
		handler: productController.getAllProducts.bind(productController),
	});

	// GET /api/products/:id - Get product by ID
	fastify.get("/products/:id", {
		schema: {
			description: "Get a product by ID",
			tags: ["products"],
			params: {
				type: "object",
				required: ["id"],
				properties: {
					id: { type: "string", format: "uuid" },
				},
			},
			response: {
				200: {
					type: "object",
					properties: {
						success: { type: "boolean" },
						data: {
							type: "object",
							properties: {
								id: { type: "string" },
								name: { type: "string" },
								description: { type: "string" },
								price: { type: "number" },
								sku: { type: "string" },
								stockQuantity: { type: "integer" },
								createdAt: { type: "string" },
								updatedAt: { type: "string" },
							},
						},
					},
				},
				404: {
					type: "object",
					properties: {
						success: { type: "boolean" },
						error: { type: "string" },
					},
				},
			},
		},
		handler: productController.getProductById.bind(productController),
	});

	// POST /api/products - Create new product
	fastify.post("/products", {
		schema: {
			description: "Create a new product",
			tags: ["products"],
			body: {
				type: "object",
				required: ["name", "description", "price", "sku"],
				properties: {
					name: { type: "string", minLength: 1, maxLength: 255 },
					description: { type: "string", minLength: 1 },
					price: { type: "number", minimum: 0 },
					sku: { type: "string", minLength: 1, maxLength: 100 },
					stockQuantity: { type: "integer", minimum: 0, default: 0 },
				},
			},
			response: {
				201: {
					type: "object",
					properties: {
						success: { type: "boolean" },
						data: {
							type: "object",
							properties: {
								id: { type: "string" },
								name: { type: "string" },
								description: { type: "string" },
								price: { type: "number" },
								sku: { type: "string" },
								stockQuantity: { type: "integer" },
								createdAt: { type: "string" },
								updatedAt: { type: "string" },
							},
						},
						message: { type: "string" },
					},
				},
				400: {
					type: "object",
					properties: {
						success: { type: "boolean" },
						error: { type: "string" },
					},
				},
				409: {
					type: "object",
					properties: {
						success: { type: "boolean" },
						error: { type: "string" },
					},
				},
			},
		},
		handler: productController.createProduct.bind(productController),
	});

	// PUT /api/products/:id - Update product
	fastify.put("/products/:id", {
		schema: {
			description: "Update a product",
			tags: ["products"],
			params: {
				type: "object",
				required: ["id"],
				properties: {
					id: { type: "string", format: "uuid" },
				},
			},
			body: {
				type: "object",
				properties: {
					name: { type: "string", minLength: 1, maxLength: 255 },
					description: { type: "string", minLength: 1 },
					price: { type: "number", minimum: 0 },
					sku: { type: "string", minLength: 1, maxLength: 100 },
					stockQuantity: { type: "integer", minimum: 0 },
				},
			},
			response: {
				200: {
					type: "object",
					properties: {
						success: { type: "boolean" },
						data: {
							type: "object",
							properties: {
								id: { type: "string" },
								name: { type: "string" },
								description: { type: "string" },
								price: { type: "number" },
								sku: { type: "string" },
								stockQuantity: { type: "integer" },
								createdAt: { type: "string" },
								updatedAt: { type: "string" },
							},
						},
						message: { type: "string" },
					},
				},
				404: {
					type: "object",
					properties: {
						success: { type: "boolean" },
						error: { type: "string" },
					},
				},
			},
		},
		handler: productController.updateProduct.bind(productController),
	});

	// DELETE /api/products/:id - Delete product
	fastify.delete("/products/:id", {
		schema: {
			description: "Delete a product",
			tags: ["products"],
			params: {
				type: "object",
				required: ["id"],
				properties: {
					id: { type: "string", format: "uuid" },
				},
			},
			response: {
				204: {
					type: "null",
					description: "Product deleted successfully",
				},
				404: {
					type: "object",
					properties: {
						success: { type: "boolean" },
						error: { type: "string" },
					},
				},
			},
		},
		handler: productController.deleteProduct.bind(productController),
	});

	// PATCH /api/products/:id/stock - Update product stock
	fastify.patch("/products/:id/stock", {
		schema: {
			description: "Update product stock quantity",
			tags: ["products"],
			params: {
				type: "object",
				required: ["id"],
				properties: {
					id: { type: "string", format: "uuid" },
				},
			},
			body: {
				type: "object",
				required: ["quantity"],
				properties: {
					quantity: {
						type: "number",
						description: "Quantity to add/subtract from current stock",
					},
				},
			},
			response: {
				200: {
					type: "object",
					properties: {
						success: { type: "boolean" },
						data: {
							type: "object",
							properties: {
								id: { type: "string" },
								name: { type: "string" },
								description: { type: "string" },
								price: { type: "number" },
								sku: { type: "string" },
								stockQuantity: { type: "integer" },
								createdAt: { type: "string" },
								updatedAt: { type: "string" },
							},
						},
						message: { type: "string" },
					},
				},
				400: {
					type: "object",
					properties: {
						success: { type: "boolean" },
						error: { type: "string" },
					},
				},
				404: {
					type: "object",
					properties: {
						success: { type: "boolean" },
						error: { type: "string" },
					},
				},
			},
		},
		handler: productController.updateStock.bind(productController),
	});
}
