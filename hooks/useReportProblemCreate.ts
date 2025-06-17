import { useMutation, useQueryClient } from "@tanstack/react-query";
import { complaintCreateApi, reportProblemCreateApi } from "../app/api/complaint";
import { ComplaintCreate, ReportProblemCreate } from "../types/complaintCreate";
import { getAll } from "./queries/QueriesKey";

export default function useReportProblemCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ReportProblemCreate) => {
      return reportProblemCreateApi(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [getAll] });
    },
    onError: (error: any) => {
      console.error("Error creating problem service:", error);
    }
  });
}









// const useCreateOrganizeTableUser = () => {
//   const queryClient = useQueryClient();
//   return useMutation<IProblemServiceRequestCreate<string>, { message: string }, any>(
//       [createproblemservice],
//       async (data: IOrganizeRequest) => await createOrganizeTableUserApi(data),
//       {
//           onSuccess: () => {
//               queryClient.invalidateQueries([getOrganizeTableUser]);
//           },
//       }
//   );


// }

// export default function useCreateProblem() {
//   const queryClient = useQueryClient();
//   return useMutation<void, { message: string }, IProblemServiceRequestCreate>(
//     (newPayload) => createProblemApi(newPayload),
//     {
//       onSuccess: () => {
//         queryClient.invalidateQueries(['getProblem']);
//       },
//     }
//   );
// }