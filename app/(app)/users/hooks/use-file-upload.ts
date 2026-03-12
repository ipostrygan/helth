"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChangeEvent } from "react";

export function useUploadFile(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      
      if (!file) throw new Error("No file provided");

      const formData = new FormData();
      formData.append("file", file);

      return fetch(`/api/users/${id}/upload-image`, {
        method: "PUT",
        body: formData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile']})
    },
    onError: (err) => {
      if (err) throw new Error("Failed to upload file to S3");
    } 
  })
}