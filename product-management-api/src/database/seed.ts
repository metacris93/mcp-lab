import { v4 as uuidv4 } from "uuid";
import { db } from "./connection.js";
import { products } from "./schema.js";

const sampleProducts = [
	{
		id: uuidv4(),
		name: "Wireless Bluetooth Headphones",
		price: 99.99,
		sku: "WBH-001",
		stockQuantity: 50,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		id: uuidv4(),
		name: "Smartphone Stand",
		price: 24.99,
		sku: "SMS-002",
		stockQuantity: 100,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		id: uuidv4(),
		name: "USB-C Charging Cable",
		price: 12.99,
		sku: "UCC-003",
		stockQuantity: 200,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		id: uuidv4(),
		name: "Wireless Mouse",
		price: 39.99,
		sku: "WM-004",
		stockQuantity: 75,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		id: uuidv4(),
		name: "Portable Power Bank",
		price: 29.99,
		sku: "PPB-005",
		stockQuantity: 30,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
];

export const seedDatabase = async () => {
	try {
		console.log("Starting database seeding...");

		// Insert sample products
		for (const product of sampleProducts) {
			await db.insert(products).values(product);
			console.log(`✓ Created product: ${product.name}`);
		}

		console.log(
			`✅ Successfully seeded database with ${sampleProducts.length} products`,
		);
	} catch (error) {
		console.error("❌ Error seeding database:", error);
		throw error;
	}
};

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
	seedDatabase()
		.then(() => {
			console.log("Database seeding completed");
			process.exit(0);
		})
		.catch((error) => {
			console.error("Database seeding failed:", error);
			process.exit(1);
		});
}
