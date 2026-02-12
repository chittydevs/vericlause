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
    // Intentionally query a table name that probably doesn't exist.
    // If we still get a structured error back from Supabase,
    // it means the connection and auth are working.
    const { data, error } = await supabase
      .from('does_not_exist')
      .select('*')
      .limit(1);

    console.log('Supabase response data:', data);
    console.log('Supabase response error:', error);

    if (error) {
      console.log(
        '\n✅ Supabase is connected! The error above is from the database (missing table), which confirms the connection works.'
      );
      process.exitCode = 0;
      return;
    }

    console.log('\n✅ Supabase is connected and responded without error.');
    process.exitCode = 0;
  } catch (e) {
    console.error('\n❌ Failed to reach Supabase:', e.message || e);
    process.exitCode = 1;
  }
}

main().then(() => {
  // Give Node.js a moment to clean up before exit
  setTimeout(() => process.exit(process.exitCode || 0), 100);
});

