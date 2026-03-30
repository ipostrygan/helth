"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAppointment } from "@/app/actions/appointments";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "sonner";

export const useEditAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
      toast.success("Appointment was successfully updated");
    },
    onError: () => {
      toast.error("Failed to update appointment");
    },
  });
};
