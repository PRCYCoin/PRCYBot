# Simple Telegram Response Bot
A Simple Telegram Response Bot
[Read the tutorial](https://thedevs.network/blog/build-a-simple-telegram-bot-with-node-js).

## How to run the project
Requires [NodeJS](https://nodejs.org) to be installed on your system.  

#1. [Download the project (zip)](https://github.com/DAPSCoin/DAPSBot/archive/master.zip).
(from Terminal: wget https://github.com/DAPSCoin/DAPSBot/archive/master.zip)  

#2. Unzip the project (from Terminmal: unzip master.zip -d .DAPSBot/)

#3. Open the project folder in your terminal (command prompt) (from terminal: cd DAPSBot)

#4. Insert your Telegram Bot API-token in [`env.example`](https://github.com/DAPSCoin/DAPSBot/blob/master/env.example#L2)
(from Terminal: nano .env.example) (don't forget to save before exit)  

#5. Rename [`env.example`](https://github.com/DAPSCoin/DAPSBot/blob/master/env.example) to .env
(from Terminal: mv .env.example .env)  

#6. Install dependencies `npm install`

#7. Run the project using `npm start`

#8. In production you may want to use a process manager. Example with PM2:

```
pm2 start index.js --name=daps-bot
```

If you change the configuration you must restart the bot for the changes to take effect. For example, with PM2 you would do something like:

```
pm2 restart daps-bot
```

Talk to the bot using the following commands:

- help - List all commands
- rules - Chat Rules
- newsletter - Latest Newsletter
- exchanges/markets - What exchanges is DAPS Token on?
- wallets - Currently Supported Wallets
- coingecko - CoinGecko Listing
- coinmarketcap - CoinMarketCap Listing
- whitepaper - Latest Whitepaper
- roadmap - Latest Roadmap
- faq - Other Questions?
- socialmedia - Social Media Accounts
- international - International Telegram Groups
- shop - Link to DAPS Shop
- podcasts - Link to DAPS News Podcasts
- trading - Link to Trading channel on Discord
- articles - List of articles by team members and users
- giveaway - Used for various giveaways/competitions, comment out reply when not in use
- gifparty - Used for fun, invite people to lounge for gif party
- partnerships - List current DAPS partnerships
- scammers - Warn about scammers
- team - Link to DAPS team page
- poaminer - Info/help for PoA Miner
- mnscripts - Share the Masternode Script
- donations / fundraiser - Link to donations drive
- cheers - "Cheers mate"

Current list of blacklisted words:
- pxn
- vestx
- rstr
- ondori
- dapsx
- EOM

The Bot will respond to:

- Hello bot - "Hello! Welcome to DAPS!", "Howdy! Welcome to DAPS!", "Hi! Welcome to DAPS!", "Hey! Welcome to DAPS!"
- Good bot - "Thanks, I appreciate you.", "Glad to be of service.", "Ahww thank you, you're making me blush!", "Gosh, thank you... Seems like I'm doing something right after all!", "Yeah yeah I'm a bad bot and I'm getting s*** every time for doing something stupid... Oh Wait... I'm a good bot? You're the best!"
- Bad bot - "Aw, gosh, I didn't mean it!", "Sorry! Please don't tell my handler!", "ERROR! Initiating reboot sequence...", "Kiss my shiny metal DAPS", "Think that's bad? Wait 'til Combot comes out, then you have trouble."

More commands to come. Feel free to suggest them!
Also now deletes .scr, .pdf, .exe, .pif, .com, .url file uploads by default for user safety

## How to add a command/response

#1. Using Question/Answer as an example, insert these lines right before [`bot.startPolling();`] in [`index.js`](https://github.com/DAPSCoin/DAPSBot/blob/master/index.js)

```
    bot.command('question', ctx => {  
    return ctx.reply('answer');  
    });
```

#2. Save [`index.js`](https://github.com/DAPSCoin/DAPSBot/blob/master/index.js)

#3. Submit pull request

## To-Do List
- Add Admin only [DONE]
- Prevent flooding [https://github.com/DAPScoin/DAPSBot/tree/rate-limiting]
- Delete command after replying [DONE]
- Add a /tutorial command with various tutorials
- Have the bot send a "ATTENTION TO SCAMMERS" reminder every 2 hours maybe?

## Potential Tutorials:

Staking
- Combination
- Explanation
- Orphan Blocks

Wallets
- Linux/Menu Options
- Mac/Wallet Directory
- Windows/Bootstrapping
- Windows/Repair Wallet
