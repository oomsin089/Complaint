import { useMutation } from "@tanstack/react-query";
import { EncryptApi } from "../../app/api/encryption";

export default function useEncryptData() {
  return useMutation<string, { message: string }, string>({
    mutationFn: async (data: string) => {
      const response = await EncryptApi(data);
      return response as string;
    },
  });
}