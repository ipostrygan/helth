import { UserProfile } from "../users/types/profile.types"
import UserAvatar from "@/components/user-avatar"

const PersonalInformation = ({ profile }: { profile: UserProfile }) => {
  return (
    <>
      <div className="text-center">
        <div className="flex justify-center">
          <UserAvatar profile={profile} editable />
        </div>
        <h2 className="text-2xl font-bold">{profile.firstName} {profile.lastName}</h2>
        <p className="text-lg text-gray-400">{profile.familyRole}</p>
      </div>
      <div className="flex flex-col gap-4">
        <h3 className="font-semibold">Personal information</h3>
        <div className="flex justify-between">
          <label htmlFor="short-name" className="text-muted-foreground">Short name</label>
          <span id="short-name">{profile.shortName ?? 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <label htmlFor="birth-date" className="text-muted-foreground">Birth date</label>
          <span id="birth-date">{new Date(profile.birthDate).toLocaleDateString("en-US")}</span>
        </div>
        <div className="flex justify-between">
          <label htmlFor="height" className="text-muted-foreground">Height</label>
          <span id="height">{profile.height ? `${profile.height} cm` : 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <label htmlFor="weight" className="text-muted-foreground">Weight</label>
          <span id="weight">{profile.weight} kg</span>
        </div>
      </div>
    </>
  )
}

export default PersonalInformation
