# Database Design Document

## Smart Price Tracker

**Version:** 1.0  
**Date:** February 23, 2026  
**Database:** PostgreSQL  
**ORM:** Prisma 7.2.0  
**Status:** Active Development

**Development Team:**
- Varun Singh (2547254)
- Ananya M (2547259)
- Prajwal KT (2547239)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Database Selection](#2-database-selection)
3. [Schema Design](#3-schema-design)
4. [Entity Relationship Diagram](#4-entity-relationship-diagram)
5. [Data Dictionary](#5-data-dictionary)
6. [Indexes and Performance](#6-indexes-and-performance)
7. [Constraints and Validation](#7-constraints-and-validation)
8. [Migration Strategy](#8-migration-strategy)
9. [Security Considerations](#9-security-considerations)
10. [Scaling Strategy](#10-scaling-strategy)
11. [Backup and Recovery](#11-backup-and-recovery)

---

## 1. Overview

### 1.1 Purpose

This document describes the database design for the Smart Price Tracker application, a web platform that tracks product prices across multiple e-commerce platforms and provides price alerts to users.

### 1.2 Development Phases

The database design is implemented in phases:

- **Phase 1 (Current)**: User authentication and management
- **Phase 2 (Planned)**: Product tracking, price history, and alerts
- **Phase 3 (Future)**: Advanced features (wishlists, categories, sharing)

### 1.3 Key Requirements

- Support user authentication (email/password and OAuth)
- Store and track product information from multiple platforms
- Maintain historical price data for trend analysis
- Manage user-defined price alerts
- Ensure data integrity and referential consistency
- Support high read/write operations for price updates

---

## 2. Database Selection

### 2.1 Database: PostgreSQL

**Rationale:**
- **ACID Compliance**: Ensures data consistency for financial data (prices)
- **JSON Support**: Native JSONB type for flexible metadata storage
- **Advanced Indexing**: Supports B-tree, Hash, GiST, and GIN indexes
- **Full-Text Search**: Built-in for product search capabilities
- **Scalability**: Excellent horizontal and vertical scaling options
- **Open Source**: No licensing costs with robust community support
- **Prisma Integration**: First-class support with type-safe queries

### 2.2 ORM: Prisma

**Benefits:**
- Type-safe database access
- Auto-generated migrations
- Declarative schema definition
- Built-in connection pooling
- Query optimization
- Database introspection tools

---

## 3. Schema Design

### 3.1 Current Schema (Phase 1)

#### User Model

```prisma
model User {
  id         String   @id @default(cuid())
  email      String   @unique
  password   String?  // nullable for OAuth users
  googleId   String?  @unique
  username   String?  @unique
  name       String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

**Purpose**: Manages user accounts with support for both traditional email/password authentication and Google OAuth.

**Key Features**:
- Unique email addresses for each user
- Optional password (null for OAuth-only users)
- Optional Google ID for OAuth integration
- Username can be unique if provided
- Automatic timestamp management

---

### 3.2 Planned Schema (Phase 2)

#### Complete Schema Definition

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String    @id @default(cuid())
  email     String    @unique
  password  String?   // nullable for OAuth users
  googleId  String?   @unique
  username  String?   @unique
  name      String?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  
  // Relations
  products  Product[]
  alerts    Alert[]
  
  @@index([email])
  @@index([googleId])
  @@map("users")
}

model Product {
  id          String   @id @default(cuid())
  url         String   // Original product URL
  title       String
  platform    String   // Platform name (Amazon, eBay, Walmart, etc.)
  imageUrl    String?  // Product image
  currentPrice Float?  // Latest known price
  currency    String   @default("USD")
  inStock     Boolean  @default(true)
  productId   String?  // Platform-specific product ID (ASIN, etc.)
  metadata    Json?    // Additional flexible data (brand, specs, etc.)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  lastChecked DateTime @default(now())
  
  // Foreign Keys
  userId      String
  
  // Relations
  user        User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  priceHistory PriceHistory[]
  alerts      Alert[]
  
  @@index([userId])
  @@index([platform])
  @@index([lastChecked])
  @@unique([url, userId]) // Prevent duplicate URL tracking per user
  @@map("products")
}

model PriceHistory {
  id        String   @id @default(cuid())
  price     Float
  inStock   Boolean  @default(true)
  scrapedAt DateTime @default(now())
  
  // Foreign Keys
  productId String
  
  // Relations
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  @@index([productId])
  @@index([scrapedAt])
  @@map("price_history")
}

model Alert {
  id           String   @id @default(cuid())
  targetPrice  Float    // Price threshold to trigger alert
  active       Boolean  @default(true)
  notified     Boolean  @default(false)
  notifiedAt   DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  // Foreign Keys
  userId       String
  productId    String
  
  // Relations
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  product      Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([productId])
  @@index([active, notified]) // Compound index for alert processing
  @@map("alerts")
}
```

---

### 3.3 Future Extensions (Phase 3)

#### Category Model (Optional)

```prisma
model Category {
  id        String    @id @default(cuid())
  name      String    @unique
  slug      String    @unique
  icon      String?
  createdAt DateTime  @default(now())
  
  products  ProductCategory[]
  
  @@map("categories")
}

model ProductCategory {
  productId  String
  categoryId String
  
  product    Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  
  @@id([productId, categoryId])
  @@map("product_categories")
}
```

#### Wishlist Sharing Model (Optional)

```prisma
model Wishlist {
  id          String   @id @default(cuid())
  name        String
  description String?
  isPublic    Boolean  @default(false)
  shareToken  String?  @unique
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  items       WishlistItem[]
  
  @@index([userId])
  @@index([shareToken])
  @@map("wishlists")
}

model WishlistItem {
  id         String   @id @default(cuid())
  notes      String?
  addedAt    DateTime @default(now())
  
  wishlistId String
  productId  String
  
  wishlist   Wishlist @relation(fields: [wishlistId], references: [id], onDelete: Cascade)
  product    Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  @@unique([wishlistId, productId])
  @@map("wishlist_items")
}
```

---

## 4. Entity Relationship Diagram

### 4.1 Phase 2 ERD

```
┌─────────────────────────────────────────┐
│                  User                   │
├─────────────────────────────────────────┤
│ PK id          String (CUID)            │
│ UK email       String                   │
│ UK googleId    String?                  │
│ UK username    String?                  │
│    password    String?                  │
│    name        String?                  │
│    createdAt   DateTime                 │
│    updatedAt   DateTime                 │
└────────────┬───────────────────────┬────┘
             │                       │
             │ 1                     │ 1
             │                       │
             │ n                     │ n
             │                       │
┌────────────▼─────────────────────┐ │
│          Product                 │ │
├──────────────────────────────────┤ │
│ PK id          String (CUID)     │ │
│    url         String            │ │
│    title       String            │ │
│    platform    String            │ │
│    imageUrl    String?           │ │
│    currentPrice Float?           │ │
│    currency    String            │ │
│    inStock     Boolean           │ │
│    productId   String?           │ │
│    metadata    JSON?             │ │
│    createdAt   DateTime          │ │
│    updatedAt   DateTime          │ │
│    lastChecked DateTime          │ │
│ FK userId      String            │ │
│ UK (url, userId)                 │ │
└────────────┬─────────────────────┘ │
             │                       │
             │ 1                     │
             │                       │
             │ n                     │
             │                       │
┌────────────▼─────────────────────┐ │
│       PriceHistory               │ │
├──────────────────────────────────┤ │
│ PK id          String (CUID)     │ │
│    price       Float             │ │
│    inStock     Boolean           │ │
│    scrapedAt   DateTime          │ │
│ FK productId   String            │ │
└──────────────────────────────────┘ │
                                     │
             ┌───────────────────────┘
             │
             │ n
             │
┌────────────▼─────────────────────┐
│           Alert                  │
├──────────────────────────────────┤
│ PK id          String (CUID)     │
│    targetPrice Float             │
│    active      Boolean           │
│    notified    Boolean           │
│    notifiedAt  DateTime?         │
│    createdAt   DateTime          │
│    updatedAt   DateTime          │
│ FK userId      String            │
│ FK productId   String            │
└──────────────────────────────────┘
```

### 4.2 Cardinality

| Relationship | Type | Description |
|--------------|------|-------------|
| User → Product | 1:N | One user can track many products |
| User → Alert | 1:N | One user can create many alerts |
| Product → PriceHistory | 1:N | One product has many price records |
| Product → Alert | 1:N | One product can have many alerts |

---

## 5. Data Dictionary

### 5.1 User Table

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | String (CUID) | No | cuid() | Primary key, unique user identifier |
| email | String | No | - | User's email address (unique) |
| password | String | Yes | null | Hashed password (null for OAuth users) |
| googleId | String | Yes | null | Google OAuth identifier (unique) |
| username | String | Yes | null | User's display username (unique if set) |
| name | String | Yes | null | User's full name |
| createdAt | DateTime | No | now() | Account creation timestamp |
| updatedAt | DateTime | No | now() | Last update timestamp (auto-updated) |

**Constraints:**
- PRIMARY KEY: `id`
- UNIQUE: `email`, `googleId`, `username`

---

### 5.2 Product Table

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | String (CUID) | No | cuid() | Primary key, unique product identifier |
| url | String | No | - | Full product URL on e-commerce platform |
| title | String | No | - | Product title/name |
| platform | String | No | - | Platform name (Amazon, eBay, Walmart, etc.) |
| imageUrl | String | Yes | null | Product thumbnail URL |
| currentPrice | Float | Yes | null | Latest scraped price |
| currency | String | No | "USD" | Currency code (ISO 4217) |
| inStock | Boolean | No | true | Current stock availability |
| productId | String | Yes | null | Platform-specific ID (ASIN, SKU, etc.) |
| metadata | JSON | Yes | null | Additional flexible data (brand, specs) |
| createdAt | DateTime | No | now() | Record creation timestamp |
| updatedAt | DateTime | No | now() | Last update timestamp |
| lastChecked | DateTime | No | now() | Last price check timestamp |
| userId | String (FK) | No | - | Foreign key to User |

**Constraints:**
- PRIMARY KEY: `id`
- FOREIGN KEY: `userId` → `users.id` (CASCADE DELETE)
- UNIQUE: `(url, userId)` - Prevents duplicate URL tracking per user

---

### 5.3 PriceHistory Table

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | String (CUID) | No | cuid() | Primary key |
| price | Float | No | - | Recorded price at scrape time |
| inStock | Boolean | No | true | Stock status at scrape time |
| scrapedAt | DateTime | No | now() | Timestamp when price was scraped |
| productId | String (FK) | No | - | Foreign key to Product |

**Constraints:**
- PRIMARY KEY: `id`
- FOREIGN KEY: `productId` → `products.id` (CASCADE DELETE)

---

### 5.4 Alert Table

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | String (CUID) | No | cuid() | Primary key |
| targetPrice | Float | No | - | Price threshold to trigger notification |
| active | Boolean | No | true | Whether alert is enabled |
| notified | Boolean | No | false | Whether user has been notified |
| notifiedAt | DateTime | Yes | null | Timestamp of last notification |
| createdAt | DateTime | No | now() | Alert creation timestamp |
| updatedAt | DateTime | No | now() | Last update timestamp |
| userId | String (FK) | No | - | Foreign key to User |
| productId | String (FK) | No | - | Foreign key to Product |

**Constraints:**
- PRIMARY KEY: `id`
- FOREIGN KEY: `userId` → `users.id` (CASCADE DELETE)
- FOREIGN KEY: `productId` → `products.id` (CASCADE DELETE)

---

## 6. Indexes and Performance

### 6.1 Primary Indexes

All tables have a primary index on `id` (CUID).

### 6.2 Unique Indexes

| Table | Column(s) | Purpose |
|-------|-----------|---------|
| users | email | Fast user lookup by email |
| users | googleId | OAuth user identification |
| users | username | Unique username enforcement |
| products | (url, userId) | Prevent duplicate product tracking |

### 6.3 Performance Indexes

| Table | Column(s) | Type | Purpose |
|-------|-----------|------|---------|
| products | userId | B-tree | Fast user product queries |
| products | platform | B-tree | Filter by e-commerce platform |
| products | lastChecked | B-tree | Identify products needing price updates |
| price_history | productId | B-tree | Retrieve price history for products |
| price_history | scrapedAt | B-tree | Time-series queries and trends |
| alerts | userId | B-tree | User alert management |
| alerts | productId | B-tree | Product-specific alerts |
| alerts | (active, notified) | Compound | Efficient alert processing queries |

### 6.4 Query Optimization Strategies

**Common Queries:**

1. **Get user's tracked products with current price:**
   ```sql
   SELECT * FROM products WHERE userId = ? ORDER BY lastChecked DESC
   ```
   - Uses index on `userId`

2. **Get price history for a product:**
   ```sql
   SELECT * FROM price_history WHERE productId = ? ORDER BY scrapedAt DESC
   ```
   - Uses index on `productId` and `scrapedAt`

3. **Find products needing price updates:**
   ```sql
   SELECT * FROM products WHERE lastChecked < NOW() - INTERVAL '1 hour'
   ```
   - Uses index on `lastChecked`

4. **Check active alerts for price drops:**
   ```sql
   SELECT * FROM alerts 
   WHERE active = true AND notified = false 
   AND productId IN (SELECT id FROM products WHERE currentPrice <= alerts.targetPrice)
   ```
   - Uses compound index on `(active, notified)`

---

## 7. Constraints and Validation

### 7.1 Database-Level Constraints

| Constraint Type | Table | Description |
|----------------|-------|-------------|
| PRIMARY KEY | All tables | Ensures unique row identification |
| FOREIGN KEY | products.userId | Referential integrity with users |
| FOREIGN KEY | price_history.productId | Referential integrity with products |
| FOREIGN KEY | alerts.userId | Referential integrity with users |
| FOREIGN KEY | alerts.productId | Referential integrity with products |
| UNIQUE | users.email | Prevent duplicate email addresses |
| UNIQUE | users.googleId | Prevent duplicate OAuth accounts |
| UNIQUE | users.username | Unique username when provided |
| UNIQUE | products(url, userId) | Prevent duplicate product tracking |
| NOT NULL | Various | Enforce required fields |
| DEFAULT | Various | Provide sensible default values |

### 7.2 Cascade Deletion Rules

| Parent → Child | Action | Rationale |
|----------------|--------|-----------|
| User → Product | CASCADE | When user deleted, remove their tracked products |
| User → Alert | CASCADE | When user deleted, remove their alerts |
| Product → PriceHistory | CASCADE | When product deleted, remove price history |
| Product → Alert | CASCADE | When product deleted, remove associated alerts |

### 7.3 Application-Level Validation

**User Model:**
- Email: Valid email format (RFC 5322)
- Password: Minimum 8 characters (if provided)
- Username: 3-30 characters, alphanumeric + underscore
- At least one auth method required (password OR googleId)

**Product Model:**
- URL: Valid HTTP/HTTPS URL format
- Platform: Enum validation (Amazon, eBay, Walmart, etc.)
- Currency: Valid ISO 4217 currency code
- Price: Positive number with 2 decimal places

**Alert Model:**
- targetPrice: Positive number
- Must reference valid product and user

---

## 8. Migration Strategy

### 8.1 Prisma Migrate

All schema changes are managed through Prisma Migrate:

```bash
# Development: Create and apply migration
npx prisma migrate dev --name migration_description

# Production: Apply pending migrations
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

### 8.2 Migration History

| Migration | Date | Description |
|-----------|------|-------------|
| 20260112103856_init | Jan 12, 2026 | Initial User model creation |
| [Pending] | TBD | Add Product, PriceHistory, Alert models |

### 8.3 Migration Best Practices

1. **Always backup production data** before migrations
2. **Test migrations** in staging environment first
3. **Use descriptive names** for migrations
4. **Never modify** existing migration files
5. **Create new migrations** for schema changes
6. **Keep migrations atomic** - one logical change per migration
7. **Document breaking changes** in migration comments

### 8.4 Rollback Strategy

**Development:**
```bash
npx prisma migrate reset
```

**Production:**
- Create reverse migration manually
- Restore from backup if necessary
- Use blue-green deployment for zero downtime

---

## 9. Security Considerations

### 9.1 Sensitive Data Protection

| Data Type | Protection Method |
|-----------|-------------------|
| Passwords | bcrypt hashing (cost factor 10+) |
| User emails | Indexed but not exposed in logs |
| OAuth tokens | Never stored in database (session only) |
| User data | Row-level access control in application |

### 9.2 SQL Injection Prevention

- **Prisma ORM** provides automatic parameterization
- All queries use prepared statements
- Input validation with Zod before database operations

### 9.3 Access Control

**Application Layer:**
- Users can only access their own products and alerts
- No cross-user data queries permitted
- Admin role for future management (Phase 3)

**Database Layer:**
- Least privilege principle for database users
- Application uses dedicated database user with limited permissions
- No direct database access from frontend

### 9.4 Data Privacy

- **GDPR Compliance**: User can request data deletion
- **Data Retention**: Price history retained for 1 year (configurable)
- **Soft Delete Option**: Consider adding `deletedAt` field for audit trail

### 9.5 Connection Security

- SSL/TLS required for database connections
- Connection string stored in environment variables
- Connection pooling to prevent connection exhaustion
- Regular credential rotation recommended

---

## 10. Scaling Strategy

### 10.1 Vertical Scaling

**Database Server:**
- Start: 2 vCPU, 4GB RAM (Development)
- Production: 4+ vCPU, 8-16GB RAM
- Monitor: CPU, memory, disk I/O, connection count

### 10.2 Horizontal Scaling

**Read Replicas:**
- Implement for read-heavy operations (price history queries)
- Use Prisma read replica support
- Route analytics queries to replicas

**Partitioning Strategy:**

**PriceHistory Table:**
- Partition by `scrapedAt` (monthly partitions)
- Archive old partitions to cold storage
- Reduces index size and improves query performance

```sql
-- Example partitioning (PostgreSQL 10+)
CREATE TABLE price_history_2026_02 PARTITION OF price_history
  FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
```

### 10.3 Caching Strategy

**Application-Level Cache (Redis):**
- Cache frequently accessed products
- Cache user session data
- Cache latest prices (5-minute TTL)

**Database Query Cache:**
- PostgreSQL shared_buffers tuning
- Effective_cache_size configuration

### 10.4 Data Archival

**Price History:**
- Keep 1 year of detailed history
- Aggregate older data to weekly/monthly averages
- Move to archive table or cold storage

```prisma
model PriceHistoryArchive {
  id        String   @id @default(cuid())
  price     Float
  scrapedAt DateTime
  productId String
  
  @@index([productId, scrapedAt])
  @@map("price_history_archive")
}
```

### 10.5 Performance Monitoring

**Key Metrics:**
- Query execution time
- Connection pool utilization
- Table bloat
- Index efficiency
- Transaction rate

**Tools:**
- Prisma Accelerate (optional paid service)
- PostgreSQL pg_stat_statements
- Application Performance Monitoring (APM)

---

## 11. Backup and Recovery

### 11.1 Backup Strategy

**Frequency:**
- Full backup: Daily at 2:00 AM UTC
- Incremental backup: Every 6 hours
- Transaction log backup: Continuous (WAL archiving)

**Retention:**
- Daily backups: 30 days
- Weekly backups: 12 weeks
- Monthly backups: 1 year

### 11.2 Backup Methods

**PostgreSQL Native:**
```bash
# Full backup
pg_dump -U username -F c -b -v -f backup_$(date +%Y%m%d).dump database_name

# Restore
pg_restore -U username -d database_name -v backup_file.dump
```

**Managed Database Services:**
- AWS RDS automated backups
- Neon continuous backups
- Supabase point-in-time recovery

### 11.3 Disaster Recovery Plan

**RTO (Recovery Time Objective):** 4 hours  
**RPO (Recovery Point Objective):** 1 hour

**Recovery Steps:**
1. Identify issue and trigger incident response
2. Spin up new database instance
3. Restore from most recent backup
4. Apply WAL logs to minimize data loss
5. Update application connection string
6. Verify data integrity
7. Resume normal operations
8. Post-mortem and documentation

### 11.4 Data Integrity Checks

**Regular Checks:**
```sql
-- Check for orphaned records
SELECT COUNT(*) FROM products WHERE userId NOT IN (SELECT id FROM users);
SELECT COUNT(*) FROM price_history WHERE productId NOT IN (SELECT id FROM products);
SELECT COUNT(*) FROM alerts WHERE userId NOT IN (SELECT id FROM users);
SELECT COUNT(*) FROM alerts WHERE productId NOT IN (SELECT id FROM products);

-- Check for data anomalies
SELECT * FROM price_history WHERE price < 0 OR price > 1000000;
SELECT * FROM products WHERE currentPrice < 0;
```

**Automated Integrity Jobs:**
- Run weekly via cron job
- Alert on anomalies
- Log results for audit trail

---

## Appendix

### A. Sample Queries

**Get user's products with latest price:**
```sql
SELECT 
  p.*,
  ph.price as latest_price,
  ph.scrapedAt as last_price_check
FROM products p
LEFT JOIN LATERAL (
  SELECT price, scrapedAt
  FROM price_history
  WHERE productId = p.id
  ORDER BY scrapedAt DESC
  LIMIT 1
) ph ON true
WHERE p.userId = 'user_id_here'
ORDER BY p.createdAt DESC;
```

**Get price trend for product:**
```sql
SELECT 
  DATE(scrapedAt) as date,
  AVG(price) as avg_price,
  MIN(price) as min_price,
  MAX(price) as max_price
FROM price_history
WHERE productId = 'product_id_here'
  AND scrapedAt >= NOW() - INTERVAL '30 days'
GROUP BY DATE(scrapedAt)
ORDER BY date;
```

**Find triggered alerts:**
```sql
SELECT 
  a.*,
  p.title,
  p.currentPrice,
  u.email
FROM alerts a
JOIN products p ON a.productId = p.id
JOIN users u ON a.userId = u.id
WHERE a.active = true
  AND a.notified = false
  AND p.currentPrice <= a.targetPrice;
```

### B. Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/smart_price_tracker"
DATABASE_POOL_SIZE=10

# Prisma
PRISMA_LOG_LEVEL="info"
```

### C. Useful Prisma Commands

```bash
# Generate Prisma Client
npx prisma generate

# View database in browser
npx prisma studio

# Validate schema
npx prisma validate

# Format schema file
npx prisma format

# Pull schema from existing database
npx prisma db pull

# Push schema to database (dev only, no migration)
npx prisma db push
```

---

## Document History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | Feb 23, 2026 | Varun Singh, Ananya M, Prajwal KT | Initial database design document |

---

**Next Review Date:** April 23, 2026

**For Questions Contact:**
- Varun Singh (2547254)
- Ananya M (2547259)
- Prajwal KT (2547239)

---

*End of Database Design Document*
