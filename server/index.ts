import { app } from './app.ts';
import { supabaseAdmin } from './middleware/security.ts';

const PORT = Number(process.env.PORT ?? 4000);

app.listen(PORT, () => {
  console.log(
    `Trade Fresh API listening on http://localhost:${PORT} (${
      supabaseAdmin ? 'supabase' : 'sandbox'
    } mode)`
  );
});
