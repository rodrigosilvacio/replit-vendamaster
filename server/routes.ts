import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertCustomerSchema,
  insertSupplierSchema,
  insertProductSchema,
  insertSaleSchema,
  insertSaleItemSchema,
  updateUserRoleSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Middleware to check admin role
  const requireAdmin = async (req: any, res: any, next: any) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      next();
    } catch (error) {
      res.status(500).json({ message: "Authorization check failed" });
    }
  };

  // Customer routes
  app.get('/api/customers', isAuthenticated, async (req, res) => {
    try {
      const { search } = req.query;
      if (search && typeof search === 'string') {
        const customers = await storage.searchCustomers(search);
        res.json(customers);
      } else {
        const customers = await storage.getCustomers();
        res.json(customers);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.get('/api/customers/:id', isAuthenticated, async (req, res) => {
    try {
      const customer = await storage.getCustomer(req.params.id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  app.post('/api/customers', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(validatedData);
      res.status(201).json(customer);
    } catch (error) {
      console.error("Error creating customer:", error);
      res.status(400).json({ message: "Failed to create customer" });
    }
  });

  app.put('/api/customers/:id', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(req.params.id, validatedData);
      res.json(customer);
    } catch (error) {
      console.error("Error updating customer:", error);
      res.status(400).json({ message: "Failed to update customer" });
    }
  });

  app.delete('/api/customers/:id', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      await storage.deleteCustomer(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting customer:", error);
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });

  // Supplier routes
  app.get('/api/suppliers', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { search } = req.query;
      if (search && typeof search === 'string') {
        const suppliers = await storage.searchSuppliers(search);
        res.json(suppliers);
      } else {
        const suppliers = await storage.getSuppliers();
        res.json(suppliers);
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  app.post('/api/suppliers', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const validatedData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(validatedData);
      res.status(201).json(supplier);
    } catch (error) {
      console.error("Error creating supplier:", error);
      res.status(400).json({ message: "Failed to create supplier" });
    }
  });

  app.put('/api/suppliers/:id', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const validatedData = insertSupplierSchema.partial().parse(req.body);
      const supplier = await storage.updateSupplier(req.params.id, validatedData);
      res.json(supplier);
    } catch (error) {
      console.error("Error updating supplier:", error);
      res.status(400).json({ message: "Failed to update supplier" });
    }
  });

  app.delete('/api/suppliers/:id', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      await storage.deleteSupplier(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting supplier:", error);
      res.status(500).json({ message: "Failed to delete supplier" });
    }
  });

  // Product routes
  app.get('/api/products', isAuthenticated, async (req, res) => {
    try {
      const { search, category } = req.query;
      if (search && typeof search === 'string') {
        const products = await storage.searchProducts(search, category as string);
        res.json(products);
      } else {
        const products = await storage.getProducts();
        res.json(products);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get('/api/products/low-stock', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const threshold = req.query.threshold ? parseInt(req.query.threshold as string) : 10;
      const products = await storage.getLowStockProducts(threshold);
      res.json(products);
    } catch (error) {
      console.error("Error fetching low stock products:", error);
      res.status(500).json({ message: "Failed to fetch low stock products" });
    }
  });

  app.post('/api/products', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(400).json({ message: "Failed to create product" });
    }
  });

  app.put('/api/products/:id', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const validatedData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, validatedData);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(400).json({ message: "Failed to update product" });
    }
  });

  app.delete('/api/products/:id', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      await storage.deleteProduct(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Sales routes
  app.get('/api/sales', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { startDate, endDate, customerId, sellerId } = req.query;
      const filters: any = {};
      
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (customerId) filters.customerId = customerId as string;
      if (sellerId) filters.sellerId = sellerId as string;

      const sales = await storage.getSales(Object.keys(filters).length > 0 ? filters : undefined);
      res.json(sales);
    } catch (error) {
      console.error("Error fetching sales:", error);
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });

  app.get('/api/sales/:id', isAuthenticated, async (req, res) => {
    try {
      const sale = await storage.getSale(req.params.id);
      if (!sale) {
        return res.status(404).json({ message: "Sale not found" });
      }
      res.json(sale);
    } catch (error) {
      console.error("Error fetching sale:", error);
      res.status(500).json({ message: "Failed to fetch sale" });
    }
  });

  const createSaleSchema = z.object({
    sale: insertSaleSchema,
    items: z.array(insertSaleItemSchema.omit({ saleId: true })),
  });

  app.post('/api/sales', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = createSaleSchema.parse(req.body);
      const userId = req.user.claims.sub;
      
      // Set the seller ID
      const saleData = {
        ...validatedData.sale,
        sellerId: userId,
      };

      // Validate stock availability
      for (const item of validatedData.items) {
        const product = await storage.getProduct(item.productId);
        if (!product) {
          return res.status(400).json({ message: `Product ${item.productId} not found` });
        }
        if (product.stock < item.quantity) {
          return res.status(400).json({ 
            message: `Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}` 
          });
        }
      }

      const sale = await storage.createSale(saleData, validatedData.items);
      res.status(201).json(sale);
    } catch (error) {
      console.error("Error creating sale:", error);
      res.status(400).json({ message: "Failed to create sale" });
    }
  });

  // Analytics routes
  app.get('/api/analytics/sales-stats', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getSalesStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching sales stats:", error);
      res.status(500).json({ message: "Failed to fetch sales stats" });
    }
  });

  // User management routes (admin only)
  app.get('/api/users', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.put('/api/users/:id/role', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const validatedData = updateUserRoleSchema.parse(req.body);
      const user = await storage.updateUserRole(req.params.id, validatedData);
      res.json(user);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(400).json({ message: "Failed to update user role" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
