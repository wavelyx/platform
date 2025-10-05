import { Container, Skeleton } from '@mui/material';

// ----------------------------------------------------------------------

export default function SwapLoading() {
  return (
    <Container maxWidth="lg">
      <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
    </Container>
  );
}
