"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTherapy } from "@/lib/api/therapies";

export const useDeleteTherapy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTherapy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["therapies"] });
    },
  });
};
