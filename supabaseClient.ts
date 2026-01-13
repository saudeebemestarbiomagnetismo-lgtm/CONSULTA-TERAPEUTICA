
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bgtudbfbjyheuxrdsnhi.supabase.co';
const supabaseAnonKey = 'sb_publishable_SNoSpTjb2I5jnwRydSUo2w_WbNVsb0m';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
