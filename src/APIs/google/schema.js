/**
 * GLOBAL ID's
 */
const sheetsStudentsId = process.env.SHEETS_STUDENTS_ID;
const sheetsContentId = process.env.SHEETS_CONTENT_ID;
const sheetsAnalyticsId = process.env.SHEETS_ANALYTICS_ID;
const sheetsMetricsId = process.env.SHEETS_METRICS_ID;
const sheetsMasterCRM = process.env.SHEETS_MASTER_CRM;

module.exports = {
  models: {
    analytics: {
      spreadsheetId: sheetsAnalyticsId,
      gid: '0',
      name: 'Daily Data',
      range: 'A2:P',
      collection: {
        date: 'Date',
        number_of_events: 'String',
        number_of_unique_users: 'String',
        avg_messages_per_user: 'String',
        surveys_completed: 'String',
      },
    },
    'profile-main': {
      spreadsheetId: sheetsMasterCRM,
      gid: '0',
      name: 'User CRM (Main)',
      range: 'A2:L',
      collection: {
        name: 'String',
        age_range: 'String',
        gender: 'String',
        language: 'String',
        location: 'String',
        source_type: 'String',
        source_name: 'String',
        motivation: 'String',
        interests: 'String',
        status: 'String',
        nps: 'String',
        date_message_us: 'DateFormat',
        tutor_requested: 'String',
      },
    },
    'profile-detailed': {
      spreadsheetId: sheetsMasterCRM,
      gid: '594167232',
      name: 'User CRM (Detailed)',
      range: 'A2:V',
      collection: {
        name: 'String',
        first_name: 'String',
        last_name: 'String',
        picture: 'Picture',
        age_range: 'String',
        gender: 'String',
        language: 'String',
        location: 'String',
        accent: 'String',
        level: 'String',
        source_type: 'String',
        source_name: 'String',
        motivation: 'String',
        interests: 'String',
        date_message_us: 'DateFormat',
        time_message_us: 'Time',
        birthday: 'DateFormat',
        profile_link: 'String',
        email: 'String',
        status: 'String',
        nps: 'String',
        tutor_requested: 'String',
      },
    },
    metadata: {
      spreadsheetId: sheetsStudentsId,
      gid: '1241628204',
      name: 'Metadata',
      range: 'A2:Q',
      collection: {
        user_name: 'String',
        user_picture: 'Picture',
        age: 'String',
        motivation_to_learn_english: 'String',
        current_job: 'String',
        subjects_studying: 'String',
        exam_studying: 'String',
        biggest_interests_personal: 'String',
        favorite_city: 'String',
        available_time_to_study: 'String',
        internet_speed: 'String',
        ad_referral: 'String',
        delay_time_between_messages: 'String',
        response_time: 'String',
        answers_to_content: 'String',
        source_type: 'String',
        source_name: 'String',
      },
    },
    survey: {
      spreadsheetId: sheetsMasterCRM,
      gid: '672814563',
      name: 'Survey',
      range: 'A2:L',
      collection: {
        user_name: 'String',
        user_picture: 'Picture',
        importance: 'String',
        problem: 'String',
        help: 'String',
        most_important1: 'String',
        currently_using: 'String',
        likes_dislikes: 'String',
        most_important2: 'String',
        friend_idea: 'String',
        correction_idea: 'String',
        join_community: 'String',
      },
    },
    metric: {
      spreadsheetId: sheetsMetricsId,
      gid: '0',
      name: 'Daily Data',
      range: 'A2:E',
      collection: {
        date: 'Date',
        numberOfEvents: 'String',
        numberOfNewUsers: 'String',
        avgOfMessagesPerUser: 'String',
        surveysCompleted: 'String',
      },
    },
    'tutor-requests': {
      spreadsheetId: sheetsMasterCRM,
      gid: '1711779857',
      name: 'Tutor Request',
      range: 'A2:N',
      collection: {
        user_name: 'String',
        user_picture: 'Picture',
        current_country: 'String',
        user_accent: 'String',
        user_level: 'String',
        self_description: 'String',
        interests: 'String',
        time_of_day_for_calls: 'String',
        time_of_day_for_calls2: 'String',
        time_of_week_for_calls: 'String',
        internet_speed_description: 'String',
        request_date: 'DateFormat',
        other_information: 'String',
      },
    },
    'english-beginner-us': {
      spreadsheetId: sheetsContentId,
      gid: '1544346744',
      name: 'WEEK Beginner (US)',
      range: 'A2:K',
      collection: {
        lesson: {
          type: 'Integer',
          propagate: true,
        },
        message: {
          type: 'Integer',
          propagate: false,
        },
        content: {
          type: 'String',
          propagate: false,
        },
        audio: {
          type: 'String',
          propagate: false,
        },
        pause: {
          type: 'String',
          propagate: false,
        },
        listen_link: {
          type: 'String',
          propagate: false,
        },
        media1: {
          type: 'String',
          propagate: false,
        },
        media2: {
          type: 'String',
          propagate: false,
        },
        media3: {
          type: 'String',
          propagate: false,
        },
        media4: {
          type: 'String',
          propagate: false,
        },
        media5: {
          type: 'String',
          propagate: false,
        },
      },
    },
    'english-intermediate-us': {
      spreadsheetId: sheetsContentId,
      gid: '1544346744',
      name: 'WEEK Intermediate (US)',
      range: 'A2:K',
      collection: {
        lesson: {
          type: 'Integer',
          propagate: true,
        },
        message: {
          type: 'Integer',
          propagate: false,
        },
        content: {
          type: 'String',
          propagate: false,
        },
        audio: {
          type: 'String',
          propagate: false,
        },
        pause: {
          type: 'String',
          propagate: false,
        },
        listen_link: {
          type: 'String',
          propagate: false,
        },
        media1: {
          type: 'String',
          propagate: false,
        },
        media2: {
          type: 'String',
          propagate: false,
        },
        media3: {
          type: 'String',
          propagate: false,
        },
        media4: {
          type: 'String',
          propagate: false,
        },
        media5: {
          type: 'String',
          propagate: false,
        },
      },
    },
    'english-advanced-us': {
      spreadsheetId: sheetsContentId,
      gid: '1544346744',
      name: 'WEEK Advanced (US)',
      range: 'A2:K',
      collection: {
        lesson: {
          type: 'Integer',
          propagate: true,
        },
        message: {
          type: 'Integer',
          propagate: false,
        },
        content: {
          type: 'String',
          propagate: false,
        },
        audio: {
          type: 'String',
          propagate: false,
        },
        pause: {
          type: 'String',
          propagate: false,
        },
        listen_link: {
          type: 'String',
          propagate: false,
        },
        media1: {
          type: 'String',
          propagate: false,
        },
        media2: {
          type: 'String',
          propagate: false,
        },
        media3: {
          type: 'String',
          propagate: false,
        },
        media4: {
          type: 'String',
          propagate: false,
        },
        media5: {
          type: 'String',
          propagate: false,
        },
      },
    },
    'english-beginner-uk': {
      spreadsheetId: sheetsContentId,
      gid: '1544346744',
      name: 'WEEK Beginner (UK)',
      range: 'A2:K',
      collection: {
        lesson: {
          type: 'Integer',
          propagate: true,
        },
        message: {
          type: 'Integer',
          propagate: false,
        },
        content: {
          type: 'String',
          propagate: false,
        },
        audio: {
          type: 'String',
          propagate: false,
        },
        pause: {
          type: 'String',
          propagate: false,
        },
        listen_link: {
          type: 'String',
          propagate: false,
        },
        media1: {
          type: 'String',
          propagate: false,
        },
        media2: {
          type: 'String',
          propagate: false,
        },
        media3: {
          type: 'String',
          propagate: false,
        },
        media4: {
          type: 'String',
          propagate: false,
        },
        media5: {
          type: 'String',
          propagate: false,
        },
      },
    },
    'english-intermediate-uk': {
      spreadsheetId: sheetsContentId,
      gid: '1544346744',
      name: 'WEEK Intermediate (UK)',
      range: 'A2:K',
      collection: {
        lesson: {
          type: 'Integer',
          propagate: true,
        },
        message: {
          type: 'Integer',
          propagate: false,
        },
        content: {
          type: 'String',
          propagate: false,
        },
        audio: {
          type: 'String',
          propagate: false,
        },
        pause: {
          type: 'String',
          propagate: false,
        },
        listen_link: {
          type: 'String',
          propagate: false,
        },
        media1: {
          type: 'String',
          propagate: false,
        },
        media2: {
          type: 'String',
          propagate: false,
        },
        media3: {
          type: 'String',
          propagate: false,
        },
        media4: {
          type: 'String',
          propagate: false,
        },
        media5: {
          type: 'String',
          propagate: false,
        },
      },
    },
    'english-advanced-uk': {
      spreadsheetId: sheetsContentId,
      gid: '1544346744',
      name: 'WEEK Advanced (UK)',
      range: 'A2:K',
      collection: {
        lesson: {
          type: 'Integer',
          propagate: true,
        },
        message: {
          type: 'Integer',
          propagate: false,
        },
        content: {
          type: 'String',
          propagate: false,
        },
        audio: {
          type: 'String',
          propagate: false,
        },
        pause: {
          type: 'String',
          propagate: false,
        },
        listen_link: {
          type: 'String',
          propagate: false,
        },
        media1: {
          type: 'String',
          propagate: false,
        },
        media2: {
          type: 'String',
          propagate: false,
        },
        media3: {
          type: 'String',
          propagate: false,
        },
        media4: {
          type: 'String',
          propagate: false,
        },
        media5: {
          type: 'String',
          propagate: false,
        },
      },
    },
    'english-beginner-us-saturday': {
      spreadsheetId: sheetsContentId,
      gid: '1544346744',
      name: 'Beginner (US) Saturday',
      range: 'A2:I',
      collection: {
        week: {
          type: 'Integer',
          propagate: true,
        },
        message: {
          type: 'Integer',
          propagate: false,
        },
        content: {
          type: 'String',
          propagate: false,
        },
        audio: {
          type: 'String',
          propagate: false,
        },
        media1: {
          type: 'String',
          propagate: false,
        },
        media2: {
          type: 'String',
          propagate: false,
        },
        media3: {
          type: 'String',
          propagate: false,
        },
        media4: {
          type: 'String',
          propagate: false,
        },
        media5: {
          type: 'String',
          propagate: false,
        },
      },
    },
    'english-intermediate-us-saturday': {
      spreadsheetId: sheetsContentId,
      gid: '1544346744',
      name: 'Intermediate (US) Saturday',
      range: 'A2:I',
      collection: {
        week: {
          type: 'Integer',
          propagate: true,
        },
        message: {
          type: 'Integer',
          propagate: false,
        },
        content: {
          type: 'String',
          propagate: false,
        },
        audio: {
          type: 'String',
          propagate: false,
        },
        media1: {
          type: 'String',
          propagate: false,
        },
        media2: {
          type: 'String',
          propagate: false,
        },
        media3: {
          type: 'String',
          propagate: false,
        },
        media4: {
          type: 'String',
          propagate: false,
        },
        media5: {
          type: 'String',
          propagate: false,
        },
      },
    },
    'english-advanced-us-saturday': {
      spreadsheetId: sheetsContentId,
      gid: '1544346744',
      name: 'Advanced (US) Saturday',
      range: 'A2:I',
      collection: {
        week: {
          type: 'Integer',
          propagate: true,
        },
        message: {
          type: 'Integer',
          propagate: false,
        },
        content: {
          type: 'String',
          propagate: false,
        },
        audio: {
          type: 'String',
          propagate: false,
        },
        media1: {
          type: 'String',
          propagate: false,
        },
        media2: {
          type: 'String',
          propagate: false,
        },
        media3: {
          type: 'String',
          propagate: false,
        },
        media4: {
          type: 'String',
          propagate: false,
        },
        media5: {
          type: 'String',
          propagate: false,
        },
      },
    },
    'english-beginner-us-sunday': {
      spreadsheetId: sheetsContentId,
      gid: '1544346744',
      name: 'Beginner (US) Sunday',
      range: 'A2:I',
      collection: {
        week: {
          type: 'Integer',
          propagate: true,
        },
        message: {
          type: 'Integer',
          propagate: false,
        },
        content: {
          type: 'String',
          propagate: false,
        },
        audio: {
          type: 'String',
          propagate: false,
        },
        media1: {
          type: 'String',
          propagate: false,
        },
        media2: {
          type: 'String',
          propagate: false,
        },
        media3: {
          type: 'String',
          propagate: false,
        },
        media4: {
          type: 'String',
          propagate: false,
        },
        media5: {
          type: 'String',
          propagate: false,
        },
      },
    },
    'english-intermediate-us-sunday': {
      spreadsheetId: sheetsContentId,
      gid: '1544346744',
      name: 'Intermediate (US) Sunday',
      range: 'A2:I',
      collection: {
        week: {
          type: 'Integer',
          propagate: true,
        },
        message: {
          type: 'Integer',
          propagate: false,
        },
        content: {
          type: 'String',
          propagate: false,
        },
        audio: {
          type: 'String',
          propagate: false,
        },
        media1: {
          type: 'String',
          propagate: false,
        },
        media2: {
          type: 'String',
          propagate: false,
        },
        media3: {
          type: 'String',
          propagate: false,
        },
        media4: {
          type: 'String',
          propagate: false,
        },
        media5: {
          type: 'String',
          propagate: false,
        },
      },
    },
    'english-advanced-us-sunday': {
      spreadsheetId: sheetsContentId,
      gid: '1544346744',
      name: 'Advanced (US) Sunday',
      range: 'A2:I',
      collection: {
        week: {
          type: 'Integer',
          propagate: true,
        },
        message: {
          type: 'Integer',
          propagate: false,
        },
        content: {
          type: 'String',
          propagate: false,
        },
        audio: {
          type: 'String',
          propagate: false,
        },
        media1: {
          type: 'String',
          propagate: false,
        },
        media2: {
          type: 'String',
          propagate: false,
        },
        media3: {
          type: 'String',
          propagate: false,
        },
        media4: {
          type: 'String',
          propagate: false,
        },
        media5: {
          type: 'String',
          propagate: false,
        },
      },
    },
    'english-beginner-uk-saturday': {
      spreadsheetId: sheetsContentId,
      gid: '1544346744',
      name: 'Beginner (UK) Saturday',
      range: 'A2:I',
      collection: {
        week: {
          type: 'Integer',
          propagate: true,
        },
        message: {
          type: 'Integer',
          propagate: false,
        },
        content: {
          type: 'String',
          propagate: false,
        },
        audio: {
          type: 'String',
          propagate: false,
        },
        media1: {
          type: 'String',
          propagate: false,
        },
        media2: {
          type: 'String',
          propagate: false,
        },
        media3: {
          type: 'String',
          propagate: false,
        },
        media4: {
          type: 'String',
          propagate: false,
        },
        media5: {
          type: 'String',
          propagate: false,
        },
      },
    },
    'english-intermediate-uk-saturday': {
      spreadsheetId: sheetsContentId,
      gid: '1544346744',
      name: 'Intermediate (UK) Saturday',
      range: 'A2:I',
      collection: {
        week: {
          type: 'Integer',
          propagate: true,
        },
        message: {
          type: 'Integer',
          propagate: false,
        },
        content: {
          type: 'String',
          propagate: false,
        },
        audio: {
          type: 'String',
          propagate: false,
        },
        media1: {
          type: 'String',
          propagate: false,
        },
        media2: {
          type: 'String',
          propagate: false,
        },
        media3: {
          type: 'String',
          propagate: false,
        },
        media4: {
          type: 'String',
          propagate: false,
        },
        media5: {
          type: 'String',
          propagate: false,
        },
      },
    },
    'english-advanced-uk-saturday': {
      spreadsheetId: sheetsContentId,
      gid: '1544346744',
      name: 'Advanced (UK) Saturday',
      range: 'A2:I',
      collection: {
        week: {
          type: 'Integer',
          propagate: true,
        },
        message: {
          type: 'Integer',
          propagate: false,
        },
        content: {
          type: 'String',
          propagate: false,
        },
        audio: {
          type: 'String',
          propagate: false,
        },
        media1: {
          type: 'String',
          propagate: false,
        },
        media2: {
          type: 'String',
          propagate: false,
        },
        media3: {
          type: 'String',
          propagate: false,
        },
        media4: {
          type: 'String',
          propagate: false,
        },
        media5: {
          type: 'String',
          propagate: false,
        },
      },
    },
    'english-beginner-uk-sunday': {
      spreadsheetId: sheetsContentId,
      gid: '1544346744',
      name: 'Beginner (UK) Sunday',
      range: 'A2:I',
      collection: {
        week: {
          type: 'Integer',
          propagate: true,
        },
        message: {
          type: 'Integer',
          propagate: false,
        },
        content: {
          type: 'String',
          propagate: false,
        },
        audio: {
          type: 'String',
          propagate: false,
        },
        media1: {
          type: 'String',
          propagate: false,
        },
        media2: {
          type: 'String',
          propagate: false,
        },
        media3: {
          type: 'String',
          propagate: false,
        },
        media4: {
          type: 'String',
          propagate: false,
        },
        media5: {
          type: 'String',
          propagate: false,
        },
      },
    },
    'english-intermediate-uk-sunday': {
      spreadsheetId: sheetsContentId,
      gid: '1544346744',
      name: 'Intermediate (UK) Sunday',
      range: 'A2:I',
      collection: {
        week: {
          type: 'Integer',
          propagate: true,
        },
        message: {
          type: 'Integer',
          propagate: false,
        },
        content: {
          type: 'String',
          propagate: false,
        },
        audio: {
          type: 'String',
          propagate: false,
        },
        media1: {
          type: 'String',
          propagate: false,
        },
        media2: {
          type: 'String',
          propagate: false,
        },
        media3: {
          type: 'String',
          propagate: false,
        },
        media4: {
          type: 'String',
          propagate: false,
        },
        media5: {
          type: 'String',
          propagate: false,
        },
      },
    },
    'english-advanced-uk-sunday': {
      spreadsheetId: sheetsContentId,
      gid: '1544346744',
      name: 'Advanced (UK) Sunday',
      range: 'A2:I',
      collection: {
        week: {
          type: 'Integer',
          propagate: true,
        },
        message: {
          type: 'Integer',
          propagate: false,
        },
        content: {
          type: 'String',
          propagate: false,
        },
        audio: {
          type: 'String',
          propagate: false,
        },
        media1: {
          type: 'String',
          propagate: false,
        },
        media2: {
          type: 'String',
          propagate: false,
        },
        media3: {
          type: 'String',
          propagate: false,
        },
        media4: {
          type: 'String',
          propagate: false,
        },
        media5: {
          type: 'String',
          propagate: false,
        },
      },
    },
  },
};
