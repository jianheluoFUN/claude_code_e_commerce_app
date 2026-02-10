-- Create sample store for user 0533d700-c782-4892-9550-b0353c66d7f9
-- First, ensure the user has store_owner role
UPDATE public.profiles
SET role = 'store_owner'
WHERE id = '0533d700-c782-4892-9550-b0353c66d7f9';

-- Create the sample store
INSERT INTO public.stores (id, owner_id, name, slug, description, logo_url, banner_url, status, created_at, updated_at)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    '0533d700-c782-4892-9550-b0353c66d7f9',
    'TechGear Pro',
    'techgear-pro',
    'Your one-stop shop for premium tech accessories, gadgets, and electronics. We offer high-quality products at competitive prices with fast shipping.',
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=400&fit=crop',
    'approved',
    NOW(),
    NOW()
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Get the store ID for products
DO $$
DECLARE
    store_uuid UUID := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    electronics_cat UUID;
    accessories_cat UUID;
    audio_cat UUID;
BEGIN
    -- Get category IDs
    SELECT id INTO electronics_cat FROM public.categories WHERE slug = 'electronics' LIMIT 1;
    SELECT id INTO accessories_cat FROM public.categories WHERE slug = 'accessories' LIMIT 1;
    SELECT id INTO audio_cat FROM public.categories WHERE slug = 'audio' LIMIT 1;

    -- If categories don't exist, create them
    IF electronics_cat IS NULL THEN
        INSERT INTO public.categories (id, name, slug, created_at)
        VALUES (gen_random_uuid(), 'Electronics', 'electronics', NOW())
        RETURNING id INTO electronics_cat;
    END IF;

    IF accessories_cat IS NULL THEN
        INSERT INTO public.categories (id, name, slug, created_at)
        VALUES (gen_random_uuid(), 'Accessories', 'accessories', NOW())
        RETURNING id INTO accessories_cat;
    END IF;

    IF audio_cat IS NULL THEN
        INSERT INTO public.categories (id, name, slug, created_at)
        VALUES (gen_random_uuid(), 'Audio', 'audio', NOW())
        RETURNING id INTO audio_cat;
    END IF;

    -- Insert sample products
    -- Product 1: Wireless Earbuds
    INSERT INTO public.products (id, store_id, name, slug, description, price, compare_price, category_id, images, inventory_count, status, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        store_uuid,
        'Pro Wireless Earbuds X1',
        'pro-wireless-earbuds-x1',
        'Experience crystal-clear audio with our premium wireless earbuds. Features active noise cancellation, 30-hour battery life with charging case, and IPX5 water resistance. Perfect for workouts, commutes, or everyday listening.',
        79.99,
        99.99,
        audio_cat,
        ARRAY['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&h=800&fit=crop'],
        150,
        'active',
        NOW(),
        NOW()
    )
    ON CONFLICT (slug) DO NOTHING;

    -- Product 2: Mechanical Keyboard
    INSERT INTO public.products (id, store_id, name, slug, description, price, compare_price, category_id, images, inventory_count, status, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        store_uuid,
        'RGB Mechanical Gaming Keyboard',
        'rgb-mechanical-gaming-keyboard',
        'Elevate your gaming experience with our RGB mechanical keyboard. Features hot-swappable switches, per-key RGB lighting, programmable macros, and a premium aluminum frame. Compatible with Windows and Mac.',
        129.99,
        159.99,
        electronics_cat,
        ARRAY['https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&h=800&fit=crop'],
        75,
        'active',
        NOW(),
        NOW()
    )
    ON CONFLICT (slug) DO NOTHING;

    -- Product 3: Wireless Mouse
    INSERT INTO public.products (id, store_id, name, slug, description, price, compare_price, category_id, images, inventory_count, status, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        store_uuid,
        'Ergonomic Wireless Mouse',
        'ergonomic-wireless-mouse',
        'Say goodbye to wrist strain with our ergonomically designed wireless mouse. Features 16000 DPI optical sensor, 6 programmable buttons, and up to 70 hours of battery life. Includes USB-C charging.',
        49.99,
        69.99,
        accessories_cat,
        ARRAY['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&h=800&fit=crop'],
        200,
        'active',
        NOW(),
        NOW()
    )
    ON CONFLICT (slug) DO NOTHING;

    -- Product 4: USB-C Hub
    INSERT INTO public.products (id, store_id, name, slug, description, price, compare_price, category_id, images, inventory_count, status, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        store_uuid,
        '7-in-1 USB-C Hub',
        '7-in-1-usb-c-hub',
        'Expand your laptop connectivity with our versatile USB-C hub. Includes HDMI 4K@60Hz, 2x USB 3.0, SD/TF card readers, USB-C PD 100W pass-through, and Gigabit Ethernet. Compact and travel-friendly.',
        45.99,
        59.99,
        accessories_cat,
        ARRAY['https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?w=800&h=800&fit=crop'],
        300,
        'active',
        NOW(),
        NOW()
    )
    ON CONFLICT (slug) DO NOTHING;

    -- Product 5: Laptop Stand
    INSERT INTO public.products (id, store_id, name, slug, description, price, compare_price, category_id, images, inventory_count, status, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        store_uuid,
        'Adjustable Aluminum Laptop Stand',
        'adjustable-aluminum-laptop-stand',
        'Improve your posture and reduce neck strain with our premium aluminum laptop stand. Adjustable height from 6" to 10", supports laptops up to 17", and features ventilation cutouts for cooling. Foldable for easy transport.',
        39.99,
        54.99,
        accessories_cat,
        ARRAY['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&h=800&fit=crop'],
        120,
        'active',
        NOW(),
        NOW()
    )
    ON CONFLICT (slug) DO NOTHING;

    -- Product 6: Webcam
    INSERT INTO public.products (id, store_id, name, slug, description, price, compare_price, category_id, images, inventory_count, status, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        store_uuid,
        '4K Ultra HD Webcam',
        '4k-ultra-hd-webcam',
        'Look your best on video calls with our 4K webcam. Features auto-focus, HDR, built-in privacy shutter, dual noise-canceling microphones, and adjustable field of view. Works with Zoom, Teams, and all major platforms.',
        89.99,
        119.99,
        electronics_cat,
        ARRAY['https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=800&h=800&fit=crop'],
        85,
        'active',
        NOW(),
        NOW()
    )
    ON CONFLICT (slug) DO NOTHING;

    -- Product 7: Portable Charger
    INSERT INTO public.products (id, store_id, name, slug, description, price, compare_price, category_id, images, inventory_count, status, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        store_uuid,
        '20000mAh Power Bank',
        '20000mah-power-bank',
        'Never run out of battery again with our high-capacity power bank. Features 20000mAh capacity, 65W USB-C PD fast charging, 2 USB-A ports, LED display, and airline-approved design. Charges laptops, tablets, and phones.',
        59.99,
        79.99,
        electronics_cat,
        ARRAY['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=800&h=800&fit=crop'],
        250,
        'active',
        NOW(),
        NOW()
    )
    ON CONFLICT (slug) DO NOTHING;

    -- Product 8: Monitor Light Bar
    INSERT INTO public.products (id, store_id, name, slug, description, price, compare_price, category_id, images, inventory_count, status, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        store_uuid,
        'LED Monitor Light Bar',
        'led-monitor-light-bar',
        'Reduce eye strain with our asymmetric LED light bar. Features adjustable color temperature (2700K-6500K), touch controls, auto-dimming sensor, and zero screen glare design. Clamps onto any monitor up to 1.5" thick.',
        34.99,
        49.99,
        accessories_cat,
        ARRAY['https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=800&h=800&fit=crop'],
        180,
        'active',
        NOW(),
        NOW()
    )
    ON CONFLICT (slug) DO NOTHING;

    -- Product 9: Bluetooth Speaker
    INSERT INTO public.products (id, store_id, name, slug, description, price, compare_price, category_id, images, inventory_count, status, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        store_uuid,
        'Portable Bluetooth Speaker Pro',
        'portable-bluetooth-speaker-pro',
        'Take your music anywhere with our portable Bluetooth speaker. Features 360° immersive sound, 24-hour playtime, IP67 waterproof rating, and built-in microphone for calls. Pairs with a second speaker for stereo sound.',
        69.99,
        89.99,
        audio_cat,
        ARRAY['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1589003077984-894e133dabab?w=800&h=800&fit=crop'],
        95,
        'active',
        NOW(),
        NOW()
    )
    ON CONFLICT (slug) DO NOTHING;

    -- Product 10: Wireless Charging Pad
    INSERT INTO public.products (id, store_id, name, slug, description, price, compare_price, category_id, images, inventory_count, status, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        store_uuid,
        '3-in-1 Wireless Charging Station',
        '3-in-1-wireless-charging-station',
        'Charge all your devices in one place. Our 3-in-1 charging station supports iPhone (MagSafe compatible), Apple Watch, and AirPods simultaneously. Features 15W fast charging, LED indicator, and premium leather finish.',
        54.99,
        74.99,
        accessories_cat,
        ARRAY['https://images.unsplash.com/photo-1591815302525-756a9bcc3425?w=800&h=800&fit=crop'],
        140,
        'active',
        NOW(),
        NOW()
    )
    ON CONFLICT (slug) DO NOTHING;

    -- Product 11: Desk Mat
    INSERT INTO public.products (id, store_id, name, slug, description, price, compare_price, category_id, images, inventory_count, status, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        store_uuid,
        'Premium Leather Desk Mat',
        'premium-leather-desk-mat',
        'Upgrade your workspace with our premium PU leather desk mat. Features water-resistant surface, non-slip backing, and smooth mouse tracking. Size: 35" x 17". Available in multiple colors.',
        29.99,
        39.99,
        accessories_cat,
        ARRAY['https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&h=800&fit=crop'],
        220,
        'active',
        NOW(),
        NOW()
    )
    ON CONFLICT (slug) DO NOTHING;

    -- Product 12: Cable Management Kit
    INSERT INTO public.products (id, store_id, name, slug, description, price, compare_price, category_id, images, inventory_count, status, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        store_uuid,
        'Complete Cable Management Kit',
        'complete-cable-management-kit',
        'Organize your desk with our comprehensive cable management kit. Includes 2 cable trays, 10 cable clips, 5 velcro straps, 2 cable sleeves, and mounting hardware. Everything you need for a clean, organized workspace.',
        24.99,
        34.99,
        accessories_cat,
        ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop'],
        300,
        'active',
        NOW(),
        NOW()
    )
    ON CONFLICT (slug) DO NOTHING;

END $$;
