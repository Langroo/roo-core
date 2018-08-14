const dialogsMessages = {
  replies: {
    theWinnerIs: [
      { type: 'text', content: 'TODAY\'S WINNER 🏆' },
      { type: 'text', content: 'Maria Ortega from Spain!!' },
      { type: 'text', content: 'Maria will now receive a free 15 minute class with one of our English tutors! 🙋' },
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
        type: 'image',
        content: 'https://lh3.googleusercontent.com/-WUKeG3vQENk/Wk3eR7Kd_QI/AAAAAAAAA0M/edH_FTis2tI2fNsMMLwktC09LxkvCz6fgCJoC/w530-h398-n/post20180102_0800.png',
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
