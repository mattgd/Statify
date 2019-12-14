module.exports = {
  /**
   * Converts milliseconds to a minutes and seconds string value.
   * @param {integer} millis The time in milliseconds.
   * @returns the milliseconds represented as minutes and seconds.
   */
  millisToMinutesAndSeconds: function(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
  },
  
  /**
   * Returns the number x with commas.
   * @param {String} num The number to convert.
   * @returns the number x with commas.
   */
  numberWithCommas: function(num) {
    var values = num.toString().split('.');
    return values[0].replace(/.(?=(?:.{3})+$)/g, '$&,') + ( values.length == 2 ? '.' + values[1] : '' )
  }
};