"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTherapy } from "@/app/actions/therapies";

export const useCreateTherapy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTherapy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["therapies"] });
    },
  });
};
