import { PrismaClient, UserRole, CustomerTier, QuoteStatus, RiskLevel, ApprovalStatus, ApprovalAction, OrderStatus, FulfillmentStatus, FulfillmentSplitStatus, BackorderStatus, BillingInterval, SubscriptionStatus, BillingScheduleStatus, InvoiceType, InvoiceStatus, PaymentStatus, NegotiationStatus, SenderType, DealHealthStatus, RuleType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Password hash for all seeded demo users: "Password123!"
const DEMO_PASSWORD_HASH = bcrypt.hashSync('Password123!', 10);

/**
 * 1. Seed Internal Users
 */
export async function seedUsers() {
  console.log('👤 Seeding Users...');
  const users = [
    {
      email: 'admin@dealflow360.com',
      name: 'System Admin',
      passwordHash: DEMO_PASSWORD_HASH,
      role: UserRole.ADMIN,
    },
    {
      email: 'sales.rep@dealflow360.com',
      name: 'Sarah Jenkins (Sales Rep)',
      passwordHash: DEMO_PASSWORD_HASH,
      role: UserRole.SALES_REP,
    },
    {
      email: 'sales.rep2@dealflow360.com',
      name: 'Bob Martinez (Sales Rep 2)',
      passwordHash: DEMO_PASSWORD_HASH,
      role: UserRole.SALES_REP,
    },
    {
      email: 'sales.manager@dealflow360.com',
      name: 'Michael Scott (Sales Manager)',
      passwordHash: DEMO_PASSWORD_HASH,
      role: UserRole.SALES_MANAGER,
    },
    {
      email: 'finance@dealflow360.com',
      name: 'Oscar Martinez (Finance Controller)',
      passwordHash: DEMO_PASSWORD_HASH,
      role: UserRole.FINANCE,
    },
    {
      email: 'operations@dealflow360.com',
      name: 'Dwight Schrute (Operations Director)',
      passwordHash: DEMO_PASSWORD_HASH,
      role: UserRole.OPERATIONS,
    },
  ];

  const seededUsers = {};
  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role, isActive: true },
      create: u,
    });
    if (!seededUsers[u.role]) {
      seededUsers[u.role] = user;
    }
  }
  return seededUsers;
}

/**
 * 2. Seed Customers across Bronze, Silver, Gold tiers
 */
export async function seedCustomers() {
  console.log('🏢 Seeding Customers...');
  const customers = [
    {
      email: 'contact@acmecorp.com',
      companyName: 'Acme Corporation',
      contactName: 'Alice Johnson',
      phone: '+1-555-0101',
      customerTier: CustomerTier.BRONZE,
      currency: 'USD',
    },
    {
      email: 'procurement@globex.com',
      companyName: 'Globex Industries',
      contactName: 'Bob Smith',
      phone: '+1-555-0102',
      customerTier: CustomerTier.SILVER,
      currency: 'USD',
    },
    {
      email: 'enterprise@initech.com',
      companyName: 'Initech Global Enterprises',
      contactName: 'Peter Gibbons',
      phone: '+1-555-0103',
      customerTier: CustomerTier.GOLD,
      currency: 'USD',
    },
  ];

  const seededCustomers = {};
  for (const c of customers) {
    const customer = await prisma.customer.upsert({
      where: { email: c.email },
      update: {
        companyName: c.companyName,
        contactName: c.contactName,
        customerTier: c.customerTier,
        currency: c.currency,
      },
      create: c,
    });
    seededCustomers[c.customerTier] = customer;
  }
  return seededCustomers;
}

/**
 * 3. Seed Product Categories
 */
export async function seedCategories() {
  console.log('📂 Seeding Product Categories...');
  const categories = [
    {
      name: 'Hardware',
      description: 'Physical computing equipment, monitors, and peripherals',
      defaultMarginPercentage: 25.0,
    },
    {
      name: 'Services',
      description: 'Professional onboarding, installation, and architectural consulting',
      defaultMarginPercentage: 45.0,
    },
    {
      name: 'Subscriptions',
      description: 'Recurring cloud storage, SaaS licenses, and premium SLAs',
      defaultMarginPercentage: 70.0,
    },
  ];

  const seededCategories = {};
  for (const cat of categories) {
    const category = await prisma.productCategory.upsert({
      where: { name: cat.name },
      update: {
        description: cat.description,
        defaultMarginPercentage: cat.defaultMarginPercentage,
      },
      create: cat,
    });
    seededCategories[cat.name] = category;
  }
  return seededCategories;
}

/**
 * 4. Seed Products and Variants
 */
export async function seedProducts(categories) {
  console.log('💻 Seeding Products & Variants...');
  const products = [
    // Hardware
    {
      name: 'Enterprise Laptop Pro 15',
      sku: 'HW-LAPTOP-15',
      categoryName: 'Hardware',
      description: 'High-performance workstation laptop with 14-core CPU',
      unit: 'UNIT',
      basePrice: 1800.0,
      costPrice: 1200.0,
      taxRate: 8.5,
      isSubscription: false,
      variants: [
        { attribute: 'RAM', value: '16GB', extraPrice: 0.0 },
        { attribute: 'RAM', value: '32GB', extraPrice: 250.0 },
        { attribute: 'RAM', value: '64GB', extraPrice: 600.0 },
      ],
    },
    {
      name: 'UltraSharp 4K Monitor 27"',
      sku: 'HW-MONITOR-27',
      categoryName: 'Hardware',
      description: 'Color-accurate IPS panel with USB-C 90W power delivery',
      unit: 'UNIT',
      basePrice: 650.0,
      costPrice: 420.0,
      taxRate: 8.5,
      isSubscription: false,
    },
    {
      name: 'Mechanical Ergonomic Keyboard',
      sku: 'HW-KEYBOARD-MECH',
      categoryName: 'Hardware',
      description: 'Hot-swappable tactile mechanical keyboard',
      unit: 'UNIT',
      basePrice: 160.0,
      costPrice: 95.0,
      taxRate: 8.5,
      isSubscription: false,
    },
    // Services
    {
      name: 'Enterprise Onsite Installation & Staging',
      sku: 'SVC-INSTALL-ONSITE',
      categoryName: 'Services',
      description: 'Full equipment deployment, racking, and network verification',
      unit: 'DAY',
      basePrice: 1500.0,
      costPrice: 800.0,
      taxRate: 5.0,
      isSubscription: false,
    },
    {
      name: 'B2B Solutions Architecture Consulting',
      sku: 'SVC-CONSULTING-HR',
      categoryName: 'Services',
      description: 'Expert systems design and workflow automation consultation',
      unit: 'HOUR',
      basePrice: 250.0,
      costPrice: 125.0,
      taxRate: 5.0,
      isSubscription: false,
    },
    // Subscriptions
    {
      name: 'DealFlow360 Enterprise Cloud Storage',
      sku: 'SUB-CLOUD-STORAGE',
      categoryName: 'Subscriptions',
      description: 'Encrypted multi-region B2B asset and document storage',
      unit: 'MONTH',
      basePrice: 120.0,
      costPrice: 25.0,
      taxRate: 0.0,
      isSubscription: true,
    },
    {
      name: '24/7 Platinum Mission-Critical Support Plan',
      sku: 'SUB-SUPPORT-PLATINUM',
      categoryName: 'Subscriptions',
      description: 'Guaranteed 15-minute SLA with dedicated technical account lead',
      unit: 'MONTH',
      basePrice: 500.0,
      costPrice: 100.0,
      taxRate: 0.0,
      isSubscription: true,
    },
  ];

  const seededProducts = {};
  for (const p of products) {
    const category = categories[p.categoryName];
    const product = await prisma.product.upsert({
      where: { sku: p.sku },
      update: {
        name: p.name,
        categoryId: category.id,
        basePrice: p.basePrice,
        costPrice: p.costPrice,
        taxRate: p.taxRate,
        isSubscription: p.isSubscription,
      },
      create: {
        name: p.name,
        sku: p.sku,
        categoryId: category.id,
        description: p.description,
        unit: p.unit,
        basePrice: p.basePrice,
        costPrice: p.costPrice,
        taxRate: p.taxRate,
        isSubscription: p.isSubscription,
      },
    });

    seededProducts[p.sku] = product;

    // Seed variants if defined
    if (p.variants) {
      for (const v of p.variants) {
        // Find existing variant or create
        const existing = await prisma.productVariant.findFirst({
          where: { productId: product.id, attribute: v.attribute, value: v.value },
        });
        if (!existing) {
          await prisma.productVariant.create({
            data: {
              productId: product.id,
              attribute: v.attribute,
              value: v.value,
              extraPrice: v.extraPrice,
            },
          });
        }
      }
    }
  }

  return seededProducts;
}

/**
 * 5. Seed Price Lists and Items
 */
export async function seedPriceLists(products) {
  console.log('💲 Seeding Price Lists...');
  const tiers = [CustomerTier.BRONZE, CustomerTier.SILVER, CustomerTier.GOLD];
  const discounts = {
    [CustomerTier.BRONZE]: 0.0, // standard base price
    [CustomerTier.SILVER]: 0.05, // 5% tier discount
    [CustomerTier.GOLD]: 0.12, // 12% tier discount
  };

  const seededPriceLists = {};

  for (const tier of tiers) {
    const priceList = await prisma.priceList.upsert({
      where: { name: `${tier} Price List` },
      update: { customerTier: tier, currency: 'USD' },
      create: {
        name: `${tier} Price List`,
        customerTier: tier,
        currency: 'USD',
      },
    });

    seededPriceLists[tier] = priceList;

    // Populate price list items for key products
    const discountFactor = 1 - discounts[tier];
    for (const [sku, product] of Object.entries(products)) {
      const tieredPrice = Number(product.basePrice) * discountFactor;

      await prisma.priceListItem.upsert({
        where: {
          priceListId_productId_minimumQuantity: {
            priceListId: priceList.id,
            productId: product.id,
            minimumQuantity: 1,
          },
        },
        update: { price: tieredPrice },
        create: {
          priceListId: priceList.id,
          productId: product.id,
          price: tieredPrice,
          minimumQuantity: 1,
        },
      });
    }
  }

  return seededPriceLists;
}

/**
 * 6. Seed Tiered Discount Rules
 */
export async function seedDiscountRules(categories) {
  console.log('🏷️ Seeding Discount Rules...');
  const rules = [
    // GOLD TIER
    {
      customerTier: CustomerTier.GOLD,
      categoryName: 'Hardware',
      maxDiscountPercentage: 15.0,
      managerApprovalRequiredAbove: 10.0,
      financeApprovalRequiredAbove: 15.0,
    },
    {
      customerTier: CustomerTier.GOLD,
      categoryName: 'Services',
      maxDiscountPercentage: 10.0,
      managerApprovalRequiredAbove: 5.0,
      financeApprovalRequiredAbove: 10.0,
    },
    {
      customerTier: CustomerTier.GOLD,
      categoryName: 'Subscriptions',
      maxDiscountPercentage: 20.0,
      managerApprovalRequiredAbove: 12.0,
      financeApprovalRequiredAbove: 20.0,
    },
    // SILVER TIER
    {
      customerTier: CustomerTier.SILVER,
      categoryName: 'Hardware',
      maxDiscountPercentage: 10.0,
      managerApprovalRequiredAbove: 6.0,
      financeApprovalRequiredAbove: 10.0,
    },
    {
      customerTier: CustomerTier.SILVER,
      categoryName: 'Services',
      maxDiscountPercentage: 8.0,
      managerApprovalRequiredAbove: 4.0,
      financeApprovalRequiredAbove: 8.0,
    },
    {
      customerTier: CustomerTier.SILVER,
      categoryName: 'Subscriptions',
      maxDiscountPercentage: 15.0,
      managerApprovalRequiredAbove: 8.0,
      financeApprovalRequiredAbove: 15.0,
    },
    // BRONZE TIER
    {
      customerTier: CustomerTier.BRONZE,
      categoryName: 'Hardware',
      maxDiscountPercentage: 5.0,
      managerApprovalRequiredAbove: 3.0,
      financeApprovalRequiredAbove: 5.0,
    },
    {
      customerTier: CustomerTier.BRONZE,
      categoryName: 'Services',
      maxDiscountPercentage: 5.0,
      managerApprovalRequiredAbove: 2.0,
      financeApprovalRequiredAbove: 5.0,
    },
    {
      customerTier: CustomerTier.BRONZE,
      categoryName: 'Subscriptions',
      maxDiscountPercentage: 8.0,
      managerApprovalRequiredAbove: 4.0,
      financeApprovalRequiredAbove: 8.0,
    },
  ];

  for (const r of rules) {
    const category = categories[r.categoryName];
    await prisma.discountRule.upsert({
      where: {
        customerTier_categoryId: {
          customerTier: r.customerTier,
          categoryId: category.id,
        },
      },
      update: {
        maxDiscountPercentage: r.maxDiscountPercentage,
        managerApprovalRequiredAbove: r.managerApprovalRequiredAbove,
        financeApprovalRequiredAbove: r.financeApprovalRequiredAbove,
      },
      create: {
        customerTier: r.customerTier,
        categoryId: category.id,
        maxDiscountPercentage: r.maxDiscountPercentage,
        managerApprovalRequiredAbove: r.managerApprovalRequiredAbove,
        financeApprovalRequiredAbove: r.financeApprovalRequiredAbove,
      },
    });
  }
}

/**
 * 7. Seed Approval Chains & Multi-tier Steps
 */
export async function seedApprovalChains() {
  console.log('⛓️ Seeding Approval Chains...');
  const chain = await prisma.approvalChain.upsert({
    where: { name: 'Standard Deal Approval Chain' },
    update: { isActive: true },
    create: {
      name: 'Standard Deal Approval Chain',
      isActive: true,
    },
  });

  const steps = [
    {
      stepOrder: 1,
      role: UserRole.SALES_MANAGER,
      minimumRiskScore: 0.0,
      maximumRiskScore: 50.0,
    },
    {
      stepOrder: 2,
      role: UserRole.FINANCE,
      minimumRiskScore: 50.01,
      maximumRiskScore: 80.0,
    },
    {
      stepOrder: 3,
      role: UserRole.ADMIN,
      minimumRiskScore: 80.01,
      maximumRiskScore: 100.0,
    },
  ];

  for (const s of steps) {
    await prisma.approvalChainStep.upsert({
      where: {
        approvalChainId_stepOrder: {
          approvalChainId: chain.id,
          stepOrder: s.stepOrder,
        },
      },
      update: {
        role: s.role,
        minimumRiskScore: s.minimumRiskScore,
        maximumRiskScore: s.maximumRiskScore,
      },
      create: {
        approvalChainId: chain.id,
        stepOrder: s.stepOrder,
        role: s.role,
        minimumRiskScore: s.minimumRiskScore,
        maximumRiskScore: s.maximumRiskScore,
      },
    });
  }

  return chain;
}

/**
 * 8. Seed Warehouses
 */
export async function seedWarehouses() {
  console.log('🏭 Seeding Warehouses...');
  const warehouses = [
    {
      name: 'Main Distribution Center (Chicago)',
      location: 'Chicago, IL, USA',
      shippingCost: 35.0,
      isActive: true,
    },
    {
      name: 'East Coast Logistics Hub (Newark)',
      location: 'Newark, NJ, USA',
      shippingCost: 45.0,
      isActive: true,
    },
  ];

  const seededWarehouses = {};
  for (const w of warehouses) {
    const warehouse = await prisma.warehouse.upsert({
      where: { name: w.name },
      update: { location: w.location, shippingCost: w.shippingCost },
      create: w,
    });
    seededWarehouses[w.name] = warehouse;
  }
  return seededWarehouses;
}

/**
 * 9. Seed Inventory across Warehouses
 */
export async function seedInventory(warehouses, products) {
  console.log('📦 Seeding Inventory Balances...');
  const mainWh = warehouses['Main Distribution Center (Chicago)'];
  const eastWh = warehouses['East Coast Logistics Hub (Newark)'];

  const inventoryStock = [
    // Laptop in Chicago
    { warehouseId: mainWh.id, sku: 'HW-LAPTOP-15', qty: 75, reserved: 10, reorder: 20 },
    // Laptop in East Coast (scarce inventory, ready for backorder demo)
    { warehouseId: eastWh.id, sku: 'HW-LAPTOP-15', qty: 4, reserved: 2, reorder: 15 },

    // Monitor in Chicago
    { warehouseId: mainWh.id, sku: 'HW-MONITOR-27', qty: 120, reserved: 15, reorder: 25 },
    // Monitor in East Coast
    { warehouseId: eastWh.id, sku: 'HW-MONITOR-27', qty: 50, reserved: 5, reorder: 20 },

    // Keyboard in Chicago
    { warehouseId: mainWh.id, sku: 'HW-KEYBOARD-MECH', qty: 200, reserved: 20, reorder: 30 },
    // Keyboard in East Coast
    { warehouseId: eastWh.id, sku: 'HW-KEYBOARD-MECH', qty: 90, reserved: 10, reorder: 20 },
  ];

  for (const stock of inventoryStock) {
    const product = products[stock.sku];
    if (!product) continue;

    const existing = await prisma.inventory.findFirst({
      where: {
        warehouseId: stock.warehouseId,
        productId: product.id,
        variantId: stock.variantId || null,
      },
    });

    if (existing) {
      await prisma.inventory.update({
        where: { id: existing.id },
        data: {
          quantityAvailable: stock.qty,
          quantityReserved: stock.reserved,
          reorderLevel: stock.reorder,
        },
      });
    } else {
      await prisma.inventory.create({
        data: {
          warehouseId: stock.warehouseId,
          productId: product.id,
          variantId: stock.variantId || null,
          quantityAvailable: stock.qty,
          quantityReserved: stock.reserved,
          reorderLevel: stock.reorder,
        },
      });
    }
  }
}

/**
 * 10. Seed Subscription Plans
 */
export async function seedSubscriptionPlans() {
  console.log('🔄 Seeding Subscription Plans...');
  const plans = [
    {
      name: 'DealFlow Cloud - Monthly Starter',
      billingInterval: BillingInterval.MONTHLY,
      price: 120.0,
      currency: 'USD',
      prorationEnabled: true,
      cancellationPolicy: 'Cancel anytime with 30-day notice',
      refundPolicy: 'Pro-rata refund for unused full billing periods',
    },
    {
      name: 'DealFlow Cloud - Quarterly Business',
      billingInterval: BillingInterval.QUARTERLY,
      price: 330.0, // 10% discount over 3 single months
      currency: 'USD',
      prorationEnabled: true,
      cancellationPolicy: 'Quarter-end cancellation',
      refundPolicy: 'Non-refundable after 14 days',
    },
    {
      name: 'DealFlow Cloud - Annual Enterprise',
      billingInterval: BillingInterval.YEARLY,
      price: 1200.0, // 2 months free equivalent
      currency: 'USD',
      prorationEnabled: false,
      cancellationPolicy: 'Annual commitment',
      refundPolicy: 'Non-refundable',
    },
  ];

  const seededPlans = {};
  for (const p of plans) {
    const plan = await prisma.subscriptionPlan.upsert({
      where: { name: p.name },
      update: {
        billingInterval: p.billingInterval,
        price: p.price,
        currency: p.currency,
      },
      create: p,
    });
    seededPlans[p.billingInterval] = plan;
  }
  return seededPlans;
}

/**
 * 11. Seed Upsell and Cross-Sell Rules
 */
export async function seedUpsellRules(products) {
  console.log('💡 Seeding Upsell & Cross-Sell Rules...');
  const laptop = products['HW-LAPTOP-15'];
  const monitor = products['HW-MONITOR-27'];
  const keyboard = products['HW-KEYBOARD-MECH'];
  const installService = products['SVC-INSTALL-ONSITE'];
  const supportPlan = products['SUB-SUPPORT-PLATINUM'];

  const rules = [
    // Cross-sell: Buy Laptop -> recommend Monitor
    {
      productId: laptop.id,
      recommendedProductId: monitor.id,
      ruleType: RuleType.CROSS_SELL,
      priority: 1,
      promotionTag: 'BUNDLE & SAVE 10%',
      minimumMarginPercentage: 20.0,
    },
    // Cross-sell: Buy Laptop -> recommend Mechanical Keyboard
    {
      productId: laptop.id,
      recommendedProductId: keyboard.id,
      ruleType: RuleType.CROSS_SELL,
      priority: 2,
      promotionTag: 'COMPANION ACCESSORY',
      minimumMarginPercentage: 25.0,
    },
    // Upsell: Buy Installation Service -> recommend Platinum Support Plan
    {
      productId: installService.id,
      recommendedProductId: supportPlan.id,
      ruleType: RuleType.UPSELL,
      priority: 1,
      promotionTag: 'PEACE OF MIND COVERAGE',
      minimumMarginPercentage: 40.0,
    },
  ];

  for (const r of rules) {
    await prisma.upsellCrossSellRule.upsert({
      where: {
        productId_recommendedProductId_ruleType: {
          productId: r.productId,
          recommendedProductId: r.recommendedProductId,
          ruleType: r.ruleType,
        },
      },
      update: {
        priority: r.priority,
        promotionTag: r.promotionTag,
        minimumMarginPercentage: r.minimumMarginPercentage,
      },
      create: r,
    });
  }
}

/**
 * 12. Seed Complete End-to-End Demo Workflow
 * (Quotes, Items, Approval Chain, Order, Multi-warehouse Fulfillment Split,
 *  Backorder, Subscription, Invoice, simulated Payment, Negotiation, Deal Health & Audit Logs)
 */
export async function seedDemoData(users, customers, products, plans, warehouses) {
  console.log('🚀 Seeding End-to-End Demo Workflow Transactions...');

  const goldCustomer = customers[CustomerTier.GOLD];
  const salesRep = users[UserRole.SALES_REP];
  const salesManager = users[UserRole.SALES_MANAGER];
  const laptop = products['HW-LAPTOP-15'];
  const installService = products['SVC-INSTALL-ONSITE'];
  const cloudStorage = products['SUB-CLOUD-STORAGE'];
  const mainWh = warehouses['Main Distribution Center (Chicago)'];
  const eastWh = warehouses['East Coast Logistics Hub (Newark)'];
  const monthlyPlan = plans[BillingInterval.MONTHLY];

  // A. Seed Quotation
  const quoteNumber = 'DF-2026-0001';
  const quote = await prisma.quotation.upsert({
    where: { quoteNumber },
    update: {
      status: QuoteStatus.APPROVED,
      totalAmount: 9400.0,
      subtotal: 10400.0,
      discountAmount: 1000.0,
      marginAmount: 3800.0,
      marginPercentage: 40.42,
    },
    create: {
      quoteNumber,
      customerId: goldCustomer.id,
      salesRepId: salesRep.id,
      status: QuoteStatus.APPROVED,
      subtotal: 10400.0,
      discountAmount: 1000.0,
      taxAmount: 520.0,
      totalAmount: 9920.0,
      marginAmount: 3800.0,
      marginPercentage: 40.42,
      riskScore: 25.5,
      riskLevel: RiskLevel.LOW,
      approvalRequired: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // B. Seed Quotation Items (1-time hardware + 1-time service + recurring subscription)
  await prisma.quotationItem.deleteMany({ where: { quotationId: quote.id } });

  const qItem1 = await prisma.quotationItem.create({
    data: {
      quotationId: quote.id,
      productId: laptop.id,
      quantity: 5,
      unitPrice: 1800.0,
      discountPercentage: 10.0,
      discountAmount: 900.0,
      taxAmount: 425.0,
      lineTotal: 8525.0,
      costPrice: 1200.0,
      marginAmount: 2100.0,
      marginPercentage: 25.88,
    },
  });

  await prisma.quotationItem.create({
    data: {
      quotationId: quote.id,
      productId: installService.id,
      quantity: 1,
      unitPrice: 1500.0,
      discountPercentage: 6.67,
      discountAmount: 100.0,
      taxAmount: 70.0,
      lineTotal: 1470.0,
      costPrice: 800.0,
      marginAmount: 600.0,
      marginPercentage: 42.86,
    },
  });

  await prisma.quotationItem.create({
    data: {
      quotationId: quote.id,
      productId: cloudStorage.id,
      quantity: 10,
      unitPrice: 120.0,
      discountPercentage: 0.0,
      discountAmount: 0.0,
      taxAmount: 0.0,
      lineTotal: 1200.0,
      costPrice: 25.0,
      marginAmount: 950.0,
      marginPercentage: 79.17,
    },
  });

  // C. Seed Approval Request & Traceable History
  const approvalReq = await prisma.approvalRequest.upsert({
    where: { id: `app-req-${quote.id}` },
    update: { status: ApprovalStatus.APPROVED },
    create: {
      id: `app-req-${quote.id}`,
      quotationId: quote.id,
      currentStep: 1,
      status: ApprovalStatus.APPROVED,
      completedAt: new Date(),
    },
  });

  await prisma.approvalActionHistory.deleteMany({ where: { quotationId: quote.id } });
  await prisma.approvalActionHistory.create({
    data: {
      quotationId: quote.id,
      approvalRequestId: approvalReq.id,
      reviewerId: salesManager.id,
      action: ApprovalAction.APPROVED,
      reason: 'Standard 10% discount approved for Strategic Gold Enterprise Tier Account.',
    },
  });

  // D. Seed Deal Health
  await prisma.dealHealth.upsert({
    where: { quotationId: quote.id },
    update: { healthStatus: DealHealthStatus.HEALTHY, inactivityDays: 1 },
    create: {
      quotationId: quote.id,
      healthStatus: DealHealthStatus.HEALTHY,
      inactivityDays: 1,
      deliveryRisk: false,
      discountAnomaly: false,
      riskReason: 'Quote within authorized policy parameters.',
    },
  });

  // E. Seed Order from Confirmed Quote
  const orderNumber = 'ORD-2026-0001';
  const order = await prisma.order.upsert({
    where: { orderNumber },
    update: { status: OrderStatus.CONFIRMED },
    create: {
      orderNumber,
      quotationId: quote.id,
      customerId: goldCustomer.id,
      status: OrderStatus.CONFIRMED,
      subtotal: 10400.0,
      discountAmount: 1000.0,
      taxAmount: 495.0,
      totalAmount: 9895.0,
    },
  });

  // F. Seed Order Items (mixed one-time & recurring)
  await prisma.orderItem.deleteMany({ where: { orderId: order.id } });
  await prisma.orderItem.createMany({
    data: [
      {
        orderId: order.id,
        productId: laptop.id,
        quantity: 5,
        unitPrice: 1800.0,
        discountPercentage: 10.0,
        lineTotal: 8100.0,
        isRecurring: false,
      },
      {
        orderId: order.id,
        productId: installService.id,
        quantity: 1,
        unitPrice: 1500.0,
        discountPercentage: 6.67,
        lineTotal: 1400.0,
        isRecurring: false,
      },
      {
        orderId: order.id,
        productId: cloudStorage.id,
        quantity: 10,
        unitPrice: 120.0,
        discountPercentage: 0.0,
        lineTotal: 1200.0,
        isRecurring: true,
      },
    ],
  });

  // G. Seed Fulfillment & Multi-Warehouse Fulfillment Split
  const fulfillment = await prisma.fulfillment.upsert({
    where: { id: `ful-${order.id}` },
    update: { status: FulfillmentStatus.PROCESSING },
    create: {
      id: `ful-${order.id}`,
      orderId: order.id,
      status: FulfillmentStatus.PROCESSING,
      estimatedShipmentCount: 2,
      estimatedShippingCost: 80.0,
    },
  });

  await prisma.fulfillmentSplit.deleteMany({ where: { fulfillmentId: fulfillment.id } });

  // Split 1: 3 Laptops shipped from Chicago
  const split1 = await prisma.fulfillmentSplit.create({
    data: {
      fulfillmentId: fulfillment.id,
      warehouseId: mainWh.id,
      productId: laptop.id,
      quantity: 3,
      shippingCost: 35.0,
      status: FulfillmentSplitStatus.SHIPPED,
    },
  });

  // Split 2: 2 Laptops allocated to East Coast (scarce stock -> 1 allocated, 1 backordered)
  const split2 = await prisma.fulfillmentSplit.create({
    data: {
      fulfillmentId: fulfillment.id,
      warehouseId: eastWh.id,
      productId: laptop.id,
      quantity: 2,
      shippingCost: 45.0,
      status: FulfillmentSplitStatus.BACKORDERED,
    },
  });

  // H. Seed Backorder Record
  await prisma.backorder.deleteMany({ where: { fulfillmentSplitId: split2.id } });
  await prisma.backorder.create({
    data: {
      fulfillmentSplitId: split2.id,
      productId: laptop.id,
      quantity: 1,
      status: BackorderStatus.OPEN,
    },
  });

  // I. Seed Subscription & Billing Schedule
  const subscription = await prisma.subscription.upsert({
    where: { id: `sub-${order.id}` },
    update: { status: SubscriptionStatus.ACTIVE },
    create: {
      id: `sub-${order.id}`,
      customerId: goldCustomer.id,
      orderId: order.id,
      productId: cloudStorage.id,
      planId: monthlyPlan.id,
      quantity: 10,
      startDate: new Date(),
      status: SubscriptionStatus.ACTIVE,
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.billingSchedule.deleteMany({ where: { subscriptionId: subscription.id } });
  await prisma.billingSchedule.createMany({
    data: [
      {
        subscriptionId: subscription.id,
        billingDate: new Date(),
        amount: 1200.0,
        status: BillingScheduleStatus.PAID,
      },
      {
        subscriptionId: subscription.id,
        billingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        amount: 1200.0,
        status: BillingScheduleStatus.UPCOMING,
      },
      {
        subscriptionId: subscription.id,
        billingDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        amount: 1200.0,
        status: BillingScheduleStatus.UPCOMING,
      },
    ],
  });

  // J. Seed Invoice & Simulated Payment
  const invoiceNumber = 'INV-2026-0001';
  const invoice = await prisma.invoice.upsert({
    where: { invoiceNumber },
    update: { status: InvoiceStatus.PAID },
    create: {
      invoiceNumber,
      orderId: order.id,
      customerId: goldCustomer.id,
      type: InvoiceType.ONE_TIME,
      subtotal: 9500.0,
      taxAmount: 495.0,
      totalAmount: 9995.0,
      status: InvoiceStatus.PAID,
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      paidAt: new Date(),
    },
  });

  await prisma.invoiceItem.deleteMany({ where: { invoiceId: invoice.id } });
  await prisma.invoiceItem.create({
    data: {
      invoiceId: invoice.id,
      productId: laptop.id,
      description: 'Enterprise Laptop Pro 15 (x5)',
      quantity: 5,
      unitPrice: 1620.0,
      amount: 8100.0,
      isRecurring: false,
    },
  });

  await prisma.payment.deleteMany({ where: { invoiceId: invoice.id } });
  await prisma.payment.create({
    data: {
      invoiceId: invoice.id,
      amount: 9995.0,
      paymentMethod: 'ACH_TRANSFER',
      transactionReference: 'TXN-SIM-2026-99881',
      status: PaymentStatus.SUCCESSFUL,
      paidAt: new Date(),
    },
  });

  // K. Seed Customer Negotiation & Messages
  const negotiation = await prisma.negotiation.upsert({
    where: { id: `neg-${quote.id}` },
    update: { status: NegotiationStatus.SALES_RESPONDED },
    create: {
      id: `neg-${quote.id}`,
      quotationId: quote.id,
      customerId: goldCustomer.id,
      status: NegotiationStatus.SALES_RESPONDED,
      counterDiscountPercentage: 12.5,
      customerMessage: 'Can we achieve 12.5% discount if we commit to an annual cloud storage plan upfront?',
      salesResponse: 'We can honor 10% on the laptops and provide 2 months free storage on the annual plan commitment.',
    },
  });

  await prisma.negotiationMessage.deleteMany({ where: { negotiationId: negotiation.id } });
  await prisma.negotiationMessage.createMany({
    data: [
      {
        negotiationId: negotiation.id,
        senderType: SenderType.CUSTOMER,
        senderId: goldCustomer.id,
        message: 'Requesting review of laptop line item discount.',
        quotationItemId: qItem1.id,
      },
      {
        negotiationId: negotiation.id,
        senderType: SenderType.SALES_REP,
        senderId: salesRep.id,
        message: 'Discussed with manager. Tier discount locked at 10% with complimentary priority logistics.',
        quotationItemId: qItem1.id,
      },
    ],
  });

  // L. Seed Audit Log Record
  await prisma.auditLog.create({
    data: {
      userId: salesManager.id,
      entityType: 'QUOTATION',
      entityId: quote.id,
      action: 'APPROVE_DISCOUNT',
      oldValue: { status: 'PENDING_APPROVAL', discountPercentage: 10.0 },
      newValue: { status: 'APPROVED', approvedBy: salesManager.email },
      reason: 'Strategic enterprise gold tier renewal discount authorization.',
    },
  });

  console.log('✅ Demo Workflow Transactions seeded successfully.');
}

/**
 * Main Seed Runner
 */
export async function seed() {
  console.log('🌱 Starting DealFlow360 Database Seeding Process...');

  const users = await seedUsers();
  const customers = await seedCustomers();
  const categories = await seedCategories();
  const products = await seedProducts(categories);
  const priceLists = await seedPriceLists(products);
  await seedDiscountRules(categories);
  const approvalChain = await seedApprovalChains();
  const warehouses = await seedWarehouses();
  await seedInventory(warehouses, products);
  const plans = await seedSubscriptionPlans();
  await seedUpsellRules(products);
  await seedDemoData(users, customers, products, plans, warehouses);

  console.log('🎉 DealFlow360 Database Seeding complete and verified!');
}

seed()
  .catch((e) => {
    console.error('❌ Seeding failed with error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
