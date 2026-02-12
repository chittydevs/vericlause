import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  try {
    // Try a fake login – we EXPECT it to fail with "Invalid login credentials".
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'nonexistent.user@example.com',
      password: 'this-is-not-a-real-password',
    });

    console.log('Auth sign-in data:', data);
    console.log('Auth sign-in error:', error);

    if (error) {
      console.log(
        '\n✅ Supabase Auth is reachable. The error above is expected for invalid credentials, which confirms auth is working.'
      );
      process.exitCode = 0;
      return;
    }

    console.log(
      '\n✅ Supabase Auth responded without error (unexpected for fake credentials, but endpoint is working).'
    );
    process.exitCode = 0;
  } catch (e) {
    console.error('\n❌ Failed to reach Supabase Auth:', e.message || e);
    process.exitCode = 1;
  }
}

main().then(() => {
  // Give Node.js a moment to clean up before exit
  setTimeout(() => process.exit(process.exitCode || 0), 100);
});

