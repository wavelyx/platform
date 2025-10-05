import { Box, Card, CardHeader, Link, Stack, Typography } from "@mui/material";
import { ST } from "next/dist/shared/lib/utils";
import { useResponsive } from "src/hooks/use-responsive";
import { ITokenInformation } from "src/types/user";
import { fNumber } from "src/utils/format-number";

export default function TokenInformation({ tokenDescription, mint, tokenName, tokenSymbol, tokenSupply, decimals, mutable, Metadata, programName, mintAuthority, freezeAddress, freezeAccount, mintAccount }: ITokenInformation) {

    const smDown = useResponsive('down', 'sm')
    const formatValue = (value: any) => {
        if (typeof value === 'boolean') {
            return value ? 'Yes' : 'No';
        }
        return value;
    };
    return (
        <Card>
            <CardHeader title="Token Information" />

            <Stack spacing={2} sx={{ p: 3 }}>
                <Stack direction="row" spacing={1}>
                    <Typography variant="subtitle1">Mint: </Typography>

                    <Box sx={{ typography: 'body1', textDecoration: 'underline' }}>
                        <Link href={`https://solscan.io/token/${mint}`} target="_blank" rel="noopener noreferrer" variant="subtitle2" color="inherit">
                            {smDown ? mint.slice(0, 4) + '...' + mint.slice(-4) : mint}
                        </Link>
                    </Box>
                </Stack>

                <Stack direction="row" spacing={1}>
                    <Typography variant="subtitle1">Token Name: </Typography>
                    <Typography variant="body1">{tokenName}</Typography>
                </Stack>

                <Stack direction="row" spacing={1}>
                    <Typography variant="subtitle1">Token Symbol:</Typography>
                    <Typography variant="body1">{tokenSymbol}</Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                    <Typography variant="subtitle1">Token Supply:</Typography>
                    <Typography variant="body1">{fNumber(tokenSupply)}</Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                    <Typography variant="subtitle1">Token Decimals:</Typography>
                    <Typography variant="body1">{decimals}</Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                    <Typography variant="subtitle1">Metadata:</Typography>
                    <Link href={Metadata} target="_blank" rel="noopener noreferrer" color='primary'>
                        <Typography sx={{ textDecoration: 'underline' }} variant="body1">View Metadata</Typography>
                    </Link>
                </Stack>
                <Stack direction="row" spacing={1}>
                    <Typography variant="subtitle1">Token Program:</Typography>
                    <Typography variant="body1">{programName}</Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                    <Typography variant="subtitle1">Mint Authority:</Typography>
                    <Typography variant="body1">{formatValue(mintAuthority)}</Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                    <Typography variant="subtitle1">Freeze Authority:</Typography>
                    <Typography variant="body1">{formatValue(freezeAddress)}</Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                    <Typography variant="subtitle1">Immutable:</Typography>
                    <Typography variant="body1">{formatValue(mutable)}</Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                    <Typography variant="subtitle1">Freeze Account:</Typography>
                    {freezeAccount ? (
                        <Typography variant="body1">{freezeAccount}</Typography>
                    ) : (
                        <Typography variant="body1">No freeze account for this token</Typography>
                    )}
                </Stack>
                <Stack direction="row" spacing={1}>
                    <Typography variant="subtitle1">Mint Account:</Typography>
                    {mintAccount ? (
                        <Typography variant="body1">{mintAccount}</Typography>
                    ) : (
                        <Typography variant="body1">No mint account for this token</Typography>
                    )}
                </Stack>
            </Stack>
        </Card>
    )
};