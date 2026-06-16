export type Lang = 'zh' | 'en'

export interface Translations {
  // ── common ──
  loading: string
  saving: string
  saved: string
  save: string
  cancel: string
  confirm: string
  edit: string
  delete: string
  close: string
  submit: string
  submitting: string
  back: string
  backToHome: string
  backToActivity: string
  copyLink: string
  viewDetails: string
  optional: string
  noData: string
  error: string
  skip: string
  or: string
  processing: string

  // ── nav / layout ──
  siteName: string
  siteSubtitle: string
  adminPanel: string
  about: string
  myRegistrations: string
  editProfile: string
  notificationSettings: string
  signIn: string
  signInGate: string
  footerCopyright: string

  // ── quick actions ──
  quickPropose: string
  quickProposeMobile: string
  quickRecruit: string
  quickRecruitMobile: string
  quickInfo: string
  quickInfoMobile: string

  // ── home sections ──
  sectionRecruiting: string
  sectionProposals: string
  sectionProposalsSubtitle: string
  sectionInfo: string
  sectionPast: string
  noRecruiting: string
  noRecruitingFilter: string
  noProposals: string
  noProposalsFilter: string
  noInfo: string
  viewAllProposals: string
  allFilter: string

  // ── categories ──
  cat_board_game: string
  cat_sports: string
  cat_culture: string
  cat_dining: string
  cat_escape_room: string
  cat_other: string

  // ── activity card ──
  locationTbd: string
  launchedBy: string
  clickDetails: string
  alreadyRegistered: string
  registerButton: string
  registrationClosed: string
  full: string

  // ── activity badge ──
  badge_in_progress: string
  badge_registration_closed: string
  badge_full: string
  badge_proposal_expired: string

  // ── proposal card ──
  interested: string
  notInterested: string
  interestedCount: (n: number) => string
  proposalExpired: string
  linkedRecruits: string
  noLinkedRecruits: string

  // ── info card ──
  viewInfo: string
  deadline: string
  startTime: string

  // ── registration modal ──
  registerTitle: (title: string) => string
  registrationInfoLabel: string
  guestRegistrationHint: string
  participantCount: string
  noteLabel: string
  notePlaceholder: string
  registerAs: (name: string) => string
  accountLabel: string
  loginToManage: string
  orFillDirectly: string
  nameLabel: string
  namePlaceholder: string
  submitRegistration: string
  cancelRegistration: string

  // ── contact fields ──
  contactLabel: string
  contactWechat: string
  contactEmail: string
  contactOther: string
  contactOtherLabel: string
  contactOtherPlaceholder: string
  wechatPlaceholder: string
  emailPlaceholder: string
  otherPlaceholder: string

  // ── profile modal ──
  profileSetupTitle: string
  profileEditTitle: string
  profileSetupDesc: string
  profileEditDesc: string
  nicknameLabel: string
  nicknamePlaceholder: (fallback: string) => string
  nicknameHint: string
  wechatLabel: string
  wechatModalPlaceholder: string

  // ── sign-in gate ──
  signInGateDefault: string
  signInButton: string

  // ── event page ──
  eventNotFound: string
  eventDate: string
  eventLocation: string
  eventFee: string
  eventOrganizer: string
  eventNotes: string
  eventDescription: string
  eventItinerary: string
  showMore: string
  showLess: string
  addToCalendar: string
  shareQR: string
  copyRegLink: string
  registeredCount: (n: number, max: number | null) => string
  proposeToRecruit: string
  interestedInProposal: string

  // ── my registrations page ──
  myTitle: string
  myRegistrationsSection: string
  myPublishedSection: string
  noMyRegistrations: string
  noMyPublished: string
  viewModeList: string
  viewModeCalendar: string
  guestHint: string
  signInToSeeMore: string

  // ── my registration card ──
  activityCancelled: string
  cancelReason: (reason: string) => string
  contactOrganizer: (wechat: string) => string
  yourRegistration: (n: number) => string
  cancelRegistrationLink: string

  // ── cancel registration page ──
  cancelPageTitle: string
  cancelConfirmQuestion: string
  cancelSuccessTitle: string
  cancelSuccessDesc: string
  cancelSuccessSlotReleased: string
  cancelAlreadyTitle: string
  cancelInvalidLink: string
  cancelConfirmButton: string
  cancelActivity: string
  cancelDate: string
  cancelLocation: string
  cancelRegistrant: string
  cancelParticipantCount: string

  // ── notification drawer / bell / banner ──
  notifDrawerTitle: string
  notifMarkAllRead: string
  notifEmpty: string
  notifViewLink: string
  notifView: string
  notifNewCount: (n: number) => string

  // ── relative time ──
  timeJustNow: string
  timeMinutesAgo: (n: number) => string
  timeHoursAgo: (n: number) => string
  timeDaysAgo: (n: number) => string
  dateTbd: string

  // ── notification settings ──
  notifSettingsTitle: string
  notifEmail: string
  notifEmailPlaceholder: (email: string) => string
  notifEmailHint: (email: string) => string
  notifEmailSection: string
  notifInAppSection: string
  notifOnActivityChange: string
  notifOnProposalRecruit: string
  notifOnNewRecruit: string
  notifCalendarTitle: string
  notifCalendarDesc: string
  saveSettings: string

  // ── about dialog ──
  aboutTitle: string
  aboutSubtitle: string
  aboutIntro: string
  aboutSections: Array<{ title: string; items: string[] }>
  aboutPermissionsHint: string

  // ── propose page ──
  proposeTitle: string
  proposeSubtitle: string
  proposeSubmitAs: (name: string) => string
  proposeReceived: string
  proposeReceivedDesc: string
  proposeLink: string
  proposeQR: string

  // ── recruit form ──
  recruitTitle: string
  recruitSubtitle: string
  recruitCreated: string
  recruitLink: string
  copyGroupMessage: string

  // ── info form ──
  infoTitle: string
  infoSubtitle: string
  infoPublished: string
  infoLink: string

  // ── organizer fields ──
  organizerLabel: string
  organizerContactLabel: string
  organizerYourAccount: string

  // ── activity form fields ──
  fieldTitle: string
  fieldDescription: string
  fieldLocation: string
  fieldDate: string
  fieldDateEnd: string
  fieldFee: string
  fieldNotes: string
  fieldCategory: string
  fieldSourceUrl: string
  fieldMaxParticipants: string
  fieldMinParticipants: string

  // ── admin registration manager ──
  adminAddRegistration: string
  adminExportList: string
  adminRegistrationList: string
  adminLinkedUser: string
  adminSearchUser: string
  adminSearchPlaceholder: string
  adminSearchSearching: string
  adminSearchNoResult: string
  adminUserLinked: (name: string) => string
  adminUnlinkUser: string
  adminLinkHint: string
  adminNoRegistrations: string
  adminTotalSummary: (count: number, people: number) => string
  adminConfirmDeleteTitle: string
  adminConfirmDeleteBody: (name: string) => string

  // ── type / status labels ──
  typeInfo: string
  typeProposal: string
  typeRecruiting: string
  typeEnded: string
  typeCancelled: string
  statusDeadline: (date: string) => string
  registeredCountSimple: (n: number) => string
  interestedCountSimple: (n: number) => string
  cannotEdit: string
}
