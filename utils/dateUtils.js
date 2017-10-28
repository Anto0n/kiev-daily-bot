'use strict';
class DateUtils {




 /**
 * Convert date from OWM
 * get date in ISO format "yyyy-mm-dd hh-mm-ss"
 * returns like "dd Month" - "10 October"
 * @param str
 */
 static convertOWMDate(str){
 let monthArr = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
 let date = new Date(str.split(" ")[0]);
 let dd =date.getDate();
 let month = monthArr[date.getMonth()];
 return dd + " " + month;
 }
}

module.exports = DateUtils;