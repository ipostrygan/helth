"use server";

import prisma from "@/lib/prisma";
import { Appointment, AppointmentStatus, AppointmentType } from "@/lib/generated/prisma/client";
import type { PaginatedResult } from "@/types/table";
import type { AppointmentsQueryParams } from "@/app/(app)/appointments/types";

export type AppointmentsQuery = AppointmentsQueryParams;

export const getAppointments = async ({
  profileId,
  page = 1,
  pageSize = 10,
  sortField = "date",
  sortDirection = "desc",
  search = "",
  dateFrom,
  dateTo,
  statuses,
}: AppointmentsQuery = {}): Promise<PaginatedResult<Appointment>> => {
  const skip = (page - 1) * pageSize;
  const where = {
    ...(profileId ? { userId: profileId } : {}),
    ...(search ? {
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { doctorName: { contains: search, mode: "insensitive" as const } },
        { location: { contains: search, mode: "insensitive" as const } },
        { notes: { contains: search, mode: "insensitive" as const } },
      ],
    } : {}),
    ...(dateFrom || dateTo ? {
      date: {
        ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
        ...(dateTo ? { lte: new Date(dateTo) } : {}),
      },
    } : {}),
    ...(statuses && statuses.length > 0 ? { status: { in: statuses as AppointmentStatus[] } } : {}),
  };

  const [data, total] = await prisma.$transaction([
    prisma.appointment.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { [sortField]: sortDirection },
    }),
    prisma.appointment.count({ where }),
  ]);

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
};

export const deleteAppointment = async (id: string): Promise<void> => {
  await prisma.appointment.delete({ where: { id } });
};

export type CreateAppointmentInput = {
  userId: string;
  title: string;
  date: Date;
  type: AppointmentType;
  status: AppointmentStatus;
  description?: string;
  endDate?: Date;
  doctorName?: string;
  location?: string;
  notes?: string;
};

export const createAppointment = async (input: CreateAppointmentInput) => {
  try {
    await prisma.appointment.create({ data: { ...input, relatedDocuments: [] } });
  } catch (e) {
    console.error(e);
    throw new Error(e instanceof Error ? e.message : "Failed to create appointment");
  }
};

export type UpdateAppointmentInput = {
  id: string;
  title?: string;
  date?: Date;
  type?: AppointmentType;
  status?: AppointmentStatus;
  description?: string;
  endDate?: Date;
  doctorName?: string;
  location?: string;
  notes?: string;
};

export const updateAppointment = async ({ id, ...data }: UpdateAppointmentInput) => {
  try {
    await prisma.appointment.update({ where: { id }, data });
  } catch (e) {
    console.error(e);
    throw new Error(e instanceof Error ? e.message : "Failed to update appointment");
  }
};

export const getAppointmentById = async (id: string): Promise<Appointment | null> => {
  return prisma.appointment.findUnique({ where: { id } });
};
