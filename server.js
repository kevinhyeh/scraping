var express = require('express');
var app = express();
var mongojs = require('mongojs');
var bodyParser = require('body-parser');
var cheerio = require('cheerio');
var request = require('request');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("views"));
app.use(bodyParser.json());

app.set('view engine', 'ejs');

request('https://www.washingtonpost.com/sports/tennis/?utm_term=.8009ed9a57c5', function(error, response, html) {
    var $ = cheerio.load(html);
    var results = [];

    $('div.story-list-story').each(function(i, element) {
        var title = $(element).find('h3').text();
        var link = $(element).find('h3').children('a').attr('href');
        var summary = $(element).find('div.story-description').text();
        var author = $(element).find('span.author').text();
        var image = $(element).find('div.story-image').children('a').attr('href')

        results.push({
            title: title,
            link: link,
            summary: summary,
            author: author,
            image: image
        });

    })
    console.log(results);
})


// app.listen(3000, function() {
//     console.log("listening on 3000");
// });