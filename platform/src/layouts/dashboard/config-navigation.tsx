import { useMemo } from 'react';
// routes
import { paths } from 'src/routes/paths';
// components
import Iconify from 'src/components/iconify';
import { Badge } from '@mui/material';
import Label from 'src/components/label';
import path from 'path';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  // <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
  // OR
  <Iconify icon={name} sx={{ width: 1, height: 1 }} />
  // https://icon-sets.iconify.design/solar/
  // https://www.streamlinehq.com/icons
);

const ICONS = {
  job: icon('mdi:briefcase'),
  blog: icon('radix-icons:tokens'),
  chat: icon('mdi:chat'),
  mail: icon('mdi:email'),
  user: icon('mdi:tools'),
  file: icon('mdi:file'),
  lock: icon('mdi:lock'),
  tour: icon('mdi:airplane'),
  order: icon('mdi:clipboard-text'),
  label: icon('mdi:label'),
  blank: icon('mdi:blank'),
  camera: icon('mdi:camera'),
  kanban: icon('mdi:view-dashboard'),
  folder: icon('mdi:folder'),
  banking: icon('icon-park-outline:market-analysis'),
  booking: icon('mdi:book'),
  invoice: icon('mdi:receipt'),
  product: icon('mdi:shopping'),
  calendar: icon('mdi:calendar'),
  disabled: icon('mdi:wheelchair-accessibility'),
  external: icon('mdi:exit-to-app'),
  menuItem: icon('mdi:menu'),
  ecommerce: icon('ic:baseline-generating-tokens'),
  analytics: icon('mdi:parachute'),
  dashboard: icon('mdi:view-dashboard-outline'),
  send: icon('mdi:send-outline'),

};

// ----------------------------------------------------------------------

export function useNavData() {
  const data = useMemo(
    () => [
      // OVERVIEW
      // ----------------------------------------------------------------------
      {
        subheader: 'Management',
        items: [

          {
            title: 'tokens',
            path: paths.dashboard.token.root,
            icon: ICONS.ecommerce,
            children: [
              {
                title: 'my tokens', path: paths.dashboard.root,
              },
              {
                title: 'create token', path: paths.dashboard.token.create,
              },
              // { title: 'update token metadata', path: paths.dashboard.token.minttokens },
              {
                title: 'Advanced settings',
                path: paths.dashboard.token.advanced.root,
                children: [
                  { title: 'create openBook market', path: paths.dashboard.openBook.root },
                  { title: 'revoke freeze authority', path: paths.dashboard.token.advanced.revokefreeze },
                  { title: 'revoke mint authority', path: paths.dashboard.token.advanced.mint },
                  { title: 'make token immutable', path: paths.dashboard.token.advanced.immutable },
                  { title: 'update token metadata', path: '#updateMetaData', info: <Label color="secondary">Soon</Label> },
                  { title: 'burn tokens', path: paths.dashboard.token.advanced.burn, info: <Label color="success">New</Label> },
                  { title: 'mint tokens', path: paths.dashboard.token.advanced.minttokens, info: <Label color="success">New</Label> },
                  { title: 'freeze tokens', path: paths.dashboard.token.advanced.freezeToken, info: <Label color="success">New</Label> },
                  { title: 'unfreeze/thaw tokens', path: paths.dashboard.token.advanced.thawToken, info: <Label color="success">New</Label> },
                  // { title: 'update token metadata', path: paths.dashboard.token.minttokens },

                  // { title: 'update token metadata', path: paths.dashboard.token.minttokens },
                ],
              },

            ],
          },
          {
            title: 'Snapshots',
            path: paths.dashboard.snapshot.root,
            icon: ICONS.camera,

          },
          {
            title: 'Multisender',
            path: paths.dashboard.multisender.root,
            icon: ICONS.send,
            info: (
              <Label color='success'>
                New
              </Label>
            ),
          },
          {
            title: 'Swap',
            path: paths.dashboard.swap.root,
            icon: ICONS.banking,
            info: (
              <Label color='success'>
                New
              </Label>
            ),
          },
        ],
      },
      // MANAGEMENT
      // ----------------------------------------------------------------------

      // {
      //   subheader: 'snapshots',
      //   items: [
      //     {title: 'take snapshot', path: "#", icon: ICONS.banking, info: <Label color="error">Coming soon</Label>},
      //     {title: 'snapshot history', path: "#", icon: ICONS.banking, info: <Label color="error">Coming soon</Label>},

      //   ],
      // },

    ],
    []
  );

  return data;
}
