'use strict'
const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

app.set('port', (process.env.PORT)|| 3000)

app.use(bodyParser.urlencoded({extended: false}))

app.use(bodyParser.json())

app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot')
})

app.get('/webhook/', function(req, res) {
  if (req.query['hub.verify_token'] === 'my_voice_is_mypassword_verify_me') {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
})

app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})

app.post('/webhook/', function(req, res){
  console.log('received webhook');
  let messaging_events = req.body.entry[0].messaging
  for (let i = 0; i < messaging_events.length; i ++) {
    let event = req.body.entry[0].messaging[i]
    let sender = event.sender.id
    if (event.message && event.message.text) {
      // let text = event.message.text
      sendTextMessage(sender, "Hello there, I am Pam, your personal assistant. Let's set you up")
      sendTextMessage(sender, "I'll help you get up in the mornings and fulfill your personal goals")
      sendTextMessage(sender, "To start, what time do you usually wake up?")//recieve text back
      sendTextMessage(sender, "Awesome! Do you have a morning routine you'd like to stick to?") //button yes or no
      // sendTextMessage(sender, "Sweet")
      resToMorningRoutine(sender)

    }
  }
  res.sendStatus(200)
})

const token = "EAACGElIklxMBAGeo6OyZBOOPCudxZCun6dF7noz5P3HixXIzeZClJNDkzQLAFZCyl61Thn98jXzuNo6bE85ZBaxmK5bBmutKFR9O9mLuFJl5h6NHl55L1EmslH6u53IbKtLYTqj2FPmIojrv2wpJ0odaS7ZCh5RUY0XXGymp3qxQZDZD"

function sendTextMessage(sender, text) {
  let messageData = {text: text}
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token: token},
    method: 'POST',
    json: {
      recipient: {id: sender},
      message: messageData
    }
  }, function(error, response,body) {
    if (error) {
      console.log('Error sending messages: ', error)
    } else if (response.body.error) {
      console.log('Error: ', response.body.error)
    }
  })
}

function sendGenericMessage(sender) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Awesome! Do you have a morning routine you'd like to stick to?",
                    "subtitle": "",
                    // "image_url": "http://messengerdemo.parseapp.com/img/rift.png",
                    "buttons": [{
                        "type": "postback",
                        // "url": "https://www.messenger.com",
                        "payload": "Payload for first element in a generic bubble",
                        "title": "yes"
                    }, {
                        "type": "postback",
                        "title": "no",
                        "payload": "Payload for first element in a generic bubble",
                    }]
                }]
            }
        }
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}
