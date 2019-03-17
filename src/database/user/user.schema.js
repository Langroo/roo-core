/**
 * Global dependencies
 */
const mongoose = require('mongoose');
const { Schema } = mongoose;
const IntegerValidator = require('mongoose-integer');
require('mongoose-type-email');

const UserSchema = new Schema({
  _id: {
    type: Schema.Types.String,
    required: [true, 'ID is required'],
    unique: true,
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
  is_admin: {
    type: Schema.Types.Boolean,
    default: false,
  },
}, { collection: 'user' });

/**
 * Enable plugins
 */
UserSchema.plugin(IntegerValidator);

module.exports = UserSchema;
