import { redirect } from 'next/navigation';
// config
import { PATH_AFTER_LOGIN } from 'src/config-global';

// ----------------------------------------------------------------------

export default async function TokenPage() {
  redirect(PATH_AFTER_LOGIN);
}
