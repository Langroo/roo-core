const messagesManagement = require('../../database/messages').management
const dialoguesMessages = {
  replies: {
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
