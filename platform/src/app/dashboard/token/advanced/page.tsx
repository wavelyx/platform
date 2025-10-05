import { redirect } from 'next/navigation';
// config
import { PATH_ADVANCED } from 'src/config-global';

// ----------------------------------------------------------------------

export default async function TokenPage() {
  redirect(PATH_ADVANCED);
}
