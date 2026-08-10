import { supabase } from '../services/supabase.js';

export async function getActivePromos() {
  return await supabase
    .from('promos')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });
}
