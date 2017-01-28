import * as express from 'express';
import * as builder from 'botbuilder';
import { Handoff, ConversationState } from './handoff';
// import { commandsMiddleware } from './commands';

//=========================================================
// Bot Setup
//=========================================================

const app = express();

// Setup Express Server
app.listen(process.env.port || process.env.PORT || 3978, '::', () => {
    console.log('Server Up');
});
// Create chat bot
const connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
const bot = new builder.UniversalBot(connector, (session) => {
    if (handoff.isAgent(session)) {
        session.replaceDialog('options');
    } else {
        session.send('Echo ' + session.message.text);
        session.send('type help to connect to an agent');
    }

});
app.post('/api/messages', connector.listen());

// Create endpoint for agent / call center
app.use('/webchat', express.static('public'));

// replace this function with custom login/verification for agents
const isAgent = (session: builder.Session) => {
    return session.message.user.name.startsWith("Agent");
}

const handoff = new Handoff(bot, isAgent);

//========================================================
// Bot Middleware
//========================================================
bot.use(
    handoff.routingMiddleware(),
    /* other bot middlware should probably go here */
);


const currentConversations = (handoff, session) => {
    if (handoff.isAgent(session)) {
        const conversations = handoff.currentConversations();
        if (conversations.length === 0) {
            return "No customers are in conversation.";
        }

        let text = '### Current Conversations \n';
        conversations.forEach(conversation => {
            const starterText = ' - *' + conversation.customer.user.name + '*';
            switch (ConversationState[conversation.state]) {
                case 'Bot':
                    text += starterText + ' is talking to the bot\n';
                    break;
                case 'Agent':
                    text += starterText + ' is talking to an agent\n';
                    break;
                case 'Waiting':
                    text += starterText + ' is waiting to talk to an agent\n';
                    break;
            }
        });
        return text;
    }

}

bot.dialog('options', (session) => {
    if (handoff.isAgent(session)) {
        const commands = ' ### Agent Options\n - Type *connect* to connect to customer who has been waiting longest.\n - Type *connect { user name }* to connect to a specific conversation\n - Type *list* to see a list of all current conversations.\n - Type *disconnect* while talking to a user to end a conversation.\n - Type *options* at any time to see these options again.';
        session.endDialog(commands)
    }
    session.endDialog()

}).triggerAction({ matches: /options/i });

bot.dialog('list', (session) => {
    if (handoff.isAgent(session)) {
        session.send(currentConversations(handoff, session));
    }
    session.endDialog();

}).triggerAction({ matches: /list/i });

bot.dialog('connect', (session) => {
    if (handoff.isAgent(session)) {
        const inputWords = session.message.text.split(' ');
        const conversation = handoff.getConversation({ agentConversationId: session.message.address.conversation.id });
        if (!conversation) {
            const newConversation = handoff.connectCustomerToAgent(
                inputWords.length > 1
                    ? { customerName: inputWords.slice(1).join(' ') }
                    : { bestChoice: true },
                session.message.address
            );
            if (newConversation) {
                session.send("You are connected to " + newConversation.customer.user.name);
            } else {
                session.send("No customers waiting.");
            }
        }
    }
    session.endDialog();

}).triggerAction({ matches: /connect/i });

bot.dialog('disconnect', (session) => {
    if (handoff.isAgent(session)) {
        const conversation = handoff.getConversation({ agentConversationId: session.message.address.conversation.id });

        if (handoff.connectCustomerToBot({ customerConversationId: conversation.customer.conversation.id })) {
            session.send("Customer " + conversation.customer.user.name + " is now connected to the bot.");
        }
    }
    session.endDialog();
}).triggerAction({ matches: /disconnect/i });

bot.dialog('customerEscalation', (session) => {
    if (!handoff.isAgent(session)) {
        // lookup the conversation (create it if one doesn't already exist)
        const conversation = handoff.getConversation({ customerConversationId: session.message.address.conversation.id }, session.message.address);

        if (conversation.state == ConversationState.Bot) {
            handoff.addToTranscript({ customerConversationId: conversation.customer.conversation.id }, session.message.text);
            handoff.queueCustomerForAgent({ customerConversationId: conversation.customer.conversation.id })
            session.send("Connecting you to the next available agent.");
        }
    }
    session.endDialog();
}).triggerAction({ matches: /help/i });
