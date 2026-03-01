# Database Documentation

This directory contains the database client, management scripts, and documentation for the Codo platform.

## 📁 Repository Structure

### Core Files
- `supabase-client.ts` - Singleton Supabase client initialization.
- `operations.ts` - Core database operations and transactional logic.
- `dashboard-operations.ts` - Specialized operations for the learning dashboard.

### 🛡️ Security & RLS
- `rls-setup.sql` - Base Row-Level Security policies.
- `security-enhancements.sql` - Hardened security configurations.
- `fix-all-rls-policies.sql` - Utility to reset and fix RLS issues.
- `check-rls-status.sql` - Script to audit current policy status.
- `fix-service-role-access.sql` - Specific fixes for service role permissions.

### 📜 Migrations
- `schema.sql` - Initial database schema (the source of truth).
- `seeds.sql` - Initial seed data for a fresh installation.
- `migrations/dashboard-enhancements.sql` - Tables for analytics, peers, and tracks.
- `migrations/dashboard-analytics.sql` - Performance and event tracking tables.

### 📊 Sample Data
- `sample-data-simple.sql` - ⭐ **Recommended** sample data for local development.
- `quick-insert.sql` - Minimal configuration script for quick setup.
- `insert-sample-data.sql` - Detailed sample data including peers and graph nodes.
- `sample-data.sql` - Legacy full sample data script.

## 📚 Documentation
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md) - Overview of recent dashboard API changes.
- [Dashboard Enhancements Guide](./DASHBOARD_ENHANCEMENTS_README.md) - Detailed guide for the enhanced dashboard.
- [Sample Data Guide](./SAMPLE_DATA_README.md) - How to populate your local database with test data.

## 🚀 Quick Setup
1. Ensure you have the base schema: `psql < schema.sql`
2. Run initial seeds: `psql < seeds.sql`
3. Apply dashboard updates: `psql < migrations/dashboard-enhancements.sql`
4. Load sample data: `psql < sample-data-simple.sql` (after replacing Clerk ID)
