import { z } from "zod";
import type { products } from "../database/schema.js";

// Zod schemas for validation
export const createProductSchema = z.object({
	name: z.string().min(1, "Name is required").max(255, "Name too long"),
	description: z.string().min(1, "Description is required"),
	price: z.number().min(0, "Price must be positive"),
	sku: z.string().min(1, "SKU is required").max(100, "SKU too long"),
	stockQuantity: z
		.number()
		.int()
		.min(0, "Stock quantity must be non-negative")
		.default(0),
});

export const updateProductSchema = createProductSchema.partial();

export const productParamsSchema = z.object({
	id: z.string().uuid("Invalid product ID format"),
});

export const queryProductsSchema = z.object({
	name: z.string().optional(),
	sku: z.string().optional(),
	minPrice: z.coerce.number().min(0).optional(),
	maxPrice: z.coerce.number().min(0).optional(),
	minStock: z.coerce.number().int().min(0).optional(),
	maxStock: z.coerce.number().int().min(0).optional(),
	limit: z.coerce.number().int().min(1).max(100).default(50),
	offset: z.coerce.number().int().min(0).default(0),
});

// TypeScript types inferred from Drizzle schema
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

// Types for API requests/responses
export type CreateProductRequest = z.infer<typeof createProductSchema>;
export type UpdateProductRequest = z.infer<typeof updateProductSchema>;
export type ProductParams = z.infer<typeof productParamsSchema>;
export type QueryProductsRequest = z.infer<typeof queryProductsSchema>;

export interface ProductResponse {
	success: boolean;
	data?: Product | Product[];
	message?: string;
	error?: string;
}

export interface PaginatedProductsResponse {
	success: boolean;
	data: Product[];
	pagination: {
		total: number;
		limit: number;
		offset: number;
		hasMore: boolean;
	};
	message?: string;
	error?: string;
}
