import type { Translations } from './types'

export const en: Translations = {
  // ── common ──
  loading: 'Loading...',
  saving: 'Saving...',
  saved: 'Saved ✓',
  save: 'Save',
  cancel: 'Cancel',
  confirm: 'Confirm',
  edit: 'Edit',
  delete: 'Delete',
  close: 'Close',
  submit: 'Submit',
  submitting: 'Submitting...',
  back: 'Back',
  backToHome: 'Back to Home',
  backToActivity: 'Back to Activity',
  copyLink: 'Copy Link',
  viewDetails: 'View Details →',
  optional: 'optional',
  noData: 'No data',
  error: 'Something went wrong',
  skip: 'Skip',
  or: 'or',
  processing: 'Processing...',

  // ── nav / layout ──
  siteName: 'HappyMakerClub',
  siteSubtitle: 'Next Fun Club',
  adminPanel: 'Admin',
  about: 'About',
  myRegistrations: 'My Activities',
  editProfile: 'Edit Profile',
  notificationSettings: 'Notifications',
  signIn: 'Sign In / Register',
  signInGate: 'Please sign in',
  footerCopyright: '© Next Fun Club · Paris Chinese Community',

  // ── quick actions ──
  quickPropose: 'Propose an idea',
  quickProposeMobile: 'Propose',
  quickRecruit: 'Start recruiting',
  quickRecruitMobile: 'Recruit',
  quickInfo: 'Post info',
  quickInfoMobile: 'Info',

  // ── home sections ──
  sectionRecruiting: '🟢 Recruiting',
  sectionProposals: '💡 Ideas Pool',
  sectionProposalsSubtitle: 'Show interest to help ideas reach enough people to launch',
  sectionInfo: '📢 Community Updates',
  sectionPast: 'Past Events',
  noRecruiting: 'No ongoing activities',
  noRecruitingFilter: 'No activities in this category',
  noProposals: 'No ideas yet — be the first!',
  noProposalsFilter: 'No ideas in this category',
  noInfo: 'No updates yet',
  viewAllProposals: 'View all ideas →',
  allFilter: 'All',

  // ── categories ──
  cat_board_game: 'Board Game',
  cat_sports: 'Sports',
  cat_culture: 'Culture',
  cat_dining: 'Dining',
  cat_escape_room: 'Escape Room',
  cat_other: 'Other',

  // ── activity card ──
  locationTbd: 'Location TBD',
  launchedBy: 'by',
  clickDetails: 'View details →',
  alreadyRegistered: 'Registered',
  registerButton: 'Sign Up',
  registrationClosed: 'Registration Closed',
  full: 'Full',

  // ── activity badge ──
  badge_in_progress: 'In Progress',
  badge_registration_closed: 'Closed',
  badge_full: 'Full',
  badge_proposal_expired: 'Expired',

  // ── proposal card ──
  interested: "I'm interested",
  notInterested: 'Remove interest',
  interestedCount: (n) => `${n} interested`,
  proposalExpired: 'Expired',
  linkedRecruits: 'Recruiting',
  noLinkedRecruits: 'No recruits yet',

  // ── info card ──
  viewInfo: 'View details',
  deadline: 'Deadline',
  startTime: 'Date',

  // ── registration modal ──
  registerTitle: (title) => `Sign Up for "${title}"`,
  registrationInfoLabel: 'Registration Info',
  guestRegistrationHint: 'Manage your registration on this device via cancel link',
  participantCount: 'Number of participants',
  noteLabel: 'Notes',
  notePlaceholder: 'Allergies, have a car, etc.',
  registerAs: (name) => `Registering as ${name}`,
  accountLabel: 'Account',
  loginToManage: 'Sign in to manage registrations across devices',
  orFillDirectly: 'Or fill in directly (no sign-in needed)',
  nameLabel: 'Name / Nickname *',
  namePlaceholder: 'Your nickname',
  submitRegistration: 'Submit Registration',
  cancelRegistration: 'Cancel Registration',

  // ── contact fields ──
  contactLabel: 'Contact',
  contactWechat: 'WeChat',
  contactEmail: 'Email',
  contactOther: 'Other',
  contactOtherLabel: 'Contact type',
  contactOtherPlaceholder: 'e.g. Line, Telegram...',
  wechatPlaceholder: 'Your WeChat ID',
  emailPlaceholder: 'Email address',
  otherPlaceholder: 'Contact info',

  // ── profile modal ──
  profileSetupTitle: 'Complete Your Profile (Optional)',
  profileEditTitle: 'Edit Profile',
  profileSetupDesc: 'Set a nickname and WeChat ID so organizers can contact you. You can update this later from the avatar menu.',
  profileEditDesc: 'Changes will be used for future registrations and proposals.',
  nicknameLabel: 'Nickname',
  nicknamePlaceholder: (fallback) => fallback || 'Your nickname',
  nicknameHint: 'Leave empty to use your login account name',
  wechatLabel: 'WeChat ID (optional)',
  wechatModalPlaceholder: 'So organizers can reach you',

  // ── sign-in gate ──
  signInGateDefault: 'Please sign in to continue',
  signInButton: 'Sign In / Register',

  // ── event page ──
  eventNotFound: 'Activity not found',
  eventDate: 'Date',
  eventLocation: 'Location',
  eventFee: 'Fee',
  eventOrganizer: 'Organizer',
  eventNotes: 'Notes',
  eventDescription: 'About',
  eventItinerary: 'Itinerary',
  showMore: 'Show more',
  showLess: 'Show less',
  addToCalendar: 'Add to Calendar',
  shareQR: 'Share',
  copyRegLink: 'Copy sign-up link',
  registeredCount: (n, max) => max ? `${n}/${max} registered` : `${n} registered`,
  proposeToRecruit: 'Start Recruiting',
  interestedInProposal: "I'm Interested",

  // ── my registrations page ──
  myTitle: 'My',
  myRegistrationsSection: 'My Registrations',
  myPublishedSection: 'My Posts',
  noMyRegistrations: 'No registrations yet',
  noMyPublished: 'No posts yet',
  viewModeList: 'List',
  viewModeCalendar: 'Calendar',
  guestHint: 'Sign in to see more records',
  signInToSeeMore: 'Sign In / Register',

  // ── my registration card ──
  activityCancelled: '❌ Activity Cancelled',
  cancelReason: (reason) => `Reason: ${reason}`,
  contactOrganizer: (wechat) => `Contact organizer: ${wechat}`,
  yourRegistration: (n) => `Your registration: ${n} person${n === 1 ? '' : 's'}`,
  cancelRegistrationLink: 'Cancel registration',

  // ── cancel registration page ──
  cancelPageTitle: 'Confirm Cancellation',
  cancelConfirmQuestion: 'Are you sure you want to cancel this registration?',
  cancelSuccessTitle: 'Registration Cancelled',
  cancelSuccessDesc: 'Your registration has been successfully cancelled.',
  cancelSuccessSlotReleased: 'The spot has been released for others.',
  cancelAlreadyTitle: 'Already Cancelled',
  cancelInvalidLink: 'Invalid or expired link',
  cancelConfirmButton: 'Confirm Cancellation',
  cancelActivity: 'Activity',
  cancelDate: 'Date',
  cancelLocation: 'Location',
  cancelRegistrant: 'Registrant',
  cancelParticipantCount: 'Participants',

  // ── notification settings ──
  notifSettingsTitle: '📬 Notification Settings',
  notifEmail: 'Notification Email',
  notifEmailPlaceholder: (email) => email || 'Leave empty to use login email',
  notifEmailHint: (email) => `Leave empty to use your login email (${email})`,
  notifEmailSection: 'Email Notifications',
  notifInAppSection: 'In-App Notifications',
  notifOnActivityChange: 'Notify me when an activity I registered for is cancelled or rescheduled',
  notifOnProposalRecruit: 'Notify me when a proposal I liked starts recruiting',
  notifOnNewRecruit: 'Notify me when a new activity is posted',
  notifCalendarTitle: 'Calendar Reminders',
  notifCalendarDesc: 'When you register or follow an activity, click "Add to Calendar" to add it to your device calendar for system-level reminders.',
  saveSettings: 'Save Settings',

  // ── about dialog ──
  aboutTitle: 'About Next Fun Club',
  aboutSubtitle: 'Next Fun Club · Paris Chinese Community Platform',
  aboutPermissionsHint: 'How it works & permissions',
  aboutIntro: 'Next Fun Club is a lightweight activity tool for the Paris Chinese community — collect ideas, start recruiting, register online, and reduce WeChat group roll calls and spreadsheets.',
  aboutSections: [
    {
      title: 'No sign-in needed',
      items: [
        'Browse the home page: recruiting activities, ideas pool, community updates',
        'View activity detail pages',
        'Register for activities: fill in your name and contact, save your cancel link',
        'Show interest in proposals (tracked per device)',
        'Post updates: just fill in your nickname',
      ],
    },
    {
      title: 'After signing in',
      items: [
        'Submit proposals and start recruiting',
        'View and manage registrations across devices in "My Activities"',
        'Check in-app notifications via the bell icon (activity changes, proposals turning into recruits, etc.)',
        'Complete your profile: nickname and WeChat ID (auto-filled when registering)',
        'Notification settings: email alerts for cancellations and changes',
        'One-tap registration using your profile name for a faster flow',
      ],
    },
    {
      title: 'Admin panel',
      items: [
        'Click the gear icon in the top-right header to enter',
        'Requires sign-in and admin password (re-authenticated each visit to /admin)',
        'Manage activities on a kanban board, edit/cancel, Excel import and export',
      ],
    },
    {
      title: 'Contact info explained',
      items: [
        'Profile · Nickname: your display name, default for signed-in registrations',
        'Profile · WeChat ID: lets organizers reach you; auto-filled when registering',
        'Profile · Notification email: receives cancellation or change emails (configurable in settings)',
        'Registration WeChat/email/other: shared with the organizer for confirmation and meet-up info',
        'Organizer contact · Private: number not shown; organizer will reach out to you',
        'Organizer contact · WeChat/email/other: follow page instructions after registering',
      ],
    },
  ],

  // ── propose page ──
  proposeTitle: 'Propose an Activity',
  proposeSubtitle: 'Submit an idea — when enough people are interested, someone can start recruiting',
  proposeSubmitAs: (name) => `Proposing as ${name}`,
  proposeReceived: 'Idea submitted!',
  proposeReceivedDesc: 'Others can show interest. Once enough people are interested, you can start recruiting.',
  proposeLink: 'View proposal',
  proposeQR: 'Share',

  // ── recruit form ──
  recruitTitle: 'Start Recruiting',
  recruitSubtitle: 'Fill in the activity details and publish your recruitment post',
  recruitCreated: 'Recruitment posted!',
  recruitLink: 'View activity',
  copyGroupMessage: 'Copy group message',

  // ── info form ──
  infoTitle: 'Post an Update',
  infoSubtitle: 'Share activity news or community information',
  infoPublished: 'Update published!',
  infoLink: 'View post',

  // ── organizer fields ──
  organizerLabel: 'Organizer name',
  organizerContactLabel: 'Contact (optional)',
  organizerYourAccount: 'Your account',

  // ── activity form fields ──
  fieldTitle: 'Activity name',
  fieldDescription: 'Description',
  fieldLocation: 'Location',
  fieldDate: 'Start time',
  fieldDateEnd: 'End time',
  fieldFee: 'Fee',
  fieldNotes: 'Notes',
  fieldCategory: 'Category',
  fieldSourceUrl: 'Source / Reference link',
  fieldMaxParticipants: 'Max participants',
  fieldMinParticipants: 'Min participants',

  // ── admin registration manager ──
  adminAddRegistration: 'Add Registration',
  adminExportList: 'Export',
  adminRegistrationList: 'Registrations',
  adminLinkedUser: 'Account',
  adminSearchUser: 'Link Account',
  adminSearchPlaceholder: 'Search nickname or WeChat',
  adminSearchSearching: 'Searching...',
  adminSearchNoResult: 'No matching users',
  adminUserLinked: (name) => `Linked: ${name}`,
  adminUnlinkUser: 'Unlink',
  adminLinkHint: 'Optionally link to a platform account',
  adminNoRegistrations: 'No registrations yet',
  adminTotalSummary: (count, people) => `${count} registration${count === 1 ? '' : 's'}, ${people} person${people === 1 ? '' : 's'}`,
  adminConfirmDeleteTitle: 'Delete Registration',
  adminConfirmDeleteBody: (name) => `Are you sure you want to delete ${name}'s registration? This cannot be undone.`,

  // ── type / status labels ──
  typeInfo: '📢 Update',
  typeProposal: '💡 Proposal',
  typeRecruiting: '🟢 Recruiting',
  typeEnded: '✅ Ended',
  typeCancelled: '❌ Cancelled',
  statusDeadline: (date) => `Deadline: ${date}`,
  registeredCountSimple: (n) => `${n} registered`,
  interestedCountSimple: (n) => `${n} interested`,
  cannotEdit: 'Cannot edit',
}
