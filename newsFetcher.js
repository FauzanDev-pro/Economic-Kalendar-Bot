import fetch from 'node-fetch';
import cheerio from 'cheerio';

export async function getEconomicNews() {
  const response = await fetch('https://www.forexfactory.com/calendar');
  const html = await response.text();
  const $ = cheerio.load(html);
  let newsList = [];

  $('tr.calendar__row').each((i, el) => {
    const time = $(el).find('.calendar__time').text().trim();
    const impact = $(el).find('.impact span').attr('title');
    const currency = $(el).find('.calendar__currency').text().trim();
    const event = $(el).find('.calendar__event').text().trim();
    const forecast = $(el).find('.forecast').text().trim();
    const previous = $(el).find('.previous').text().trim();

    if (impact && (impact.includes("High") || impact.includes("Medium"))) {
      newsList.push({ time, impact, currency, event, forecast, previous });
    }
  });

  return newsList;
}

export async function getCryptoEvents() {
  const response = await fetch('https://coinmarketcal.com/en/');
  const html = await response.text();
  const $ = cheerio.load(html);
  let events = [];

  $('.card-event').slice(0, 5).each((i, el) => {
    const title = $(el).find('.card-title').text().trim();
    const date = $(el).find('.date').text().trim();
    const coin = $(el).find('.coin-name').text().trim();
    const proof = $(el).find('.proof-link a').attr('href');
    events.push({ title, date, coin, proof });
  });

  return events;
}

export async function getCryptoNews() {
  const response = await fetch('https://www.coindesk.com/');
  const html = await response.text();
  const $ = cheerio.load(html);
  let headlines = [];

  $('a.card-title').slice(0, 5).each((i, el) => {
    const title = $(el).text().trim();
    const link = 'https://www.coindesk.com' + $(el).attr('href');
    headlines.push({ title, link });
  });

  return headlines;
}

export async function getLatestEconomicHeadlines() {
  const response = await fetch("https://www.investing.com/news/economy");
  const html = await response.text();
  const $ = cheerio.load(html);
  let results = [];

  $('.largeTitle .articleItem').slice(0, 3).each((i, el) => {
    const title = $(el).find('.title').text().trim();
    const link = 'https://www.investing.com' + $(el).find('a').attr('href');
    const image = $(el).find('img').attr('data-src') || $(el).find('img').attr('src');
    const desc = $(el).find('.articleDetails').text().trim();
    results.push({ title, link, image, desc });
  });

  return results;
    }
