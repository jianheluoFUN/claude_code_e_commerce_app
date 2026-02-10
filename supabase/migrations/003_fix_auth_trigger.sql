-- Fix the auth trigger for new user signup
-- This ensures the trigger function has proper permissions

-- Drop and recreate the function with proper error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        NEW.raw_user_meta_data->>'avatar_url',
        COALESCE(
            CASE 
                WHEN NEW.raw_user_meta_data->>'role' IN ('admin', 'store_owner', 'buyer') 
                THEN (NEW.raw_user_meta_data->>'role')::public.user_role
                ELSE 'buyer'::public.user_role
            END,
            'buyer'::public.user_role
        )
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url);
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        -- Log error but don't fail the user creation
        RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER SET search_path = public;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;

-- Ensure profiles table allows inserts from the trigger
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Add a policy to allow the service role to insert profiles
DROP POLICY IF EXISTS "Service role can manage all profiles" ON public.profiles;
CREATE POLICY "Service role can manage all profiles"
    ON public.profiles
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Allow insert for new users (the trigger runs as SECURITY DEFINER)
DROP POLICY IF EXISTS "Enable insert for authentication" ON public.profiles;
CREATE POLICY "Enable insert for authentication"
    ON public.profiles
    FOR INSERT
    WITH CHECK (true);
