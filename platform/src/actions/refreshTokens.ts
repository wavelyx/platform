
import axiosInstance from "src/utils/axios";

const refreshTokens = async (walletAddress: any) => {
    try {

        await axiosInstance.get(`${process.env.NEXT_PUBLIC_HOST_API_V2}/refreshTokens/${walletAddress}`);

    } catch (error) {
        console.error('Error logging in:', error);
        // Handle login error here (e.g., show notification)
    }
};

export default refreshTokens;