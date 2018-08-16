module.exports = {
  ContentManagement: require('./content').management,
  LoginManagement: require('./login').management,
  UsersManagement: require('./user').management,
  UsersMetadataManagement: require('./user-metadata').management,
  ScheduleManagement: require('./schedule').management,
  TutorRequestManagement: require('./tutor-request').management,
  PlanManagement: require('./plan').management,
  SubscriptionManagement: require('./subscription').management,
  PronunciationManagement: require('./pronunciation').management,
  AnalyticsManagement: require('./analytics').management,
  MetricsManagement: require('./metric').management,
}
