'use client';

import { useState, useCallback } from 'react';
// @mui
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Tabs, { tabsClasses } from '@mui/material/Tabs';
// _mock
import { _tokenProfileCover } from 'src/_mock';
// components
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
//
import TwoView from 'src/sections/revoke/revoke-mint-view';
import { Button, Typography } from '@mui/material';
import ProfileCover from 'src/sections/three/profile-cover';
import TokenInformation from 'src/sections/three/view/token-information';
import ImmutableView from 'src/sections/revoke/immutable-view';
import { useTokenIdByWallet } from 'src/actions/getTokensByWallet';
import BurnTokenForm from 'src/sections/token/burn-token';
import RevokeFreezeView from 'src/sections/revoke/revoke-freeze-view';
import MintToken from 'src/sections/token/mint-token';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { LoadingScreen } from 'src/components/loading-screen';
import NotFound from 'src/app/not-found';


// ----------------------------------------------------------------------

const TABS = [
  {
    value: 'tokenDetails',
    label: 'Token Details',
    icon: <Iconify icon="bx:detail" width={24} />,
  },
  {
    value: 'mintAuthority',
    label: 'Revoke Mint',
    icon: <Iconify icon="mdi:hammer" width={24} />,
  },
  {
    value: 'revokeFreeze',
    label: 'Revoke Freeze',
    icon: <Iconify icon="mdi:snowflake" width={24} />,
  },
  {
    value: 'mutable',
    label: 'Make Token Immutable',
    icon: <Iconify icon="mdi:shield-check" width={24} />,
  },
  {
    value: 'burnToken',
    label: 'Burn Token',
    icon: <Iconify icon="mdi:fire" width={24} />,
  },
  {
    value: 'mintToken',
    label: 'Mint Token',
    icon: <Iconify icon="ic:baseline-generating-tokens" width={24} />,
  },
  // {
  //   value: 'freezeAssAccount',
  //   label: 'Freeze Token',
  //   icon: <Iconify icon="solar:users-group-rounded-bold" width={24} />,
  // }
];

// ----------------------------------------------------------------------

export default function TokenProfileView({ id }: { id: string }) {

  const { token, isLoading, isError } = useTokenIdByWallet(id);

  const settings = useSettingsContext();

  const [currentTab, setCurrentTab] = useState('tokenDetails');

  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }
  if (isError) {
    return <NotFound />;
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>

      <CustomBreadcrumbs
        heading={`${token.tokenName}`}
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'My Tokens',
            href: paths.dashboard.root
          },
          {
            name: 'Token Details',
          },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.token.create}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            Create New Token
          </Button>
        }
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <Typography
        variant='h4'
        sx={{
          mb: { xs: 3, md: 5 },
        }}>
        {`${token.tokenName} - Token Details`}

      </Typography>

      <Card
        sx={{
          mb: 3,
          height: 290,
        }}
      >
        <ProfileCover
          tokenSymbol={token.tokenSymbol}
          tokenName={token.tokenName}
          tokenAddress={token.tokenAddress}
          tokenPictureUrl={token.tokenPictureUrl}
          coverUrl={_tokenProfileCover.coverUrl}
        />

        <Tabs
          value={currentTab}
          onChange={handleChangeTab}
          sx={{
            width: 1,
            bottom: 0,
            zIndex: 9,
            position: 'absolute',
            bgcolor: 'background.paper',
            [`& .${tabsClasses.flexContainer}`]: {
              pl: { md: 3 },
              justifyContent: {
                sm: 'center',
                md: 'flex-start',
              },
            },
          }}
        >
          {TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} icon={tab.icon} label={tab.label} />
          ))}
        </Tabs>
      </Card>

      {currentTab === 'tokenDetails' &&

        <TokenInformation
          tokenDescription={token.description}
          mint={token.tokenAddress}
          tokenName={token.tokenName}
          tokenSymbol={token.tokenSymbol}
          tokenSupply={token.tokenSupply}
          decimals={token.decimals}
          Metadata={token.metadata.uri}
          programName={token.programName}
          mintAuthority={token.mintAuthority}
          freezeAddress={token.freezeAddress}
          mutable={!token.mutable}
          freezeAccount={token.freezeAccount}
          mintAccount={token.mintAccount}
        />}

      {currentTab === 'mintAuthority' && <TwoView tokenName={token.tokenName} />}

      {currentTab === 'revokeFreeze' && <RevokeFreezeView tokenName={token.tokenName} />}

      {currentTab === 'mutable' && <ImmutableView tokenName={token.tokenName} />}
      {currentTab === 'burnToken' && <BurnTokenForm tokenName={token.tokenName} />}
      {currentTab === 'mintToken' && <MintToken tokenName={token.tokenName} />}
      {/* {currentTab === 'freezeAssAccount' && <FreezeToken tokenName={token.tokenName} />} */}
    </Container>
  );
}