const messagesManagement = require('../../database/messages').management
const dialoguesMessages = {
  replies: {
    theWinnerIs: [
      { type: 'text', content: 'Today\'s Results!! 📢' },
      { type: 'text', content: 'ANSWER 📕: "I Put On My Makeup"' },
      { type: 'text', content: 'WINNER 🏆:\nMirella Dagher from France 🇫🇷' },
      { type: 'text', content: 'Mirella will now get a FREE 20 minute English class! 🙋' },
      { type: 'text', content: 'The next quiz will be on Monday at 3pm - London Time!' },
      { type: 'text', content: 'Have a great weekend! 💪' },
      { type: 'text', content: 'https://www.youtube.com/watch?v=KtBbyglq37E' },
    ],
    wednesdayBroadcastQuiz: [
      { type: 'text', content: 'This is the wednesday broadcast quiz!' },
    ],
    fridayBroadcastQuiz: [
      { type: 'text', content: 'Welcome to today\'s quiz {{first_name}}! 💥' },
      { type: 'text', content: 'This week, Aretha Franklin, known as "The Queen of Soul" died 🎼😢' },
      {
        type: 'image',
        content: 'https://www.thenation.com/wp-content/uploads/2018/08/Aretha-Franklin-1973-ap-img.jpg',
      },
      { type: 'text', content: 'Her most famous song "A Litte Prayer", has the lyrics 🎶:' },
      { type: 'text', content: '"The moment I wake up, before I ... .. .. ......, I say a little prayer for you"' },
      { type: 'text', content: 'BUT, what words are missing? ❓' },
      {
        type: 'text',
        content: 'The quickest person ⌚️ to give the right answer will be announced as our winner 🏆 in 30 minutes! Write below 👇',
      },
    ],
  },

  get messages () {
    return this.replies
  },
}

module.exports = dialoguesMessages
