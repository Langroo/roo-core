const dialoguesMessages = {
  replies: {
    theWinnerIs: [
      { type: 'text', content: 'Today\'s Results are Just In!! 📢' },
      { type: 'text', content: 'ANSWER 📕: A scone!' },
      { type: 'text', content: 'WINNER 🏆:\nLorena González from Madrid 🇪' },
      { type: 'text', content: 'Lorena will now get a FREE 20 minute English class! 🙋' },
      { type: 'text', content: 'Join us tomorrow at 3pm (London Time) to have the chance to win! 😄' },
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
