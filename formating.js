const moment = require('moment');

const timeFormat = (time) => {
    const convertedTime = moment(time, 'hh:mm A').format('HH:mm:ss')
    return convertedTime;
};

module.exports = timeFormat;