import { supabase } from '../services/supabase.js';

export async function createBotOrder(payload) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Belum login');

  return await supabase.from('bot_orders').insert({
    user_id: user.id,
    target_url: payload.target_url,
    service_type: payload.service_type,
    status: 'pending'
  }).select().single();
}
