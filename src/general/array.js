/**
 * General functions to handle problems related with arrays
 */

class ArraySync {
  static config() {
    /**
         * Iterate over a promise array in a sycnchronous way
         */
    Array.prototype.forEachAsync = async function (asyncCallback) {
      for (const element of this) { await asyncCallback(element); }
    };


    /**
         * Group by an array of objects
         * @param {String} key
         * @return {Object}
         */
    Array.prototype.groupBy = function (key) {
      return this.reduce((previous, actual) => {
        previous[actual[key]] = previous[actual[key]] || [];
        previous[actual[key]].push(actual);
        return previous;
      }, Object.create(null));
    };
  }
}

module.exports = ArraySync;
