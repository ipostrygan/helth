"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAppointment } from "@/app/actions/appointments";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "sonner";

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
      toast.success("Appointment was successfully created");
    },
    onError: () => {
      toast.error("Failed to create appointment");
    },
  });
};
