import { getProfile } from "@/lib/profile";

const profile = await getProfile();

export const SITE_TITLE = profile.name;
export const SITE_DESCRIPTION = `${profile.intro} ${profile.description}`;
