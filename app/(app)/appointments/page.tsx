"use client"

import { useActiveProfile } from "@/context/profile-context"
import Appointments from "./appointments"

export default function Page() {
  const { activeProfileId } = useActiveProfile()
  return <Appointments id={activeProfileId} />
}
