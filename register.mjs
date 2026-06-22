import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yrqcyqbbscgcjgdewzkj.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlycWN5cWJic2NnY2pnZGV3emtqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjA0Mjg0OSwiZXhwIjoyMDk3NjE4ODQ5fQ.ce1iKGe3pBPi0Q1sz-hoLZxSMHwXlT3YErV7LasSAUI';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function run() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'ochiwilliamotieno@gmail.com',
    password: 'Savville#',
    email_confirm: true
  });

  if (error) {
    console.error('Error creating user:', error.message);
  } else {
    console.log('User created successfully:', data.user.id);
  }
}

run();
