"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTherapy } from "@/app/actions/therapies";
import { toast } from "sonner";

export const useCreateTherapy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTherapy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["therapies"] });
      toast.success("Therapy was successfully created");
    },
    onError: () => {
      toast.error("Failed to create therapy");
    },
  });
};
