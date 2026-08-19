import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const migrationPath = join(__dirname, '../supabase/migrations/0010_customer_auth_simple.sql');
const sql = readFileSync(migrationPath, 'utf-8');

console.log('Running migration 0010_customer_auth_simple.sql...');
console.log('SQL length:', sql.length);

const { data, error } = await supabase.rpc('exec_sql', { sql });

if (error) {
  console.error('Migration failed:', error);
  process.exit(1);
}

console.log('Migration completed successfully!');
console.log('Result:', data);