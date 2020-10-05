const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch")

const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static("public"));

/* // Root route GET */

app.get("/", function (req, res) {
    res.render("main");
})

/* POST answer */

app.post("/", function (req, res) {

    /* Haluttu kaupungin koodi lyhenteenä */

    const desiredCity = req.body.cityName;

    console.log(desiredCity);

    /* API kutsu ja parametrit */

    const requestURL = "https://rata.digitraffic.fi/api/v1//live-trains/station/" + desiredCity + "?departed_trains=0&departing_trains=20&arriving_trains=0&arrived_trains=0&include_nonstopping=false";

    const options = {
        headers: {
            Encoding: "gzip"
        },
    };


    fetch(requestURL, options)
        .then(res => res.json())
        .then(function (data) {

            var bruh = [];

            /* Funktio HH:MM muodon saaminen järjestettävään muotoon */

            function aikaNumeroksi(time) {
                var hoursMinutes = time.split(/[.:]/);
                var hours = parseInt(hoursMinutes[0], 10);
                var minutes = parseInt(hoursMinutes[1], 10) * 0.01;
                return hours + minutes;
            }

            /* Luo uusi objekti haetun datan perustella */

            for (let i = 0; i < data.length; i++) {

                const e = data[i].timeTableRows.length;

                bruh[i] = {
                    type: data[i].trainType,
                    number: data[i].trainNumber,
                    departure: data[i].departureDate,
                    category: data[i].trainCategory,
                    date: aikaNumeroksi(data[i].timeTableRows[0].scheduledTime.substring(11, 16)),
                    destination: data[i].timeTableRows[e - 1].stationShortCode
                }
            }

            /* .sort ajan perustella */

            bruh.sort(function (a, b) {
                return a.date - b.date
            });

            res.render("result", {
                data: data,
                station: desiredCity,
                bruh: bruh
            });
        });
});

app.listen("3000", function () {
    console.log("listening on port 3000")
});