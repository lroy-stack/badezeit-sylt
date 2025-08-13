-- Badezeit Sylt - Row Level Security Policies
-- Enable RLS and create security policies for all tables

-- ============================================================================
-- 1. ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_scan_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. PUBLIC READ POLICIES (for public-facing content)
-- ============================================================================

-- Allow public read access to menu categories
CREATE POLICY "Public can view active menu categories" ON menu_categories
  FOR SELECT USING ("isActive" = true);

-- Allow public read access to menu items
CREATE POLICY "Public can view available menu items" ON menu_items
  FOR SELECT USING ("isAvailable" = true);

-- Allow public read access to gallery images
CREATE POLICY "Public can view active gallery images" ON gallery_images
  FOR SELECT USING ("isActive" = true);

-- Allow public read access to published page content
CREATE POLICY "Public can view published content" ON page_content
  FOR SELECT USING ("isPublished" = true);

-- Allow public read access to active tables (for reservation system)
CREATE POLICY "Public can view active tables" ON tables
  FOR SELECT USING ("isActive" = true);

-- ============================================================================
-- 3. AUTHENTICATED USER POLICIES
-- ============================================================================

-- Users table - users can only see their own record
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = "clerkId");

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = "clerkId");

-- Customers table - customers can view/update their own data
CREATE POLICY "Customers can view own data" ON customers
  FOR SELECT USING (auth.uid()::text = id OR auth.uid()::text = email);

CREATE POLICY "Customers can update own data" ON customers
  FOR UPDATE USING (auth.uid()::text = id OR auth.uid()::text = email);

-- Customer notes - only staff can view/manage
CREATE POLICY "Staff can manage customer notes" ON customer_notes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE clerk_id = auth.uid()::text 
      AND role IN ('ADMIN', 'MANAGER', 'STAFF')
    )
  );

-- Reservations - customers can view their own, staff can view all
CREATE POLICY "Customers can view own reservations" ON reservations
  FOR SELECT USING (
    customer_id IN (
      SELECT id FROM customers 
      WHERE id = auth.uid()::text OR email = auth.uid()::text
    )
  );

CREATE POLICY "Staff can view all reservations" ON reservations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE clerk_id = auth.uid()::text 
      AND role IN ('ADMIN', 'MANAGER', 'STAFF')
    )
  );

-- Customers can create new reservations
CREATE POLICY "Customers can create reservations" ON reservations
  FOR INSERT WITH CHECK (
    customer_id IN (
      SELECT id FROM customers 
      WHERE id = auth.uid()::text OR email = auth.uid()::text
    )
  );

-- Newsletter subscriptions - customers can manage their own
CREATE POLICY "Customers can manage own newsletter subscription" ON newsletter_subscriptions
  FOR ALL USING (
    customer_id IN (
      SELECT id FROM customers 
      WHERE id = auth.uid()::text OR email = auth.uid()::text
    )
  );

-- ============================================================================
-- 4. STAFF-ONLY POLICIES
-- ============================================================================

-- Tables management - only staff can modify
CREATE POLICY "Staff can manage tables" ON tables
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE clerk_id = auth.uid()::text 
      AND role IN ('ADMIN', 'MANAGER', 'STAFF')
    )
  );

-- Menu management - only managers/admins can modify
CREATE POLICY "Managers can manage menu categories" ON menu_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE clerk_id = auth.uid()::text 
      AND role IN ('ADMIN', 'MANAGER')
    )
  );

CREATE POLICY "Managers can manage menu items" ON menu_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE clerk_id = auth.uid()::text 
      AND role IN ('ADMIN', 'MANAGER')
    )
  );

-- Gallery management - only managers/admins can modify
CREATE POLICY "Managers can manage gallery" ON gallery_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE clerk_id = auth.uid()::text 
      AND role IN ('ADMIN', 'MANAGER')
    )
  );

-- Page content management - only managers/admins can modify
CREATE POLICY "Managers can manage page content" ON page_content
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE clerk_id = auth.uid()::text 
      AND role IN ('ADMIN', 'MANAGER')
    )
  );

-- QR codes - staff can view, managers can modify
CREATE POLICY "Staff can view QR codes" ON qr_codes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE clerk_id = auth.uid()::text 
      AND role IN ('ADMIN', 'MANAGER', 'STAFF')
    )
  );

CREATE POLICY "Managers can manage QR codes" ON qr_codes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE clerk_id = auth.uid()::text 
      AND role IN ('ADMIN', 'MANAGER')
    )
  );

-- QR scan events - all authenticated users can create, staff can view
CREATE POLICY "Anyone can create QR scan events" ON qr_scan_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Staff can view QR scan events" ON qr_scan_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE clerk_id = auth.uid()::text 
      AND role IN ('ADMIN', 'MANAGER', 'STAFF')
    )
  );

-- ============================================================================
-- 5. ADMIN-ONLY POLICIES
-- ============================================================================

-- System settings - only admins can modify
CREATE POLICY "Admins can manage system settings" ON system_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE clerk_id = auth.uid()::text 
      AND role = 'ADMIN'
    )
  );

-- Analytics events - staff can create, admins can view all
CREATE POLICY "Anyone can create analytics events" ON analytics_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view analytics events" ON analytics_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE clerk_id = auth.uid()::text 
      AND role IN ('ADMIN', 'MANAGER')
    )
  );

-- Users management - only admins can manage other users
CREATE POLICY "Admins can manage all users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE clerk_id = auth.uid()::text 
      AND role = 'ADMIN'
    )
  );

-- Customers management - staff can view/create, managers can modify
CREATE POLICY "Staff can view customers" ON customers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE clerk_id = auth.uid()::text 
      AND role IN ('ADMIN', 'MANAGER', 'STAFF')
    )
  );

CREATE POLICY "Staff can create customers" ON customers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE clerk_id = auth.uid()::text 
      AND role IN ('ADMIN', 'MANAGER', 'STAFF')
    )
  );

CREATE POLICY "Managers can modify customers" ON customers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE clerk_id = auth.uid()::text 
      AND role IN ('ADMIN', 'MANAGER')
    )
  );

-- Reservation management - staff can modify reservations
CREATE POLICY "Staff can modify reservations" ON reservations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE clerk_id = auth.uid()::text 
      AND role IN ('ADMIN', 'MANAGER', 'STAFF')
    )
  );

CREATE POLICY "Staff can create reservations" ON reservations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE clerk_id = auth.uid()::text 
      AND role IN ('ADMIN', 'MANAGER', 'STAFF')
    )
  );

-- ============================================================================
-- 6. SECURITY NOTES
-- ============================================================================

-- These policies ensure:
-- 1. Public can only read published/active content
-- 2. Customers can only access their own data
-- 3. Staff have appropriate access based on role hierarchy
-- 4. Sensitive operations require proper authentication
-- 5. Analytics and QR tracking work for anonymous users
-- 6. Admin functions are restricted to admin users only

-- Remember to regularly audit these policies and adjust as needed
-- Consider implementing additional security measures like:
-- - Rate limiting on public endpoints
-- - IP restrictions for admin functions
-- - Audit logging for sensitive operations
-- - Regular security reviews