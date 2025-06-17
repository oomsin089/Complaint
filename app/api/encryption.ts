import { axiosApi } from "../../utils/axios";

export const EncryptApi = async (data: string) => {
    try {
      const response = await axiosApi('post',`/encryption/encrypt?id=${data}`);
      return response; 
    } catch (error) {
      console.error('Error encrypting data:', error);
      throw error; 
    }
  };

  export const DecryptApi = async (encryptedData: string) => {
    try {
      const response = await axiosApi('post',`/encryption/decrypt?id=${encryptedData}`);
      return response; 
    } catch (error) {
      console.error('Error decrypting data:', error);
      throw error;
    }
  };