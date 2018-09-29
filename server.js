const express = require('express');
const app = express();
const mongojs = require('mongojs');
const bodyParser = require('body-parser');
const cheerio = require('cheerio');
const request = require('request');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("views"));
app.use(bodyParser.json());

app.set('view engine', 'ejs');

request('https://www.washingtonpost.com/sports/tennis/?utm_term=.8009ed9a57c5', function(error, response, html) {
    let $ = cheerio.load(html);
    let results = [];

    // scraping website and storing in results array
    $('div.story-list-story').each(function(i, element) {
        let title = $(element).find('h3').text();
        let link = $(element).find('h3').children('a').attr('href');
        let summary = $(element).find('div.story-description').text();
        let author = $(element).find('span.author').text();
        let image = $(element).find('div.story-image').children('a').attr('href')

        results.push({
            title: title,
            link: link,
            summary: summary,
            author: author,
            image: image
        });
    })

    app.get('/', function(req, res) {
        let articles = {
            results: results
        }
        res.render('pages/', articles);
        // res.json(articles);
    })
    // console.log(results);
});


app.listen(3000, function() {
    console.log("listening on 3000");
});