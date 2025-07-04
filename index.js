require('dotenv').config();
const Telegraf = require('telegraf');
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const rateLimit = require('telegraf-ratelimit')
const token = process.env.TELEGRAM_API_KEY || '';
const bot = new Telegraf(token, { username: 'PRCY_Coin_Bot' });
const axios = require('axios');

// Set limit to 1 message per 0.5 second (for those having fun with good bot/bad bot) - can be adjusted or removed if necessary
const limitConfig = {
  window: 500,
  limit: 1,
  onLimitExceeded: (ctx, next) => ctx.reply('Please slow down a bit... need some more grease!')
}
//bot.use(rateLimit(limitConfig))

bot.use(async (ctx, next) => {
  // Skip for non-group chats
  if(ctx.chat.id > 0) return next();

  try {
    // Get the ChatMember object for the user who sent the message
    const member = await ctx.getChatMember(ctx.from.id);

    if(member.status === 'administrator' || member.status === 'creator') {
      ctx.from._is_in_admin_list = true;
    } else {
      ctx.from._is_in_admin_list = false;
    }
  } catch (error) {
    console.log(error);
  }

  return next();
});

const walletversion = "2.0.0.6"
const officialID = "-1001251263614"
const loungeID = "-1001475331704"
const isBprcyStakingAvailable = false; // bPRCY staking options available?
const checkDex = false;

async function getUniqueFromAssets() {
  if (checkDex === false) return [];
  try {
    const response = await axios.get('https://api.privacydex.io/api/SwapRoutes', {
      headers: {
        accept: 'text/plain'
      }
    });

    if (response.status === 200) {
      const result = response.data.result;
      const uniqueFromAssets = new Set();

      result.forEach(route => {
        uniqueFromAssets.add(route.fromAsset);
      });

      return Array.from(uniqueFromAssets);
    } else {
      console.error('Failed to fetch data from the API.');
      return [];
    }
  } catch (error) {
    console.error('An error occurred:', error.message);
    return [];
  }
}

// Function to construct the exchanges text
async function getExchangesText() {
  const uniqueFromAssets = await getUniqueFromAssets();

  const dexcoins = uniqueFromAssets.length > 0 ? uniqueFromAssets.join(', ') : '';

  let exchangetext = `Question: What exchanges is PRivaCY Coin being traded on?\n\nAnswer:\nPRivaCY Coin is trading on:\n\nExchanges:\n`;

  if (uniqueFromAssets.length > 0) {
    exchangetext += `<a href="https://privacydex.io">PRivaCYDEX.io</a>: <b>No KYC / No Limits / No Trading Fees</b>\nTrading Pairs: ${dexcoins}\n\n`;
  }

  exchangetext += `<a href="https://nonkyc.io/?ref=64267adf8660a5f543741c6b/">NonKyc.io</a>: No KYC\nTrading Pairs: PRCY-USDT\n(You can also send bPRCY / pPRCY / tPRCY / wPRCY and trade 1:1 as PRCY)\n\n<a href="https://stakecube.net/">StakeCube</a>: No KYC\nTrading Pairs: PRCY-BTC / PRCY-USDT / PRCY-SCC\n\n<a href="https://dex-trade.com/refcode/pabavp">Dex-Trade</a>: No KYC\nTrading Pairs: PRCY-BTC / PRCY-USDT\nSwap directly between more than 200 different coins for PRCY\n\nAll current markets can be seen here: https://prcycoin.com/exchange\n\nNote: PRCY is not responsible for the coins you hold on an exchange.\n<b>Remember: not your keys, not your coins!</b>`;

  return exchangetext;
}

// Exchanges command - list available exchanges
bot.command('exchanges', async ctx => {
  const exchangetext = await getExchangesText();
  ctx.replyWithHTML(exchangetext);
  ctx.deleteMessage();
});

const donationtxt = ""

//Newsletter link
const newsletterlink = "https://www.getrevue.co/profile/prcycoin/issues/weekly-newsletter-of-prcy-coin-official-issue-1-471692"

//Scammer text
const scammertext = "<b>🚨 <u>Important Reminder</u> 🚨 Please BEWARE of scammers‼️\n\nThere might be admin impersonators, fake profiles, pages, websites and download links provided by scammers. ONLY follow links given in our official channels ❗️\n\n❌PRivaCY Coin Admins will not take the initiative to message you privately to solve problems.\n\n🔑Don't share confidential personal information in private chats, and don't make transactions of any kind at all.\n\n🧩Anyone that claims to be an admin and messages you first in a private message, is a SCAMMER.\n\n👉 Always verify Admins with admin tag.</b>"

const supporttext = "Question: What are the Support channels?\n\nAnswer:\nFor Tech Support, please join: @prcySupport\nFor Masternode Support, please join: @PRCY_MN_Support\nFor PoA Mining Support, please join: @PRCYMiners"

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
bot.start((ctx) => ctx.reply("Hello! Welcome to the PrivaCY Coin Bot. Feel free to start by entering /help to see all available commands."));

//Help command - listing all commands for user
bot.help((ctx) => ctx.replyWithHTML("Hello! Welcome to the PrivaCY Coin Bot.\n\nBelow are a list of all the commands:\n/autobootstrap - Link to Auto BootStrap Tool\n/bbq - Link to BBQ\n/bootstrap - Link to BootStrap\n/bridge - Link to PRCY bridge\n/coingecko - Is PRCY listed on CoinGecko?\n/coinmarketcap - Is PRCY listed on CoinMarketCap?\n/comparison - Link to Comparison Chart\n/dex - Link to PRivaCYdex.io and Pairs\n/exchanges - What exchanges is PrivaCY Coin on?\n/explorer - Link to Explorer\n/faq - Other Questions?\n/finance_report - Link to the PrivaCY Coin Q2 Financial Report\n/freemarket - People buy and sell\n/gamble - Gamble with PRCY\n/gifparty - Used for fun, invite people to lounge for gif party\n/github - Link to GitHub\n/help - List all commands\n/international - PRCY international channels\n/kingkabab - Link to buy kabab with PRCY\n/linuxwallet - Link to the linuxwallet\n/macwallet - Link to the macwallet\n/masternodes - General Masternode description and instructions\n/mnscripts - Link to Masternode Scripts\n/multisigwallets - Link to the multisigwallet\n/newsletter - Link to sign up for the newsletter\n/passive_income - Link to Passive Income Opportunities\n/plane - Pay with PRCY for a private jet\n/poaminer - PoA Miner Instructions\n/premine - Info about the premine\n/promo - Link to Promotional materials\n/raspberry - Link to the rapsberry pi channel\n/retention - What is the Retention Plan?\n/rewards - What are the staking rewards?\n/roadmap - Latest Roadmap\n/rules - Chat Rules\n/scammers - Give our community a scammer warning\n/shop - Link to PRCY Shop\n/socialmedia - Social Media Accounts\n/staking - Can you stake PrivaCY Coin?\n/supply - What is the current supply of PrivaCY Coin?\n/support - Need tech support?\n/team - Who is on the PrivaCY Coin team?\n/update - How to update your wallet\n/wallets - Currently Supported Wallets\n/whitepaper - Latest Whitepaper\n/windowswallet - Link to the windows wallet\n/wrapped - Wrapped contract adresses"));

//Welcome command - a quick welcome, not used as much, mark for possible removal/add admin only
bot.command('welcome', ctx => {
  ctx.replyWithHTML("<b>Welcome to the PRivaCY Coin Official Chat Channel</b>\n\nMore information about PrivaCY Coin can be found by visiting the Official website <a href='https://prcycoin.com/'>Official Website</a>\n\nOur Community Chat Rules\n\n▫️Please refrain from using foul/unpleasant language and be kind to community members.\n▫️Do not post inappropriate content or personal links of interest.\n▫️No shilling will be permitted.\n▫️This is an English only chat, so please use English.\n▫️Avoid discussion of illegal activities.\n▫️Do not harass Community Managers. They are provided as a courtesy to the PrivaCY Coin community.\n\n🤦‍♂️ Violation of chat rules will result in restrictions without warning.\n\n🙏 We strive for a friendly and positive chat experience!\n\n💁‍♂️ For any support issues please contact the team directly we are unable to help, verify, or fix any issues via public Telegram.\n\n🤥 Be highly cautious of members that private message you, we don't handle support tickets in public Telegram, admins will never ask for money, we will only handle support requests through the <a href='https://prcycoin.com/'>Official Website</a>  / <a href='https://t.me/prcySupport'>Telegram Support Channel</a> / <a href='https://t.me/PRCY_MN_Support'>Masternode Support Channel</a> and will never contact you first.");
  ctx.deleteMessage();
});

//Rules command = display rules for official or lounge, determined by chatid
bot.command('rules', ctx => {
  let chatid = ctx.message.chat.id;
  //If not Lounge (ID below), give official rules
  if (chatid != loungeID) {
    ctx.replyWithHTML("<b>Chat Rules</b>\nWe will appreciate your cooperation in keeping our channel a clean and spam free environment.\nWe encourage respectful and constructive spreading of our message.\n1. No spam links (referrals/advertisements/etc)\n2. No talking/shilling for outside projects\n3. No gifs/memes/videos\n4. No hate speech\n5. No posts about price/predictions/moons/lambos/etc.\n\n<b>Please use this room for less restricted chat about price discussion, chart watching, buy/sell walls and such:</b>\n@prcylounge\n<b>Thank you!</b>");
    ctx.deleteMessage();
  }
  //If Lounge (ID below), give Lounge rules
  if (chatid == loungeID) {
    ctx.replyWithHTML("<b>Welcome to PRivaCY Lounge!</b>\nPlease keep conversations about price discussion, chart watching, buy/sell walls and such here.\n\nThis room will have some very simple rules to follow with the normal rules we have:\n\n<b>Do's:</b>\n- General non-PRCY related discussions are allowed\n- PRCY market price discussions are allowed\n- GIFS and stickers are allowed in moderation, don't spam!\n- PRCY comparisons and discussions in relation to other privacy coins are allowed\n\n<b>Don'ts:</b>\n- Swearing/insults/trolling/flaming/baiting are not allowed\n- Discussing other projects or channels is not allowed\n- Spreading FUD or misinformation is not allowed\n- Advertising or recruiting members is not allowed\n- NSFW/18+ content is not allowed (keep it PG-13)\n\nPlease keep it friendly and fun, and follow the admin's instructions.\nThe admins are reasonable and will act in a fair manner, but there are boundaries. Not following the rules or the admin's instructions will result in a mute or a (perma)ban.\n\nNow with that out of the way and without further ado: enjoy your stay in the PRCY Lounge and have fun!");
    ctx.deleteMessage();
  }
});

//Newsletter command - provide latest newsletter link and subcription link
bot.command('newsletter', ctx => {
  ctx.replyWithHTML("Our newsletter summarizes all our updates for you\n\nThis week's newsletter: " + newsletterlink + "\n\n<b>Subscribe for future updates:</b> https://www.getrevue.co/profile/prcycoin");
  ctx.deleteMessage();
});

//Markets command - list available exchanges (some users would use this command instead, easy enough to add)
// bot.command('markets', ctx => {
//   ctx.replyWithHTML(exchangetext);
//   ctx.deleteMessage();
// });

//Wallets command - list available wallets
bot.command('wallets', ctx => {
  ctx.replyWithHTML('Question: What wallets currently support PrivaCY Coin?\n\nAnswer: We currently recommend our desktop wallet which can be downloaded for Windows, Mac and Linux here: https://prcycoin.com/wallets/\nThe Latest Version is: ' + walletversion + '\n\nWe also have the Web Wallet at: https://wallet.prcycoin.com\n\nMobile Wallets:\nPRivaCY Coin Mobile Web Wallet:\nAndroid: https://play.google.com/store/apps/details?id=com.wallet.prcy\niOS: https://apps.apple.com/app/privacy-coin-web-wallet/id1637664062\n\nWrapped PRCY can be used on:\nTrust Wallet\nAndroid: https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp\niOS: https://apps.apple.com/app/apple-store/id1288339409\n\nIncognito\nAndroid: https://play.google.com/store/apps/details?id=com.incognito.wallet\niOS: https://apps.apple.com/us/app/incognito-crypto-wallet/id1475631606\n\nGuide to add Wrapped PRCY to Trust Wallet: https://prcycoin.com/knowledge-base/wallets/how-to-add-wrapped-prcy-wprcy-bprcy-to-trust-wallet/');
  ctx.deleteMessage();
});

//Wallets command - list available wallets
bot.command('multisigwallets', ctx => {
  ctx.replyWithHTML("Question: What Multisig wallets currently support PrivaCY Coin?\n\nAnswer: We currently recommend our desktop wallet which can be downloaded for Windows, Mac and Linux here: https://prcycoin.com/multisig-wallets/");
  ctx.deleteMessage();
});

//Coinmarketcap command - link to CoinMarketCap
bot.command('coinmarketcap', ctx => {
  ctx.replyWithHTML("Question: Is PRivaCY listed on CoinMarketCap?\n\nAnswer: Yes, we are listed on Coin Market Cap - the link is: https://coinmarketcap.com/currencies/prcy-coin/");
  ctx.deleteMessage();
});

//Coingecko command - link to CoinGecko
bot.command('coingecko', ctx => {
  ctx.replyWithHTML("Question: Is PRivaCY listed on CoinGecko?\n\nAnswer: Yes, we are listed on CoinGecko - the link is: https://www.coingecko.com/en/coins/prcy-coin/");
  ctx.deleteMessage();
});

//Coinmarketleague command - link to CoinMarketLeague
bot.command('coinmarketleague', ctx => {
  ctx.replyWithHTML("Question: Is PRivaCY listed on CoinMarketLeague?\n\nAnswer: Yes, we are listed on CoinMarketLeague - the link is: https://coinmarketleague.com/coin/prcy-coin\n\nYou can vote daily to help PrivaCY Coin reach the top of their Mineable, PoS, and Privacy lists. Every vote counts!");
  ctx.deleteMessage();
});

//Roadmap command - link to roadmap
bot.command('roadmap', ctx => {
  ctx.replyWithHTML("Question: Where is the PRivaCY roadmap?\n\nAnswer: You can view the most up to date roadmap at: https://prcycoin.com/roadmap/");
  ctx.deleteMessage();
});

//Whitepaper command - link to Whitepaper
bot.command('whitepaper', ctx => {
  ctx.replyWithHTML("Question: Where is the PRivaCY whitepaper?\n\nAnswer: You can view the full and most up to date whitepaper at: https://prcycoin.com/whitepaper");
  ctx.deleteMessage();
});

//Staking command - explain staking options
bot.command('staking', ctx => {
  //Check if bprcyStakingOptions are enabled and add them to the message if they are
  const bprcyStakingOptions = isBprcyStakingAvailable
    ? "\n\nOr earn <b>bPRCY</b> by staking <b>SWAP</b>\n<b><u>bPRCY Coin</u></b>: <a href='https://safeswap.online/safeearn/bprcy'>SafeSwap.online</a>" //Text to add if bPRCY staking is available
    : "";

  ctx.replyWithHTML(`Question: What are the options for PRivaCY Staking?\n\nAnswer:\nYou can stake PRivaCY Coin with our desktop QT wallet. A minimum of 2.5k (2,500) PRCY is required.\n\nWe also have Staking Pool option(s) below:\n<b><u>PRivaCY Coin:</u></b>\n<a href='https://stakecube.net'>StakeCube.net</a>${bprcyStakingOptions}\n\nYou can view all of our Staking Options at https://staking.prcycoin.com`);
  ctx.deleteMessage();
});

//Coinsbit Staking text - \n\nWe have also made an awesome deal for you.\n\nCoinsbit Staking Pool - https://coinsbit.io/staking-pool/plan/503\n\n1. 7.50% after 30 days.\n2. Accrual – daily block for withdrawal 2 weeks\n3. Minimum deposit – 7500 #PRCY\n4. No maximum deposit

//Retention command - explain staking can't be done until mainnet as we are ERC-20
bot.command('retention', ctx => {
  ctx.replyWithHTML("Question: What is the Retention Plan? How do I participate?\n\nAnswer: You can read the details of the Retention Plan here: <a href='https://retention.prcycoin.com/'>Retention Plan</a>");
  ctx.deleteMessage();
});

//FAQ command - link to FAQ
bot.command('faq', ctx => {
  ctx.replyWithHTML("Any other questions you can view our FAQ at: https://prcycoin.com/knowledge-base/ or ask in the channels.");
  ctx.deleteMessage();
});

//Socialmedia command - link to all socials, might require updating - Jul 8-21
bot.command('socialmedia', ctx => {
  ctx.replyWithHTML("<b>Official Social Media Accounts</b>\n<a href='https://twitter.com/PRCYcoin'>PRivaCY Coin Twitter</a>\n<a href='https://t.me/PRCYsocialmediachannel'>PRivaCY Coin Social Media Army</a>\n<a href='https://www.youtube.com/c/PRCYCoin'>PRivaCY Coin Youtube</a>\n<a href='https://discord.prcycoin.com'>PRivaCY Coin Discord</a>\n\n<b>Blogs/News</b>\n<a href='https://prcycoin.com/news/'>PRivaCY Coin News</a>\n<a href='https://www.reddit.com/r/PRCYCoin/'>PRivaCY Coin Reddit</a>\n<a href='https://linktr.ee/PRivaCYcoin'>PRivaCY Coin Linktree</a>");
  ctx.deleteMessage();
});

//Tech command - a quick welcome to tech, not used as much, mark for possible removal/add admin only
bot.command('tech', ctx => {
  ctx.replyWithHTML("Welcome to the PRivaCY Tech Support room!\n\nThis is the support room for all your (technical) questions related to PRCY. 🛠\n\nIf you have any questions, do not hesitate to ask them here. Our admins will do their best to answer them and help you with your issues!");
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

//Masternodes command - Quick write-up of masternodes and how they work
bot.command('masternodes', ctx => {
  ctx.replyWithHTML('PRivaCY Masternodes are required to have 5,000 PRCY collateral, a dedicated IP address, and be able to run 24 hours a day without more than a 1-hour connection loss. Masternodes get paid using the See-Saw method. For offering their services to the network, Masternodes are paid a portion of block rewards to maintain the ecosystem. This payment will be in PRCY and it serves as a form of passive income to the Masternode owners\n\nTo make things easier, we have partnered with a few Masternode services as well where  there is no need to run your wallet 24/7.\n\nMasternode Hosting:\n<a href="https://higlan.com/">Higlan</a>\n<a href="https://masternodes.biz/cryptocurrency/PRCY">Masternodes.biz</a>\n<a href="https://pecuniaplatform.io/ref/f8556ab0">Pecunia Platform</a>');
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
  ctx.replyWithPhoto({ url: 'https://prcycoin.com/wp-content/uploads/2021/08/giveaway.jpg' }, { caption: 'Remember to enter our recent Giveaway!\n\nEnter at: https://givelab.com/IfDbN1/prcy-coin-giveaway'})
  ctx.deleteMessage();
});

//Gifparty command - Used for fun, invite people to lounge for gif party
bot.command('gifparty', ctx => {
  ctx.deleteMessage();
  var gifpartyresponses = ["Meet me in the @prcylounge for a good old fashioned GIF party!", "Do you like a good GIF party? Meet me in the @prcylounge!"];
  var randomgifpartyresponse = gifpartyresponses[Math.floor(Math.random() * gifpartyresponses.length)];
  ctx.replyWithHTML(randomgifpartyresponse);
});

//Rainparty command - Used for fun, invite people to lounge for rain party
bot.command('rainparty', ctx => {
  ctx.deleteMessage();
  var rainpartyresponses = ["Meet me in the @prcylounge for a good old fashioned Rain party!", "Do you like to make it rain? Meet me in the @prcylounge!"];
  var randomrainpartyresponse = rainpartyresponses[Math.floor(Math.random() * rainpartyresponses.length)];
  ctx.replyWithHTML(randomrainpartyresponse);
});

//Scammers command - Warn about scammers
bot.command('scammers', ctx => {
  ctx.deleteMessage();
  ctx.replyWithHTML(scammertext)
});

//Team command - link to PRCY team
bot.command('team', ctx => {
  ctx.replyWithHTML("Check out the PRivaCY Team page to see our list of team members: https://prcycoin.com/our-team");
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
  ctx.replyWithHTML("You can download the latest PoA Miner at: https://github.com/PRCYCoin/POA-Miner/releases/latest\n\nSetup instructions can be found at https://prcycoin.com/PoAMiner\n\nIf you need any help or want to discuss mining, feel free to join @PRCYMiners");
  ctx.deleteMessage();
});

//Bootstrap command - info and link to bootstrap
bot.command('bootstrap', ctx => {
  ctx.replyWithHTML('The latest BootStrap is always available from: https://bootstrap.prcycoin.com/\n\nPlease remember to backup your wallet.dat and Mnemonic Recovery phrase before running the BootStrap!\n\nhttps://prcycoin.com/knowledge-base/wallets/how-to-apply-bootstrap/\n\nVideo guide: https://www.youtube.com/watch?v=b6iM4r21hAM\n\nAuto BootStrap Tool: https://prcycoin.com/auto-bootstrap/');
  ctx.deleteMessage();
});

//Update command - info and link to update
bot.command('update', ctx => {
  ctx.replyWithHTML("<b>How to update your wallet to v</b>" + walletversion + " 🤔💡\n\n1️⃣ Make sure you've backed up your wallet.dat file and written down your Mnemonic Phrase, then close the wallet.\n\n2️⃣ Windows: Go to where you have prcycoin-qt.exe in Windows Explorer\n\nMac: Go to Macintosh HD/⁨Users/⁨Username/⁨Library/⁨Applications/⁨PRCYcoin⁩\n\n3️⃣ Download the v" + walletversion + " wallet from here: https://github.com/PRCYCoin/PRCYCoin/releases and open the zip file\n\n4️⃣ Copy the prcycoin-qt.exe/prcycoin-qt file and paste or place it over your current file.\n\n5️⃣ When asked if you want to replace the old file, click Yes.\n\nThat's it! Now you can open your wallet like normal and it is now running the new version. 🥳👍\n\n<b>Steps to Run Apps from Unidentified Developers on macOS</b>\n\n1️⃣ Open System Preferences on your Mac.\n\n2️⃣ Head to Security & Privacy and select the General tab.\n\n3️⃣ Here, you’ll see an “Open Anyway” button for the app you tried opening in the past hour.\n\n4️⃣ Click Open Anyway to override the block.\n\nHow To Guides: https://prcycoin.com/knowledge-base/wallets/how-to-update-qt-wallet/\nMac: https://prcycoin.com/knowledge-base/wallets/how-to-update-mac-os-wallet/");
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
  ctx.replyWithHTML("Question: What is the current supply of PrivaCY Coin?\n\nAnswer: The <b>Current Supply</b> can always be viewed here: https://explorer.prcycoin.com/api/getsupply\nThe <b>Circulating Supply</b> can always be viewed here: https://api.prcycoin.com/api/getcirculatingsupply\nThe <b>Total Supply</b> can always be viewed here: https://explorer.prcycoin.com/api/getmaxsupply");
  ctx.deleteMessage();
});

//Freemarket command
bot.command('freemarket', ctx => {
  ctx.replyWithHTML("Somebody sold, and somebody bought. Have to love a free market!");
  ctx.deleteMessage();
});

//Explorer command - links to Explorer
bot.command('explorer', ctx => {
  ctx.replyWithHTML("Question: What is the link to the PrivaCY Coin Explorer?\n\nAnswer: The Explorer is located here: https://explorer.prcycoin.com/");
  ctx.deleteMessage();
});

//Github command - links to Github
bot.command('github', ctx => {
  ctx.replyWithHTML("Question: What is the link to the PrivaCY Coin GitHub?\n\nAnswer: The PrivaCY Coin GitHub is located at: https://github.com/PRCYcoin/\n\nGitHub Telegram Channel: @prcycoingithub");
  ctx.deleteMessage();
});

//Doxygen command - links to Doxygen (Developer Documentation)
bot.command('doxygen', ctx => {
  ctx.replyWithHTML("Question: What is the link to the PrivaCY Coin Developer Documentation?\n\nAnswer: The PrivaCY Coin Developer Documentation is located at: https://doxygen.prcycoin.com");
  ctx.deleteMessage();
});

//Passive_income command - links to Passive Income Opportunities
bot.command('passive_income', ctx => {
  ctx.replyWithHTML("Question: Does PrivaCY Coin have any Passive Income Opportunities?\n\nAnswer: Yes, we do! You can check them all out at: https://prcycoin.com/category/passive-incomes-opportunities/");
  ctx.deleteMessage();
});

//Finance_report command - links to Financial Report
bot.command('finance_report', ctx => {
  ctx.replyWithHTML("Question: What is the link to the PrivaCY Coin 2022 Financial Report?\n\nAnswer: The PrivaCY Coin 2022 Financial Report is located at: https://financialreport.prcycoin.com");
  ctx.deleteMessage();
});

//International command - links to International channels
// bot.command('international', ctx => {
//   ctx.replyWithHTML("PRivaCY International Telegram Groups\n\nNederlands / Belgium: @PRCYcoinNLBe\nPolish: @PRCYcoinPL\nRussian: @PRCYcoinRU\nTurkish: @prcycointurkey\nIndoneasian: @PRCYcoinindonesia\Portuguese: @PRCYPortuguese\nSpanish: @PRCY_ES");
//   ctx.deleteMessage();
// });

// Raspberry command -  links to  Raspberry Pi channel
bot.command('raspberry', ctx => {
  ctx.replyWithHTML("Question: Does PrivaCY Coin have a Raspberry Pi channel?\n\nAnswer: Yes, you can join the channel here - @prcyraspberry");
  ctx.deleteMessage();
});

//BBQ command - Fun BBQ command
bot.command('bbq', ctx => {
  ctx.replyWithAnimation({ url: 'https://prcycoin.com/wp-content/uploads/2021/05/bbq.mp4' }, { caption: 'Time for the BBQ!\nhttps://www.indrapura.nl/'})
  ctx.deleteMessage();
});

//Bridge command - Bridge information
bot.command('bridge', ctx => {
  ctx.replyWithHTML("Question: How do I bridge my PRCY to bPRCY/pPRCY/tPRCY/wPRCY and vice versa?\n\nAnswer: You can bridge between PRCY/bPRCY/pPRCY/tPRCY/wPRCY at:\n<a href='https://privacydex.io'>PRivaCYdex.io</a>\n\nCheck out our guide for instructions: <a href='https://prcycoin.com/knowledge-base/wallets/how-to-bridge-prcy-wprcy-bprcy/'> How to bridge</a>");
  ctx.deleteMessage();
});

//Wrapped command - Wrapped information
bot.command('wrapped', ctx => {
  ctx.replyWithHTML("Question: What are the Wrapped PRCY (bPRCY/pPRCY/tPRCY/wPRCY) Contract Addresses?\n\nAnswer:\nWe highly recommend trying out the <a href='https://prcycoin.com/knowledge-base/incognito-prv/how-to-download-incognito/'>Incognito app</a> to trade Wrapped PRCY privately.\n\n<b><u><a href='https://bscscan.com/token/0xdfc3829b127761a3218bfcee7fc92e1232c9d116'>BSC Contract</a></u></b>\nTrade:\n\nOKX Dex:\n<a href='https://www.okx.com/web3/dex?irclickid=xVeyLSzNmxyNUakRwUzHdQtAUkDTmfSJVWPAwA0&af_sub1=ACE506286&irgwc=1&inputChain=56&inputCurrency=0xe9e7cea3dedca5984780bafc599bd69add087d56&outputChain=56&outputCurrency=0xdfc3829b127761a3218bfcee7fc92e1232c9d116'>BUSD / bPRCY</a>\nPancakeSwap:\n<a href='https://pancakeswap.finance/swap?outputCurrency=0xdfc3829b127761a3218bfcee7fc92e1232c9d116'>BNB / bPRCY</a>\nJustMoney:\n<a href='https://just.money/?from=BNB&n=BSC&t=swap&to=BPRCY'>BNB / bPRCY</a>\n\n<a href='https://dex.guru/token/0xdfc3829b127761a3218bfcee7fc92e1232c9d116-bsc'>DexGuru</a>\n\nCharts:\n<a href='https://charts.bogged.finance/?token=0xdFC3829b127761a3218bFceE7fc92e1232c9D116'>BoggedFinance chart</a>\n<a href='https://poocoin.app/tokens/0xdfc3829b127761a3218bfcee7fc92e1232c9d116'>Poocoin chart</a>\n\n<b><u><a href='https://polygonscan.com/token/0xdfc3829b127761a3218bfcee7fc92e1232c9d116'>Polygon Contract</a></u></b>\nTrade:\n\nOKX Dex:\n<a href='https://www.okx.com/web3/dex?irclickid=xVeyLSzNmxyNUakRwUzHdQtAUkDTmfSJVWPAwA0&af_sub1=ACE506286&irgwc=1&inputChain=137&inputCurrency=0xdfc3829b127761a3218bfcee7fc92e1232c9d116&outputChain=137&outputCurrency=0x2791bca1f2de4661ed88a30c99a7a9449aa84174'>USDC / pPRCY</a>\nQuickSwap:\n<a href='https://quickswap.exchange/#/swap?inputCurrency=ETH&outputCurrency=0xdfc3829b127761a3218bfcee7fc92e1232c9d116'>MATIC / pPRCY</a>\n<a href='https://quickswap.exchange/#/swap?inputCurrency=0xc2132d05d31c914a87c6611c10748aeb04b58e8f&outputCurrency=0xdfc3829b127761a3218bfcee7fc92e1232c9d116'>USDT / pPRCY</a>\n\n<a href='https://dex.guru/token/0xdfc3829b127761a3218bfcee7fc92e1232c9d116-polygon'>DexGuru</a>\n\nCharts:\n<a href='https://polygon.poocoin.app/tokens/0xdfc3829b127761a3218bfcee7fc92e1232c9d116'>Poocoin chart</a>\n<a href='https://info.quickswap.exchange/token/0xdfc3829b127761a3218bfcee7fc92e1232c9d116'>QuickSwap chart</a>\n\n<b><u><a href='https://tronscan.org/#/token20/TYV5eu6UgSPtxVLkPD9YfxmUEcXhum35yS'>TRON Contract</a></u></b>\nTrade:\nSunSwap:\n<a href='https://sunswap.com/?lang=en-US#/home?tokenAddress=TYV5eu6UgSPtxVLkPD9YfxmUEcXhum35yS&type=swap'>TRX / tPRCY</a>\n\nCharts:\n<a href='https://sunswap.com/?lang=en-US#/scan/detail/TYV5eu6UgSPtxVLkPD9YfxmUEcXhum35yS'>SunSwap chart</a>\n\n<b><u><a href='https://etherscan.io/token/0xdfc3829b127761a3218bfcee7fc92e1232c9d116'>ETH Contract</a></u></b>\nTrade:\nOKX Dex:\n<a href='https://www.okx.com/web3/dex?irclickid=xVeyLSzNmxyNUakRwUzHdQtAUkDTmfSJVWPAwA0&af_sub1=ACE506286&irgwc=1&inputChain=1&inputCurrency=0xdfc3829b127761a3218bfcee7fc92e1232c9d116&outputChain=1&outputCurrency=0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'>USDC / wPRCY</a>\nUniSwap:\n<a href='https://app.uniswap.org/#/swap?inputCurrency=ETH&outputCurrency=0xdfc3829b127761a3218bfcee7fc92e1232c9d116'>ETH / wPRCY</a>\n<a href='https://app.uniswap.org/#/swap?inputCurrency=USDT&outputCurrency=0xdfc3829b127761a3218bfcee7fc92e1232c9d116'>USDT / wPRCY</a>\n\n<a href='https://dex.guru/token/0xdfc3829b127761a3218bfcee7fc92e1232c9d116-eth'>DexGuru</a>\n\nCharts:\n<a href='https://info.uniswap.org/#/tokens/0xdfc3829b127761a3218bfcee7fc92e1232c9d116'>UniSwap chart</a>\n<a href='https://analytics.sushi.com/tokens/0xdfc3829b127761a3218bfcee7fc92e1232c9d116'>SushiSwap chart</a>\n\nCheck out our guide to Bridge to/from Wrapped PRCY:\n<a href='https://prcycoin.com/knowledge-base/wallets/how-to-bridge-prcy-wprcy-bprcy'>Swap to/from Wrapped PRCY</a> via our dex <a href='https://privacydex.io'>Privacydex.io</a>");
  ctx.deleteMessage();
});

//Contracts command - Basic Contracts information
bot.command('contracts', ctx => {
  ctx.replyWithHTML("Question: What are the Wrapped PRCY (bPRCY/pPRCY/tPRCY/wPRCY) Contract Addresses?\n\nAnswer:\nbPRCY - BSC Contract: <a href='https://bscscan.com/token/0xdfc3829b127761a3218bfcee7fc92e1232c9d116'>0xdfc3829b127761a3218bfcee7fc92e1232c9d116</a>\npPRCY - Polygon Contract: <a href='https://polygonscan.com/token/0xdfc3829b127761a3218bfcee7fc92e1232c9d116'>0xdfc3829b127761a3218bfcee7fc92e1232c9d116</a>\ntPRCY - TRON Contract: <a href='https://tronscan.io/#/token20/TYV5eu6UgSPtxVLkPD9YfxmUEcXhum35yS'>TYV5eu6UgSPtxVLkPD9YfxmUEcXhum35yS</a>\nwPRCY - ETH Contract: <a href='https://etherscan.io/token/0xdfc3829b127761a3218bfcee7fc92e1232c9d116'>0xdfc3829b127761a3218bfcee7fc92e1232c9d116</a>\n\nThe Bridge Wallet Addresses on each chain are as follows:\nbPRCY: <a href='https://bscscan.com/address/0x6c096a66d64bcd2d603df4d94e70519b38395d00'>0x6c096a66d64bcd2d603df4d94e70519b38395d00</a>\npPRCY: <a href='https://polygonscan.com/address/0x6c096a66d64bcd2d603df4d94e70519b38395d00'>0x6c096a66d64bcd2d603df4d94e70519b38395d00</a>\ntPRCY: <a href='https://tronscan.io/#/address/TLwk39xfW4K7PMscRxi6nvsvTgmuVGXMEM'>TLwk39xfW4K7PMscRxi6nvsvTgmuVGXMEM</a>\nwPRCY: <a href='https://etherscan.io/address/0x6c096a66d64bcd2d603df4d94e70519b38395d00'>0x6c096a66d64bcd2d603df4d94e70519b38395d00</a>");
  ctx.deleteMessage();
});

//Comparison command - Comparison information
bot.command('comparison', ctx => {
  ctx.replyWithHTML("Question: Is there a comparison chart for PRCY and other privacy coins?\n\nAnswer: Yes, we have created one at https://comparison.prcycoin.com");
  ctx.deleteMessage();
});

//Autobootstrap command - Autobootstrap information
bot.command('autobootstrap', ctx => {
  ctx.replyWithHTML("Question: Where is the Auto Bootstrap Tool?\n\nAnswer: It can be downloaded at https://prcycoin.com/auto-bootstrap/");
  ctx.deleteMessage();
});

//Shop command - link to PRCY shop
bot.command('shop', ctx => {
  ctx.replyWithHTML("Shop for PRivaCY Coin merchandise at the new store! https://shop.prcycoin.com");
  ctx.deleteMessage();
});

// Function to construct the dex links
async function getDexLinks() {
  const uniqueFromAssets = await getUniqueFromAssets();

  if (uniqueFromAssets.length === 0) {
    return 'Error fetching exchange data. Please try again later.';
  }

  const dexLinks = uniqueFromAssets.map(asset => {
    const link = `https://privacydex.io/Swap?from=${encodeURIComponent(asset)}&to=PRCY`;
    return `<a href="${link}">${asset}</a>`;
  });

  return dexLinks.join('\n');
}

// Dex command - PrivacyDex.io information
bot.command('dex', async ctx => {
  const dexLinks = await getDexLinks();

  const replyText = `Question: What coins can be swapped for PRCY at PRivaCYDEX.io?\n\nAnswer: Below are the coins that you can swap to PRCY/Wrapped PRCY on PRivaCYDEX.io:\n\n${dexLinks}`;

  ctx.replyWithHTML(replyText);
  ctx.deleteMessage();
});

//Promotion materials command - information and link to Promo materials
bot.command('promo', ctx => {
  ctx.replyWithHTML('If you wish to create a post on social media related to PRivaCY then add $PRCY #PRCY.\n\nHere are some <a href="https://drive.google.com/drive/folders/1QE9UtLOkSyC6tCu_25lUzEOHV5AQzocc">PRivaCY Approved Graphics</a> -https://drive.google.com/drive/folders/1QE9UtLOkSyC6tCu_25lUzEOHV5AQzocc');
  ctx.deleteMessage();
});

//Gamble command - link to CasinoGate
bot.command('gamble', ctx => {
  ctx.replyWithHTML("Want to take a gamble?\nTry out PRivaCY's new integration at <a href='https://www.casinogate.live/?ref=871'>CasinoGate</a>!\nPlay Baccarat, Blackjack, Dice, Roulette, Fruits Slots, and many more to earn PRCY.\nGood luck!\n\nPlease play wisely, It’s real Crypto!\nUse below referral and get 50 free credits! https://www.casinogate.live/?ref=871");
  ctx.deleteMessage();
});

//Plane command - link to Top Gun Aviation
bot.command('plane', ctx => {
  ctx.replyWithHTML("Looking to catch your next private plane?\n\nPay with inter at: <a href='https://topgun-aviation.com'>Top Gun Aviation</a>!");
  ctx.deleteMessage();
});

//KingKabab command - link to King Kabab
bot.command('kingkabab', ctx => {
  ctx.replyWithHTML("Looking to grab some excellent food in Charlotte, NC?\n\nPay with PRCY at: <a href='https://ballantyne.kingkababs.com/'>King Kabab (Ballantyne)</a>!");
  ctx.deleteMessage();
});

//Reward command - reply about houw much you earn by staking
bot.command('rewards', ctx => {
  ctx.replyWithHTML("Question: What are the current staking returns?\n\nAnswer:\nAs we use PoSv3 it's not possible to calculate the daily staking rewards or its frequency. Because it relies on time + users staking + amount of coins staking in your wallet + luck = reward\n\n<b>You want to know more about staking PrivaCY Coin? Look <a href='https://prcycoin.com/features/staking/'>here</a></b>");
  ctx.deleteMessage();
});

//Premine command
bot.command('premine', ctx => {
  ctx.replyWithHTML("Question: <b>PrivaCY Coin Premine</b>\n\nAnswer:\n\nWe want to stay away from the discussions to become a security.\nWe need value to grow in means of development and pay our running costs. A premine is a solution to get the means to compensate third party costs or salaries, marketing and create liquidity in exchanges.\n\nWe have examined all other privacy coins first, looked how they developed and their background.\nThe majority of the privacy coins have had a large investment round, in other words the luxury to select a premined ratio. We started differently, no ICO. Just us, <a href='https://prcycoin.com/our-team/'>the team</a>, 6 people, funding all. In our mind, the future is important and we do not want to start something and fail.\n\nFrom a contingency point of view we decided for this ratio. Not scientific but from a project planning view and to create a coin for the future. We know a <a href='https://prcycoin.com/whitepaper/'>premine</a> is not popular, we realize it and we decided to have open <a href='https://prcycoin.com/wp-content/uploads/2021/07/2ND-QT-2021-FINANCIAL-REPORT-PRCY.pdf'>bookkeeping</a> about all our costs and coins.\n\nEach quarter we open the <a href='https://prcycoin.com/wp-content/uploads/2021/07/2ND-QT-2021-FINANCIAL-REPORT-PRCY.pdf'>books</a> and explain how we managed this project. Via this means you can verify if you are still happy or not how we run this project. Our actions are verifiable too, combine it all what you see.\nWe are very efficient , we do not waste time or money, we invest as much as possible in added value.\nI am sure you all have noticed how fast we accomplish <a href='https://prcycoin.com/achievements/'>milestones</a> like the <a href='http://privacydex.io/'>PRivaCYdex.io</a> or <a href='https://prcycoin.com/announcement/buyback-program-announcement/'>Buy back plan</a>. While others taking their time.\n\nHopes it satisfies your curiosity about the ratio. Have a look how much we allocated to <a href='https://prcycoin.com/whitepaper/'>reward</a> you as our community, it’s 30%, with this in mind without a <a href='https://prcycoin.com/whitepaper/'>premine</a> we could not do it like this.\nIt gives us the means to do it together, you, us, the community and all others.");
  ctx.deleteMessage();
});

//Channels
bot.command('channels', ctx => {
  ctx.replyWithHTML("<b>PRivaCY Coin International Telegram Groups</b>\n\n<a href='https://t.me/prcyupdate'>PRivaCY Coin Updates</a>\n<a href='https://t.me/prcycoinofficial'>PRivaCY Coin Official</a>\n<a href='https://t.me/prcylounge'>PRivaCY Coin Lounge</a>\n<a href='https://t.me/PrcycoinNLBe'>PRivaCY Coin Nederlands / Belgium</a>\n<a href='https://t.me/PRCYcoinPL'>PRivaCY Coin Polish</a>\n<a href='https://t.me/PRCYcoinRU'>PRivaCY Coin Russia</a>\n<a href='https://t.me/prcycointurkey'>PRivaCY Coin Turkish</a>\n<a href='https://t.me/PRCYPortuguese'>PRivaCY Coin Portuegese</a>\n<a href='https://t.me/prcy_es'>PRivaCY Coin Espanol</a>\n<a href='https://t.me/prcycoinindonesia'>PRivaCY Coin Indonesia</a>\n\n<b>PRivaCY Coin Support Channels:</b>\n\n<a href='https://t.me/prcySupport'>PRivaCY Coin Tech Support</a>\n<a href='https://t.me/PRCY_MN_Support'>PRivaCY Coin Masternode Support</a>\n<a href='https://t.me/PRCYMiners'>PRivaCY Coin POA Mining</a>\n<a href='https://t.me/prcyraspberry'>PRivaCY Coin Raspberry Channel</a>\n<a href='https://t.me/prcychecker'>PRivaCY Coin Auto Checker</a>\n\n<b>PRivaCY Coin Official Social Media Accounts:</b>\n\n<a href='https://twitter.com/PRCYcoin'>PRivaCY Coin Twitter</a>\n<a href='https://t.me/PRCYsocialmediachannel'>PRivaCY Coin Social Media Army</a>\n<a href='https://www.youtube.com/c/privacycoin'>PRivaCY Coin Youtube</a>\n<a href='https://discord.prcycoin.com'>PRivaCY Coin Discord</a>\n<a href='https://www.bitchute.com/channel/privacycoin/'>PRivaCY Coin Bitchute</a>\n<a href='https://stocktwits.com/symbol/PRCY.X'>PRivaCY Coin Stocktwits</a>\n\n<b>PRivaCY Coin Official Blogs/News:</b>\n\n<a href='https://prcycoin.com/news/'>PRivaCY Coin News</a>\n<a href='https://www.reddit.com/r/PRCYCoin/'>PRivaCY Coin Reddit</a>\n<a href='https://linktr.ee/PRivaCYcoin'>PRivaCY Coin Linktree</a>");
  ctx.deleteMessage();
});

//Mobile - Answer about mobile
bot.command('mobile', ctx => {
  ctx.replyWithHTML("Question: My Mobile/Web Wallet won't send, what can I do?\n\nAnswer: If the Mobile Wallet/Web Wallet taking a long time to send/sync:\n\n - If it has already been running for 5 minutes, Restart the app\n- Try the Web Wallet (if using Mobile)\n- Check back later.\n\nDesktop wallets are unaffected. You can import your seed phrase to Desktop.");
  ctx.deleteMessage();
});

//Withdraw - Answer about Min Withdraw from wallets
bot.command('withdraw', ctx => {
  ctx.replyWithHTML("Question: What is the Minimum Withdrawal from PRCY Wallets?\n\nAnswer: The Minimum is 5 PRCY to withdraw, plus 1 PRCY for fees. This means you <b>CAN NOT</b> send 5 PrivaCY Coins.\nThis will not be changed until the designated date.\n\nNeed more PRCY? Our exchanges are listed at: https://prcycoin.com/exchange/");
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
  var badbotresponses = ["Aw, gosh, I didn't mean it!", "Sorry! Please don't tell my handler!", "ERROR! Initiating reboot sequence...", "Kiss my shiny metal PRivaCY", "Think that's bad? Wait 'til Combot comes out, then you have trouble.", "https://www.youtube.com/watch?v=dsUXAEzaC3Q"];
  var badbotresponse = badbotresponses[Math.floor(Math.random() * badbotresponses.length)];
  ctx.replyWithHTML(badbotresponse);
});

//Listen for Spam channel(s)
bot.hears([/kryptokompassDE/i, /PrcyUnofficialChannel/i, /pump signal/i, /McAfees Official Alliance/i, /TheChimeraSyndicate/i, /Krypto Freunde aufgepasst/i, /joinchat/i, /miningwithextractbot/i, /parazmat/i, /Binance Competition/i, /fxprofitlord/i, /Mytoken/i, /✅Invest/i, /@PRCY_RUS_MOONSPAM/i, /Goood! Google!/i, /Wooow! Google!/i, /tel_modern/i, /proxy.zedfilter.taggram/i, /emtiaz5star/i, /Trade_santos/i, /STEPrimo/i, /FRAGMA/i, /airdrop/i], (ctx) => {
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

    if (filetype) {
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
    } else {
    }
    //ctx.kickChatMember(userid);
  }
})

//Add a bit of a swear filter
bot.hears([/fuck/i], (ctx) => {
  let chatid = ctx.message.chat.id;
  if (ctx.from._is_in_admin_list) {
  } else {
    //If not Lounge (ID below), complain about swear mentions
    if (chatid != loungeID) {
      ctx.replyWithHTML(ctx.from.username + ", Please don't swear in our official channels. Thanks for your cooperation.");
      ctx.deleteMessage();
    }
  }
});

//Check for edited message scam posts
bot.on('edited_message', (ctx) => {
  //let chatid = ctx.message.chat.id;
  //let userid = ctx.message.from.id;
  let msg = ctx.message;
  if (ctx.from._is_in_admin_list) {
  } else {
    if (ctx.editedMessage.photo) {
      //ctx.deleteMessage();
      //bot.kickChatMember(chatid, userid);
    }
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
