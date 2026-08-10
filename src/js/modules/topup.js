import { supabase } from '../services/supabase.js';

export async function getTopupHistory() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: new Error('Belum login') };

  return await supabase
    .from('topup_orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
}
