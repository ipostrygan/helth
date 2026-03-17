"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTherapy } from "@/app/actions/therapies";

export const useEditTherapy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTherapy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["therapies"] });
    },
  });
};
