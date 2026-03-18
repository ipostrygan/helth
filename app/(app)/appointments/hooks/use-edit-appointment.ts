"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAppointment } from "@/app/actions/appointments";

export const useEditAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
};
