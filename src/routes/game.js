const express = require('express')
const cache = require('memory-cache')
const crypto = require('crypto')
const config = require('../config.js')
const router = express.Router()

router.get('/game/:id', (req, res) => {
  const id = req.params.id
  if (cache.get(id) === null) {
    return res.status(400).send({
      error: `Game ${id} does not exist`
    })
  }
  return res.send({
    data: {
      game: cache.get(id)
    }
  })
})

router.post('/game/:id/join', (req, res) => {
  const id = req.params.id
  if (req.body.name === undefined) {
    return res.status(400).send({
      error: `Request requires name`
    })
  }
  const name = req.body.name
  // cache.put(id, { users: [{name: 'aaron'}, {name: 'victoria'}]}, 10000)
  if (cache.get(id) === null)
    return res.status(400).send({
      error: `Game ${id} does not exist`
    })
  else {
    const game = cache.get(id)
    const used = game.users.map((user) => user.name).includes(name)
    if (used) {
      return res.status(400).send({
        error: `User ${name} already exists in game ${id}`
      })
    }
    else if (game.started) {
      return res.status(400).send({
        error: `Cannot join game ${id} in progress`
      })
    }
    else if (game.users.length > 8) {
      return res.status(400).send({
        error: `Cannot join game ${id} is full`
      })
    }
    else {
      game.users.push({
        name,
        cards: undefined,
        money: undefined
      })
      cache.put(id, game, config.GAME_EXPIRE)
      return res.send({
        message: `Successfully added user ${name} to game ${id}`
      })
    }
  }
})

router.post('/game/create', (req, res) => {
  let id = crypto.randomBytes(3).toString('hex')
  while (cache.get(id) !== null) {
    id = crypto.randomBytes(3).toString('hex')
  }
  cache.put(id, {
    users: [],
    deck: undefined,
    turn: undefined,
    timeStarted: undefined,
    started: false,
    timeCreated: new Date().getTime()
  }, config.GAME_EXPIRE)
  return res.send({
    message: `Successfully created game ${id}`,
    data: {
      id
    }
  })
})

router.post('/game/:id/start', (req, res) => {
  const id = req.params.id
  if (cache.get(id) === null) {
    return res.status(400).send({
      error: `Game ${id} does not exist`
    })
  }
  const game = cache.get(id)
  if (game.started) {
    return res.status(400).send({
      error: `Game ${id} has already started`
    })
  }

  if (game.users.length <= 1) {
    return res.status(400).send({
      error: `Game ${id} does not have enough players`
    })
  }

  game.started = true
  game.timeStarted = new Date().getTime()
  game.deck = config.GAME.DECK
  game.turn = Math.floor(Math.random() * game.users.length)

  for (let userId = 0; userId < game.users.length; userId++) {
    const user = game.users[userId]
    user.money = config.GAME.STARTING_MONEY
    user.cards = []
    for (let i = 0; i < 2; i++) {
      const pickedCard = Math.floor(Math.random() * game.deck.length)
      user.cards.push(game.deck[pickedCard])
      game.deck.splice(pickedCard, 1)
    }
  }

  cache.put(id, game, config.GAME_EXPIRE)

  return res.send({
    message: `Game ${id} is successfully started`
  })
})

module.exports = router
