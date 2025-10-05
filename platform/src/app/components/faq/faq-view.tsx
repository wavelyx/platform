import { Container, Typography } from '@mui/material';
import { MotionContainer } from 'src/components/animate';
import FaqsList from './faq-list';
import { FaqViewProps } from 'src/types/faq';


export default function FaqView({ content }: FaqViewProps) {
  return (
    <Container component={MotionContainer} sx={{ height: 1, my: 10 }}>
      <Typography sx={{ ml: 1, my: 3 }} textAlign='center' variant="h3">
        FAQ
      </Typography>
      <FaqsList content={content} />
    </Container>
  );
}
