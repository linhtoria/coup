const express = require('express')
const path = require('path')
const mustacheExpress = require('mustache-express');
const bodyParser = require('body-parser')
const config = require('./config.js')
const app = express()

app.engine('mustache', mustacheExpress())
app.set('view engine', 'mustache')
app.set('views', __dirname + '/views')

app.use(bodyParser.json())

app.get('/', (req, res) => res.sendFile(path.join(__dirname, '/index.html')))

app.use('/api', require('./routes/game.js'))

app.listen(config.PORT, function () {
  console.log('Listening on port 3000')
})