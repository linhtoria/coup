const express = require('express')
const path = require('path')
const app = express()

app.get('/', (req, res) => res.sendFile(path.join(__dirname, '/index.html')))

app.listen(3000, function () {
  console.log('Listening on port 3000')
})