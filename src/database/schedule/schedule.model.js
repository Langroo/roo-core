const mongoose = require('mongoose');
const ScheduleSchema = require('./schedule.schema');
const ScheduleModel = mongoose.model('ScheduleModel', ScheduleSchema);
module.exports = ScheduleModel;
