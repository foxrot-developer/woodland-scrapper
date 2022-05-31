const monthFormat = (monthYear, date) => {
    const monthName = monthYear.split(' ');
    if (monthName[0] === 'Jan') {
        return `${monthName[1]}-01-${date}`;
    }
    else if (monthName[0] === 'Feb') {
        return `${monthName[1]}-02-${date}`;
    }
    else if (monthName[0] === 'Mar') {
        return `${monthName[1]}-03-${date}`;
    }
    else if (monthName[0] === 'Apr') {
        return `${monthName[1]}-04-${date}`;
    }
    else if (monthName[0] === 'May') {
        return `${monthName[1]}-05-${date}`;
    }
    else if (monthName[0] === 'Jun') {
        return `${monthName[1]}-06-${date}`;
    }
    else if (monthName[0] === 'Jul') {
        return `${monthName[1]}-07-${date}`;
    }
    else if (monthName[0] === 'Aug') {
        return `${monthName[1]}-08-${date}`;
    }
    else if (monthName[0] === 'Sep') {
        return `${monthName[1]}-09-${date}`;
    }
    else if (monthName[0] === 'Oct') {
        return `${monthName[1]}-10-${date}`;
    }
    else if (monthName[0] === 'Nov') {
        return `${monthName[1]}-11-${date}`;
    }
    else if (monthName[0] === 'Dec') {
        return `${monthName[1]}-12-${date}`;
    }
};

module.exports = monthFormat;


