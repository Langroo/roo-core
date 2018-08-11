/**
 * Dependencies
 */
const Events = require('./events.model');

class EventsManagement {

    /**
     * Create events model
     * @param {*} eventsModel 
     * @param {*} params 
     */
    async create (eventsModel, params = { updateIfExist: false }) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!params.updateIfExist) {
                    // -- Save events
                    resolve(await (new Events(eventsModel)).save()) 
                } else {
                    // -- FindOne and Update
                    let eventsId = eventsModel._id;
                    delete eventsModel._id;
                    const events = await Events.findOneAndUpdate({ _id: eventsId }, { $set: eventsModel }, { new: true });
                    resolve(events === null || events === undefined ? await (new Events(eventsModel)).save() : events)
                }
            } catch (reason) {
                console.log('[EventsManagement (Update)] An error ocurred while creating events [%s]', reason.message);
                reject(reason)
            }
        })
    }

    /**
     * Retrieve Events
     */
    async retrieve (options = {
        query: {},
        findOne: false,
    }) {
        return new Promise((resolve, reject) => {
            if (!options.findOne) {
                Events.find(options.query, (error, eventsFound) => {
                    if (error) { reject(error)
                    } else { resolve(eventsFound) }
                }).lean()
            } else {
                Events.findOne(options.query, (error, eventsFound) => {
                    if (error) { reject(error)
                    } else { resolve(eventsFound) }
                }).lean()
            }
        })
    }


    /**
     * Update Events
     */
    async update (_id, set) {
        try {
            return await Events.findOneAndUpdate({ _id }, { $set: set }, { new: true })
        } catch (reason) {
            console.error('[Events (Update)] An error ocurred while updating events [%s]', reason.message)
        }
    }

    async findAndUpdate(query, set) {
        try {
            return await Events.findOneAndUpdate(query, { $set: set }, { new: true })
        } catch (reason) {
            console.error('[EventsManagement (Update)] An error ocurred while updating events [%s]', reason.message)
        }
    }

    /**
     * Delete Events
     * @param _id => Events Identifier
     */
    async delete (_id) {
        return new Promise((resolve, reject) => {
            Events.findOneAndRemove({ _id }, (error, eventsDeleted) => {
                if (error) { reject(error) } else { resolve(eventsDeleted) }
            })
        })
    }
}

module.exports = new EventsManagement();
