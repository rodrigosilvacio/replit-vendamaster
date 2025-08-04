import {
  users,
  customers,
  suppliers,
  products,
  sales,
  saleItems,
  type User,
  type UpsertUser,
  type Customer,
  type InsertCustomer,
  type Supplier,
  type InsertSupplier,
  type Product,
  type InsertProduct,
  type ProductWithSupplier,
  type Sale,
  type InsertSale,
  type SaleItem,
  type InsertSaleItem,
  type SaleWithDetails,
  type UpdateUserRole,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, gte, lte, and, sql, ilike } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserRole(id: string, data: UpdateUserRole): Promise<User>;
  getUsers(): Promise<User[]>;

  // Customer operations
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer>;
  deleteCustomer(id: string): Promise<void>;
  searchCustomers(query: string): Promise<Customer[]>;

  // Supplier operations
  getSuppliers(): Promise<Supplier[]>;
  getSupplier(id: string): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: string, supplier: Partial<InsertSupplier>): Promise<Supplier>;
  deleteSupplier(id: string): Promise<void>;
  searchSuppliers(query: string): Promise<Supplier[]>;

  // Product operations
  getProducts(): Promise<ProductWithSupplier[]>;
  getProduct(id: string): Promise<ProductWithSupplier | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  searchProducts(query: string, category?: string): Promise<ProductWithSupplier[]>;
  getLowStockProducts(threshold?: number): Promise<ProductWithSupplier[]>;
  updateProductStock(id: string, quantity: number): Promise<void>;

  // Sale operations
  getSales(filters?: {
    startDate?: Date;
    endDate?: Date;
    customerId?: string;
    sellerId?: string;
  }): Promise<SaleWithDetails[]>;
  getSale(id: string): Promise<SaleWithDetails | undefined>;
  createSale(sale: InsertSale, items: InsertSaleItem[]): Promise<SaleWithDetails>;

  // Analytics
  getSalesStats(): Promise<{
    todaySales: number;
    weekSales: number;
    monthSales: number;
    topProducts: Array<{ productName: string; totalSold: number }>;
    salesByPeriod: Array<{ date: string; total: number }>;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserRole(id: string, data: UpdateUserRole): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.firstName);
  }

  // Customer operations
  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers).orderBy(customers.name);
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }

  async updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer> {
    const [updatedCustomer] = await db
      .update(customers)
      .set({ ...customer, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning();
    return updatedCustomer;
  }

  async deleteCustomer(id: string): Promise<void> {
    await db.delete(customers).where(eq(customers.id, id));
  }

  async searchCustomers(query: string): Promise<Customer[]> {
    return await db
      .select()
      .from(customers)
      .where(ilike(customers.name, `%${query}%`))
      .orderBy(customers.name);
  }

  // Supplier operations
  async getSuppliers(): Promise<Supplier[]> {
    return await db.select().from(suppliers).orderBy(suppliers.name);
  }

  async getSupplier(id: string): Promise<Supplier | undefined> {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, id));
    return supplier;
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const [newSupplier] = await db.insert(suppliers).values(supplier).returning();
    return newSupplier;
  }

  async updateSupplier(id: string, supplier: Partial<InsertSupplier>): Promise<Supplier> {
    const [updatedSupplier] = await db
      .update(suppliers)
      .set({ ...supplier, updatedAt: new Date() })
      .where(eq(suppliers.id, id))
      .returning();
    return updatedSupplier;
  }

  async deleteSupplier(id: string): Promise<void> {
    await db.delete(suppliers).where(eq(suppliers.id, id));
  }

  async searchSuppliers(query: string): Promise<Supplier[]> {
    return await db
      .select()
      .from(suppliers)
      .where(ilike(suppliers.name, `%${query}%`))
      .orderBy(suppliers.name);
  }

  // Product operations
  async getProducts(): Promise<ProductWithSupplier[]> {
    return await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        stock: products.stock,
        category: products.category,
        supplierId: products.supplierId,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        supplier: suppliers,
      })
      .from(products)
      .leftJoin(suppliers, eq(products.supplierId, suppliers.id))
      .orderBy(products.name);
  }

  async getProduct(id: string): Promise<ProductWithSupplier | undefined> {
    const [product] = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        stock: products.stock,
        category: products.category,
        supplierId: products.supplierId,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        supplier: suppliers,
      })
      .from(products)
      .leftJoin(suppliers, eq(products.supplierId, suppliers.id))
      .where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product> {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async searchProducts(query: string, category?: string): Promise<ProductWithSupplier[]> {
    let whereClause = ilike(products.name, `%${query}%`);
    if (category) {
      whereClause = and(whereClause, eq(products.category, category)) || whereClause;
    }

    return await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        stock: products.stock,
        category: products.category,
        supplierId: products.supplierId,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        supplier: suppliers,
      })
      .from(products)
      .leftJoin(suppliers, eq(products.supplierId, suppliers.id))
      .where(whereClause)
      .orderBy(products.name);
  }

  async getLowStockProducts(threshold: number = 10): Promise<ProductWithSupplier[]> {
    return await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        stock: products.stock,
        category: products.category,
        supplierId: products.supplierId,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        supplier: suppliers,
      })
      .from(products)
      .leftJoin(suppliers, eq(products.supplierId, suppliers.id))
      .where(lte(products.stock, threshold))
      .orderBy(products.stock);
  }

  async updateProductStock(id: string, quantity: number): Promise<void> {
    await db
      .update(products)
      .set({
        stock: sql`${products.stock} - ${quantity}`,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id));
  }

  // Sale operations
  async getSales(filters?: {
    startDate?: Date;
    endDate?: Date;
    customerId?: string;
    sellerId?: string;
  }): Promise<SaleWithDetails[]> {
    let whereClause = undefined;

    if (filters) {
      const conditions = [];
      if (filters.startDate) {
        conditions.push(gte(sales.createdAt, filters.startDate));
      }
      if (filters.endDate) {
        conditions.push(lte(sales.createdAt, filters.endDate));
      }
      if (filters.customerId) {
        conditions.push(eq(sales.customerId, filters.customerId));
      }
      if (filters.sellerId) {
        conditions.push(eq(sales.sellerId, filters.sellerId));
      }
      if (conditions.length > 0) {
        whereClause = and(...conditions);
      }
    }

    const salesData = await db
      .select({
        sale: sales,
        customer: customers,
        seller: users,
      })
      .from(sales)
      .leftJoin(customers, eq(sales.customerId, customers.id))
      .innerJoin(users, eq(sales.sellerId, users.id))
      .where(whereClause)
      .orderBy(desc(sales.createdAt));

    // Get items for each sale
    const salesWithItems = await Promise.all(
      salesData.map(async ({ sale, customer, seller }) => {
        const items = await db
          .select({
            id: saleItems.id,
            saleId: saleItems.saleId,
            productId: saleItems.productId,
            quantity: saleItems.quantity,
            unitPrice: saleItems.unitPrice,
            subtotal: saleItems.subtotal,
            product: products,
          })
          .from(saleItems)
          .innerJoin(products, eq(saleItems.productId, products.id))
          .where(eq(saleItems.saleId, sale.id));

        return {
          ...sale,
          customer: customer || undefined,
          seller,
          items,
        };
      })
    );

    return salesWithItems;
  }

  async getSale(id: string): Promise<SaleWithDetails | undefined> {
    const [saleData] = await db
      .select({
        sale: sales,
        customer: customers,
        seller: users,
      })
      .from(sales)
      .leftJoin(customers, eq(sales.customerId, customers.id))
      .innerJoin(users, eq(sales.sellerId, users.id))
      .where(eq(sales.id, id));

    if (!saleData) return undefined;

    const items = await db
      .select({
        id: saleItems.id,
        saleId: saleItems.saleId,
        productId: saleItems.productId,
        quantity: saleItems.quantity,
        unitPrice: saleItems.unitPrice,
        subtotal: saleItems.subtotal,
        product: products,
      })
      .from(saleItems)
      .innerJoin(products, eq(saleItems.productId, products.id))
      .where(eq(saleItems.saleId, id));

    return {
      ...saleData.sale,
      customer: saleData.customer || undefined,
      seller: saleData.seller,
      items,
    };
  }

  async createSale(sale: InsertSale, items: InsertSaleItem[]): Promise<SaleWithDetails> {
    return await db.transaction(async (tx) => {
      // Create the sale
      const [newSale] = await tx.insert(sales).values(sale).returning();

      // Create sale items
      const saleItemsData = items.map((item) => ({
        ...item,
        saleId: newSale.id,
      }));
      await tx.insert(saleItems).values(saleItemsData);

      // Update product stock
      await Promise.all(
        items.map((item) =>
          tx
            .update(products)
            .set({
              stock: sql`${products.stock} - ${item.quantity}`,
              updatedAt: new Date(),
            })
            .where(eq(products.id, item.productId))
        )
      );

      // Return the complete sale
      const completeSale = await this.getSale(newSale.id);
      return completeSale!;
    });
  }

  // Analytics
  async getSalesStats(): Promise<{
    todaySales: number;
    weekSales: number;
    monthSales: number;
    topProducts: Array<{ productName: string; totalSold: number }>;
    salesByPeriod: Array<{ date: string; total: number }>;
  }> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

    // Today's sales
    const [todayResult] = await db
      .select({ total: sql<number>`COALESCE(SUM(${sales.total}), 0)` })
      .from(sales)
      .where(gte(sales.createdAt, today));

    // Week's sales
    const [weekResult] = await db
      .select({ total: sql<number>`COALESCE(SUM(${sales.total}), 0)` })
      .from(sales)
      .where(gte(sales.createdAt, weekAgo));

    // Month's sales
    const [monthResult] = await db
      .select({ total: sql<number>`COALESCE(SUM(${sales.total}), 0)` })
      .from(sales)
      .where(gte(sales.createdAt, monthAgo));

    // Top products
    const topProducts = await db
      .select({
        productName: products.name,
        totalSold: sql<number>`SUM(${saleItems.quantity})`,
      })
      .from(saleItems)
      .innerJoin(products, eq(saleItems.productId, products.id))
      .groupBy(products.id, products.name)
      .orderBy(desc(sql`SUM(${saleItems.quantity})`))
      .limit(5);

    // Sales by period (last 7 days)
    const salesByPeriod = await db
      .select({
        date: sql<string>`DATE(${sales.createdAt})`,
        total: sql<number>`SUM(${sales.total})`,
      })
      .from(sales)
      .where(gte(sales.createdAt, weekAgo))
      .groupBy(sql`DATE(${sales.createdAt})`)
      .orderBy(sql`DATE(${sales.createdAt})`);

    return {
      todaySales: Number(todayResult.total),
      weekSales: Number(weekResult.total),
      monthSales: Number(monthResult.total),
      topProducts: topProducts.map(p => ({ ...p, totalSold: Number(p.totalSold) })),
      salesByPeriod: salesByPeriod.map(s => ({ ...s, total: Number(s.total) })),
    };
  }
}

export const storage = new DatabaseStorage();
