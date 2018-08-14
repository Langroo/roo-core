module.exports = {
  ContentManagement: require('./content/index').management,
  LoginManagement: require('./login/index').management,
  UsersManagement: require('./user/index').management,
  UsersMetadataManagement: require('./user-metadata/index').management,
  ScheduleManagement: require('./schedule/index').management,
  TutorRequestManagement: require('./tutor-request/index').management,
  PlanManagement: require('./plan/index').management,
  SubscriptionManagement: require('./subscription/index').management,
  PronunciationManagement: require('./pronunciation/index').management,
  AnalyticsManagement: require('./analytics/index').management,
  MetricsManagement: require('./metric/index').management,
  RemindersManagement: require('./reminder/index').management,
}
