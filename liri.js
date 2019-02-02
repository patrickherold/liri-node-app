require("dotenv").config();


// Load the NPM Package inquirer
var inquirer = require("inquirer");
var axios = require("axios");
var Spotify = require('node-spotify-api');
var keys = require('./key')
var spotify = new Spotify(keys.spotify);
var moment = require('moment');
var fs = require('fs');

function SpotifyThisSong(song) {
    spotify.search({ type: 'track', query: song }, function(err, spotData) {
        if (err) {
            spotify.search({ type: 'track', query: "The Sign" }, function(err, spotData) {
                if (err) {
                    return console.log('Error occurred: ' + err);
                }
                var artists = spotData.tracks.items[0].artists
                for (var i = 0; i < artists.length; i++) {
                    console.log('Artist: ' + artists[i].name);
                }
                console.log('Song Name: ' + spotData.tracks.items[0].name);
                console.log('Preview URL: ' + spotData.tracks.items[0].preview_url);
                console.log('Album Name: ' + spotData.tracks.items[0].album.name);
            });    
        }
        var artists = spotData.tracks.items[0].artists
        for (var i = 0; i < artists.length; i++) {
            console.log('Artist: ' + artists[i].name);
        }
        console.log('Song Name: ' + spotData.tracks.items[0].name);
        console.log('Preview URL: ' + spotData.tracks.items[0].preview_url);
        console.log('Album Name: ' + spotData.tracks.items[0].album.name);
    });
};

function FindConcert(artist) {
    var url = ("https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp");
    axios.get(url).then(res => {
        var concerts = res.data;
        for (var i = 0; i < concerts.length; i++) {
            console.log('==========================');
            console.log('Venue: ' + concerts[i].venue.name);
            console.log('Location: ' + concerts[i].venue.city + ", " + concerts[i].venue.region+ " " + concerts[i].venue.country);
            console.log('When: ' + moment(concerts[i].datetime).format("dddd, MMMM Do YYYY, h:mm:ss a"));
        }
    }).catch(console.error);    
}

function MovieThis(movie) {
    console.log(movie);
    var url = ("https://www.omdbapi.com/?t=" + movie + "&y=&plot=short&apikey=a01a2d01");
    console.log(url);
    axios.get(url).then(res => {
        console.log('Title: ', res.data.Title);
        console.log('Year: ', res.data.Year);
        console.log('Rating: ', res.data.imdbRating);
        console.log('Tomatoes: ', res.data.Ratings[1].Value);
        console.log('Country: ', res.data.Country);
        console.log('Language(s): ', res.data.Language);
        console.log('Plot: ', res.data.Plot);
        console.log('Actor(s): ', res.data.Actors);
    }).catch(console.error);
};

function WriteLog(action, subject) {
    fs.appendFile("log.txt", action + "," + subject + ",", function(err) {
        // If the code experiences any errors it will log the error to the console.
        if (err) {
          return console.log(err);
        }
        // Otherwise, it will print: "movies.txt was updated!"
        console.log("log was updated!");
    });
}

// Prompt the user to provide which command they want.
inquirer.prompt([
    {
    type: "list",
    name: "whatCommand",
    message: "Which would you like?",
    choices: ["Find a concert", "Spotify a song", "Find a movie", "Do what it says"]
    }

// After the prompt, store the user's response in a variable called location.
]).then(function(prompt) {

        // * `movie-this`
        if (prompt.whatCommand === "Find a movie") {
            
            inquirer.prompt([
                {
                type: "input",
                name: "whatMovie",
                message: "What movie can I lookup for you?"
                }
            ]).then(function (movie) {
                MovieThis(movie.whatMovie);
                WriteLog("Find a movie", movie.whatMovie)
            });
        }
        else if (prompt.whatCommand === "Find a concert"){
            inquirer.prompt([
                {
                type: "input",
                name: "whatArtist",
                message: "What band or artist can I lookup for you?"
                }
            // After the prompt, store the user's response in a variable called location.
            ]).then(function(artist) {
                FindConcert(artist.whatArtist);
                WriteLog("Find a concert", artist.whatArtist)
            });
        }
        // * `spotify-this-song`
        else if (prompt.whatCommand === "Spotify a song") {
            inquirer.prompt([
                {
                type: "input",
                name: "whatSong",
                message: "What song can I lookup for you?"
                }
            // After the prompt, store the user's response in a variable called location.
            ]).then(function(song) {
                SpotifyThisSong(song.whatSong);
                WriteLog("Spotify a song", song.whatSong)
            });
        }
        else if (prompt.whatCommand === "Do what it says"){
            fs.readFile("./random.txt", "utf8", function(error, data) {
                // If the code experiences any errors it will log the error to the console.
                if (error) {
                return console.log(error);
                }
                // Then split it by commas (to make it more readable)
                var dataArr = data.split(",");
                // We will then re-display the content as an array for later use.
                for (var i = 0; i < dataArr.length; i = i + 2) {
                    console.log(dataArr[i]);
                    if (dataArr[i] === "Spotify a song") {
                        SpotifyThisSong(dataArr[i++]);
                        WriteLog("Spotify a song", dataArr[i++])
                    }
                    else if (dataArr[i] === "Find a concert") {
                        FindConcert(dataArr[i++]);
                        WriteLog("Find a concert", dataArr[i++])
                    }
                    else if (dataArr[i] === "Find a movie") {
                        MovieThis(dataArr[i++]);
                        WriteLog("Find a movie", dataArr[i++])
                    }    
                }
            });
        }
        else {
            console.log("Nothing to do.")
        };
});