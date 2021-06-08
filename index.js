require('dotenv').config();
const Telegraf = require('telegraf');
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const rateLimit = require('telegraf-ratelimit')
const token = process.env.TELEGRAM_API_KEY || '';
const bot = new Telegraf(token, { username: 'PRCY_Coin_Bot' });

// Set limit to 1 message per 0.5 second (for those having fun with good bot/bad bot) - can be adjusted or removed if necessary
const limitConfig = {
  window: 500,
  limit: 1,
  onLimitExceeded: (ctx, next) => ctx.reply('Please slow down a bit... need some more grease!')
}
//bot.use(rateLimit(limitConfig))

//Check for admin in channel usage
bot.use(function (ctx, next) {
  /// or other chat types...
  // if( ctx.chat.type !== 'channel' ) return next();
  if (ctx.chat.id > 0) return next();

  /// need to cache this result ( variable or session or ....)
  /// because u don't need to call this method
  /// every message
  return bot.telegram.getChatAdministrators(ctx.chat.id)
    .then(function (data) {
      if (!data || !data.length) return;
      console.log('admin list:', data);
      ctx.chat._admins = data;
      ctx.from._is_in_admin_list = data.some(adm => adm.user.id === ctx.from.id);
    })
    .catch(console.log)
    .then(_ => next(ctx));
});

const walletversion = "1.0.0.6"

//Add exchange constant for use in multiple commands
const exchangetext = 'Question: What exchanges is PRCY Coin being traded on?\nPRCY Coin is trading on:\n\nExchanges:\n<a href="https://txbit.io/?r=13747">Txbit</a>: KYC - Unlimited, Non KYC - 8500 PRCY/day withdrawl limit.\nTrading Pairs: PRCY-BTC / PRCY-USDT / PRCY-EUR / PRCY-USD / PRCY-RUR\n\n<a href="https://app.stex.com?ref=05796629">STEX</a>: KYC\nTrading Pairs: PRCY-BTC / PRCY-USDT\n\n<a href="https://www.hotbit.io/register?ref=1028586">HotBit</a>: No KYC\nTrading Pairs: PRCY-BTC / PRCY-USDT\n\nExchange / Mobile Wallet:\n<a href="https://swap.swftcoin.com/swft-v3/InviteSignup-pc.html?referrer=1476348">SWFT</a>: KYC required\nSwap directly between more than 200 different coins for PRCY\n\nAll current markets can be seen here: https://prcycoin.com/market\n\nNote: PRCY is not responsible for the coins you hold on an exchange. Remember: not your keys, not your coins!'

//old exchangetext = 'Question: What exchanges is PRCY Coin being traded on?\nPRCY Coin is trading on:\n\nExchanges:\n<a href="https://txbit.io/?r=13747">Txbit</a>: KYC - Unlimited, Non KYC - 8500 PRCY/day withdrawl limit.\nTrading Pairs: PRCY-BTC / PRCY-USDT / PRCY-EUR / PRCY-USD / PRCY-RUR\n\n<a href="https://app.stex.com?ref=05796629">STEX</a>: KYC\nTrading Pairs: PRCY-BTC / PRCY-USDT\n\n<a href="https://www.hotbit.io/register?ref=1028586">HotBit</a>: No KYC\nTrading Pairs: PRCY-BTC / PRCY-USDT\n\n<a href="https://coinsbit.io/referral/e9e321fb-1bac-4d29-b154-8918d11013e0">Coinsbit</a>: KYC\nTrading Pairs: PRCY-BTC / PRCY-USDT\n\nExchange / Mobile Wallet:\n<a href="https://swap.swftcoin.com/swft-v3/InviteSignup-pc.html?referrer=1476348">SWFT</a>: KYC required\nSwap directly between more than 200 different coins for PRCY\n\nWrapped PRCY (wPRCY) Markets\n<a href="https://coinsbit.io/referral/e9e321fb-1bac-4d29-b154-8918d11013e0">Coinsbit</a>: KYC\nTrading Pairs: wPRCY-BTC / wPRCY-USDT / wPRCY-ETH\n\nAll current markets can be seen here: https://prcycoin.com/market\n\nNote: PRCY is not responsible for the coins you hold on an exchange. Remember: not your keys, not your coins!'

const donationtxt = ""

//Newsletter link
const newsletterlink = "https://www.getrevue.co/profile/prcycoin/issues/weekly-newsletter-of-prcy-coin-official-issue-1-471692"

//Scammer text
const scammertext = '<b>Please BEWARE of scammers‼️\n\nThere might be admin impersonators, fake profiles, pages, websites and download links provided by scammers over the next week or two. ONLY follow links given in our official channels ❗️n\nHow can I tell if an admin is real? 🤔\n\nHere are some easy guidelines to make sure you are dealing with real admins:\n\n- Admins will never send you a DM first\n- They have an "admin" tag in their messages\n- They have a star symbol next to their name in the member list\n- Admins will never ask or offer you cryptocurrencies or referrals\n\nIf you spot a fake admin or if you are not sure: please inform an admin in the official PRCY channels. 🔎\n\nAlso: please be warned about other users contacting you in DM to fish for your private information or offer you deals, services or to trade.❗️🚫\n\nDo not engage with them and please report them to a PRCY admin so we can take care of the situation and keep our community safe. \n\nAgain, watch out for fake links. ONLY follow links given by admins in our official channels!\n\nBe safe! 🙏</b>'

const supporttext = "If you need any Tech Support, please join: https://t.me/prcySupport\nFor Masternode Support, please join: https://t.me/PRCY_MN_Support"

//Function to spark conversation, remind users about scammers, keeping coins on exchanges, etc.
function remindUsers() {
  let chances = Math.floor(Math.random() * 11); // returns a random integer from 0 to 10
  var reminderresponses = ["Do not store your crypto on any exchanges. Do your trading and save them in your own wallet with your own key", "Be safe on TG and remember PRCY admins will never DM you asking for personal information, your PRCY holdings etc. Always check handles!", "Set your TG phone number visibility to 'nobody' in the settings.", "If you get 'account suspended' on our Twitter account you need to clear the app data from your phone settings section.", "Do not keep your crypto on exchanges."]; // responses to choose from
  var reminderresponse = reminderresponses[Math.floor(Math.random() * reminderresponses.length)]; // pick random response from above
  if (chances < 5) bot.telegram.sendMessage("@prcycoinofficial", "Friendly PRCY reminder: " + reminderresponse); //if chances is less than 5, send message to Official
  if (chances > 5) bot.telegram.sendMessage("@prcylounge", "Friendly PRCY reminder: " + reminderresponse); //if chances is greater than 5, send message to Lounge
}

//Timer - currently not set
//setInterval(remindUsers, 3600000); //1hr

//Start command
bot.start((ctx) => ctx.reply("Hello! Welcome to the PRCY Coin Bot. Feel free to start by entering /help to see all available commands."));

//Help command - listing all commands for user
bot.help((ctx) => ctx.replyWithHTML("Hello! Welcome to the PRCY Coin Bot.\n\nBelow are a list of all the commands:\n/bootstrap - Link to BootStrap\n/coinmarketcap - Is PRCY listed on CoinMarketCap?\n/exchanges - What exchanges is PRCY coin on?\n/explorer - Link to Explorer\n/faq - Other Questions?\n/finance_report - Link to the PRCY Coin Q1 Financial Report\n/gifparty - Used for fun, invite people to lounge for gif party\n/github - Link to GitHub\n/help - List all commands\n/markets - What exchanges is PRCY coin on?\n/masternodes - General Masternode description and instructions\n/mnscripts - Link to Masternode Scripts\n/passive_income - Link to Passive Income Opportunities\n/poaminer - PoA Miner Instructions\n/retention - What is the Retention Plan?\n/roadmap - Latest Roadmap\n/rules - Chat Rules\n/scammers - Give our community a scammer warning\n/socialmedia - Social Media Accounts\n/staking - Can you stake PRCY Coin?\n/supply - What is the current supply of PRCY Coin?\n/team - Who is on the PRCY Coin team?\n/wallets - Currently Supported Wallets\n/whitepaper - Latest Whitepaper"));

//Welcome command - a quick welcome, not used as much, mark for possible removal/add admin only
bot.command('welcome', ctx => {
  ctx.replyWithHTML("<b>Welcome to the PRCY coin Official Chat Channel</b>\n\nMore information about PRCY coin can be found by visiting the Official website <a href='https://prcycoin.com/'>Official Website</a>\n\nOur Community Chat Rules\n\n▫️Please refrain from using foul/unpleasant language and be kind to community members.\n▫️Do not spread FUD. And do not spread DAPS FUD. It’s not our business, we are #PRCY\n▫️Do not post inappropriate content or personal links of interest.\n▫️No shilling will be permitted.\n▫️This is an English only chat, so please use English.\n▫️Avoid discussion of illegal activities.\n▫️Do not harass Community Managers. They are provided as a courtesy to the PRCY coin community.\n\n🤦‍♂️ Violation of chat rules will result in restrictions without warning.\n\n🙏 We strive for a friendly and positive chat experience!\n\n💁‍♂️ For any support issues please contact the team directly we are unable to help, verify, or fix any issues via public Telegram.\n\n🤥 Be highly cautious of members that private message you, we don't handle support tickets in public Telegram, admins will never ask for money, we will only handle support requests through the <a href='https://prcycoin.com/'>Official Website</a>  / <a href='https://t.me/prcySupport'>Telegram Support Channel</a> / <a href='https://t.me/PRCY_MN_Support'>Masternode Support Channel</a> and will never contact you first.");
  ctx.deleteMessage();
});

//Rules command = display rules for official or lounge, determined by chatid
bot.command('rules', ctx => {
  let chatid = ctx.message.chat.id;
  //If not Lounge (ID below), give official rules
  if (chatid != "-1001367088314") {
    ctx.replyWithHTML("<b>Chat Rules</b>\nWe will appreciate your cooperation in keeping our channel a clean and spam free environment.\nWe encourage respectful and constructive spreading of our message.\n1. No spam links (referrals/advertisements/etc)\n2. No talking/shilling for outside projects\n3. No gifs/memes/videos\n4. No hate speech\n5. No posts about price/predictions/moons/lambos/etc.\n\n<b>Please use this room for less restricted chat about price discussion, chart watching, buy/sell walls and such:</b>\n@prcylounge\n<b>Thank you!</b>");
    ctx.deleteMessage();
  }
  //If Lounge (ID below), give Lounge rules
  if (chatid == "-1001367088314") {
    ctx.replyWithHTML("<b>Welcome to PRCY Lounge!</b>\nPlease keep conversations about price discussion, chart watching, buy/sell walls and such here.\n\nThis room will have some very simple rules to follow with the normal rules we have:\n\n<b>Do's:</b>\n- General non-PRCY related discussions are allowed\n- PRCY market price discussions are allowed\n- GIFS and stickers are allowed in moderation, don't spam!\n- PRCY comparisons and discussions in relation to other privacy coins are allowed\n\n<b>Don'ts:</b>\n- Swearing/insults/trolling/flaming/baiting are not allowed\n- Discussing other projects or channels is not allowed\n- Spreading FUD or misinformation is not allowed\n- Advertising or recruiting members is not allowed\n- NSFW/18+ content is not allowed (keep it PG-13)\n\nPlease keep it friendly and fun, and follow the admin's instructions.\nThe admins are reasonable and will act in a fair manner, but there are boundaries. Not following the rules or the admin's instructions will result in a mute or a (perma)ban.\n\nNow with that out of the way and without further ado: enjoy your stay in the PRCY Lounge and have fun!");
    ctx.deleteMessage();
  }
});

//Newsletter command - provide latest newsletter link and subcription link
bot.command('newsletter', ctx => {
  ctx.replyWithHTML("Our newsletter summarizes all our updates for you\n\nThis week's newsletter: " + newsletterlink + "\n\n<b>Subscribe for future updates:</b> https://www.getrevue.co/profile/prcycoin");
  ctx.deleteMessage();
});

//Exchanges command - list available exchanges
bot.command('exchanges', ctx => {
  ctx.replyWithHTML(exchangetext);
  ctx.deleteMessage();
});

//Markets command - list available exchanges (some users would use this command instead, easy enough to add)
bot.command('markets', ctx => {
  ctx.replyWithHTML(exchangetext);
  ctx.deleteMessage();
});

//Wallets command - list available wallets
bot.command('wallets', ctx => {
  ctx.replyWithHTML('Question: What wallets currently support PRCY Coin?\n\nAnswer: We currently recommend our desktop wallet which can be downloaded for Windows, Mac and Linux here: https://prcycoin.com/wallets/\n\nWe also have the Web Wallet at: https://wallet.prcycoin.com\n\nMobile Wallets:\nPRCY Mobile: Android: https://play.google.com/store/apps/details?id=com.prcy.wallet\niOS: https://apps.apple.com/app/prcy-coin-wallet/id1564273550\nRapids Mobile Wallet: Android: https://play.google.com/store/apps/details?id=io.rapids.network.wallet\niOS: https://apps.apple.com/us/app/rapids-wallet/id1485755628\n\nWrapped PRCY can be used on:\nTrust Wallet\nAndroid: https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp\niOS: https://apps.apple.com/app/apple-store/id1288339409\n\nGuide to add Wrapped PRCY to Trust Wallet: https://prcycoin.com/knowledge-base/wallets/how-to-add-wrapped-prcy-wprcy-bprcy-to-trust-wallet/');
  ctx.deleteMessage();
});

//Wallets command - list available wallets
bot.command('multisigwallets', ctx => {
  ctx.replyWithHTML("Question: What Multisig wallets currently support PRCY Coin?\n\nAnswer: We currently recommend our desktop wallet which can be downloaded for Windows, Mac and Linux here: https://prcycoin.com/multisig-wallets/");
  ctx.deleteMessage();
});

//Coinmarketcap command - link to CoinMarketCap
bot.command('coinmarketcap', ctx => {
  ctx.replyWithHTML("Question: Is PRCY listed on CoinMarketCap??\n\nAnswer: Yes, we are listed on Coin Market Cap - the link is: https://coinmarketcap.com/currencies/prcy-coin/");
  ctx.deleteMessage();
});

//Coingecko command - link to CoinGecko
bot.command('coingecko', ctx => {
  ctx.replyWithHTML("Question: Is PRCY listed on CoinGecko??\n\nAnswer: Yes, we are listed on CoinGecko - the link is: https://www.coingecko.com/en/coins/prcy-coin/");
  ctx.deleteMessage();
});

//Roadmap command - link to roadmap
bot.command('roadmap', ctx => {
  ctx.replyWithHTML("Question: Where is the PRCY roadmap?\n\nAnswer: You can view the most up to date roadmap at: https://prcycoin.com/roadmap/");
  ctx.deleteMessage();
});

//Whitepaper command - link to Whitepaper
bot.command('whitepaper', ctx => {
  ctx.replyWithHTML("Question: Where is the PRCY whitepaper?\n\nAnswer: You can view the full and most up to date whitepaper at: https://prcycoin.com/whitepaper");
  ctx.deleteMessage();
});

//Staking command - explain staking can't be done until mainnet as we are ERC-20
bot.command('staking', ctx => {
  ctx.replyWithHTML("Question: Can you stake PRCY Coin?\n\nAnswer: Yes, you can stake with our desktop QT wallet. A minimum of 2.5k (2,500) PRCY is required.");
  ctx.deleteMessage();
});

//Coinsbit Staking text - \n\nWe have also made an awesome deal for you.\n\nCoinsbit Staking Pool - https://coinsbit.io/staking-pool/plan/503\n\n1. 7.50% after 30 days.\n2. Accrual – daily block for withdrawal 2 weeks\n3. Minimum deposit – 7500 #PRCY\n4. No maximum deposit

//Retention command - explain staking can't be done until mainnet as we are ERC-20
bot.command('retention', ctx => {
  ctx.replyWithHTML("Question: What is the Retention Plan? How do I participate?\n\nAnswer: You can read the details of the first milestone of the retention plan here: https://retention.prcycoin.com/");
  ctx.deleteMessage();
});

//FAQ command - link to FAQ
bot.command('faq', ctx => {
  ctx.replyWithHTML("Any other questions you can view our FAQ at: https://prcycoin.com/faq or ask in the channels.");
  ctx.deleteMessage();
});

//Socialmedia command - link to all socials, might require updating - Jan 30/2019
bot.command('socialmedia', ctx => {
  ctx.replyWithHTML("<b>Official Social Media Accounts</b>\nTwitter: https://twitter.com/PRCYcoin\nFacebook Page: https://www.facebook.com/Prcycoin-101534778505838/\nInstagram: https://www.instagram.com/prcycoin/\n\n<b>Chats</b>\nTelegram Official: @prcycoinofficial\nTelegram Updates: @prcyupdate\nTelegram Tech Support: @prcySupport\nTelegram Lounge (Price discussion/spam): @prcylounge\nDiscord: https://prcycoin.com/discord\n\n<b>Blogs/News</b>\nPRCY Blog: https://prcycoin.com/blog/\nReddit: https://www.reddit.com/r/PRCYCoin/");
  ctx.deleteMessage();
});

//Tech command - a quick welcome to tech, not used as much, mark for possible removal/add admin only
bot.command('tech', ctx => {
  ctx.replyWithHTML("Welcome to the PRCY Tech Support room!\n\nThis is the support room for all your (technical) questions related to PRCY. 🛠\n\nIf you have any questions, do not hesitate to ask them here. Our admins will do their best to answer them and help you with your issues!");
  ctx.deleteMessage();
});

//Tech command - send user to Support
bot.command('techsupport', ctx => {
  ctx.replyWithHTML(supporttext);
  ctx.deleteMessage();
});

//Support command - send user to Support
bot.command('support', ctx => {
  ctx.replyWithHTML(supporttext);
  ctx.deleteMessage();
});

//Lounge command - gentle reminder to keep price discussion to Lounge
bot.command('lounge', ctx => {
  ctx.replyWithHTML("Please keep price discussion to our Lounge :) @prcylounge");
  ctx.deleteMessage();
});

//Masternodes command - Quick write-up of masternodes and how they work
bot.command('masternodes', ctx => {
  ctx.replyWithHTML('PRCY Masternodes are required to have 5,000 PRCY collateral, a dedicated IP address, and be able to run 24 hours a day without more than a 1-hour connection loss. Masternodes get paid using the See-Saw method. For offering their services to the network, Masternodes are paid a portion of block rewards to maintain the ecosystem. This payment will be in PRCY and it serves as a form of passive income to the Masternode owners\n\nTo make things easier, we have partnered with a few Masternode services as well where  there is no need to run your wallet 24/7.\n\nMasternode Hosting:\n<a href="https://higlan.com/">Higlan</a>\n<a href="https://masternodes.biz/cryptocurrency/PRCY">Masternodes.biz</a>\n<a href="https://pecuniaplatform.io/ref/f8556ab0">Pecunia Platform</a>');
  ctx.deleteMessage();
});

//Vote command - links to votes PRCY is in, may change frequently or not be needed at times
bot.command('vote', ctx => {
  //ctx.replyWithHTML("Please don't forget to vote for PRCY in this Twitter vote!\n\nYou can vote at: https://twitter.com/CryptoBelgie/status/1330927357130133510");
  ctx.deleteMessage();
});

//Promofriday command - information and link to Promo Friday materials
bot.command('promofriday', ctx => {
  //ctx.replyWithHTML('<b>PRCY Promo Friday</b>\n\PRCY community, today is #PROMOFRIDAY! If you wish to create a post on social media related to PRCY then add $PRCY #PRCY & #PROMOFRIDAY.\n\nHere are some <a href="https://drive.google.com/drive/u/0/folders/11t-q7E32hYzxQzKqnx-FhpAqlOQiu-yp">PRCY Approved Graphics</a> - https://drive.google.com/drive/u/0/folders/11t-q7E32hYzxQzKqnx-FhpAqlOQiu-yp');
  ctx.deleteMessage();
});

//Giveaway command - Used for various giveaways/competitions, comment out reply when not in use
bot.command('giveaway', ctx => {
  //ctx.replyWithPhoto({url: 'https://d36eyd5j1kt1m6.cloudfront.net/user-assets/116626/lnB0ekcTLfr3Q2sy/prcy-newsletter.jpg'}, {caption: 'Remember to enter our Monocero Giveaway!\n\nEnter at: https://gleam.io/rs2nY/prcy-multiverse-monocero-giveaway'})
  ctx.deleteMessage();
});

//Gifparty command - Used for fun, invite people to lounge for gif party
bot.command('gifparty', ctx => {
  ctx.deleteMessage();
  var gifpartyresponses = ["Meet me in the @prcylounge for a good old fashioned GIF party!", "Do you like a good GIF party? Meet me in the @prcylounge!"];
  var gifpartyresponse = gifpartyresponses[Math.floor(Math.random() * gifpartyresponses.length)];
  ctx.replyWithHTML(gifpartyresponse);
});

//Scammers command - Warn about scammers
bot.command('scammers', ctx => {
  ctx.deleteMessage();
  ctx.replyWithHTML(scammertext)
});

//Team command - link to PRCY team
bot.command('team', ctx => {
  ctx.replyWithHTML("Check out the PRCY Team page to see our list of team members: https://prcycoin.com/our-team");
  ctx.deleteMessage();
});

//Linuxwallet command - info/help for Linux Wallet
bot.command('linuxwallet', ctx => {
  ctx.replyWithHTML("You can download the latest Linux wallet at: https://github.com/PRCYCoin/PRCYCoin/releases/latest\n\nIf you need any help, feel free to join @prcySupport");
  ctx.deleteMessage();
});

//Windowswallet command - info/help for Windows Wallet
bot.command('windowswallet', ctx => {
  ctx.replyWithHTML("You can download the latest Windows wallet at: https://github.com/PRCYCoin/PRCYCoin/releases/latest\n\nIf you need any help, feel free to join @prcySupport");
  ctx.deleteMessage();
});

//Macwallet command - info/help for Mac Wallet
bot.command('macwallet', ctx => {
  ctx.replyWithHTML("You can download the latest Mac wallet at: https://github.com/PRCYCoin/PRCYCoin/releases/latest\n\nIf you need any help, feel free to join @prcySupport");
  ctx.deleteMessage();
});

//PoAMiner command - info/help for PoA Miner
bot.command('poaminer', ctx => {
  ctx.replyWithHTML("You can download the latest PoA Miner at: https://github.com/PRCYCoin/POA-Miner/releases/tag/latest\n\nSetup instructions can be found at https://prcycoin.com/PoAMiner\n\nIf you need any help, feel free to join @prcySupport");
  ctx.deleteMessage();
});

//Bootstrap command - info and link to bootstrap
bot.command('bootstrap', ctx => {
  ctx.replyWithHTML('The latest BootStrap is always available from: https://bootstrap.prcycoin.com/\n\nPlease remember to backup your wallet.dat and Mnemonic Recovery phrase before running the BootStrap!\n\nhttps://prcycoin.com/knowledge-base/wallets/how-to-apply-bootstrap/\n\nVideo guide: https://www.youtube.com/watch?v=b6iM4r21hAM');
  ctx.deleteMessage();
});

//Update command - info and link to update
bot.command('update', ctx => {
  ctx.replyWithHTML("How to update your wallet to v" + walletversion + " 🤔💡\n\n1️⃣ Make sure you've backed up your wallet.dat file and written down your Mnemonic Phrase, then close the wallet.\n\n2️⃣ Windows: Go to where you have prcycoin-qt.exe in Windows Explorer\n\nMac: Go to Macintosh HD/⁨Users/⁨Username/⁨Library/⁨Applications/⁨PRCYcoin⁩\n\n3️⃣ Download the v" + walletversion + " wallet from here: https://github.com/PRCYCoin/PRCYCoin/releases and open the zip file\n\n4️⃣ Copy the prcycoin-qt.exe/prcycoin-qt file and paste or place it over your current file.\n\n5️⃣ When asked if you want to replace the old file, click Yes.\n\nThat's it! Now you can open your wallet like normal and it is now running the new version. 🥳👍");
  ctx.deleteMessage();
});

//MNScripts command - command to share the Masternode Scripts
bot.command('mnscripts', ctx => {
  ctx.replyWithHTML('Looking for our Masternode scripts?\nThey are all available here: https://github.com/PRCYCoin/Scripts/tree/master/Masternodes\n\nFor a single Masternode install:https://github.com/PRCYCoin/Scripts/blob/master/Masternodes/Install.sh');
  ctx.deleteMessage();
});

//Cheers command - fun cheers command
bot.command('cheers', ctx => {
  ctx.replyWithHTML('Cheers mate!');
  ctx.deleteMessage();
});

//Supply command - links to supply
bot.command('supply', ctx => {
  ctx.replyWithHTML("Question: What is the current supply of PRCY Coin?\n\nAnswer: The current supply can always be viewed here: https://explorer.prcycoin.com/api/getsupply");
  ctx.deleteMessage();
});

//Freemarket command
bot.command('freemarket', ctx => {
  ctx.replyWithHTML("Somebody sold, and somebody bought. Have to love a free market!");
  ctx.deleteMessage();
});

//Explorer command - links to Explorer
bot.command('explorer', ctx => {
  ctx.replyWithHTML("Question: What is the link to the PRCY Coin Explorer?\n\nAnswer: The Explorer is located here: https://explorer.prcycoin.com/\n\nBackup Explorer: https://backup.prcycoin.com/");
  ctx.deleteMessage();
});

//Github command - links to Github
bot.command('github', ctx => {
  ctx.replyWithHTML("Question: What is the link to the PRCY Coin GitHub?\n\nAnswer: The PRCY Coin GitHub is located at: https://github.com/PRCYcoin/\n\nGitHub page: https://prcycoin.github.io/PRCYCoin/");
  ctx.deleteMessage();
});

//Passive_income command - links to Passive Income Opportunities
bot.command('passive_income', ctx => {
  ctx.replyWithHTML("Question: Does PRCY Coin have any Passive Income Opportunities?\n\nAnswer: Yes, we do! You can check them all out at: https://prcycoin.com/category/passive-incomes-opportunities/");
  ctx.deleteMessage();
});

//Finance_report command - links to Financial Report
bot.command('finance_report', ctx => {
  ctx.replyWithHTML("Question: What is the link to the PRCY Coin Q1 Financial Report?\n\nAnswer: The PRCY Coin Q1 Financial Report is located at: https://prcycoin.com/wp-content/uploads/2021/02/1ST-QT-2021-FINANCIAL-REPORT-PRCY.pdf");
  ctx.deleteMessage();
});

//International command - links to International channels
bot.command('international', ctx => {
  ctx.replyWithHTML("PRCY International Telegram Groups\n\nNederlands / Belgium: @PrcycoinNLBe\nPolish: @PRCYcoinPL\nRussia: @PRCYcoinRU\nTurkish: @prcycointurkey");
  ctx.deleteMessage();
});

// Raspberry command -  links to  Raspberry Pi channel
bot.command('raspberry', ctx => {
  ctx.replyWithHTML("Question: Does PRCY Coin have a Raspberry Pi channel?\n\nAnswer: Yes, you can join the channel here - @prcyraspberry");
  ctx.deleteMessage();
});

//BBQ command - Fun BBQ command
bot.command('bbq', ctx => {
  ctx.replyWithAnimation({ url: 'https://prcycoin.com/wp-content/uploads/2021/05/bbq.mp4' }, { caption: 'Time for the BBQ!\nhttps://www.indrapura.nl/'})
  ctx.deleteMessage();
});

//Bridge command - Bridge information
bot.command('bridge', ctx => {
  ctx.replyWithHTML("Question: How do I bridge my PRCY to wPRCY/bPRCY and vice versa?\n\nAnswer: You can bridge between PRCY/wPRCY/bPRCY at:\nPRCY Bridge website: https://bridge.prcycoin.com\nor\nTXBit.io: https://txbit.io/?r=13747\n\nCheck out our guide for instructions: https://prcycoin.com/knowledge-base/wallets/how-to-bridge-prcy-wprcy-bprcy/");
  ctx.deleteMessage();
});

//Wrapped command - Wrapped information
bot.command('wrapped', ctx => {
  ctx.replyWithHTML("Question: What are the Wrapped PRCY (wPRCY/bPRCY) Contract Addresses?\n\nAnswer:\nETH Contract: https://etherscan.io/token/0xdfc3829b127761a3218bfcee7fc92e1232c9d116\n\nTrade:\n<b>UniSwap:</b> https://app.uniswap.org/#/swap?outputCurrency=0xdfc3829b127761a3218bfcee7fc92e1232c9d116\n<b>SushiSwap:</b> https://app.sushi.com/swap?outputCurrency=0xdfc3829b127761a3218bfcee7fc92e1232c9d116\n\nCharts: https://info.uniswap.org/#/tokens/0xdfc3829b127761a3218bfcee7fc92e1232c9d116\nhttps://analytics.sushi.com/tokens/0xdfc3829b127761a3218bfcee7fc92e1232c9d116\n\nBSC Contract: https://bscscan.com/token/0xdfc3829b127761a3218bfcee7fc92e1232c9d116\n\nTrade:\nPancakeSwap: https://exchange.pancakeswap.finance/#/swap?outputCurrency=0xdfc3829b127761a3218bfcee7fc92e1232c9d116\nSushiSwap: https://app.sushi.com/swap?outputCurrency=0xdfc3829b127761a3218bfcee7fc92e1232c9d116\nApeSwap: https://dex.apeswap.finance/#/swap?outputCurrency=0xdfc3829b127761a3218bfcee7fc92e1232c9d116\n\nCharts:\nhttps://charts.bogged.finance/?token=0xdFC3829b127761a3218bFceE7fc92e1232c9D116\nhttps://poocoin.app/tokens/0xdfc3829b127761a3218bfcee7fc92e1232c9d116\n\nCheck out our guide to Bridge to/from Wrapped PRCY: https://prcycoin.com/knowledge-base/wallets/how-to-bridge-prcy-wprcy-bprcy");
  ctx.deleteMessage();
});

//Bridge command - Bridge information
bot.command('comparison', ctx => {
  ctx.replyWithHTML("Question: Is there a comparison chart for PRCY and other privacy coins?\n\nAnswer: Yes, we have created one at https://comparison.prcycoin.com");
  ctx.deleteMessage();
});

//Autobootstrap command - Autobootstrap information
bot.command('autobootstrap', ctx => {
  ctx.replyWithHTML("Question: Where is the Auto Bootstrap Tool?\n\nAnswer: It can be downloaded at https://prcycoin.com/auto-bootstrap/");
  ctx.deleteMessage();
});

//Listen for name changes
bot.hears([/changed name from/i, /changed username from/i, /and username from/i], (ctx) => {
  ctx.telegram.forwardMessage(-1001217171305, ctx.message.chat.id, ctx.message.message_id);
  ctx.deleteMessage();
});

//Hello bot, use random response from our array
bot.hears(/hello bot/i, (ctx) => {
  var hellobotresponses = ["Hello! Welcome to PRCY!", "Howdy! Welcome to PRCY!", "Hi! Welcome to PRCY!", "Hey! Welcome to PRCY!"];
  var hellobotresponse = hellobotresponses[Math.floor(Math.random() * hellobotresponses.length)];
  ctx.replyWithHTML(hellobotresponse);
});

//Good bot, use random response from our array
bot.hears(/good bot/i, (ctx) => {
  var goodbotresponses = ["Thanks, I appreciate you.", "Glad to be of service.", "Ahww thank you, you're making me blush!", "Gosh, thank you... Seems like I'm doing something right after all!", "Yeah yeah I'm a bad bot and I'm getting s*** every time for doing something stupid...  Oh Wait... I'm a good bot? You're the best!"];
  var goodbotresponse = goodbotresponses[Math.floor(Math.random() * goodbotresponses.length)];
  ctx.replyWithHTML(goodbotresponse);
});

//Bad bot, use random response from our array
bot.hears(/bad bot/i, (ctx) => {
  var badbotresponses = ["Aw, gosh, I didn't mean it!", "Sorry! Please don't tell my handler!", "ERROR! Initiating reboot sequence...", "Kiss my shiny metal PRCY", "Think that's bad? Wait 'til Combot comes out, then you have trouble."];
  var badbotresponse = badbotresponses[Math.floor(Math.random() * badbotresponses.length)];
  ctx.replyWithHTML(badbotresponse);
});

//Listen for Spam channel(s)
bot.hears([/kryptokompassDE/i, /PrcyUnofficialChannel/i, /pump signal/i, /McAfees Official Alliance/i, /TheChimeraSyndicate/i, /Krypto Freunde aufgepasst/i, /joinchat/i, /miningwithextractbot/i, /parazmat/i, /Binance Competition/i, /fxprofitlord/i, /Mytoken/i, /✅Invest/i, /@PRCY_RUS_MOONSPAM/i, /Goood! Google!/i, /Wooow! Google!/i, /tel_modern/i, /proxy.zedfilter.taggram/i, /emtiaz5star/i, /Trade_santos/i], (ctx) => {
  let userid = ctx.message.from.id;
  if (ctx.from._is_in_admin_list) {
    // admin, let it slide
  } else {
    ctx.deleteMessage();
    ctx.kickChatMember(userid);
  }
});

//Listen for GeckoBot responding to all /commands
bot.hears([/Oops, something went wrong... Try another command like/i], (ctx) => {
  ctx.deleteMessage();
});

//Listen for issues, requests, suggestion mentions
bot.hears([/issues/i, /requests/i, /suggestion/i], (ctx) => {
  ctx.telegram.forwardMessage(-1001191950899, ctx.message.chat.id, ctx.message.message_id);
});

// Delete .scr, .pdf, .exe, .pif, .com, .url, .rar posts
bot.on('document', (ctx) => {
  if (ctx.from._is_in_admin_list) {
    // admin, let it slide
  } else {
    let userid = ctx.message.from.id;
    let filetype = ctx.message.document.file_name;
    if (filetype.endsWith(".scr")) {
      ctx.replyWithHTML(ctx.from.username + ", Please don't post .scr files. Thanks for your cooperation.");
      ctx.deleteMessage();
    }
    if (filetype.endsWith(".pdf")) {
      ctx.replyWithHTML(ctx.from.username + ", Please don't post .pdf files. Thanks for your cooperation.");
      ctx.deleteMessage();
    }
    if (filetype.endsWith(".exe")) {
      ctx.replyWithHTML(ctx.from.username + ", Please don't post .exe files. Thanks for your cooperation.");
      ctx.deleteMessage();
    }
    if (filetype.endsWith(".pif")) {
      ctx.replyWithHTML(ctx.from.username + ", Please don't post .pif files. Thanks for your cooperation.");
      ctx.deleteMessage();
    }
    if (filetype.endsWith(".com")) {
      ctx.replyWithHTML(ctx.from.username + ", Please don't post .com files. Thanks for your cooperation.");
      ctx.deleteMessage();
    }
    if (filetype.endsWith(".url")) {
      ctx.replyWithHTML(ctx.from.username + ", Please don't post .url files. Thanks for your cooperation.");
      ctx.deleteMessage();
    }
    if (filetype.endsWith(".rar")) {
      ctx.replyWithHTML(ctx.from.username + ", Please don't post .rar files. Thanks for your cooperation.");
      ctx.deleteMessage();
    }
    //ctx.kickChatMember(userid);
  }
})

//Admins command - Provide a list of admin only commands
bot.command('admins', ctx => {
  if (ctx.from._is_in_admin_list) {
    ctx.replyWithHTML("<b>Current Admin Only Commands:</b>\n/price (not finished yet) - List price in BTC/USD/CAD/Volume\n/welcome - Welcome user to room, soon to be smarter\n/loungerules - list lounge rules, to be edited as well\n/tech - list tech welcome/rules, to be edited as well");
  } else {
  }
});

//Add a bit of a swear filter
bot.hears([/fuck/i], (ctx) => {
  let chatid = ctx.message.chat.id;
  if (ctx.from._is_in_admin_list) {
  } else {
    //If not Lounge (ID below), complain about swear mentions
    if (chatid != "-1001367088314") {
      ctx.replyWithHTML(ctx.from.username + ", Please don't swear in our official channels. Thanks for your cooperation.");
      ctx.deleteMessage();
    }
  }
});

//Check for edited message scam posts
bot.on('edited_message', (ctx) => {
  //let chatid = ctx.message.chat.id;
  //let userid = ctx.message.from.id;
  if (ctx.from._is_in_admin_list) {
  } else {
    if (ctx.editedMessage.photo) {
      //ctx.deleteMessage();
      //bot.kickChatMember(chatid, userid);
    }
    let msg = ctx.message;
    //If message contains link
    if (msg.includes = "tinyurl.com") {
      ctx.deleteMessage();
    }
    if (msg.includes = "bit.ly") {
      ctx.deleteMessage();
    }
  }
});

//Clear the command queue (helps prevent backlog when restarted)
bot.polling.offset = -1;

//Start polling
bot.launch();
