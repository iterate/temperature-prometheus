'use strict';

const express = require('express');
const cluster = require('cluster');
const fetch = require('node-fetch');
const server = express();
const register = require('prom-client').register;


const Gauge = require('prom-client').Gauge;
const temp_gauge = new Gauge({
	name: 'temperature',
	help: 'Temperature in Celcius',
	labelNames: ['floor']
});
const time_gauge = new Gauge({
	name: 'temperature_time',
	help: 'Time when the temperature was measured',
	labelNames: ['floor']
});

function go_get_the_temp() {
    let data = fetch('https://temp-5c997.firebaseio.com/temps.json?orderBy="$key"&limitToLast=1')
        .then(res => res.json())
        .then(data => {
            let points = Object.values(data);
            points.sort((a, b) => a.timestamp - b.timestamp);
            let latest = points[points.length - 1];
            let temp = parseFloat(latest.temp);
            let time = latest.timestamp;

            temp_gauge.set({ floor: '6' }, temp);
            time_gauge.set({ floor: '6' }, time);

            setTimeout(go_get_the_temp, 60000);
        });
}

go_get_the_temp();

server.get('/metrics', (req, res) => {
	res.set('Content-Type', register.contentType);
	res.end(register.metrics());
});

//Enable collection of default metrics
require('prom-client').collectDefaultMetrics();

console.log('Server listening to 5000, metrics exposed on /metrics endpoint');
server.listen(5000);
