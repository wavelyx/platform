// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  minimalUI: 'https://mui.com/store/items/minimal-dashboard/',
  // AUTH
  auth: {
    jwt: {
      login: `${ROOTS.AUTH}/jwt/login`,
      register: `${ROOTS.AUTH}/jwt/register`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    three: `${ROOTS.DASHBOARD}/three`,
    token: {
      root: `${ROOTS.DASHBOARD}/token`,
      create: `${ROOTS.DASHBOARD}/token/create-token`,
      id: `${ROOTS.DASHBOARD}/token`,

      //

      advanced:{
        root: `${ROOTS.DASHBOARD}/token/advanced`,
        mint: `${ROOTS.DASHBOARD}/token/advanced/mint-authority`,
        burn: `${ROOTS.DASHBOARD}/token/advanced/burn-token`,
        minttokens: `${ROOTS.DASHBOARD}/token/advanced/mint-token`,
        revokefreeze: `${ROOTS.DASHBOARD}/token/advanced/revoke-freeze-authority`,
        immutable: `${ROOTS.DASHBOARD}/token/advanced/make-immutable`,
        freezeToken: `${ROOTS.DASHBOARD}/token/advanced/freeze-account`,
        thawToken: `${ROOTS.DASHBOARD}/token/advanced/thaw-account`,
      },
    },
    user: {
      root: ROOTS.DASHBOARD,
      list: `${ROOTS.DASHBOARD}/user/list`,
      view: `${ROOTS.DASHBOARD}/user/view`,
      edit: `${ROOTS.DASHBOARD}/user/edit`,
      new: `${ROOTS.DASHBOARD}/user/new`,
    },
    openBook: {
      root: `${ROOTS.DASHBOARD}/token/advanced/openbook`,
      create: `${ROOTS.DASHBOARD}/token/advanced/openbook/create`,
      completed: `${ROOTS.DASHBOARD}/token/advanced/openbook/completed`,
      id: `${ROOTS.DASHBOARD}/token/advanced/openbook/:id`,
    },
    snapshot: {
      root: `${ROOTS.DASHBOARD}/snapshot`,
      create: `${ROOTS.DASHBOARD}/snapshot/create`,
      completed: `${ROOTS.DASHBOARD}/snapshot/completed`,
      id: `${ROOTS.DASHBOARD}/snapshot/:id`,
    },
    multisender: {
      root: `${ROOTS.DASHBOARD}/multisender`,
      details: `${ROOTS.DASHBOARD}/multisender/details`,
      list: `${ROOTS.DASHBOARD}/multisender/list`,
      completed: `${ROOTS.DASHBOARD}/multisender/completed`,
    },
    swap: {
      root: `${ROOTS.DASHBOARD}/swap`,
    },
  }
};
