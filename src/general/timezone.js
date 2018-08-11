/**
 * General functions to handle problems related with timezones
 */
const moment = require('moment')
const days = { monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 7 }

/**
 * Global dependencies
 */

class Timezone {

  static config () {
        /**
         * Update a given date to the next day
         */
    Date.prototype.nextDay = function () {
      this.setDate(this.getDate() + 1)
      return this
    }

    Date.prototype.prevDay = function () {
      this.setDate(this.getDate() - 1)
      return this
    }

        /**
         * Add some minutes to a certain date
         */
    Date.prototype.addMinutes = function (minutes = 0) {
      return new Date(this.getTime() + minutes * 60 * 1000)
    }

        /**
         * Turns a String Hour Format ("12:25") to an actual Date
         */
    String.prototype.hourFormatToDate = function () {
      const format = this.split(':').map((part) => parseInt(part))
      const hours = format[0]
      const minutes = format[1]
      const date = new Date()
      date.setHours(hours)
      date.setMinutes(minutes)
      date.setSeconds(0)
      date.setMilliseconds(0)
      return date
    }

		/**
		 * Parse a date to user locale timezone
		 */
    Date.prototype.toUserTimezone = function (timezoneOffset) {
      const utcOffset = this.getTimezoneOffset()
      this.setMinutes(this.getMinutes() + utcOffset)
      timezoneOffset *= 60 * (1)
      this.setMinutes(this.getMinutes() + timezoneOffset)
      return this
    }

        /**
         * Update given date and timezone to local server timezone
         * @param timezone => is given in hours b
         */
    Date.prototype.toLocaleTimezone = function (timezoneOffset) {
      const utcOffset = this.getTimezoneOffset()
      this.setMinutes(this.getMinutes() + utcOffset)
      timezoneOffset *= 60 * (-1)
      this.setMinutes(this.getMinutes() + timezoneOffset)
      const serverDate = new Date()
      if (this < serverDate) {
        return this.nextDay()
      }
      return this
    }

    Date.prototype.toLocaleTimezoneNoShift = function (timezoneOffset) {
      const utcOffset = this.getTimezoneOffset()
      this.setMinutes(this.getMinutes() + utcOffset)
      timezoneOffset *= 60 * (-1)
      this.setMinutes(this.getMinutes() + timezoneOffset)
      return this
    }

		/**
		 * Next day of a day specified
		 */
    Date.prototype.nextOf = function (dayOfWeek, daysAfter) {
      // 24 hours multiplied by 3600000 miliseconds that comprise one hour
      const dayInMilliseconds = 86400000
      const basePeriod = daysAfter * dayInMilliseconds
      let weekDayNumber = this.getDay()
      if (weekDayNumber === 0) { weekDayNumber = 7 }
      const diff = (Math.abs(weekDayNumber - dayOfWeek)) * dayInMilliseconds
      const finalDate = this.getTime() + basePeriod - diff
      this.setTime(finalDate)
      return this
    }

    Date.prototype.nextOf = function (dayOfWeek, overflow = 0) {
      let momentDate
      if (moment(this).isoWeekday() <= days[dayOfWeek]) {
        momentDate = moment(this).isoWeekday(days[dayOfWeek])
      } else {
        momentDate = moment(this).add(1, 'weeks').isoWeekday(days[dayOfWeek])
      }

      if (momentDate) {
        if (momentDate.toDate().getTime() === this.getTime() && process.env.NODE_ENV === 'production' ) {
          momentDate.add(1, 'weeks')
        }
      }

      return momentDate.add(overflow, 'weeks').toDate()
    }

  }
}

module.exports = Timezone
