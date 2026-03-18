"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAppointment } from "@/app/actions/appointments";

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
};
