

class CustomString {
    static config() {

        /**
         * @param {String} delimiter
         * @param {String} str 
         */
        String.prototype.customReplace = function(delimiter, str) {
            //-- Split string in pieces
            let string = this.split(" ");
            let response = "";
            let index = 0;

            for(let word of string) {
                index++;
                //-- Check if word match delimiter
                if (word.indexOf(delimiter) != -1) {
                    let stringInner = word.split(delimiter).join(str);
                    response += stringInner;
                } else response += word;
                if (index != string.length) response += " ";
            }

            return response;
        };
    }
};

module.exports = CustomString