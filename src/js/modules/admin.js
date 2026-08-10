import { supabase } from '../services/supabase.js';

export async function getAdminTopups() {
  return await supabase
    .from('topup_orders')
    .select('*')
    .order('created_at', { ascending: false });
}
