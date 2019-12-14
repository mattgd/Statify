/**
 * Converts milliseconds to a minutes and seconds string value.
 * @param {number} millis The time in milliseconds.
 * @returns the milliseconds represented as minutes and seconds.
 */
export const millisToMinutesAndSeconds = (millis: number) => {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000);
  return minutes + ':' + (seconds < 10 ? '0' : '') + seconds.toFixed(0);
}
  
/**
 * Returns the number x with commas.
 * @param {number} num The number to convert.
 * @returns the number x with commas.
 */
export const numberWithCommas = (num: number) => {
  var values = num.toString().split('.');
  return values[0].replace(/.(?=(?:.{3})+$)/g, '$&,') + ( values.length == 2 ? '.' + values[1] : '' )
}
