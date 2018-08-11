/**
 * Global dependencies
 */
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const IntegerValidator = require('mongoose-integer')
require('mongoose-type-email')

/**
 * User Schema
 * @param _id => FB User identifier
 * @param name => Complete name
 * @param profile_link => Link to the profile
 * @param age => Age
 * @param birthday => Birthday
 * @param email => Email
 * @param gender => Gender
 * @param language => Language
 * @param location => User's location
 * @param devices => Devices
 * @param education => Education (Schools and Colleges)
 * @param artists => Favorite Artists
 * @param games => Favorite Games
 * @param payment => Payment related information
 * @param content => Content Schedule
 */
const UserSchema = new Schema({
  _id: {
    type: Schema.Types.String,
    required: [true, 'ID is required'],
    unique: true,
  },
  conversationId: {
    type: Schema.Types.String,
    default: null,
  },
  senderId: {
    type: Schema.Types.String,
    default: null,
  },
  customerId: {
    // -- For payment purposes
    type: Schema.Types.String,
    required: false,
    default: null,
  },
  name: {
    type: {
      full_name: {
        type: Schema.Types.String,
        required: [true, 'Full Name is required'],
      },
      first_name: {
        type: Schema.Types.String,
        required: [true, 'First Name is required'],
      },
      last_name: {
        type: Schema.Types.String,
        required: [true, 'Last Name is required'],
      },
      short_name: {
        type: Schema.Types.String,
        required: [true, 'Short Name is required'],
      },
    },
    required: [true, 'Name is required'],
  },
  picture: {
    type: Schema.Types.String,
    required: false,
  },
  profile_link: {
    type: Schema.Types.String,
    required: false,
  },
  age: {
    type: Schema.Types.Number,
    required: false,
  },
  birthday: {
    type: Schema.Types.Date,
    required: false,
  },
  email: {
    type: Schema.Types.Email,
    required: false,
  },
  gender: {
    type: Schema.Types.String,
    enum: ['male', 'female'],
  },
  language: {
    type: Schema.Types.String,
    required: [true, 'Language is required'],
  },
  location: {
    type: {
      id: {
        type: Schema.Types.String,
        default: null,
      },
      name: {
        type: Schema.Types.String,
        default: null,
      },
      locale: {
        type: Schema.Types.String,
        default: null,
      },
      timezone: {
        type: Schema.Types.Number,
        required: [true, 'Location Timezone is required'],
      },
    },
    required: [false, 'Location is required'],
  },
  devices: {
    type: [{
      os: {
        type: Schema.Types.String,
        default: null,
      },
      hardware: {
        type: Schema.Types.String,
        default: null,
      },
    }],
    required: false,
  },
  education: {
    type: [{
      id: {
        type: Schema.Types.String,
        required: [true, 'Education ID is required'],
      },
      type: {
        type: Schema.Types.String,
        required: [true, 'Education type is required'],
      },
      school: {
        type: {
          id: {
            type: Schema.Types.String,
            required: [true, 'School ID is required'],
          },
          name: {
            type: Schema.Types.String,
            required: [true, 'School Name is required'],
          },
          link: {
            type: Schema.Types.String,
            required: [true, 'School page link is required'],
          },
          picture: {
            type: Schema.Types.String,
            required: [true, 'School picture is required'],
          },
        },
        required: [true, 'Education School is required'],
      },
    }],
    required: false,
  },
  payment: {
    type: {
      status: {
        type: Schema.Types.String,
        enum: ['paid_out', 'in_debt'],
        required: [true, 'Payment status is required'],
        default: 'in_debt',
      },
    },
    required: [true, 'Payment is required'],
  },
  content: {
    type: {
      current: {
        type: {
          lesson: {
            type: Schema.Types.Number,
            integer: true,
            required: [true, 'Day number is required'],
            default: 0,
          },
          message: {
            type: Schema.Types.Number,
            required: [true, 'Message number is required'],
            default: 0,
          },
          until_lesson: {
            type: Schema.Types.Number,
            integer: true,
            required: [true, 'Until lesson number is required'],
            default: 0,
          },
        },
        required: [true, 'Content current is required'],
      },
      plan: {
        type: {
          language: {
            type: Schema.Types.String,
            required: [true, 'Language is required'],
            enum: ['english'],
            default: 'english',
          },
          accent: {
            type: Schema.Types.String,
            required: [true, 'Accent is required'],
            enum: ['us', 'uk'],
            default: 'us',
          },
          level: {
            type: Schema.Types.String,
            required: [true, 'Level is required'],
            enum: ['beginner', 'intermediate', 'advanced'],
            default: 'beginner',
          },
        },
      },
    },
  },
  subscription: {
    type: {
      product: {
        type: Schema.Types.String,
        required: [true, 'Product is required'],
      },
      status: {
        type: Schema.Types.String,
        required: [true, 'Subscription status is required'],
      },
      weeks_paid: {
        type: Schema.Types.Number,
        required: [true, 'Subscription weeks paid is required'],
      },
    },
    default: {
      product: 'FREE CONTENT',
      status: 'UNREGISTERED',
      weeks_paid: 2,
    },
  },
  updated_product_on: {
    type: Schema.Types.Date,
    required: false,
    default: null,
  },
  FirstSubscriptionDate: {
    type: Schema.Types.Date,
    default: new Date(),
  },
  lastInteraction: {
    type: Schema.Types.Date,
    default: new Date(),
  },
  respondNps: {
    type: Schema.Types.Boolean,
    default: false
  }
}, { collection: 'user' })

/**
 * Enable plugins
 */
UserSchema.plugin(IntegerValidator)

module.exports = UserSchema
