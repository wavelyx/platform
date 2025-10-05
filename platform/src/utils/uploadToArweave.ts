import Arweave from 'arweave';

async function UploadFileToBlockChain(file: File | Blob, fileTypeOverride?: string): Promise<string | undefined> {
    const isFileTypeSupported = file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'application/json';
    const isFileSizeSupported = file.size <= 5000 * 1024; // 150kB in bytes

    if (!isFileTypeSupported || !isFileSizeSupported) {
        console.error('File type not supported or file size too large.');
        return undefined;
    }

    const arweave = Arweave.init({
        host: 'arweave.net',
        port: 443,
        protocol: 'https',
        timeout: 20000,
        logging: false,
    });

    // Determine content type
    const contentType = fileTypeOverride || file.type;

    // Handle JSON data differently
    let data;
    if (contentType === 'application/json' && !(file instanceof Blob)) {
        data = JSON.stringify(file);
    } else {
        data = await file.arrayBuffer();
    }

    const transaction = await arweave.createTransaction({
        data
    });

    transaction.addTag('Content-Type', contentType);

    // Your signing mechanism here (placeholder)
    await arweave.transactions.sign(transaction,
        {
            "d": "l_ZQ--goyn1zQK96waJI_j50lb-t034aKlPttPoUML7JzSveBni6s0qJZntCfzq6Umso60SX55debSoGHdTmDhOtVdkQmXD10ax0nXj2deUV3sHlv877kxNXQj55mP1j2VNaAnnfbTvm2EbE8TAp5eoHlMj5yqSXakHPghZ3vIh6u-X5NnDB6ZCkWOwKEV6Hh2E56hJmuFYsTeoRR2tiaiRLsoFuie-6zOaM9VGqLB36hFdeX4weTu9gKJ9MIUyAA5r0Oxw4eojGFX_EYtkUIwAK5Fkg8FX7sG4u91OQjFBrAtxY4qypUs2VysLWxLAlNHHeGgBJg4evY-j3MZVyI7zzd2YjwETq4zudfeLkSiCNJCDT379RVlJTQKVbavNbzD-DSSQNvYeCDH12x9oNcXBB902-btaKqSwr5EjJSOOZYKufsZK653_w6Fv4I8lSisg9vTZ_SQ3mul3uP3dxtMXqb4R7sfwIHBG41OGqgfJBo3aPnQuZ2umIxB4hV3C2cKJj1WUwJYDrvLdxYEIma9Xy1NTXU0LOh0y4D_BDiBcvobFpgfexVGCnU01hyBtgcCsJZbook4e4celt1G4nElg6cDRnL_YtaVDW8GlLDza9otr17_YX479BRmCs7jTsR4alelBeYxQG-NyxaxPeNDalTZLHxyDkGJdHyyr2DJk",
            "dp": "qaCtPFvGQWxRnk6OhKHzKpeFEMn65C41mYYNE7kSLnvMdecTBshyKMD_hy-Kkh7vFHnuExizV-kSbb53aaSFhz-RX_-royYFHctm6_Oe04sj8tJr_v1omgcRvYFTpsUIjU8oBFUtTJSkFZBfGt1jv3chUf1fys5cX2iouzerv7RB10Pi465Dr4nitvaU8cY-HRSpfaYA19OWebK06dIqPylntE49xJrA4UvlojKxF5dpP1i5MX8UhANcxkQ8kMU9mDbXuwZbR4-seUbvyxZbyL9rBcWRVgoJTA8PB6hMGzSe1Tecl9WR4Xdar33ZG8xVEPaOlisPu9PuI8sSZKwJiQ",
            "dq": "DpYz40HkBlW_H_gVkjF-UVKEsxyOB5wqmAQv-NXG3a1erc8KY47f9RcSm2TAFkVnHWjxOFNzWKF3d3srh-7Q311d4RZOJ2Pokg05p6vQ4GPAa6ZlFAH_XfgDBtN6tTaoRl9fGEmw1-1E62JjUlIeZzzhhXmQ2fQ9mfAsTvyNR6EqbMwHUqKxEbs1XiuIBh2VQE-m4xSpR-O5pr-bThb_YeaHQxu-iU4pRc5omcoQBEMXsckq0iChxH84sUTBHOmIo-e3BJ-OX7_gSzBhyY7Vn-VHRjFDCRjrUTdsPWWrIEawR3BwnSyCi1csK0K4lwuOdnbcNb-xuGDhyhZdIw-jgw",
            "e": "AQAB",
            "kty": "RSA",
            "n": "m4Tw255AuWMLTkrdhVtjZB9SGqQoJhrnFJy1BCH376M7t2TPFh4tw9ESFNKAv9_-QvlioZL5MmAMCwDWLR8LjI4zgvKmU8fOcKFWXUt_uDeAif9ENt3JLUG9AZDlt6u_10j0OvTexrIBshnIFL59wfTgZ_DFdxlMFhJhUVwOf9hPAraVg0xEo_oTPiolnYRRKNGb1Smmgxf_DpGfT7UTaRvCRZhepTDk17eiaDRiA0-F-ECMbJ4S1UGQwQkDfw4Z0zjzFHYvJql8YA_3T8ZFLNyxSc3kEghxbih4NOgeICkoKELzg_fDz0Gu8g0BoxtX5OiLSvL1MptT1B-cEczMHRe4gJBL805NMfdWY6I1sysQ8J25fvtBn0FKTdploUVl1KNjXxtCcf5T1whgapTTEbLMVqUxl338WE8KKx4XB7sZ9IxObFXOFxFAPnpKGyLA0xBMFmfHcf1K-8hi0BY2APCHcJNecmdkOi3VZuPCSaEkWyLzgmy95UQGBNo0jVgKBBA86dxPuQfyMk2IKfp3yCnMx7uc3Z06F45e9ZT6Sq6H0cZs6Hs3CTy6s6edagB2e4ed74cP98L0Vz6G-KDeGmZSKolCJvuxMP1hyDLE5gZ7gabaQjImkcWOu5lsVLV7RUTBqfyTMHleELDg5BFvN1j1AnabX70uQKO09ExKgmE",
            "p": "0VuJlGXpRP4bAsItpGbI40xsHBLM--XSBlfGlGdQx7L-D3us1eFhht7tvRQpH05H8nedLCyxkstsPMnkxWANK4yk1zf2I9ad9RZpcZ3RQCsn7ZhIcFuFiqI8_817A_TjkR0MdIqL-XPiCu-6Kuj8r-0HKO82P2_Jm3m-Lo3tj6Y4LE31MtvC-UIPUN2YozMfUIaPN4RrIiyJ6KIPJAm9KrGkY2G5UTWAguMCq90mVDyOlSehyYrRjxH1Iaf2Esqru_xzj5n6PkOhZT125dxbZ1JhuDn26khj7COJZRrN27XXlr0Iu6-XqrsAUoBIUwayIs50zxVgUfAKwmRsm7ulxw",
            "q": "virNGTJUCaoC1lqfguFri1KM8Qp_bDnCY9pQnYyWtdB0RVh3gCQHvSMSaF0QgDQDmyvg5gLv3GTWIxGe5ClkYePZ1FDUi6O4zgg8Ixx-tj3dPRnBE8ND-7DPtv_S0FpQnaVTjPMSXUzjkPK-mPNBM8EYaUQ0h7hGYzC_b2qzkiBkHd16nD0YUBF46k0CK_qr6tx25XHwCaAIrm5oe485pFSYP0zT5sbXNRk6hd1ccgbSXXC6WX-P0ZtUtpbB58rp0a0kH4A6oVfZC7I8fu_QrUr4Yp48UEFoqGVQJZP2upRseg2Me3_bu9kRfUUY_gV5jx2fK_GCoFezj1yX1D52lw",
            "qi": "Rggm5jM2M5lyB9mFqY4jnw7NAuPBxOvV7nZwqTcZhaRKEQ3YuyY-BOlrvsHZg8V3yPt-d1A1M5JtNGccOX5mm6cgQZ7HXOeSfbJW5tRybBve_7i326DbjCz6V-oENHfUoWmc8qLMMkd8Oo9ozqkMaqsZLmWaAHMN1Lue4t1aH3ED07f10CYrO5vy9bXBAbrNZo2xJv-XOIu5CUdzn1xnOcwmBALPGBwmad-5H7w4nYOMUI7wFVkGoZvhMLeD0uSiRK26ZlbTGZFQxigVS4AIFUKlJEER1qn-RviTugAesSWXAqz2aib2WUDkxnY58v0JvaD8IknPB4eFTUmKekXANg"
        }
    );



    const response = await arweave.transactions.post(transaction);

    if (response.status === 200) {
        return `https://arweave.net/${transaction.id}`;
    } 
        console.error('Failed to upload to Arweave:', response.status);
        return undefined;
    
}

export default UploadFileToBlockChain;
