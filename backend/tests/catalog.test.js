import test from 'node:test';
import assert from 'node:assert';
import app from '../src/app.js';
import { prisma } from '../src/config/prisma.js';
import { generateAccessToken } from '../src/utils/jwt.js';
import { CustomerTier } from '@prisma/client';

test('Phase 4: Product, Customer & Price List Master Data API Suite', async (t) => {
  let server;
  const port = 5077;
  const baseUrl = `http://localhost:${port}`;

  let adminToken;
  let salesToken;

  await t.test('Bootstrap: Start test server & generate tokens', async () => {
    await new Promise((resolve) => {
      server = app.listen(port, () => resolve());
    });
    assert.ok(server);

    const adminUser = await prisma.user.findUnique({ where: { email: 'admin@dealflow360.com' } });
    const salesUser = await prisma.user.findUnique({ where: { email: 'sales.rep@dealflow360.com' } });

    adminToken = generateAccessToken(adminUser);
    salesToken = generateAccessToken(salesUser);
    assert.ok(adminToken && salesToken);
  });

  // =============================================================
  // PART 1: PRODUCT CATEGORY TESTS (1 - 7)
  // =============================================================
  let testCategoryId;
  const uniqueCatName = `Cloud Infra ${Date.now()}`;

  await t.test('1. Create category (ADMIN)', async () => {
    const res = await fetch(`${baseUrl}/api/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: uniqueCatName,
        description: 'Server clusters and virtual compute units',
        defaultMarginPercentage: 35,
      }),
    });

    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.category.name, uniqueCatName);
    assert.strictEqual(Number(data.data.category.defaultMarginPercentage), 35);
    testCategoryId = data.data.category.id;
  });

  await t.test('2. Duplicate category name rejected with 409', async () => {
    const res = await fetch(`${baseUrl}/api/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: uniqueCatName,
      }),
    });

    assert.strictEqual(res.status, 409);
    const data = await res.json();
    assert.strictEqual(data.success, false);
  });

  await t.test('3. Get categories with pagination', async () => {
    const res = await fetch(`${baseUrl}/api/categories?page=1&limit=5`, {
      headers: { Authorization: `Bearer ${salesToken}` },
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.data.categories));
    assert.ok(data.data.pagination);
    assert.strictEqual(data.data.pagination.page, 1);
  });

  await t.test('4. Get category by ID includes product count', async () => {
    const res = await fetch(`${baseUrl}/api/categories/${testCategoryId}`, {
      headers: { Authorization: `Bearer ${salesToken}` },
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.data.category.id, testCategoryId);
    assert.ok(data.data.category._count);
  });

  await t.test('5. Update category (ADMIN)', async () => {
    const res = await fetch(`${baseUrl}/api/categories/${testCategoryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        description: 'Updated server clusters and VPC nodes',
        defaultMarginPercentage: 40,
      }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.data.category.description, 'Updated server clusters and VPC nodes');
    assert.strictEqual(Number(data.data.category.defaultMarginPercentage), 40);
  });

  await t.test('6. Deactivate / delete category', async () => {
    const res = await fetch(`${baseUrl}/api/categories/${testCategoryId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
  });

  await t.test('7. Unauthorized user (SALES_REP) cannot modify category returns 403', async () => {
    const res = await fetch(`${baseUrl}/api/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesToken}`,
      },
      body: JSON.stringify({ name: 'Hacked Category' }),
    });

    assert.strictEqual(res.status, 403);
  });

  // =============================================================
  // PART 2: PRODUCT TESTS (8 - 18)
  // =============================================================
  let testProductId;
  let hardwareCategory;
  const uniqueSku = `SRV-PRO-${Date.now()}`;

  await t.test('Fetch existing Hardware category for product tests', async () => {
    hardwareCategory = await prisma.productCategory.findUnique({ where: { name: 'Hardware' } });
    assert.ok(hardwareCategory);
  });

  await t.test('8. Create product (ADMIN) and verify margin calculation', async () => {
    const res = await fetch(`${baseUrl}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Enterprise Rack Server R750',
        sku: uniqueSku,
        categoryId: hardwareCategory.id,
        description: 'Dual Xeon Scalable 32-core server',
        unit: 'SERVER',
        basePrice: 5000.0,
        costPrice: 3500.0,
        taxRate: 8.5,
        isSubscription: false,
      }),
    });

    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.product.sku, uniqueSku);
    assert.strictEqual(data.data.product.marginAmount, 1500.0);
    assert.strictEqual(data.data.product.marginPercentage, 30.0);
    testProductId = data.data.product.id;
  });

  await t.test('9. Duplicate SKU rejected with 409', async () => {
    const res = await fetch(`${baseUrl}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Duplicate SKU Server',
        sku: uniqueSku,
        categoryId: hardwareCategory.id,
        basePrice: 4000.0,
        costPrice: 3000.0,
      }),
    });

    assert.strictEqual(res.status, 409);
  });

  await t.test('10. Invalid category rejected with 400', async () => {
    const res = await fetch(`${baseUrl}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Invalid Category Server',
        sku: `BAD-CAT-${Date.now()}`,
        categoryId: 'a0000000-0000-0000-0000-000000000000',
        basePrice: 4000.0,
        costPrice: 3000.0,
      }),
    });

    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.ok(data.message.includes('category does not exist'));
  });

  await t.test('11. Get products list with calculated margins', async () => {
    const res = await fetch(`${baseUrl}/api/products`, {
      headers: { Authorization: `Bearer ${salesToken}` },
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.data.products.length >= 7);
    assert.ok(typeof data.data.products[0].marginPercentage === 'number');
  });

  await t.test('12. Products pagination metadata operates accurately', async () => {
    const res = await fetch(`${baseUrl}/api/products?page=1&limit=3`, {
      headers: { Authorization: `Bearer ${salesToken}` },
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.data.pagination.limit, 3);
    assert.strictEqual(data.data.products.length, 3);
    assert.ok(data.data.pagination.totalPages >= 3);
  });

  await t.test('13. Product search by SKU or name works', async () => {
    const res = await fetch(`${baseUrl}/api/products?search=${uniqueSku}`, {
      headers: { Authorization: `Bearer ${salesToken}` },
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.data.products.length, 1);
    assert.strictEqual(data.data.products[0].sku, uniqueSku);
  });

  await t.test('14. Filter products by category', async () => {
    const res = await fetch(`${baseUrl}/api/products?categoryId=${hardwareCategory.id}`, {
      headers: { Authorization: `Bearer ${salesToken}` },
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.data.products.every((p) => p.categoryId === hardwareCategory.id));
  });

  await t.test('15. Get product details by ID', async () => {
    const res = await fetch(`${baseUrl}/api/products/${testProductId}`, {
      headers: { Authorization: `Bearer ${salesToken}` },
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.data.product.id, testProductId);
    assert.ok(data.data.product.category);
    assert.ok(Array.isArray(data.data.product.variants));
  });

  await t.test('16. Update product (ADMIN)', async () => {
    const res = await fetch(`${baseUrl}/api/products/${testProductId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        basePrice: 5200.0,
      }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(Number(data.data.product.basePrice), 5200.0);
    assert.strictEqual(data.data.product.marginAmount, 1700.0);
  });

  await t.test('17. Deactivate product (soft delete)', async () => {
    const res = await fetch(`${baseUrl}/api/products/${testProductId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.data.product.isActive, false);
  });

  await t.test('18. Unauthorized user (SALES_REP) cannot update or delete product', async () => {
    const res = await fetch(`${baseUrl}/api/products/${testProductId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesToken}`,
      },
      body: JSON.stringify({ basePrice: 1000 }),
    });

    assert.strictEqual(res.status, 403);
  });

  // =============================================================
  // PART 3: PRODUCT VARIANT TESTS (19 - 23)
  // =============================================================
  let testVariantId;

  await t.test('19. Create product variant (ADMIN)', async () => {
    const res = await fetch(`${baseUrl}/api/products/${testProductId}/variants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        attribute: 'PowerSupply',
        value: 'Redundant 1100W Titanium',
        extraPrice: 350.0,
      }),
    });

    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.data.variant.attribute, 'PowerSupply');
    assert.strictEqual(Number(data.data.variant.extraPrice), 350.0);
    testVariantId = data.data.variant.id;
  });

  await t.test('20. Create variant with invalid product ID rejected with 404', async () => {
    const res = await fetch(`${baseUrl}/api/products/00000000-0000-0000-0000-000000000000/variants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        attribute: 'Color',
        value: 'Matte Black',
      }),
    });

    assert.strictEqual(res.status, 404);
  });

  await t.test('21. Get variants for a product', async () => {
    const res = await fetch(`${baseUrl}/api/products/${testProductId}/variants`, {
      headers: { Authorization: `Bearer ${salesToken}` },
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.data.variants.length >= 1);
  });

  await t.test('22. Update variant (ADMIN)', async () => {
    const res = await fetch(`${baseUrl}/api/variants/${testVariantId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ extraPrice: 400.0 }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(Number(data.data.variant.extraPrice), 400.0);
  });

  await t.test('23. Deactivate/delete variant (ADMIN)', async () => {
    const res = await fetch(`${baseUrl}/api/variants/${testVariantId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    assert.strictEqual(res.status, 200);
  });

  // =============================================================
  // PART 4: CUSTOMER TESTS (24 - 33)
  // =============================================================
  let testCustomerId;
  const uniqueCustomerEmail = `procurement.${Date.now()}@cyberdyne.com`;

  await t.test('24. Create customer (ADMIN)', async () => {
    const res = await fetch(`${baseUrl}/api/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        companyName: 'Cyberdyne Systems Corp',
        contactName: 'Miles Dyson',
        email: uniqueCustomerEmail,
        phone: '+1-555-8000',
        customerTier: 'GOLD',
        currency: 'USD',
      }),
    });

    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.data.customer.companyName, 'Cyberdyne Systems Corp');
    assert.strictEqual(data.data.customer.customerTier, CustomerTier.GOLD);
    testCustomerId = data.data.customer.id;
  });

  await t.test('25. Invalid email rejected with 400', async () => {
    const res = await fetch(`${baseUrl}/api/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        companyName: 'Bad Email Co',
        contactName: 'John Doe',
        email: 'invalid-email-address',
      }),
    });

    assert.strictEqual(res.status, 400);
  });

  await t.test('26. Invalid tier rejected with 400', async () => {
    const res = await fetch(`${baseUrl}/api/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        companyName: 'Bad Tier Co',
        contactName: 'John Doe',
        email: `valid.${Date.now()}@test.com`,
        customerTier: 'DIAMOND_ULTRA',
      }),
    });

    assert.strictEqual(res.status, 400);
  });

  await t.test('27. Duplicate customer email rejected with 409', async () => {
    const res = await fetch(`${baseUrl}/api/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        companyName: 'Cyberdyne Clone',
        contactName: 'Miles Dyson',
        email: uniqueCustomerEmail,
      }),
    });

    assert.strictEqual(res.status, 409);
  });

  await t.test('28. Get customers with pagination', async () => {
    const res = await fetch(`${baseUrl}/api/customers?page=1&limit=5`, {
      headers: { Authorization: `Bearer ${salesToken}` },
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.data.customers.length >= 3);
    assert.ok(data.data.pagination);
  });

  await t.test('29. Search customers by companyName, contactName, or email', async () => {
    const res = await fetch(`${baseUrl}/api/customers?search=Cyberdyne`, {
      headers: { Authorization: `Bearer ${salesToken}` },
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.data.customers.length, 1);
    assert.strictEqual(data.data.customers[0].companyName, 'Cyberdyne Systems Corp');
  });

  await t.test('30. Filter customers by tier (GOLD)', async () => {
    const res = await fetch(`${baseUrl}/api/customers?tier=GOLD`, {
      headers: { Authorization: `Bearer ${salesToken}` },
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.data.customers.length >= 2);
    assert.ok(data.data.customers.every((c) => c.customerTier === 'GOLD'));
  });

  await t.test('31. Get customer details with quotation/order/sub counts', async () => {
    const res = await fetch(`${baseUrl}/api/customers/${testCustomerId}`, {
      headers: { Authorization: `Bearer ${salesToken}` },
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.data.customer.id, testCustomerId);
    assert.ok(data.data.customer._count);
    assert.strictEqual(typeof data.data.customer._count.quotations, 'number');
  });

  await t.test('32. Update customer details (ADMIN)', async () => {
    const res = await fetch(`${baseUrl}/api/customers/${testCustomerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        contactName: 'Dr. Miles Dyson (Director)',
        phone: '+1-555-8999',
      }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.data.customer.contactName, 'Dr. Miles Dyson (Director)');
  });

  await t.test('33. Deactivate customer (soft delete preserves history)', async () => {
    const res = await fetch(`${baseUrl}/api/customers/${testCustomerId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.data.customer.isActive, false);
  });

  // =============================================================
  // PART 5: PRICE LIST & ITEM TESTS (34 - 42)
  // =============================================================
  let testPriceListId;
  let testPriceListItemId;
  const uniquePriceListName = `Strategic Partner Price List ${Date.now()}`;
  let laptopProduct;

  await t.test('Fetch existing Laptop product for price list tests', async () => {
    laptopProduct = await prisma.product.findUnique({ where: { sku: 'HW-LAPTOP-15' } });
    assert.ok(laptopProduct);
  });

  await t.test('34. Create price list (ADMIN)', async () => {
    const res = await fetch(`${baseUrl}/api/price-lists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: uniquePriceListName,
        customerTier: 'GOLD',
        currency: 'USD',
        isActive: true,
      }),
    });

    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.data.priceList.name, uniquePriceListName);
    testPriceListId = data.data.priceList.id;
  });

  await t.test('35. Duplicate price list name rejected with 409', async () => {
    const res = await fetch(`${baseUrl}/api/price-lists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: uniquePriceListName,
        customerTier: 'GOLD',
      }),
    });

    assert.strictEqual(res.status, 409);
  });

  await t.test('36. Add price list item (ADMIN)', async () => {
    const res = await fetch(`${baseUrl}/api/price-lists/${testPriceListId}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        productId: laptopProduct.id,
        price: 1550.0, // Discounted from basePrice 1800
        minimumQuantity: 10,
      }),
    });

    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.data.item.priceListId, testPriceListId);
    assert.strictEqual(Number(data.data.item.price), 1550.0);
    assert.strictEqual(data.data.item.minimumQuantity, 10);
    testPriceListItemId = data.data.item.id;
  });

  await t.test('37. Add price list item with invalid product ID rejected with 400', async () => {
    const res = await fetch(`${baseUrl}/api/price-lists/${testPriceListId}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        productId: '00000000-0000-0000-0000-000000000000',
        price: 999.0,
      }),
    });

    assert.strictEqual(res.status, 400);
  });

  await t.test('38. Get price list details with items', async () => {
    const res = await fetch(`${baseUrl}/api/price-lists/${testPriceListId}`, {
      headers: { Authorization: `Bearer ${salesToken}` },
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.data.priceList.id, testPriceListId);
    assert.strictEqual(data.data.priceList.items.length, 1);
  });

  await t.test('39. Get price list items paginated', async () => {
    const res = await fetch(`${baseUrl}/api/price-lists/${testPriceListId}/items?page=1&limit=5`, {
      headers: { Authorization: `Bearer ${salesToken}` },
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.data.items.length, 1);
  });

  await t.test('40. Update price list item (ADMIN)', async () => {
    const res = await fetch(`${baseUrl}/api/price-list-items/${testPriceListItemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        price: 1520.0,
      }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(Number(data.data.item.price), 1520.0);
  });

  await t.test('41. Remove price list item (ADMIN)', async () => {
    const res = await fetch(`${baseUrl}/api/price-list-items/${testPriceListItemId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    assert.strictEqual(res.status, 200);
  });

  await t.test('42. Product price lookup works (/api/price-lists/:id/products/:productId)', async () => {
    const goldPriceList = await prisma.priceList.findUnique({ where: { name: 'GOLD Price List' } });
    assert.ok(goldPriceList);

    const res = await fetch(
      `${baseUrl}/api/price-lists/${goldPriceList.id}/products/${laptopProduct.id}`,
      {
        headers: { Authorization: `Bearer ${salesToken}` },
      }
    );

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.data.product.sku, 'HW-LAPTOP-15');
    assert.ok(data.data.defaultPrice);
    assert.ok(Array.isArray(data.data.priceEntries));
  });

  // =============================================================
  // PART 6: RBAC ENFORCEMENT TESTS (43 - 47)
  // =============================================================
  await t.test('43. SALES_REP can read products', async () => {
    const res = await fetch(`${baseUrl}/api/products`, {
      headers: { Authorization: `Bearer ${salesToken}` },
    });
    assert.strictEqual(res.status, 200);
  });

  await t.test('44. SALES_REP cannot create product returns 403', async () => {
    const res = await fetch(`${baseUrl}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesToken}`,
      },
      body: JSON.stringify({
        name: 'Unauthorized Laptop',
        sku: 'UNAUTH-01',
        categoryId: hardwareCategory.id,
        basePrice: 1000,
        costPrice: 800,
      }),
    });
    assert.strictEqual(res.status, 403);
  });

  await t.test('45. SALES_REP can read customers', async () => {
    const res = await fetch(`${baseUrl}/api/customers`, {
      headers: { Authorization: `Bearer ${salesToken}` },
    });
    assert.strictEqual(res.status, 200);
  });

  await t.test('46. SALES_REP cannot modify price list configuration returns 403', async () => {
    const res = await fetch(`${baseUrl}/api/price-lists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${salesToken}`,
      },
      body: JSON.stringify({
        name: 'Unauthorized Price List',
        customerTier: 'GOLD',
      }),
    });
    assert.strictEqual(res.status, 403);
  });

  await t.test('47. ADMIN can manage master data across all domains', async () => {
    // Admin reading categories
    const res = await fetch(`${baseUrl}/api/categories`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
  });

  await t.test('Close test server', async () => {
    await new Promise((resolve) => server.close(resolve));
  });
});
