-- Create clothing store for user 0c3f73a5-f749-4fa6-b054-28adb7f0b6fe
-- First, ensure the user has store_owner role
UPDATE public.profiles
SET role = 'store_owner'
WHERE id = '0c3f73a5-f749-4fa6-b054-28adb7f0b6fe';

-- Create the clothing store
INSERT INTO public.stores (id, owner_id, name, slug, description, logo_url, banner_url, status, created_at, updated_at)
VALUES (
    'b2c3d4e5-f6a7-8901-bcde-f23456789012',
    '0c3f73a5-f749-4fa6-b054-28adb7f0b6fe',
    'Urban Style Co.',
    'urban-style-co',
    'Discover trendy and comfortable clothing for every occasion. From casual everyday wear to stylish outfits for special events, we have something for everyone. Quality fabrics, modern designs, and affordable prices.',
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&h=400&fit=crop',
    'approved',
    NOW(),
    NOW()
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Insert clothing products
DO $$
DECLARE
    store_uuid UUID := 'b2c3d4e5-f6a7-8901-bcde-f23456789012';
    clothing_cat UUID;
BEGIN
    -- Get or create clothing category
    SELECT id INTO clothing_cat FROM public.categories WHERE slug = 'clothing' LIMIT 1;

    IF clothing_cat IS NULL THEN
        INSERT INTO public.categories (id, name, slug, created_at)
        VALUES (gen_random_uuid(), 'Clothing', 'clothing', NOW())
        RETURNING id INTO clothing_cat;
    END IF;

    -- Product 1: Classic White T-Shirt
    INSERT INTO public.products (id, store_id, name, slug, description, price, compare_price, category_id, images, inventory_count, status, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        store_uuid,
        'Classic White Cotton T-Shirt',
        'classic-white-cotton-tshirt',
        'A wardrobe essential. This premium cotton t-shirt features a relaxed fit, crew neck, and ultra-soft fabric. Perfect for layering or wearing on its own. Available in sizes XS-XXL.',
        24.99,
        34.99,
        clothing_cat,
        ARRAY['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1622445275576-721325763afe?w=800&h=800&fit=crop'],
        200,
        'active',
        NOW(),
        NOW()
    )
    ON CONFLICT (store_id, slug) DO NOTHING;

    -- Product 2: Slim Fit Jeans
    INSERT INTO public.products (id, store_id, name, slug, description, price, compare_price, category_id, images, inventory_count, status, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        store_uuid,
        'Slim Fit Dark Wash Jeans',
        'slim-fit-dark-wash-jeans',
        'Classic slim fit jeans in a versatile dark wash. Made from premium stretch denim for comfort and style. Features 5-pocket design, zip fly, and belt loops. Perfect for casual or smart-casual looks.',
        59.99,
        79.99,
        clothing_cat,
        ARRAY['https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&h=800&fit=crop'],
        150,
        'active',
        NOW(),
        NOW()
    )
    ON CONFLICT (store_id, slug) DO NOTHING;

    -- Product 3: Hoodie
    INSERT INTO public.products (id, store_id, name, slug, description, price, compare_price, category_id, images, inventory_count, status, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        store_uuid,
        'Cozy Fleece Pullover Hoodie',
        'cozy-fleece-pullover-hoodie',
        'Stay warm and stylish with our ultra-soft fleece hoodie. Features a kangaroo pocket, adjustable drawstring hood, and ribbed cuffs. Made from a cotton-polyester blend for durability and comfort.',
        49.99,
        64.99,
        clothing_cat,
        ARRAY['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=800&h=800&fit=crop'],
        120,
        'active',
        NOW(),
        NOW()
    )
    ON CONFLICT (store_id, slug) DO NOTHING;

    -- Product 4: Casual Button-Down Shirt
    INSERT INTO public.products (id, store_id, name, slug, description, price, compare_price, category_id, images, inventory_count, status, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        store_uuid,
        'Oxford Button-Down Shirt',
        'oxford-button-down-shirt',
        'A timeless oxford shirt perfect for work or weekend. Made from 100% cotton with a comfortable regular fit. Features button-down collar, chest pocket, and adjustable cuffs. Easy to dress up or down.',
        44.99,
        59.99,
        clothing_cat,
        ARRAY['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&h=800&fit=crop'],
        100,
        'active',
        NOW(),
        NOW()
    )
    ON CONFLICT (store_id, slug) DO NOTHING;

    -- Product 5: Joggers
    INSERT INTO public.products (id, store_id, name, slug, description, price, compare_price, category_id, images, inventory_count, status, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        store_uuid,
        'Athletic Jogger Pants',
        'athletic-jogger-pants',
        'Comfortable joggers perfect for workouts or lounging. Features elastic waistband with drawstring, side pockets, and tapered leg with elastic cuffs. Made from breathable, moisture-wicking fabric.',
        39.99,
        54.99,
        clothing_cat,
        ARRAY['https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&h=800&fit=crop'],
        180,
        'active',
        NOW(),
        NOW()
    )
    ON CONFLICT (store_id, slug) DO NOTHING;

    -- Product 6: Denim Jacket
    INSERT INTO public.products (id, store_id, name, slug, description, price, compare_price, category_id, images, inventory_count, status, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        store_uuid,
        'Classic Denim Jacket',
        'classic-denim-jacket',
        'An iconic denim jacket that never goes out of style. Features button front closure, chest pockets, side pockets, and adjustable button cuffs. Made from durable 100% cotton denim with a comfortable fit.',
        79.99,
        99.99,
        clothing_cat,
        ARRAY['https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=800&h=800&fit=crop'],
        75,
        'active',
        NOW(),
        NOW()
    )
    ON CONFLICT (store_id, slug) DO NOTHING;

    -- Product 7: Summer Dress
    INSERT INTO public.products (id, store_id, name, slug, description, price, compare_price, category_id, images, inventory_count, status, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        store_uuid,
        'Floral Summer Midi Dress',
        'floral-summer-midi-dress',
        'A beautiful floral print midi dress perfect for summer days. Features a flattering V-neckline, adjustable straps, and flowy skirt. Made from lightweight, breathable fabric. Pairs perfectly with sandals or sneakers.',
        54.99,
        74.99,
        clothing_cat,
        ARRAY['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=800&fit=crop'],
        90,
        'active',
        NOW(),
        NOW()
    )
    ON CONFLICT (store_id, slug) DO NOTHING;

    -- Product 8: Chino Shorts
    INSERT INTO public.products (id, store_id, name, slug, description, price, compare_price, category_id, images, inventory_count, status, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        store_uuid,
        'Classic Chino Shorts',
        'classic-chino-shorts',
        'Versatile chino shorts perfect for warm weather. Features a flat front, zip fly, and belt loops. Made from soft cotton twill with a touch of stretch for comfort. Hits above the knee for a modern look.',
        34.99,
        44.99,
        clothing_cat,
        ARRAY['https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&h=800&fit=crop'],
        160,
        'active',
        NOW(),
        NOW()
    )
    ON CONFLICT (store_id, slug) DO NOTHING;

    -- Product 9: Knit Sweater
    INSERT INTO public.products (id, store_id, name, slug, description, price, compare_price, category_id, images, inventory_count, status, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        store_uuid,
        'Cable Knit Crew Sweater',
        'cable-knit-crew-sweater',
        'A cozy cable knit sweater for cooler days. Features classic crew neck, ribbed trim, and relaxed fit. Made from a soft acrylic-wool blend that is warm yet breathable. Perfect layered or worn alone.',
        64.99,
        84.99,
        clothing_cat,
        ARRAY['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&h=800&fit=crop'],
        85,
        'active',
        NOW(),
        NOW()
    )
    ON CONFLICT (store_id, slug) DO NOTHING;

    -- Product 10: Polo Shirt
    INSERT INTO public.products (id, store_id, name, slug, description, price, compare_price, category_id, images, inventory_count, status, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        store_uuid,
        'Classic Pique Polo Shirt',
        'classic-pique-polo-shirt',
        'A timeless polo shirt in breathable pique cotton. Features a ribbed collar, two-button placket, and short sleeves with ribbed cuffs. Perfect for golf, office, or casual occasions.',
        34.99,
        44.99,
        clothing_cat,
        ARRAY['https://images.unsplash.com/photo-1625910513413-5fc5e0de85da?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&h=800&fit=crop'],
        140,
        'active',
        NOW(),
        NOW()
    )
    ON CONFLICT (store_id, slug) DO NOTHING;

    -- Product 11: Leather Belt
    INSERT INTO public.products (id, store_id, name, slug, description, price, compare_price, category_id, images, inventory_count, status, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        store_uuid,
        'Genuine Leather Belt',
        'genuine-leather-belt',
        'A high-quality genuine leather belt that completes any outfit. Features a classic brushed metal buckle, single prong closure, and five adjustment holes. Width: 1.5 inches. Available in black and brown.',
        29.99,
        39.99,
        clothing_cat,
        ARRAY['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop'],
        200,
        'active',
        NOW(),
        NOW()
    )
    ON CONFLICT (store_id, slug) DO NOTHING;

    -- Product 12: Winter Coat
    INSERT INTO public.products (id, store_id, name, slug, description, price, compare_price, category_id, images, inventory_count, status, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        store_uuid,
        'Wool Blend Winter Coat',
        'wool-blend-winter-coat',
        'Stay warm and stylish with this elegant wool blend coat. Features a notched lapel, double-breasted button closure, side pockets, and back vent. Fully lined for added warmth. Perfect for formal or casual winter looks.',
        129.99,
        179.99,
        clothing_cat,
        ARRAY['https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=800&h=800&fit=crop'],
        60,
        'active',
        NOW(),
        NOW()
    )
    ON CONFLICT (store_id, slug) DO NOTHING;

END $$;
