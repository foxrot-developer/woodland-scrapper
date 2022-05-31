const express = require('express');

const browserConfiguration = require('./scrapper');

const app = express();

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Methods', 'GET')
    next();
});

app.get('/api/woodland', async (req, res, next) => {
    browserConfiguration().then(result => {
        console.log("Code Executed successfully .....");
    });
    res.send('Execution started ...');
});

app.use((req, res, next) => {
    throw new HttpError('Could not find the route', 404);
})

app.use((error, req, res, next) => {
    if (res.headerSent) {
        return next(error)
    }
    res.status(error.code || 500);
    res.json({ message: error.message || 'An unknown error occured' });
});


app.listen(process.env.PORT || 5000, () => {
    console.log('Connected');
});