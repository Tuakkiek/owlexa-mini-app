export const PATHS = {
  LOGIN: "/login",
  HOME: "/",
  SCHEDULE: "/schedule",
  ATTENDANCE: "/attendance",
  ASSIGNMENTS: "/assignments",
  ASSIGNMENT_ATTEMPT: "/assignments/attempt/:attemptId",
  DOCUMENTS: "/documents",
  FEES: "/fees",
  PROFILE: "/profile",
} as const;

export type PathType = (typeof PATHS)[keyof typeof PATHS];
