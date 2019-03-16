/**
 * Global dependencies
 */
const { ContentManagement } = require('../database/index');
const googlesheet = require('../APIs/google');
const { basicSender } = require('../dialogues/dialogues-builder');

/**
 * Content instances
 */
const sheets = {
  'english-beginner-us': new googlesheet('english-beginner-us'),
  'english-intermediate-us': new googlesheet('english-intermediate-us'),
  'english-advanced-us': new googlesheet('english-advanced-us'),
  'english-beginner-uk': new googlesheet('english-beginner-uk'),
  'english-intermediate-uk': new googlesheet('english-intermediate-uk'),
  'english-advanced-uk': new googlesheet('english-advanced-uk'),
  /* 'english-beginner-us-saturday': new googlesheet('english-beginner-us-saturday'),
  'english-intermediate-us-saturday': new googlesheet('english-intermediate-us-saturday'),
  'english-advanced-us-saturday': new googlesheet('english-advanced-us-saturday'),
  'english-beginner-us-sunday': new googlesheet('english-beginner-us-sunday'),
  'english-intermediate-us-sunday': new googlesheet('english-intermediate-us-sunday'),
  'english-advanced-us-sunday': new googlesheet('english-advanced-us-sunday'),
  'english-beginner-uk-saturday': new googlesheet('english-beginner-uk-saturday'),
  'english-intermediate-uk-saturday': new googlesheet('english-intermediate-uk-saturday'),
  'english-advanced-uk-saturday': new googlesheet('english-advanced-uk-saturday'),
  'english-beginner-uk-sunday': new googlesheet('english-beginner-uk-sunday'),
  'english-intermediate-uk-sunday': new googlesheet('english-intermediate-uk-sunday'),
  'english-advanced-uk-sunday': new googlesheet('english-advanced-uk-sunday'), */
};

class SheetsToMongo {
  // -- Cron Task
  static async execute() {
    // -- Retrieve data from google sheets
    console.log('-------------- CRM TO MONGO --------------');
    console.log('Updating content data...');

    // -- Query every sheet
    // -- Apply format
    // -- Save on DB
    try {
      const response = await Promise.all(Object.values(sheets).map(sheet => sheet.retrieve()));
      const formatted = [].concat.apply([], response.map((rows, index) => [].concat.apply([], rows.map((document, id) => [].concat(
        basicSender.prepareContent(document.content || ''),
        basicSender.prepareContent('', `${document.media1}||${document.media2}||${document.media3}||${document.media4}||${document.media5}` || ''),
        basicSender.prepareContent('', '', document.audio || ''),
        basicSender.prepareContent('', '', '', document.listen_link),
      )
        .map(message => ({
          message,
        }))
        .filter(content => (content.message.type !== undefined && content.message.content !== undefined)).map((content, _index_) => {
          let type = 'week';
          let language = Object.keys(sheets)[index];
          if (language.indexOf('saturday') >= 0) {
            type = 'saturday';
            language = language.substring(0, language.length - 9);
          } else if (language.indexOf('sunday') >= 0) {
            type = 'sunday';
            language = language.substring(0, language.length - 7);
          }
          return {
            language,
            lesson: document.lesson || 0,
            type,
            message_id: id + (_index_ * 0.01),
            message:
                            (content.message.type === undefined
                            && content.message.content === undefined) ? null : {
                                type: content.message.type,
                                content: content.message.content,
                              },
            pause: document.pause === 'Yes' || document.pause === 'yes',
          };
        })))));

      await ContentManagement.clear();
      await ContentManagement.createMultiple(formatted);
      if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') {
        console.log('Everything saved in database!');
      }
      if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') {
        console.log('-------------------------------------------\n');
      }
      return formatted;
    } catch (reason) {
      console.log('An error ocurred while retrieving and saving content data...');
      console.log('Details :: ', reason);
      console.log('-------------------------------------------\n');
      return false;
    }
  }
}

/**
 * All cron tasks
 */
module.exports = SheetsToMongo;
