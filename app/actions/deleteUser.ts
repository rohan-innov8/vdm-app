'use server';

import { createClient } from '@supabase/supabase-js';

export async function deleteUserAccount(userId: string) {
    // 1. Grab the secure server-side variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('Missing Supabase Service Role Key.');
    }

    // 2. Initialize the Supabase Admin Client
    // This bypasses normal Row Level Security, so it must ONLY be used in Server Actions!
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    // 3. Delete the user from the Supabase Auth system
    // (If your database is set up with 'ON DELETE CASCADE', this will automatically wipe their profile too)
    const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
        throw new Error(error.message);
    }

    return { success: true };
}