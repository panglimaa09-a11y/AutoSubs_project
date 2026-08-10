import { supabase } from '../services/supabase.js';

export async function getMyProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error('Belum login') };

  return await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
}
