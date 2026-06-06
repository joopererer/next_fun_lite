type ClerkUserLike = {
  fullName?: string | null
  firstName?: string | null
  primaryEmailAddress?: { emailAddress?: string | null } | null
}

export function getClerkDisplayName(user?: ClerkUserLike | null): string {
  if (!user) return ''
  return (
    user.fullName?.trim() ||
    user.firstName?.trim() ||
    user.primaryEmailAddress?.emailAddress ||
    '用户'
  )
}
