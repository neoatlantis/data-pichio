/*
 * Date/Time Representation
 *
 * The only format to input a date time in this system is:
 *
 *    2008-05-12T14:28:04+08:00  (seconds are rounded to be integer)
 *                               (R.I.P)
 *                       - or the same -
 *    2008-05-12T06:28:04Z       (the UTC time)
 *
 *  Output will be always the second format.
 */
function _DATETIME(value){
    var self = this;

    if(!value) value = new Date();

    this.toString = function(){
        var ret =
            value.getUTCFullYear().toString().rjust(4, '0') + '-' +
            (value.getUTCMonth() + 1).toString().rjust(2, '0') + '-' +
            value.getUTCDate().toString().rjust(2, '0') +
            'T' +
            value.getUTCHours().toString().rjust(2, '0') + ':' +
            value.getUTCMinutes().toString().rjust(2, '0') + ':' +
            value.getUTCSeconds().toString().rjust(2, '0') + 'Z'
        ;

        return ret;
    };

    this.getTimestamp = function(){
        return value.getTime();
    };

    return this;
};

//////////////////////////////////////////////////////////////////////////////

module.exports = function(str){
    if(!str) return new _DATETIME();

    var filter = /^([0-9]{4})\-([0-9]{2})\-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})(Z|([\-\+]([0-9]{2}):([0-9]{2})))$/;
    var fragments = filter.exec(str);

    if(!fragments) throw $.error('invalid-date-time');

    var year = fragments[1], month = fragments[2], day = fragments[3],
        hour = fragments[4], minute = fragments[5], second = fragments[6];

    if('Z' == fragments[7]){
        tzoneHour = 0;
        tzoneMinute = 0;
    } else {
        tzoneHour = fragments[9];
        tzoneMinute = fragments[10];
    };

    if(!(
        hour <= 23 &&
        minute <= 59 &&
        second <= 59 &&
        month <= 12 &&
        day <= 31 &&
        tzoneHour <= 23 &&
        tzoneMinute <= 60
    ))
        throw $.error('invalid-date-time');

    try{
        var value = new Date(str);
    } catch(e){
        throw $.error('invalid-date-time', e);
    };

    return new _DATETIME(value);
};
