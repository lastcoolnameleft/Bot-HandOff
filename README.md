# Summary

This bot is originally cloned from https://github.com/palindromed/Bot-HandOff  
For additional details on the technologies behind it, please go there

This bot is intended to simulate a customer service bot that does the following:

Normal Users:
* Answer questions from the XBox Q&A
* If their question is not answered, they can request an agent by entering: "agent"
* This will connect them to an agent

Agent:
* Connect to any user
* Pass commands through to the user

# Setup

1. Clone this repo
1. If you haven't already, [Register your bot](https://dev.botframework.com/bots/new) with the Bot Framework. Copy the App ID and App Password.
1. If you haven't already, add a Direct Line (not WebChat) channel and copy one of the secret keys (not the same as the app id/secret)
1. `npm install`
1. `npm run build` (or `npm run watch` if you wish to compiled on changes to the code)

### Run in the cloud

1. Deploy your bot to the cloud
2. Aim your bot registration at your bot's endpoint (probably `https://your_domain/api/messages`)
3. Aim at least two browser instances at `https://your_domain/webchat?s=direct_line_secret_key`

### Setup

### ... or run locally

* Linux:
```
# Window 1
ngrok http 3978
# Window 2
npm run build-watch
# Window 3
export MICROSOFT_APP_ID=app_id
export MICROSOFT_APP_PASSWORD=app_password
export QNASUBSCRIPTIONKEY=qna_subscriptionkey
export QNAKNOWLEDGEBASE_ID=qna_knowledge_base_id
npm run run-watch
# Browser
https://localhost:3978/webchat/?s=direct_line_secret_key
```

* Windows
```
$env:MICROSOFT_APP_ID="app_id"
$env:MICROSOFT_APP_PASSWORD="app_password"
$env:QNASUBSCRIPTIONKEY="qna_subscriptionkey"
$env:QNAKNOWLEDGEBASE_ID="qna_knowledge_base_id"
node dist/app.js
```
    
2. Create an ngrok public endpoint [see here for details](https://github.com/Microsoft-DXEIP/Tokyo-Hack-Docs#1-with-your-app-still-running-on-localhost-bind-the-localhost-deployment-with-ngrok-we-will-need-this-url-for-registering-our-bot)
3. Aim your bot registration at that endpoint (probably `https://something.ngrok.io/api/messages`)
3. Aim at least two browser instances at `http://localhost:3978/webchat?s=direct_line_secret_key`

### ... or run in Docker

1. Build your docker container
`docker build -t obibot .`
1. Run your docker container
`docker run --rm -it -e "MICROSOFT_APP_ID=$MICROSOFT_APP_ID" -e "MICROSOFT_APP_PASSWORD=$MICROSOFT_APP_PASSWORD" -p 3978:3978 obibot`
1. Create an ngrok public endpoint [see here for details](https://github.com/Microsoft-DXEIP/Tokyo-Hack-Docs#1-with-your-app-still-running-on-localhost-bind-the-localhost-deployment-with-ngrok-we-will-need-this-url-for-registering-our-bot)
1. Aim your bot registration at that endpoint (probably `https://something.ngrok.io/api/messages`)
1. Aim at least two browser instances at `http://localhost:3978/webchat?s=direct_line_secret_key`

### Set up your customer(s) & agent(s), and go

1. Make one or more instances an agent by giving it a user id starting with the word `Agent`
2. Make one or more instances a customer by giving it a user id *not* starting with the word `Agent`
3. The customer bot is a simple echo bot. Type `help` to request an agent.
4. As an agent, type `options` to see your available commands

## License

MIT License
