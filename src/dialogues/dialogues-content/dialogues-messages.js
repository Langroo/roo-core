const dialoguesMessages = {
  replies: {
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
    thursdayBroadcastQuiz: [
      { type: 'text', content: 'A big hello from all the team at Langroo!! 👋' },
      {
        type: 'text',
        content: 'From today, we will be sending native English quizzes 📝 every Monday, Wednesday and Friday, along with prizes!! 🎁',
      },
      { type: 'text', content: 'Here\'s your first Quiz! 💥' },
      { type: 'text', content: 'This is something us people in the UK 🇬🇧 LOVE to eat, but what is it called?? 😱' },
      {
        type: 'image',
        content: 'https://keyassets-p2.timeincuk.net/wp/prod/wp-content/uploads/sites/53/2016/11/Sultana-Scones-CS.jpg',
      },
      {
        type: 'text',
        content: 'The quickest person ⌚️ to give the right answer will be announced as our winner in 30 minutes! 🙌',
      },
      { type: 'text', content: 'Write your answer below 👇👇:' },
    ],
    wednesdayBroadcastQuiz: [
      { type: 'text', content: 'This is the wednesday broadcast quiz!' },
    ],
    fridayBroadcastQuiz: [
      { type: 'text', content: 'This is the friday broadcast quiz!' },
    ],
  },

  get messages () {
    return this.replies
  },
}

module.exports = dialoguesMessages
