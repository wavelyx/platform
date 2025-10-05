// @mui
import Box from '@mui/material/Box';

//
import Image from '../image';

// ----------------------------------------------------------------------

type Props = {
  imgUrl?: string;
};

export default function SingleFilePreview({ imgUrl = '' }: Props) {
  return (
    <Box
      sx={{
        p: 1,
        display: 'flex', // Flex container oluştur
        justifyContent: 'center', // İçeriği yatayda ortala
        alignItems: 'center', // İçeriği dikeyde ortala
        width: 1, // %100 genişlik
        height: 1, // %100 yükseklik
        position: 'absolute',
        top: 0,
        left: 0,
      }}
    >
      <Image
        alt="file preview"
        src={imgUrl}
        sx={{
          width: '50%', // Resmin genişliğini %50 yap
          height: 'auto', // Yüksekliği orantılı ayarla
          borderRadius: 1, // Kenar yuvarlaklığı
        }}
      />
    </Box>
  );
}
