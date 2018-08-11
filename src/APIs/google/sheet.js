/**
 * Dependencies
 */
const google = require('googleapis')
const authentication = require('./auth')
const service = google.sheets('v4')
const schema = require('./schema')

class Sheet {
  constructor (model) {
    this.model = model
    this.range = `${schema.models[this.model].name}!${schema.models[this.model].range}`
    this.labels = Object.keys(schema.models[this.model].collection)
  }

  retrieve () {
    return new Promise((resolve, reject) => {
      authentication.authenticate()
            .then((auth) => {
              const self = this
              service.spreadsheets.values.get({
                auth,
                spreadsheetId: schema.models[self.model].spreadsheetId,
                range: self.range,
                valueRenderOption: 'FORMATTED_VALUE',
              }, (error, result) => {
                if (error) {
                        // Handle error
                  if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') console.log('Googlesheets retrieve error :: ', error)
                  reject(error)
                } else {
                  const numRows = result.values ? result.values.length : 0
                  if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') console.log('%d rows retrieved from %s.', numRows, self.model)
                  resolve(self.parse(result.values))
                }
              })
            })
    })
  }

  async delete () {
    return new Promise((resolve, reject) => {
      authentication.authenticate()
        .then((auth) => {
          const self = this
          service.spreadsheets.values.clear({
            auth,
            spreadsheetId: schema.models[self.model].spreadsheetId,
            range: self.range,
          }, (error, result) => {
            if (error) {
              if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') console.log('Googlesheets clear error :: ', error)
              reject(error)
            } else {
              if (process.env.LOGS_ENABLED === 'true' || process.env.LOGS_ENABLED === '1') console.log('Googlesheets cleared')
              resolve()
            }
          })
        })
    })
  }

    /**
     * To save some data in google sheets
     * @param data is a jsonArray Object or a Json Object
     */
  create (data) {
    const array = this.parse(data, false)
    return new Promise((resolve, reject) => {
      authentication.authenticate()
            .then((auth) => {
              const self = this
              service.spreadsheets.values.append({
                auth,
                spreadsheetId: schema.models[self.model].spreadsheetId,
                range: self.range,
                valueInputOption: 'USER_ENTERED',
                resource: {
                  values: array,
                },
              }, (err, response) => {
                if (err) {
                  console.error(`GOOGLE-API ERROR SAVING IN GOOGLE SHEETS:: ${err}`)
                  reject(err)
                } else {
                  resolve(response)
                }
              })
            })
    })
  }

    /**
     * This function converts an array to json array and viceversa
     */
  parse (data, toJson = true) {
    if (toJson) {
      // -- Array goes to json array
      const self = this
      // console.log("Data is :: ", data);

      const jsonArray = data
        .map((row) => row.map((col, index) => {
          const obj = {}; obj[self.labels[index]] = col; return obj
        }))
        .map((row) => row.reduce((previous, current) => {
          Object.keys(current).forEach((key) => {
            previous[key] = current[key]
          })
          return previous
        }, {}))
        .filter((value) => Object.keys(value).length > 0)
        .map((document, index, array) => {
          if (index <= 0) {
            return document
          }
          Object.keys(document).forEach((key) => {
            const definition = schema.models[self.model].collection[key]
            document[key] = (
                    definition.propagate
                    && (document[key] === null
                    || document[key] === undefined
                    || document[key].replace(/ /g, '') === '')) ? array[index - 1][key] : document[key]
            document[key] = (definition.type === 'Integer') ? parseInt(document[key]) : document[key]
          })
          return document
        })
      return jsonArray
    }

    // -- Json | Json array goes to array of array
    const array = []
    const self = this
    data = data instanceof Array ? data : [data]

    let innerArray = []
    data.forEach((json) => {
      innerArray = []
      self.labels.forEach((label) => {
        if (schema.models[self.model].collection[label] === 'Picture') {
          innerArray.push(`=IMAGE("${json[label]}", 4, 40, 40)`)
        } else if (schema.models[self.model].collection[label] === 'Date') {
          try { innerArray.push(json[label].toString()) } catch (error) { innerArray.push(json[label]) }
        } else if (schema.models[self.model].collection[label] === 'DateFormat') {
          try { innerArray.push(`${json[label].getDate()}-${json[label].getMonth()+1}-${json[label].getFullYear()}`) } catch (error) { innerArray.push(json[label]) }
        } else if (schema.models[self.model].collection[label] === 'TimeFormat') {
          try { innerArray.push(`${json[label].getMinutes()}:${json[label].getSeconds()}:${json[label].getMiliseconds()}`) } catch (error) { innerArray.push(json[label]) }
        } else {
          innerArray.push(json[label])
        }
      })
      array.push(innerArray)
    })

    return array
  }
}

module.exports = Sheet
