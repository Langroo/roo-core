const dialogsMessages = {
  replies: {
    initBroadcastMessage: [
      { type: 'text', content: 'A big hello from all the team at Langroo!! 👋' },
      {
        type: 'text',
        content: 'Starting from today, we will be sending native English quizzes 📝 every Monday, Wednesday and Friday, with prizes for those who respond with the correct answer!! 🎁',
      },
      { type: 'text', content: 'Have fun and share with your friends! ❤️️' },
    ],
    theWinnerIs: [
      { type: 'text', content: 'Here our today\'s results:' },
      { type: 'text', content: 'ANSWER 📕:\n{{answer}}' },
      { type: 'text', content: 'TODAY\'S WINNER 🏆' },
      { type: 'text', content: '{{winner}} from {{country}}!!!' },
      {
        type: 'text',
        content: '{{winner}} will now receive a free 15 minute class with one of our English tutors! 🙋',
      },
      { type: 'text', content: 'See you on Wednesday!' },
    ],
    mondayBroadcastQuiz: [
      { type: 'text', content: 'Today\'s Langroo Quiz is HERE!' },
      {
        type: 'text',
        content: 'The quickest person ⌚ to respond with the right answer will be announced as our winner tonight! 🙌',
      },
      {
        type: 'image',
        content: 'https://lh3.googleusercontent.com/-BR7tdyrUBis/V1sT38ADt5I/AAAAAAAAAb4/meKv3PgGj1sMJaBBF3Z3In1S2KYrK-TFg/w506-h750/make-coffee-leadjpg-f77d0279038fa54a.jpg',
      },
      { type: 'text', content: 'Write your answer below {{first_name}} 👇:' },
    ],
    wednesdayBroadcastQuiz: [
      { type: 'text', content: 'Today\'s Langroo Quiz is HERE!' },
      {
        type: 'text',
        content: 'The quickest person ⌚️ to respond with the right answer will be announced as our winner tonight! 🙌',
      },
      {
        type: 'text',
        content: '{{first_name}} this is something us people in the UK 🇬🇧 LOVE to eat, but what is it called?? 😱',
      },
      {
        type: 'image',
        content: 'https://keyassets-p2.timeincuk.net/wp/prod/wp-content/uploads/sites/53/2016/11/Sultana-Scones-CS.jpg',
      },
      { type: 'text', content: 'Write your answer below {{first_name}} 👇:' },
    ],
    fridayBroadcastQuiz: [
      { type: 'text', content: 'This is the friday broadcast quiz!' },
    ],
  },

  get messages () {
    return this.replies
  },
}

module.exports = dialogsMessages
