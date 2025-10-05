import * as React from "react";
import Box from "@mui/material/Box";
import {
  GridRowsProp,
  GridRowModesModel,
  GridRowModes,
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridActionsCellItem,
  GridEventListener,
  GridRowId,
  GridRowModel,
  GridRowEditStopReasons,
  GridSlots,
  GridToolbarFilterButton,
  GridToolbarExport,
} from "@mui/x-data-grid";
import Iconify from "../iconify/iconify";
import {
  Avatar,
  Dialog,
  Divider,
  Drawer,
  Fab,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import UploadButton from "./upload-button";
import { useBoolean } from "src/hooks/use-boolean";
import { paths } from "src/routes/paths";
import { fNumber, fShortenNumber } from "src/utils/format-number";
import { useResponsive } from "src/hooks/use-responsive";
import { RHFSelect, RHFTextField } from "../hook-form";
import useTokensByWallet, {
  TokenInfo,
} from "src/actions/getParsedTokenAccountsByOwner";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useSnackbar } from "notistack";
import { useFormContext } from "react-hook-form";
import TokenManager from "src/app/components/token-manager/token-manager";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

// kano helpers

let nextId = 0;
const defaultAmount = 1;
const SOLANA_FEES = 0.0005;

const initialRows: GridRowsProp = [
  {
    id: nextId++,
    walletAddress: "FXmwqJjJ9raP2Z44ds1mfxpu7szPePatr15smEphkmNt",
    amount: 1,
  },
];

const isValidSolanaAddress = (address: string) => {
  try {
    const publicKey = new PublicKey(address);
    return PublicKey.isOnCurve(publicKey);
  } catch (err) {
    return false;
  }
};

// kano helpers -- end

interface EditToolbarProps {
  setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
  setRowModesModel: (
    newModel: (oldModel: GridRowModesModel) => GridRowModesModel
  ) => void;
}

function EditToolbar(props: EditToolbarProps) {
  const { setRows, setRowModesModel } = props;
  const { enqueueSnackbar } = useSnackbar();

  const handleClick = () => {
    const id = nextId++;
    setRows((oldRows) => {
      const newRow = {
        id,
        walletAddress: "",
        amount: 1,
        isNew: true,
        focus: true,
      };

      // Directly enter edit mode for the new row
      setRowModesModel((oldModel) => ({
        ...oldModel,
        [id]: { mode: GridRowModes.Edit, fieldToFocus: "walletAddress" },
      }));

      return [newRow, ...oldRows]; // Add new row without checking for duplicates yet
    });
  };

  const handleUploadSuccess = (data: any[]) => {
    const newRows = data
      .filter((item) => isValidSolanaAddress(item.walletAddress))
      .map((item) => ({
        id: nextId++,
        walletAddress: item.walletAddress,
        amount: item.amount || defaultAmount,
      }));

    setRows((oldRows) => {
      const mergedRows = [...oldRows];
      newRows.forEach((newRow) => {
        const existingRow = mergedRows.find(
          (row) => row.walletAddress === newRow.walletAddress
        );
        if (existingRow) {
          existingRow.amount += newRow.amount;
        } else {
          mergedRows.push(newRow);
        }
      });
      return mergedRows;
    });

    if (newRows.length > 0) {
      enqueueSnackbar("Your file uploaded successfully!", {
        variant: "success",
      });
    } else {
      enqueueSnackbar("No valid addresses found in the uploaded file.", {
        variant: "warning",
      });
    }
  };

  return (
    <GridToolbarContainer
      sx={{
        borderRadius: 1,
        justifyContent: "space-between",
        direction: { sm: "column", md: "row" },
      }}
    >
      <Stack direction="row">
        <Fab
          size="small"
          color="primary"
          variant="outlinedExtended"
          onClick={handleClick}
        >
          <Iconify icon="mdi:add" width={24} />
          Add New Wallet Address
        </Fab>
      </Stack>
      <Stack spacing={1} direction="row">
        <GridToolbarFilterButton />
        <UploadButton onUploadSuccess={handleUploadSuccess} />
        <GridToolbarExport />
      </Stack>
    </GridToolbarContainer>
  );
}

export default function MultisenderCrudGrid({ totalFees }: { totalFees: number }) {
  const [rows, setRows] = React.useState(initialRows);

  const { setValue, watch } = useFormContext();
  const values = watch();
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {}
  );
  // kano tools
  const { enqueueSnackbar } = useSnackbar();
  const smUp = useResponsive("up", "sm");
  const [input, setInput] = React.useState<string>("");
  const [inputErrors, setInputErrors] = React.useState<number[]>([]);
  const [newAmount, setNewAmount] = React.useState<number>(0);
  const { tokens, isLoading } = useTokensByWallet();

  const dialog = useBoolean();
  const drawer = useBoolean();
  const estimatedCost = rows.length * SOLANA_FEES || 0.0;

  const { connected } = useWallet();

  const { setVisible: setModalVisible } = useWalletModal();
  const tokenAddress = watch("tokenMintAddress");
  // listen to tokenMintAddress changes and update the decimals field in the form
  React.useEffect(() => {
    const selectedToken = tokens?.find(
      (token: TokenInfo) => token.mintAddress === tokenAddress
    );
    if (selectedToken) {
      setValue("decimals", selectedToken.decimals);
    }
  }, [tokenAddress, tokens, setValue]);

  React.useEffect(() => {
    // Validate input whenever it changes
    const errors = validateInput(input);
    setInputErrors(errors);
  }, [input]); // Run this effect whenever 'input' changes,,

  React.useEffect(() => {
    setValue("recipients", rows);
  }, [rows]);


  const validateInput = (input: string) => {
    const lines = input.split("\n");
    const errors: number[] = [];

    lines.forEach((line, index) => {
      const parts = line.trim().split(/[\s,]+/);
      const walletAddress = parts[0];
      const amountStr = parts[1];
      const amount = amountStr ? parseFloat(amountStr.trim()) : defaultAmount;

      if (!isValidSolanaAddress(walletAddress) || isNaN(amount)) {
        errors.push(index + 1);
      }
    });

    return errors;
  };

  // kano tools -- end
  const handleRowEditStop: GridEventListener<"rowEditStop"> = (
    params,
    event
  ) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id: GridRowId) => () => {
    const row = rows.find((row) => row.id === id);

    if (row && !isValidSolanaAddress(row.walletAddress)) {
      enqueueSnackbar(`Invalid Solana address at row: ${row.walletAddress}`, {
        variant: "error",
      });
    } else {
      setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    }
  };

  const handleDeleteClick = (id: GridRowId) => () => {
    setRows(rows.filter((row) => row.id !== id));
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rows.find((row) => row.id === id);
    if (editedRow!.isNew) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const processRowUpdate = (newRow: GridRowModel) => {
    if (!isValidSolanaAddress(newRow.walletAddress)) {
      enqueueSnackbar(`Invalid Solana address: ${newRow.walletAddress}`, {
        variant: "error",
      });
      throw new Error(`Invalid Solana address: ${newRow.walletAddress}`);
    } else {
      enqueueSnackbar("Row updated successfully!", {
        variant: "success",
      });
      // Check for duplicates and merge
      const existingRow = rows.find(
        (row) =>
          row.walletAddress === newRow.walletAddress && row.id !== newRow.id
      );
      if (existingRow) {
        existingRow.amount += newRow.amount;
        setRows(rows.filter((row) => row.id !== newRow.id));
        enqueueSnackbar(
          `Duplicate address found. Amount added to existing row.`,
          { variant: "warning" }
        );
      } else {
        const updatedRow = { ...newRow, isNew: false };
        setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
      }
      return newRow;
    }
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  // kano
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };
  const handleAddRow = () => {
    const lines = input.split("\n");
    const newRows: { id: number; walletAddress: string; amount: number }[] = [];
    const invalidRows: number[] = [];

    lines.forEach((line, index) => {
      const parts = line.trim().split(/[\s,]+/);
      const walletAddress = parts[0];
      const amountStr = parts[1];
      const amount = amountStr ? parseFloat(amountStr.trim()) : defaultAmount;

      if (isValidSolanaAddress(walletAddress) && !isNaN(amount)) {
        // Check for duplicates and merge
        const existingRow = newRows.find(
          (row) => row.walletAddress === walletAddress
        );
        if (existingRow) {
          existingRow.amount += amount;
        } else {
          newRows.push({
            id: nextId++,
            walletAddress,
            amount,
          });
        }
      } else {
        invalidRows.push(index + 1); // Store the line number (starting at 1)
      }
    });

    enqueueSnackbar("Addresses and amounts added successfully!", {
      variant: "success",
    });

    // Merge with existing rows and handle duplicates
    const mergedRows = [...rows];
    newRows.forEach((newRow) => {
      const existingRow = mergedRows.find(
        (row) => row.walletAddress === newRow.walletAddress
      );
      if (existingRow) {
        existingRow.amount += newRow.amount;
      } else {
        mergedRows.push(newRow);
      }
    });

    setRows(mergedRows);
    setInput("");
    drawer.onFalse();
  };
  const handleRedirectSnapshot = () => {
    const externalUrl = paths.dashboard.snapshot.root;
    window.open(externalUrl, "_blank");
  };

  const handleChangeAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewAmount(parseFloat(event.target.value));
  };

  const handleSaveAmount = () => {
    // Update all rows with the new amount
    setRows((prevRows) =>
      prevRows.map((row) => ({ ...row, amount: newAmount }))
    );
    enqueueSnackbar("Amounts updated successfully!", {
      variant: "success",
    });
    setNewAmount(0);
    dialog.onFalse();
  };

  // kano --- end

  const columns: GridColDef[] = [
    {
      field: "walletAddress",
      type: "string",
      headerName: "Wallet Address",
      width: smUp ? 450 : 150,
      editable: true,
    },
    {
      field: "amount",
      headerName: "Amount",
      type: "number",
      width: smUp ? 450 : 150,
      align: "left",
      headerAlign: "left",
      editable: true,
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: smUp ? 250 : 75,
      cellClassName: "actions",
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<Iconify icon="icon-park:save-one" width={24} />}
              label="Save"
              sx={{
                color: "primary.main",
              }}
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              icon={<Iconify icon="icon-park:close-one" width={24} />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<Iconify icon="icon-park:edit" width={24} />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<Iconify icon="icon-park:delete" width={24} />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  React.useEffect(() => {
    const selectedToken = tokens?.find(
      (token: TokenInfo) => token.mintAddress === tokenAddress
    );
    if (selectedToken) {
      setValue("tokenName", selectedToken.metadata?.name);
      setValue("tokenSymbol", selectedToken.metadata?.symbol);
    }
  }
    , [tokenAddress, tokens, setValue]);



  return (
    <>
      <Stack spacing={2} direction={{ xs: "column", md: "row" }}>
        <RHFTextField
          variant="outlined"
          name="tokenMintAddress"
          label="Select Token"
          helperText="Choose your token or NFT for distribution."
          select
          fullWidth
        >
          {isLoading ? (
            <option>Loading...</option>
          ) : (
            tokens
              .filter((token: TokenInfo) => token.balance > 0) // Filter tokens with balance > 0
              .map((token: TokenInfo) => (
                <MenuItem key={token.mintAddress} value={token.mintAddress}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar
                      src={token.metadataJson?.image || ""}
                      alt={token.metadataJson?.name || ""}
                    />
                    <Typography variant="body2" noWrap>
                      {`${token.metadata?.name} (${token.metadata?.symbol}) ${token.mintAddress.slice(0, 4)}...${token.mintAddress.slice(-4)} (${fShortenNumber(token.balance)} available)`}
                    </Typography>
                  </Stack>
                </MenuItem>
              ))
          )}
        </RHFTextField>
        {/* <RHFSelect
        fullWidth 
        name="tokenMintAddress"
        label={connected ? "Bacin" : 'Connect Wallet to Proceed'}
        disabled={!connected}
        onClick={() => {
          if (!connected) {
            setModalVisible(true);
          }
          else {
            return;
          }
        }
        }
      >
        {tokens?.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Avatar sx={{ width: 30, height: 30 }} src={option.tokenPictureUrl} alt={option.alt} />
              <Typography>{option.label}</Typography>
            </Stack>
          </MenuItem>
        ))}
      </RHFSelect> */}
        <Fab
          onClick={dialog.onTrue}
          sx={{
            width: { sm: 1, md: 300 },
          }}
          variant="extended"
          color="primary"
        >
          Change Amount
        </Fab>
      </Stack >
      <Box
        sx={{
          height: 500,
          width: "100%",
          "& .actions": {
            color: "text.secondary",
          },
          "& .textPrimary": {
            color: "text.primary",
          },
        }}
      >
        <DataGrid
          sx={{ m: 0.5, border: 1, borderRadius: 1, borderColor: "divider" }}
          rows={rows}
          columns={columns}
          editMode="row"
          rowModesModel={rowModesModel}
          onRowModesModelChange={handleRowModesModelChange}
          onRowEditStop={handleRowEditStop}
          processRowUpdate={processRowUpdate}
          slots={{
            toolbar: EditToolbar as GridSlots["toolbar"],
          }}
          slotProps={{
            toolbar: { setRows, setRowModesModel },
          }}
          localeText={{
            noRowsLabel: "No wallet address added yet.",
          }}
        />
      </Box>
      <Stack
        sx={{ mb: { xs: 1.618 } }}
        direction={{ xs: "column", md: "row" }}
        spacing={1}
      >
        <Fab
          sx={{ width: 1 }}
          color="inherit"
          variant="outlinedExtended"
          onClick={drawer.onTrue}
        >
          <Iconify icon="icon-park:copy-one" width={24} />
          Bulk Paste
        </Fab>
        <Fab
          onClick={handleRedirectSnapshot}
          color="inherit"
          sx={{ width: 1 }}
          variant="outlinedExtended"
        >
          <Iconify icon="icon-park:micro-slr-camera" width={24} />
          Take Snaphot
        </Fab>
        {/* <Fab color="inherit" sx={{ width: 1 }} variant="outlinedExtended">
          <Iconify icon="icon-park:mirror-one" width={24} />
          Example
        </Fab> */}
      </Stack>
      <Drawer
        open={drawer.value}
        onClose={drawer.onFalse}
        anchor="right"
        PaperProps={{
          sx: { width: { xs: 1, md: 480, xl: 618 } },
        }}
      >
        <Stack
          spacing={3}
          sx={{
            p: 3,
          }}
          direction="column"
        >
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="h4">Bulk Paste</Typography>
            <IconButton onClick={drawer.onFalse}>
              <Iconify icon="mdi:close" />
            </IconButton>
          </Stack>
          <Divider sx={{ borderStyle: "dashed" }} />
          <Typography variant="body1">Paste your things here</Typography>
          <TextField
            label="Wallet Address, Amount"
            variant="outlined"
            value={input}
            onChange={handleInputChange}
            size="small"
            multiline
            rows={20}
            error={inputErrors.length > 0}
            helperText={
              inputErrors.length > 0
                ? `Invalid wallet address on lines: 
                ${inputErrors.join(", ")}`
                : ""
            }
          />
        </Stack>
        <Fab
          sx={{ position: "fixed", bottom: 25, mx: 3, width: "93%" }}
          variant="extended"
          color="inherit"
          onClick={handleAddRow}
        >
          Add
        </Fab>
      </Drawer>
      <Stack
        sx={{
          px: 2,
          height: 50,
          justifyContent: "space-between",
          alignItems: "center",
        }}
        direction="row"
        spacing={1}
      >
        <Stack direction="row" spacing={0.618}>
          <Iconify width={18} icon="icon-park:bitcoin" />
          <Typography
            fontSize="12px"
            variant="subtitle2"
            color="text.secondary"
          >
            Token Selected: {values.tokenSymbol}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.618}>
          <Iconify icon="icon-park:pay-code" />
          <Typography
            fontSize="12px"
            variant="subtitle2"
            color="text.secondary"
          >
            Estimated Cost: [{fNumber(totalFees / LAMPORTS_PER_SOL)} SOL]
          </Typography>
        </Stack>

        <Stack direction="row" spacing={0.618}>
          <Iconify fontSize="12px" icon="icon-park:wallet-one" />
          <Typography
            fontSize="12px"
            variant="subtitle2"
            color="text.secondary"
          >
            Total Wallets: {fNumber(rows.length)}
          </Typography>
        </Stack>
      </Stack>

      {/* Change Amount dialog */}
      <Dialog
        fullWidth
        maxWidth="sm"
        open={dialog.value}
        onClose={dialog.onFalse}
      >
        <Stack sx={{ p: 3 }} direction="row" justifyContent="space-between">
          <Typography variant="h4">Change Amount</Typography>
          <IconButton onClick={dialog.onFalse}>
            <Iconify icon="mdi:close" />
          </IconButton>
        </Stack>
        <Typography variant="body2" sx={{ px: 3 }}>
          It's gonna change all amount of the wallets.
        </Typography>
        <Stack
          sx={{ p: 3 }}
          alignItems="center"
          justifyContent="center"
          direction="column"
        >
          <TextField
            fullWidth
            label="Amount"
            placeholder="Please write the amount"
            type="number"
            value={newAmount}
            onChange={handleChangeAmount}
            variant="outlined"
          />
          <Fab
            onClick={handleSaveAmount}
            variant="extended"
            color="primary"
            type="submit"
            sx={{
              width: 1,
              mt: 2,
            }}
          >
            Save
          </Fab>
        </Stack>
      </Dialog>
    </>
  );
}
