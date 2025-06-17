
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateComplaintApi } from "../app/api/complaint";
import { getAll } from "./queries/QueriesKey";

export const useUpdateComplaint = () => {
  const queryClient = useQueryClient();
 
  return useMutation({
    mutationFn: async ({ id, payload }: { 
      id: number; 
      payload: {
        status: string;
        state: string;
        comment: string;
        dueDate: Date;
        firstName: string;
        lastName: string;
        fullName: string;
        emailAddress: string;
      }
    }) => {
      return updateComplaintApi(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [getAll]});
    },
    onError: (error: any) => {
      console.error("Error updating complaint:", error);
    }
  });
};
