"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTherapy } from "@/lib/api/therapies";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "sonner";

export const useDeleteTherapy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTherapy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.therapies.all });
      toast.success("Therapy was successfully deleted");
    },
    onError: () => {
      toast.error("Failed to delete therapy");
    },
  });
};
