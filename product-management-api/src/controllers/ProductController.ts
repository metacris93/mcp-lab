import type { FastifyReply, FastifyRequest } from "fastify";
import {
	type CreateProductRequest,
	createProductSchema,
	type ProductParams,
	type ProductResponse,
	productParamsSchema,
	type QueryProductsRequest,
	queryProductsSchema,
	type UpdateProductRequest,
	updateProductSchema,
} from "../models/product.js";
import { ProductService } from "../services/ProductService.js";

export class ProductController {
	private productService: ProductService;

	constructor() {
		this.productService = new ProductService();
	}

	async createProduct(
		request: FastifyRequest<{ Body: CreateProductRequest }>,
		reply: FastifyReply,
	): Promise<ProductResponse> {
		try {
			// Validate request body
			const validatedData = createProductSchema.parse(request.body);

			const product = await this.productService.createProduct(validatedData);

			return reply.code(201).send({
				success: true,
				data: product,
				message: "Product created successfully",
			});
		} catch (error) {
			if (error instanceof Error) {
				if (error.message.includes("already exists")) {
					return reply.code(409).send({
						success: false,
						error: error.message,
					});
				}
				return reply.code(400).send({
					success: false,
					error: error.message,
				});
			}
			return reply.code(500).send({
				success: false,
				error: "Internal server error",
			});
		}
	}

	async getProductById(
		request: FastifyRequest<{ Params: ProductParams }>,
		reply: FastifyReply,
	): Promise<ProductResponse> {
		try {
			// Validate params
			const { id } = productParamsSchema.parse(request.params);

			const product = await this.productService.getProductById(id);

			if (!product) {
				return reply.code(404).send({
					success: false,
					error: "Product not found",
				});
			}

			return reply.send({
				success: true,
				data: product,
			});
		} catch (error) {
			if (error instanceof Error) {
				return reply.code(400).send({
					success: false,
					error: error.message,
				});
			}
			return reply.code(500).send({
				success: false,
				error: "Internal server error",
			});
		}
	}

	async getAllProducts(
		request: FastifyRequest<{ Querystring: QueryProductsRequest }>,
		reply: FastifyReply,
	) {
		try {
			// Validate query parameters
			const validatedQuery = queryProductsSchema.parse(request.query);

			const result = await this.productService.getAllProducts(validatedQuery);

			return reply.send(result);
		} catch (error) {
			if (error instanceof Error) {
				return reply.code(400).send({
					success: false,
					error: error.message,
				});
			}
			return reply.code(500).send({
				success: false,
				error: "Internal server error",
			});
		}
	}

	async updateProduct(
		request: FastifyRequest<{
			Params: ProductParams;
			Body: UpdateProductRequest;
		}>,
		reply: FastifyReply,
	): Promise<ProductResponse> {
		try {
			// Validate params and body
			const { id } = productParamsSchema.parse(request.params);
			const validatedData = updateProductSchema.parse(request.body);

			// Check if there's actually data to update
			if (Object.keys(validatedData).length === 0) {
				return reply.code(400).send({
					success: false,
					error: "No valid fields provided for update",
				});
			}

			const product = await this.productService.updateProduct(
				id,
				validatedData,
			);

			return reply.send({
				success: true,
				data: product,
				message: "Product updated successfully",
			});
		} catch (error) {
			if (error instanceof Error) {
				if (error.message.includes("not found")) {
					return reply.code(404).send({
						success: false,
						error: error.message,
					});
				}
				if (error.message.includes("already exists")) {
					return reply.code(409).send({
						success: false,
						error: error.message,
					});
				}
				return reply.code(400).send({
					success: false,
					error: error.message,
				});
			}
			return reply.code(500).send({
				success: false,
				error: "Internal server error",
			});
		}
	}

	async deleteProduct(
		request: FastifyRequest<{ Params: ProductParams }>,
		reply: FastifyReply,
	): Promise<ProductResponse> {
		try {
			// Validate params
			const { id } = productParamsSchema.parse(request.params);

			await this.productService.deleteProduct(id);

			return reply.code(204).send();
		} catch (error) {
			if (error instanceof Error) {
				if (error.message.includes("not found")) {
					return reply.code(404).send({
						success: false,
						error: error.message,
					});
				}
				return reply.code(400).send({
					success: false,
					error: error.message,
				});
			}
			return reply.code(500).send({
				success: false,
				error: "Internal server error",
			});
		}
	}
}
