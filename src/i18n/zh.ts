import type { Translations } from './types'

export const zh: Translations = {
  // ── common ──
  loading: '加载中...',
  saving: '保存中...',
  saved: '已保存 ✓',
  save: '保存',
  cancel: '取消',
  confirm: '确认',
  edit: '编辑',
  delete: '删除',
  close: '关闭',
  submit: '提交',
  submitting: '提交中...',
  back: '返回',
  backToHome: '回到首页',
  backToActivity: '返回活动页',
  copyLink: '复制链接',
  viewDetails: '查看详情 →',
  optional: '可选',
  noData: '暂无数据',
  error: '出错了',
  skip: '跳过',
  or: '或',
  processing: '处理中...',

  // ── nav / layout ──
  siteName: '🎉 快乐制造局',
  siteSubtitle: 'Next Fun Club',
  adminPanel: '管理后台',
  about: '关于',
  myRegistrations: '我的报名',
  editProfile: '编辑资料',
  notificationSettings: '通知设置',
  signIn: '登录 / 注册',
  signInGate: '请先登录',
  footerCopyright: '© 快乐制造局 · Paris Chinese Community',

  // ── quick actions ──
  quickPropose: '我有个提议',
  quickProposeMobile: '提议',
  quickRecruit: '发起招募',
  quickRecruitMobile: '招募',
  quickInfo: '发布资讯',
  quickInfoMobile: '发资讯',

  // ── home sections ──
  sectionRecruiting: '🟢 正在招募',
  sectionProposals: '💡 提议池',
  sectionProposalsSubtitle: '有兴趣就点 +1，积累到一定人数可发起招募',
  sectionInfo: '📢 近期资讯',
  sectionPast: '往期回顾',
  noRecruiting: '暂无招募中的活动',
  noRecruitingFilter: '该分类下暂无活动',
  noProposals: '还没有提议，来做第一个吧！',
  noProposalsFilter: '该分类下暂无提议',
  noInfo: '暂无资讯',
  viewAllProposals: '查看全部提议 →',
  allFilter: '全部',

  // ── categories ──
  cat_board_game: '桌游',
  cat_sports: '运动',
  cat_culture: '文化',
  cat_dining: '聚餐',
  cat_escape_room: '密室',
  cat_other: '其他',

  // ── activity card ──
  locationTbd: '地点待定',
  launchedBy: '发起',
  clickDetails: '点击查看详情 →',
  alreadyRegistered: '已报名',
  registerButton: '我要报名',
  registrationClosed: '报名已结束',
  full: '已满',

  // ── activity badge ──
  badge_in_progress: '正在进行',
  badge_registration_closed: '报名已结束',
  badge_full: '已满',
  badge_proposal_expired: '信息已过期',

  // ── proposal card ──
  interested: '感兴趣',
  notInterested: '取消兴趣',
  interestedCount: (n) => `${n} 人感兴趣`,
  proposalExpired: '已过期',
  linkedRecruits: '已开招募',
  noLinkedRecruits: '暂无招募',

  // ── info card ──
  viewInfo: '查看详情',
  deadline: '截止',
  startTime: '时间',

  // ── registration modal ──
  registerTitle: (title) => `报名「${title}」`,
  registrationInfoLabel: '报名信息',
  guestRegistrationHint: '本设备可凭取消链接管理报名',
  participantCount: '参与人数',
  noteLabel: '备注',
  notePlaceholder: '过敏/有车等',
  registerAs: (name) => `以 ${name} 的身份报名`,
  accountLabel: '账号',
  loginToManage: '登录后报名，方便跨设备管理记录',
  orFillDirectly: '或直接填写（无需登录）',
  nameLabel: '姓名/昵称 *',
  namePlaceholder: '你的昵称',
  submitRegistration: '提交报名',
  cancelRegistration: '取消报名',

  // ── contact fields ──
  contactLabel: '联系方式',
  contactWechat: '微信',
  contactEmail: '邮箱',
  contactOther: '其他',
  contactOtherLabel: '联系方式类型',
  contactOtherPlaceholder: '例如：Line、Telegram...',
  wechatPlaceholder: '你的微信号',
  emailPlaceholder: '邮箱地址',
  otherPlaceholder: '联系方式',

  // ── profile modal ──
  profileSetupTitle: '完善资料（可选）',
  profileEditTitle: '编辑资料',
  profileSetupDesc: '设置昵称和微信号，方便活动组织者联系你。可稍后在头像菜单修改。',
  profileEditDesc: '修改后将用于之后的报名与提议。',
  nicknameLabel: '昵称',
  nicknamePlaceholder: (fallback) => fallback || '你的昵称',
  nicknameHint: '留空则使用登录账号名',
  wechatLabel: '微信号（可选）',
  wechatModalPlaceholder: '方便组织者联系',

  // ── sign-in gate ──
  signInGateDefault: '请先登录后再继续',
  signInButton: '登录 / 注册',

  // ── event page ──
  eventNotFound: '活动不存在',
  eventDate: '时间',
  eventLocation: '地点',
  eventFee: '费用',
  eventOrganizer: '发起人',
  eventNotes: '备注',
  eventDescription: '活动介绍',
  eventItinerary: '行程',
  showMore: '展开更多',
  showLess: '收起',
  addToCalendar: '加入日历',
  shareQR: '分享',
  copyRegLink: '复制报名链接',
  registeredCount: (n, max) => max ? `${n}/${max} 人已报名` : `${n} 人已报名`,
  proposeToRecruit: '发起招募',
  interestedInProposal: '感兴趣',

  // ── my registrations page ──
  myTitle: '我的',
  myRegistrationsSection: '我的报名',
  myPublishedSection: '我发布的',
  noMyRegistrations: '暂无报名记录',
  noMyPublished: '暂无发布记录',
  viewModeList: '列表',
  viewModeCalendar: '日历',
  guestHint: '登录后可查看更多记录',
  signInToSeeMore: '登录 / 注册',

  // ── my registration card ──
  activityCancelled: '❌ 活动已取消',
  cancelReason: (reason) => `原因：${reason}`,
  contactOrganizer: (wechat) => `如有疑问联系：${wechat}`,
  yourRegistration: (n) => `你的报名：${n}人`,
  cancelRegistrationLink: '取消报名',

  // ── cancel registration page ──
  cancelPageTitle: '取消报名确认',
  cancelConfirmQuestion: '确认要取消这次报名吗？',
  cancelSuccessTitle: '已取消报名',
  cancelSuccessDesc: '你的报名已成功取消。',
  cancelSuccessSlotReleased: '名额已释放，其他人可以报名。',
  cancelAlreadyTitle: '该报名已取消',
  cancelInvalidLink: '链接无效或已过期',
  cancelConfirmButton: '确认取消',
  cancelActivity: '活动',
  cancelDate: '时间',
  cancelLocation: '地点',
  cancelRegistrant: '报名人',
  cancelParticipantCount: '参与人数',

  // ── notification settings ──
  notifSettingsTitle: '📬 通知设置',
  notifEmail: '通知邮箱',
  notifEmailPlaceholder: (email) => email || '留空则使用登录邮箱',
  notifEmailHint: (email) => `留空则使用登录邮箱（${email}）`,
  notifEmailSection: '邮件通知',
  notifInAppSection: '站内通知',
  notifOnActivityChange: '我报名的活动：取消或时间/地点变更时发邮件',
  notifOnProposalRecruit: '我感兴趣的提议转为招募时提醒',
  notifOnNewRecruit: '有新招募发布时提醒',
  notifCalendarTitle: '日历提醒',
  notifCalendarDesc: '报名活动或关注资讯时，可点击「加入日历」按钮，手动添加到你的日历，获得系统级提醒。',
  saveSettings: '保存设置',

  // ── about dialog ──
  aboutTitle: '关于快乐制造局',
  aboutSubtitle: 'Next Fun Club · 巴黎华人社群活动平台',
  aboutPermissionsHint: '使用说明与权限',
  aboutIntro: '快乐制造局是 Next Fun Club（巴黎华人社群）的轻量活动工具——收集提议、发起招募、在线报名，减少微信群接龙和表格来回传。',
  aboutSections: [
    {
      title: '无需登录',
      items: [
        '浏览首页：招募中活动、提议池、近期资讯',
        '查看活动详情页',
        '报名活动：填写昵称与联系方式，报名成功后可保存取消链接',
        '对提议点「感兴趣」（按本设备记录）',
        '发布资讯：填写昵称即可',
      ],
    },
    {
      title: '登录后',
      items: [
        '提交提议、发起招募',
        '在「我的报名」跨设备查看与管理报名',
        'Header 铃铛查看站内通知（活动变更、提议转招募等）',
        '完善资料：昵称、微信号（报名时可预填）',
        '通知设置：活动取消/变更的邮件提醒',
        '报名时可一键使用登录昵称，流程更快捷',
      ],
    },
    {
      title: '管理后台',
      items: [
        '点击 Header 右侧齿轮图标进入',
        '需登录并输入管理员密码（每次进入 /admin 需重新验证）',
        '看板管理活动、编辑/取消、Excel 导入与导出',
      ],
    },
    {
      title: '联系方式说明',
      items: [
        '个人资料 · 昵称：对外展示名，也是登录后报名的默认名称',
        '个人资料 · 微信号：方便发起人联系；报名时可自动带出',
        '个人资料 · 通知邮箱：接收活动取消或重要变更邮件（可在通知设置中修改）',
        '报名时填写的微信/邮箱/其他：提供给该活动发起人，便于确认名额与集合信息',
        '发起人联系方式 · 不公开：号码不展示，由发起人主动与你确认',
        '发起人联系方式 · 微信/邮箱/其他：报名成功后按页面提示联系发起人',
      ],
    },
  ],

  // ── propose page ──
  proposeTitle: '提议新活动',
  proposeSubtitle: '先提议，等感兴趣的人凑够了再正式招募',
  proposeSubmitAs: (name) => `以 ${name} 身份提议`,
  proposeReceived: '提议已提交！',
  proposeReceivedDesc: '感兴趣的人可以点 +1，积累到一定数量可发起招募。',
  proposeLink: '查看提议',
  proposeQR: '分享',

  // ── recruit form ──
  recruitTitle: '发起招募',
  recruitSubtitle: '填写活动信息，发布招募帖',
  recruitCreated: '招募已发布！',
  recruitLink: '查看招募',
  copyGroupMessage: '复制群消息',

  // ── info form ──
  infoTitle: '发布资讯',
  infoSubtitle: '发布活动资讯，转发社区信息',
  infoPublished: '资讯已发布！',
  infoLink: '查看资讯',

  // ── organizer fields ──
  organizerLabel: '发起人名称',
  organizerContactLabel: '联系方式（可选）',
  organizerYourAccount: '你的账号',

  // ── activity form fields ──
  fieldTitle: '活动名称',
  fieldDescription: '活动介绍',
  fieldLocation: '地点',
  fieldDate: '开始时间',
  fieldDateEnd: '结束时间',
  fieldFee: '费用',
  fieldNotes: '备注',
  fieldCategory: '分类',
  fieldSourceUrl: '参考链接',
  fieldMaxParticipants: '最多人数',
  fieldMinParticipants: '最少人数',

  // ── admin registration manager ──
  adminAddRegistration: '添加报名',
  adminExportList: '导出名单',
  adminRegistrationList: '报名名单',
  adminLinkedUser: '账户',
  adminSearchUser: '关联账号',
  adminSearchPlaceholder: '搜索昵称或微信号',
  adminSearchSearching: '搜索中...',
  adminSearchNoResult: '无匹配用户',
  adminUserLinked: (name) => `已关联：${name}`,
  adminUnlinkUser: '取消关联',
  adminLinkHint: '搜索后选择关联平台账号（可选）',
  adminNoRegistrations: '暂无报名',
  adminTotalSummary: (count, people) => `共 ${count} 条报名，${people} 人`,
  adminConfirmDeleteTitle: '确认删除报名',
  adminConfirmDeleteBody: (name) => `确认要删除「${name}」的报名记录吗？此操作不可撤销。`,

  // ── type / status labels ──
  typeInfo: '📢 资讯',
  typeProposal: '💡 提议',
  typeRecruiting: '🟢 招募',
  typeEnded: '✅ 已结束',
  typeCancelled: '❌ 已取消',
  statusDeadline: (date) => `截止 ${date}`,
  registeredCountSimple: (n) => `${n} 人已报名`,
  interestedCountSimple: (n) => `${n} 人感兴趣`,
  cannotEdit: '不可编辑',
}
