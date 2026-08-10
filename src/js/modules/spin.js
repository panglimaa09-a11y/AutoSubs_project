import { supabase } from '../services/supabase.js';

export async function getSpinConfig() {
  return await supabase
    .from('spin_config')
    .select('*')
    .eq('id', 1)
    .single();
}
