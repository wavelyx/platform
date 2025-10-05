import React, { useRef } from "react";
import Button from "@mui/material/Button";
import Iconify from "src/components/iconify";
import axiosInstance from "src/utils/axios";
import { useSnackbar } from "notistack"; // For notifications

interface Data {
  walletAddress: string;
  amount: number;
}

interface UploadButtonProps {
  onUploadSuccess: (data: Data[]) => void;
}

function UploadButton({ onUploadSuccess }: UploadButtonProps) {
  const { enqueueSnackbar } = useSnackbar();

  const inputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = event.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const file = selectedFiles[0];

      if (file.type !== "text/csv") {
        // Check file type
        enqueueSnackbar("Invalid file type. Please select a CSV file.", {
          variant: "error",
        });
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await axiosInstance.post(
          `${process.env.NEXT_PUBLIC_HOST_API_V2}/upload-csv`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        onUploadSuccess(response.data);
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
  };

  return (
    <div>
      <Button size="small" variant="text" onClick={handleButtonClick}>
        <Iconify sx={{ mr: 1 }} icon="mdi:upload" width={24} />
        Upload
      </Button>
      <input
        type="file"
        ref={inputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
        accept=".csv" // Accept only CSV files
      />
    </div>
  );
}

export default UploadButton;
