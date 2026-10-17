import { createClient } from '@supabase/supabase-js';

// Public browser credentials. Database access is restricted by owner-only RLS.
export const supabase = createClient(
  'https://xooikuvxmwbqdtijaxls.supabase.co',
  'sb_publishable_yuO2qSiXyDo1WTKJ-nmLgw__gvtRpfs',
);
