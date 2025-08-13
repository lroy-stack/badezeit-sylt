-- Badezeit Sylt - Row Level Security Policies (Fixed Column Names)
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
-- 3. SIMPLIFIED POLICIES FOR DEVELOPMENT MODE
-- ============================================================================

-- For development, create permissive policies that work with anonymous access
-- In production, these should be more restrictive

-- Allow public access to create reservations (for website form)
CREATE POLICY "Public can create reservations" ON reservations
  FOR INSERT WITH CHECK (true);

-- Allow public access to create customers (for registration)
CREATE POLICY "Public can create customers" ON customers
  FOR INSERT WITH CHECK (true);

-- Allow public access to create newsletter subscriptions
CREATE POLICY "Public can create newsletter subscriptions" ON newsletter_subscriptions
  FOR INSERT WITH CHECK (true);

-- Allow analytics tracking
CREATE POLICY "Public can create analytics events" ON analytics_events
  FOR INSERT WITH CHECK (true);

-- Allow QR code scanning
CREATE POLICY "Public can create QR scan events" ON qr_scan_events
  FOR INSERT WITH CHECK (true);

-- Allow public read access to QR codes (for scanning)
CREATE POLICY "Public can view QR codes" ON qr_codes
  FOR SELECT USING ("isActive" = true);

-- ============================================================================
-- 4. ADMIN POLICIES FOR AUTHENTICATED STAFF
-- ============================================================================

-- These policies will be used when Clerk authentication is properly set up
-- For now, they are commented out as we're in development mode

/*
-- Staff can manage reservations
CREATE POLICY "Staff can manage reservations" ON reservations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE "clerkId" = auth.uid()::text 
      AND role IN ('ADMIN', 'MANAGER', 'STAFF')
    )
  );

-- Managers can manage menu
CREATE POLICY "Managers can manage menu categories" ON menu_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE "clerkId" = auth.uid()::text 
      AND role IN ('ADMIN', 'MANAGER')
    )
  );

CREATE POLICY "Managers can manage menu items" ON menu_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE "clerkId" = auth.uid()::text 
      AND role IN ('ADMIN', 'MANAGER')
    )
  );

-- Admins can manage everything
CREATE POLICY "Admins can manage all" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE "clerkId" = auth.uid()::text 
      AND role = 'ADMIN'
    )
  );
*/

-- ============================================================================
-- 5. SECURITY NOTES
-- ============================================================================

-- Current setup:
-- 1. RLS is enabled on all tables
-- 2. Public can read published/active content
-- 3. Public can create reservations and customer records (for website)
-- 4. Analytics and QR scanning work for anonymous users
-- 5. Admin policies are ready but commented out for development

-- TODO for production:
-- 1. Uncomment and configure admin policies
-- 2. Set up proper Clerk authentication integration
-- 3. Add rate limiting on public endpoints
-- 4. Implement audit logging
-- 5. Regular security reviews