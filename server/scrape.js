const cheerio = require('cheerio');
const fetch = require('node-fetch');

const makeScrape = ({ baseUrl, tagPage, icon }, callback) => {
    const url = new URL(tagPage || '/', baseUrl);
    return async () => {
        const res = await fetch(url);
        const $ = cheerio.load(await res.text());

        const tags = callback($, { tagPage, baseUrl, url, res }).get();
        return tags.map(tag => ({
            icon: icon || baseUrl + '/favicon.ico',
            baseUrl,
            hostname: url.hostname,
            ...tag,
        }));
    }
}

const scrapeNhentai = makeScrape({
        baseUrl: 'https://nhentai.net',
        tagPage: '/tags/popular',
    }, 
    ($, { baseUrl }) => 
        $('a.tag').map((_, el) => {
            const a = $(el);
            const url = baseUrl + a.attr('href');
            const name = a.children('.name').text();
            return { url, name };
        })
);

const scrapeTubeBDSM = makeScrape({
        baseUrl: 'https://www.tubebdsm.com',
        icon: 'https://www.tubebdsm.com/templates/tubebdsm/images/favicon.ico?c4b5704b',
    }, 
    ($, { baseUrl }) => 
        $('div.card-body-main a.item-link').map((_, el) => {
            const a = $(el);
            const url = baseUrl + a.attr('href');
            const name = a.attr('title').trim();
            return { url, name };
        })
);

const scrapeXVideos = makeScrape({
        baseUrl: 'https://www.xvideos.com',
        tagPage: '/tags',
    }, 
    ($, { baseUrl }) => 
        $('ul#tags > li > a').map((_, el) => {
            const a = $(el);
            const url = baseUrl + a.attr('href');
            const name = a.children('b').text().trim();
            return { url, name };
        })
);

const scrapePornhub = makeScrape({
        baseUrl: 'https://www.pornhub.com',
        tagPage: '/categories',
    }, 
    ($, { baseUrl }) => 
        $('.category-wrapper > a').map((_, el) => {
            const a = $(el);
            const url = baseUrl + a.attr('href');
            const name = a.attr('alt');
            return { url, name };
        })
);

const scrape = async () => {
    const tags = Array.prototype.concat(
        ...await Promise.all([
            scrapeNhentai(), 
            scrapeTubeBDSM(),
            scrapeXVideos(),
            scrapePornhub(),
        ])
    );

    const byName = {};
    for (const tag of tags) {
        const name = tag.name.toLowerCase();
        byName[name] = byName[name] || [];
        byName[name].push(tag);
    }

    return Object.entries(byName).map(([name, sites]) => ({
        name, sites
    }));
}

module.exports = scrape;
