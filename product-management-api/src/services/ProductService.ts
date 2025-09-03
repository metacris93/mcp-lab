import { and, count, eq, gte, like, lte, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { db } from "../database/connection.js";
import { products } from "../database/schema.js";
import type {
	CreateProductRequest,
	NewProduct,
	PaginatedProductsResponse,
	Product,
	QueryProductsRequest,
	UpdateProductRequest,
} from "../models/product.js";

export class ProductService {
	async createProduct(productData: CreateProductRequest): Promise<Product> {
		// Check if SKU already exists
		const existingProduct = await db
			.select()
			.from(products)
			.where(eq(products.sku, productData.sku))
			.get();

		if (existingProduct) {
			throw new Error(`Product with SKU '${productData.sku}' already exists`);
		}

		const newProduct: NewProduct = {
			id: uuidv4(),
			...productData,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		const createdProduct = await db
			.insert(products)
			.values(newProduct)
			.returning()
			.get();

		return createdProduct;
	}

	async getProductById(id: string): Promise<Product | null> {
		const product = await db
			.select()
			.from(products)
			.where(eq(products.id, id))
			.get();

		return product || null;
	}

	async getAllProducts(
		query: QueryProductsRequest,
	): Promise<PaginatedProductsResponse> {
		const conditions = [];

		// Add filters based on query parameters
		if (query.name) {
			conditions.push(like(products.name, `%${query.name}%`));
		}

		if (query.sku) {
			conditions.push(like(products.sku, `%${query.sku}%`));
		}

		if (query.minPrice !== undefined) {
			conditions.push(gte(products.price, query.minPrice));
		}

		if (query.maxPrice !== undefined) {
			conditions.push(lte(products.price, query.maxPrice));
		}

		if (query.minStock !== undefined) {
			conditions.push(gte(products.stockQuantity, query.minStock));
		}

		if (query.maxStock !== undefined) {
			conditions.push(lte(products.stockQuantity, query.maxStock));
		}

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		// Get total count for pagination
		const totalResult = await db
			.select({ count: count() })
			.from(products)
			.where(whereClause)
			.get();

		const total = totalResult?.count || 0;

		// Get paginated results
		const productList = await db
			.select()
			.from(products)
			.where(whereClause)
			.limit(query.limit)
			.offset(query.offset)
			.all();

		return {
			success: true,
			data: productList,
			pagination: {
				total,
				limit: query.limit,
				offset: query.offset,
				hasMore: query.offset + query.limit < total,
			},
		};
	}

	async updateProduct(
		id: string,
		updateData: UpdateProductRequest,
	): Promise<Product> {
		// Check if product exists
		const existingProduct = await this.getProductById(id);
		if (!existingProduct) {
			throw new Error(`Product with ID '${id}' not found`);
		}

		// If SKU is being updated, check for duplicates
		if (updateData.sku && updateData.sku !== existingProduct.sku) {
			const duplicateProduct = await db
				.select()
				.from(products)
				.where(
					and(eq(products.sku, updateData.sku), sql`${products.id} != ${id}`),
				)
				.get();

			if (duplicateProduct) {
				throw new Error(`Product with SKU '${updateData.sku}' already exists`);
			}
		}

		const updatedProduct = await db
			.update(products)
			.set({
				...updateData,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(products.id, id))
			.returning()
			.get();

		return updatedProduct;
	}

	async deleteProduct(id: string): Promise<boolean> {
		// Check if product exists
		const existingProduct = await this.getProductById(id);
		if (!existingProduct) {
			throw new Error(`Product with ID '${id}' not found`);
		}

		await db.delete(products).where(eq(products.id, id));

		return true;
	}

	async getProductBySku(sku: string): Promise<Product | null> {
		const product = await db
			.select()
			.from(products)
			.where(eq(products.sku, sku))
			.get();

		return product || null;
	}

	async updateStock(id: string, quantity: number): Promise<Product> {
		const product = await this.getProductById(id);
		if (!product) {
			throw new Error(`Product with ID '${id}' not found`);
		}

		const newStock = product.stockQuantity + quantity;
		if (newStock < 0) {
			throw new Error("Insufficient stock quantity");
		}

		return await this.updateProduct(id, { stockQuantity: newStock });
	}
}
