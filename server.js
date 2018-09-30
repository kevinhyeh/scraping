const express = require('express');
const app = express();
const mongojs = require('mongojs');
const bodyParser = require('body-parser');
const cheerio = require('cheerio');
const request = require('request');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static("views"));

let databaseUrl = 'articles';
let collections = ['favorites'];

let db = mongojs(databaseUrl, collections);

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
        let image = $(element).find('div.story-image').children('a').attr('href');

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

    app.get('/saved', function(req, res) {
        db.favorites.find({}, function(error, found) {
            let favArticles = {
                results: found
            }
            res.render('pages/saved', favArticles)
            // res.json(favArticles);
        });
    });

    app.post('/save', function(req, res) {
        let title = req.body.title;
        let summary = req.body.summary;
        let author = req.body.author;
        let link = req.body.link;
        db.favorites.find({title: title}, function(error, found) {
            if (found.length > 0) {
                console.log('already saved')
            } else {
                db.favorites.insert({title: title, summary: summary, author: author, link: link, comments: []});
                res.redirect('/');
            }
        }); 
    });

    app.post('/addNotes', function(req, res) {
        let favTitle = req.body.favTitle;
        let newNote = req.body.addNote;
        db.favorites.update({title: favTitle}, {$push: {comments: newNote}});
        res.redirect('/saved')
        // res.json(newNote);
    })

    app.post('/deleteNotes', function(req, res) {
        let favTitle = req.body.favTitle;
        let deleteNote = req.body.deleteNote;
        db.favorites.update({title: favTitle}, {$pull: {comments: deleteNote}});
        res.redirect('/saved');
        // res.json(deleteNote)
        // console.log(typeof test);
    })

    app.post('/delete', function(req, res) {
        let favTitle = req.body.favTitle;
        db.favorites.remove({title: favTitle});
        res.redirect('/saved')
    })
    // console.log(results);
});


app.listen(3000, function() {
    console.log("listening on 3000");
});