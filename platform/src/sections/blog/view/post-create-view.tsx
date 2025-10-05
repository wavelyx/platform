'use client';

// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import PostNewEditForm from '../post-new-edit-form';
import { useWallet } from '@solana/wallet-adapter-react';
import { useCallback, useEffect, useState } from 'react';
import axiosInstance from 'src/utils/axios';
import { IPostItem } from 'src/types/blog';
import { LinearProgress } from '@mui/material';

// ----------------------------------------------------------------------

export default function PostCreateView({ title }: { title: string }) {
  const settings = useSettingsContext();
  const { publicKey } = useWallet();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPost, setCurrentPost] = useState<IPostItem | undefined>(undefined);

  const fetchPost = useCallback(async () => {
    const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_HOST_API_V2}/blogView?title=${encodeURIComponent(title)}`);
    setCurrentPost(response.data?.post);
  }, [title]);

  useEffect(() => {
    const verifyAdmin = async () => {
      if (publicKey) {
        try {
          const response = await axiosInstance.post(`${process.env.NEXT_PUBLIC_HOST_API_V2}/verifyAdmin`, {
            publicKey: publicKey.toBase58(),
          });

          setIsAdmin(response.data.isAdmin);
        } catch (error) {
          console.error('Error verifying admin:', error);
          setIsAdmin(false);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    verifyAdmin();
  }, [publicKey]);

  useEffect(() => {
    if (isAdmin) {
      fetchPost();
    }
  }, [isAdmin, fetchPost]);

  if (loading) {
    return <LinearProgress />;
  }

  if (!isAdmin) {
    return <div>Slow down champ, you are not the boss here</div>;
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Create a new post"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Blog',
          },
          {
            name: 'Create',
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <PostNewEditForm currentPost={currentPost} fetchPost={fetchPost} />
    </Container>
  );
}
