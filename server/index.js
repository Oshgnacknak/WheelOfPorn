const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const scrape = require('./scrape.js');
const shuffle = require('shuffle-array');

const app = express();

app.use(cors())

const prod = process.env.NODE_ENV === 'production';
app.use(morgan(prod ? 'short' : 'dev'))
app.use(express.static(prod ? 'public' : '../client/build'))

let lastScrape;
let tags;
app.get('/spin', async (req, res) => {
    if (!lastScrape || lastScrape < new Date() - 30*1000) {
        tags = await scrape();
        lastScrape = new Date();
    }
    res.json(shuffle.pick(tags, { picks: 30 }));
})

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log('Listening at port', port);
})
