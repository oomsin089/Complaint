import { useMutation } from "@tanstack/react-query";
import { DecryptApi } from "../../app/api/encryption";

const useDecryptData = () => {
  return useMutation<string, { message: string }, string>({
    mutationFn: async (encryptedData: string) => {
      const response = await DecryptApi(encryptedData);
      return response as string; // Assert that response is a string
    },
  });
};

export default useDecryptData;