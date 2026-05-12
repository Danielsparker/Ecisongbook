import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://axxwahecopzsbwgqtqgp.supabase.co'
const supabaseKey = 'sb_publishable_e438qh0Wsg-2gigGy_UPqQ_ELc_nj3C'

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
)