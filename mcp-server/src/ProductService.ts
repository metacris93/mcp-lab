export interface Product {
	id: string;
	name: string;
	price: number;
	sku: string;
	stockQuantity: number;
	createdAt: string;
	updatedAt: string;
}

export interface CreateProductRequest {
	name: string;
	price: number;
	sku: string;
	stockQuantity?: number;
}

export interface UpdateProductRequest {
	name?: string;
	price?: number;
	sku?: string;
	stockQuantity?: number;
}

export interface GetProductsFilters {
	name?: string;
	sku?: string;
	minPrice?: number;
	maxPrice?: number;
	minStock?: number;
	maxStock?: number;
	limit?: number;
	offset?: number;
}

export type PaginatedProductsResponse = Omit<
	ApiResponse<Product[]>,
	"error" | "message"
>;

export interface ApiResponse<T> {
	success: boolean;
	data: T;
	pagination?: {
		total: number;
		limit: number;
		offset: number;
		hasMore: boolean;
	};
	message?: string;
	error?: string;
}

export class ProductService {
	private apiBaseUrl: string;

	constructor(apiBaseUrl: string) {
		this.apiBaseUrl = apiBaseUrl;
	}

	private async apiCall<T>(
		endpoint: string,
		options: RequestInit = {},
	): Promise<ApiResponse<T>> {
		const url = `${this.apiBaseUrl}${endpoint}`;

		const response = await fetch(url, {
			headers: {
				"Content-Type": "application/json",
				...options.headers,
			},
			...options,
		});

		const data = (await response.json()) as ApiResponse<T>;

		if (!response.ok) {
			throw new Error(`API Error: ${data.error || "Unknown error"}`);
		}

		return data;
	}

	async createProduct(productData: CreateProductRequest): Promise<Product> {
		const result = await this.apiCall<Product>("/products", {
			method: "POST",
			body: JSON.stringify(productData),
		});
		return result.data;
	}

	async getProducts(
		filters?: GetProductsFilters,
	): Promise<PaginatedProductsResponse> {
		const params = new URLSearchParams();

		if (filters) {
			if (filters.name) params.append("name", filters.name);
			if (filters.sku) params.append("sku", filters.sku);
			if (filters.minPrice !== undefined)
				params.append("minPrice", filters.minPrice.toString());
			if (filters.maxPrice !== undefined)
				params.append("maxPrice", filters.maxPrice.toString());
			if (filters.minStock !== undefined)
				params.append("minStock", filters.minStock.toString());
			if (filters.maxStock !== undefined)
				params.append("maxStock", filters.maxStock.toString());
			if (filters.limit !== undefined)
				params.append("limit", filters.limit.toString());
			if (filters.offset !== undefined)
				params.append("offset", filters.offset.toString());
		}

		const queryString = params.toString();
		const endpoint = queryString ? `/products?${queryString}` : "/products";

		const result = await this.apiCall<Product[]>(endpoint);
		return result as PaginatedProductsResponse;
	}

	async getProductById(id: string): Promise<Product> {
		const result = await this.apiCall<Product>(`/products/${id}`);
		return result.data;
	}

	async updateProduct(
		id: string,
		updateData: UpdateProductRequest,
	): Promise<Product> {
		const result = await this.apiCall<Product>(`/products/${id}`, {
			method: "PUT",
			body: JSON.stringify(updateData),
		});
		return result.data;
	}

	async deleteProduct(id: string): Promise<void> {
		await this.apiCall<null>(`/products/${id}`, {
			method: "DELETE",
		});
	}

	async updateProductStock(id: string, quantity: number): Promise<Product> {
		const result = await this.apiCall<Product>(`/products/${id}/stock`, {
			method: "PATCH",
			body: JSON.stringify({ quantity }),
		});
		return result.data;
	}
}
