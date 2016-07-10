'use strict'
const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()
var User = require('./models/models').User;

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
  let messaging_events = req.body.entry[0].messaging
  console.log('messging_event', messaging_events.length)
  for (let i = 0; i < messaging_events.length; i ++) {
    let event = req.body.entry[0].messaging[i]
    let sender = event.sender.id

    var user = User.findOne({facebookId: req.body.entry[0].id}, function(err, user){
          if (err) {return console.log(err)
          } else {
            if (!user && event.message && event.message.text) {
              sendTextMessages(sender, ["Hello there, I am Pam, your personal assistant. Let's set you up", "I'll help you get up in the mornings and fulfill your personal goals"])
              resToMorningRoutine(sender)

              // create user
              var user = new User({facebookId: req.body.entry[0].id})
              user.save()
            } else if (user && !user.setup) {
              console.log('THERE IS A USERRRRRRRRRRRRRRRRRRRR=========');
              if (event.postback) {
                console.log("SECOND TIME");
                console.log("EVENT POSTBACK PAYLOAD===========", event.postback.payload)
                let text = event.postback.payload
                if (text === 'yes'){
                  if(user.routineQuestion===false){
                    sendTextMessages(sender, ["Meditation, pushups, tea? What's one thing you should you be doing every morning?", "For example, you could respond 'Meditation for 10 minutes', or... 'Read for 20 minutes'?"])
                    user.routineQuestion = true;
                    user.save();
                  }
                } else if (text === 'no') {
                  // do something else
                }
            }
              if (event.message && event.message.text && user.routineQuestion) { //NOT PASSING THIS
                console.log("SUCCESS===========================       =======");
                console.log("EVENT.MESSAGE=====    =======    ======", event.message);
                console.log("EVENT.MESSAGE.TEXT =====    =======    ======", event.message.text);
                user.routine.name = event.message.text
                user.save(function (err, user){
                  if(err){
                    console.log('ERROR================')
                  }
                  else {
                    sendTextMessages(sender, ["You're all set up, from now on I'll remind you daily!"])
                    user.setup = true;
                    user.save()
                    console.log("USER ADDED ===================");
                  }
                });
              //later add
            }
          } else{
            console.log("YAYAY");
            somethingFun(sender, 'https://placehold.it/350x150')
            button(sender, 'Ready to start the day?', 'Start morning routine', 'Start working')
            if (event.postback) {
              let text = event.postback.payload
              if (text === 'Start morning routine'){
                button(sender, "Cool, let's get started!", 'Finished', 'Skip for today');
                //make timers later
                if (event.postback) {
                  let text = event.postback.payload
                  if (text === 'Finished' || text === 'Skip for today'){
                    sendTextMessages(sender,["Great, what do you have to do today?", "Separate tasks by comma since I'm dumb"]);
                    if(event.message && event.message.text){
                      
                    }
                  }
                }
              }
            }
            });
      res.sendStatus(200)
    }
})

const token = "EAACGElIklxMBAGeo6OyZBOOPCudxZCun6dF7noz5P3HixXIzeZClJNDkzQLAFZCyl61Thn98jXzuNo6bE85ZBaxmK5bBmutKFR9O9mLuFJl5h6NHl55L1EmslH6u53IbKtLYTqj2FPmIojrv2wpJ0odaS7ZCh5RUY0XXGymp3qxQZDZD"

function sendTextMessages(sender, text) {
  let messageData = {text: text[0]}
  if (text.length !== 0) {
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
      text = text.slice(1)
      sendTextMessages(sender, text)
    })
  }
}

function resToMorningRoutine(sender) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "button",

                "text": "Awesome! Would you like to add a morning ritual? ie. Push-ups, meditation...",

                "buttons": [{
                      "type": "postback",
                      // "url": "https://www.messenger.com",
                      "payload": "yes",
                      "title": "Yeah!"
                  }, {
                      "type": "postback",
                      "title": "No thanks",
                      "payload": "no",
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

function somethingFun(sender, url) {
    let messageData = {
        "attachment": {
            "type": "image",
            "payload": {
              "url": url
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

function button(sender, text, button1, button2) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "button",
                "text": text,
                "buttons": [{
                      "type": "postback",
                      "payload": button1,
                      "title": button1
                  }, {
                      "type": "postback",
                      "title": button2,
                      "payload": button2,
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
