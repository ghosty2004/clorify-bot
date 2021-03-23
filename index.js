//++++++++++++++++++++++++++++++++++++++++++
// -> Clorify Discord BOT by Ghost
// -> Contact info: ghost@clorify.gg
//++++++++++++++++++++++++++++++++++++++++++

var Discord = require("discord.js");
var weather = require("weather-js");
var snekfetch = require("snekfetch");
var ipinfo = require("ipinfo");
var InstagramScrapper = require("instagram-scraping");
var samplookup = require("samp-query");
var hentapi = require("hentapi");
var fs = require("fs");var colors = require('colors');
var path = require("path");
var mysql = require("mysql");
var Canvas = require("canvas");
var YTBScrape = require("scrape-yt");
var YouTubeScrapper = require("yt-channel-info");
var youtubedl = require("youtube-dl");
var system_information = require("systeminformation");
var ytdl = require("discord-ytdl-core");
var yts = require("yt-search");
var colors = require("colors");
var ascii = require("ascii-art");
const moment = require("moment");
const wait = require("util").promisify(setTimeout);
const TikTokScraper = require("tiktok-scraper");
const SteamAPI = require("steamapi");
const steam = new SteamAPI("steam_api_key_if_you_have");

// -> SSH Configuration
const {NodeSSH} = require("node-ssh");

const ssh = new NodeSSH()

ssh.connect({
    host: "host",
    username: "username",
    password: "password",
})

var available_ssh_logged_users = 0;
var last_ssh_login_ip = "0";

var bot = new Discord.Client({partials: ["MESSAGE"]});
var PREFIX = "clorify,";
var WEBSITE = "https://clorify.xyz";
var bot_name_ex = "Clorify";
var bot_name = "Clorify BOT";
var embed_color = "#00DD00"
var embed_footer = "Copyright © Clorify Discord Bot (2020-2021)";
var ownerid = {};
ownerid[1] = "334979056095199233";
ownerid[2] = "218808258205450240";
var current_version = "v5.2";
var error_log_channel = "789205519108669452";

// -> YouTube Video Updater
var { google } = require('googleapis');
const { error } = require("console");
const { options } = require("snekfetch");
var OAuth2 = google.auth.OAuth2;	
var SCOPES = ['https://www.googleapis.com/auth/youtube.readonly', 'https://www.googleapis.com/auth/youtube'];

var OAUTH_TOKEN;
const CLIENT_SECRET = {"installed":{"client_id":"917394934098-50bqncudhfr61ecjlk2mp071sbtsf1de.apps.googleusercontent.com","project_id":"buster-bot-298716","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_secret":"tg9punwwPSt6vzMfUw2QD5nW","redirect_uris":["https://localhost"],"javascript_origins":["https://localhost"]}};
const VIDEO_ID = "5s3q3gP7B_s";

async function YouTubeMain() {
    try {
        const auth = authorize();
        await updateVideoTitle(auth);
    } catch (e) {
        if(e.code == 401) {
            var oauth2Client = new google.auth.OAuth2(
                CLIENT_SECRET.installed.client_id,
                CLIENT_SECRET.installed.client_secret,
                CLIENT_SECRET.installed.redirect_uris[0]
            )
        
            oauth2Client.credentials.refresh_token = OAUTH_TOKEN.refresh_token;
        
            oauth2Client.refreshAccessToken((error, tokens) => {
                if(!error) {
                    OAUTH_TOKEN = {"access_token":`${tokens.access_token}`,"refresh_token":`${tokens.refresh_token}`,"scope":`${tokens.scope}`,"token_type":`${tokens.token_type}`,"expiry_date":`${tokens.expiry_date}`};
                    con.query(`UPDATE settings SET access_token = '${tokens.access_token}', refresh_token = '${tokens.refresh_token}', scope = '${tokens.scope}', token_type = '${tokens.token_type}', expiry_date = '${tokens.expiry_date}'`);
                    console.log("OAuth informations has been updated.");
                    YouTubeMain();
                }
                else {
                    var authUrl = oauth2Client.generateAuthUrl({
                        access_type: 'offline',
                        scope: SCOPES
                    });
                    console.log(authUrl);
                }
            });
        }
        else {
            console.log(e);
        }
    }
}

function authorize() {
    const credentials = CLIENT_SECRET;
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

    oauth2Client.credentials = OAUTH_TOKEN;
    return oauth2Client
}

function updateVideoTitle(auth) {
    const service = google.youtube('v3');

    // -> Date
    var d = new Date();
    var time = d.toLocaleTimeString('en-US', { timeZone: 'Europe/Bucharest' })
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var monthName = months[d.getMonth()];
    var date = `${moment.utc(d).format("DD")} ${monthName}, ${moment.utc(d).format("YYYY")} at ${time}`;

    return new Promise((resolve, reject) => {
        // -> BOT top 10 servers
        var count = 0, string_top_servers = "";
        con.query("SELECT * FROM guilds ORDER BY total_writes DESC LIMIT 10", function(err, result) {
            if(result != 0) {
                for(var i = 0; i != result.length; i++) {
                    count++;
                    if(count == 1) {
                        string_top_servers = `#1. ${bot.guilds.cache.get(result[0].guild_id).name} - ${result[0].total_writes} ✍️ total writes.`;
                    }
                    else if(count >= 2) {
                        string_top_servers += `\n#${count}. ${bot.guilds.cache.get(result[i].guild_id).name} - ${result[i].total_writes} ✍️ total writes.`
                    }
                }
                service.videos.update({
                    auth: auth,
                    part: 'snippet',
                    resource: {
                        id: VIDEO_ID,
                        snippet: {
                            title: `Playing with ${bot.guilds.cache.size} servers and ${bot.users.cache.size} users. (🤖 ${bot_name_ex} Discord BOT 🤖)`,
                            description: `⏰ Last update: ${date}\nℹ️ Every 10 minutes video update\nBOT Invite: ${WEBSITE}/?action=invite\n\nTOP 10 Servers by chat activity:\n${string_top_servers}`,
                            categoryId: 27
                        }
                    }
                }, function(err, response) {
                    if (err) return reject(err)
                    resolve(response.data.snippet.title)
                });
            }
        });
    })
}

// -> Mobile mode
var Constants = Discord.Constants;
Constants.DefaultOptions.ws.properties.$browser = "Discord iOS";

// -> Variables
var snipetext = {};
var snipeauthor = {};
var snipedate = {};

var chat_record_status = {};
var chat_record_channel = {};
var slots_cooldown = {};
var voice_channel_connection = {};
var bot_last_message = {};
var seted_move_action = {};

var developername;
var postion_text = 0;

var repeat = {};
var queue = {};
var queue_link = {};
var queue_title = {};
var song_int_play = {};
var next_song = {};
var current_song_connection = {};
var current_song_pause = {};

var con = mysql.createConnection( 
{ 
    host: "host",
    user: "root",
    password: "pass",
    database: "db",
    charset: "utf8mb4"
});

con.connect(err => 
{
    if(err) {
        console.log("Database connection failed!")
    }
    else {
        console.log(`Database connection successfully!`);
        con.query("DELETE FROM chat_record")

        con.query("SELECT * FROM settings", function(err, result) {
            last_ssh_login_ip = result[0].last_ssh_login_ip;
            if(result != 0) {
                OAUTH_TOKEN = {"access_token":`${result[0].access_token}`,"refresh_token":`${result[0].refresh_token}`,"scope":`${result[0].scope}`,"token_type":`${result[0].token_type}`,"expiry_date":`${result[0].expiry_date}`};
            }
        });
    }
});

bot.on("ready", async ready =>
{
    console.log("\n");
    console.log("CLORIFY IS NOW ON!\n".yellow);
    console.log("\x1b[32m", "MMMMMMMMMMMMMMMMMMWXKkollllodOXWMMMMMMMMMMMMMMMMMM");
    console.log("\x1b[32m", "MMMMMMMMMMMMMMMWXOxdoc:::;;;::ldOXWMMMMMMMMMMMMMMM");
    console.log("\x1b[32m", "nMMMMMMMMMMMMMN0xlc:;,,'''''''',,;:dONMMMMMMMMMMMM");
    console.log("\x1b[32m", "nMMMMMMMMMMMNOdc:;,'''''',,,'''''''',cONMMMMMMMMMM");
    console.log("\x1b[32m", "nMMMMMMMMMNOoc:;,''',,,,,,,,,,,,,,,,,',lONMMMMMMMM");
    console.log("\x1b[32m", "MMMMMMMWKo:;;,''',,,,,,::;,,,,,,,,,,,'',oKWMMMMMMM");
    console.log("\x1b[32m", "MMMMMMNkl:,.'',,,,,,,,,:c:;,,,,,,,,,,''';ckNMMMMMM");
    console.log("\x1b[32m", "MMMMMKdc:,''.'',,,,,,;;cllc:;,,,,,,,''',,;cdXMMMMM");
    console.log("\x1b[32m", "MMMMKo:;,'',''',,,;;::cccccc:;,,,,,''',,,,:coKMMMM");
    console.log("\x1b[32m", "MMMKl,,'',,,,''',,,;;;:::::::;,,,,'',,,,,,,:cdXMMM");
    console.log("\x1b[32m", "MMNd,''',,,,,,,',:cccclllllcc:::;,',,,,,,,,;clxNMM");
    console.log("\x1b[32m", "MWO:,'',,,,,,;:;,;c:::::::cccc::;',,;,;;;,,,;clOMM");
    console.log("\x1b[32m", "MXo,,',,,,,,,,,,'',;;;::::::;;;,',,;;,,,;::;,:cdNM");
    console.log("\x1b[32m", "Wk:,,,,;;;;;,,,;;:ccllllooolllcc::;;,;;;,;:c:;clOM");
    console.log("\x1b[32m", "Xo,,,,;:::;,'',;:clloooooooooollc:;,'',;:;,;cc::dN");
    console.log("\x1b[32m", "0c,',;::;'.....'',::ccllooollc::;,'''.''';:;;cccl0");
    console.log("\x1b[32m", "x:,,:::'.';:col,.',;:::::::::;;,;;,';:ll,.,::;:cck");
    console.log("\x1b[32m", "o;;:c;...:doxOxc',c:;,,;;:;,,;:lkOo,:ood:',,;:;;:o");
    console.log("\x1b[32m", "c,;:,.',,;ddlc:::codc',;::;,'cdddllccldo;,;,',:;,l");
    console.log("\x1b[32m", ";,;''',,;;cooloodddl,',cllc;',ldddoolooc;;,,,'',,:");
    console.log("\x1b[32m", ":;,..'',,;;:::clll:;,;;:llc;,,;:lllcc::;;;,,,..'';");
    console.log("\x1b[32m", ":,.....',;,,;;;;:clodxOO00Okxdolc:;;;;,;;;'.....';");
    console.log("\x1b[32m", ":......'lddddxkO0KXXNNX0OO0XNNXXK0Okxxxxxo,.....';");
    console.log("\x1b[32m", ";.......;x0XXXNNNNNNXKOxoox0KXXXNNNNXXX0x;......';");
    console.log("\x1b[32m", ";........':ok0XXXNXK0OkxddxkO0KXNXXX0ko:'....'''';");
    console.log("\x1b[32m", "l'..........,:ldkOOk0KXOxxOKK0kOOkdl:,.....'''';;o");
    console.log("\x1b[32m", "0l,'',,,,,,,,,:oxkO0000OkOO00000kxdxxxo:;;;;;;;:oK");
    console.log("\x1b[32m", "WKdc;;;:llclcckNMMMWWWWNNNNNWWMMMMMMMWKdllcccclxXW");
    console.log("\x1b[37m", "");
    bot.user.setStatus("Available");

    /*bot.users.cache.forEach(u => {
        u.send("Dashboard enabled!\nCheck now https://clorify.xyz\nIf you want to invite me in your server, follow the instructions in the dashboard.")
    });*/

    CheckCommands(1);

    CheckDeveloperInformations();

    bot.guilds.cache.forEach(g => 
    {
        repeat[g.id] = 0;
        queue[g.id] = 0;
        queue_link[g.id] = "";
        queue_title[g.id] = "";
        song_int_play[g.id] = {};
        next_song[g.id] = 1;
        current_song_connection[g.id] = 0;
        current_song_pause[g.id] = false;
        for(var i = 0; i != 10; i++) { song_int_play[g.id][i] = 0; }
    });

    setInterval(() => 
    {
        CheckDeveloperInformations();
        /*/ -> Check ssh login
        system_information.users().then(result => {
            if(result.length > available_ssh_logged_users) {
                if(result[available_ssh_logged_users].ip != last_ssh_login_ip) {
                    ipinfo(result[available_ssh_logged_users].ip, (err, ip_info) => {
                        for(var i = 1; i != 3; i++) {
                            bot.users.cache.get(ownerid[i]).send("```c" + "\n" + `New SSH login:\n\nUser: "${result[available_ssh_logged_users].user}"\nDate: "${result[available_ssh_logged_users].date} at ${result[available_ssh_logged_users].time}"\nIP: "${result[available_ssh_logged_users].ip}"\nIP City: "${ip_info.city}"\nIP Country: "${ip_info.country}"` + "```");
                        }
                        UpdateSettings("last_ssh_login_ip", result[available_ssh_logged_users].ip);
                        available_ssh_logged_users = result.length;
                    });
                }
            }

            if(result.length == 0) {
                if(last_ssh_login_ip != "0") {
                    last_ssh_login_ip = "0";
                    available_ssh_logged_users = 0;
                    UpdateSettings("last_ssh_login_ip", 0);
                }
            }
        });*/
    }, 5000);

    // -> YouTube API (UPDATE TITLE & DESCRIPTION)
    //YouTubeMain();

    setInterval(() => {
        YouTubeMain();
    }, 600000); // 10 minutes

    bot.users.cache.forEach(u => {
        if(!u.bot) {
            chat_record_status[u.id] = 0;
            slots_cooldown[u.id] = 0;
            seted_move_action[u.id] = 0;
            con.query(`SELECT * FROM users WHERE user_id = '${u.id}'`, function(err, result) {
                if(result == 0) {
                    con.query(`INSERT INTO users (user_id) VALUES ('${u.id}')`);
                }
            });

            bot.guilds.cache.forEach(g => {
                voice_channel_connection[u.id+g.id] = 0;
            });
        }
    });

    setInterval(() => {
        bot.users.cache.forEach(u => {
            con.query(`SELECT * FROM users WHERE user_id = '${u.id}'`, function(err, result) {
                if(result != 0) {
                    var online_seconds = result[0].online_seconds;
                    var dnd_seconds = result[0].dnd_seconds;
                    var idle_seconds = result[0].idle_seconds;

                    if(u.presence.status == "online") { 
                        UpdateUser(u.id, "online_seconds", online_seconds + 1);
                    }
                    else if(u.presence.status == "dnd") {
                        UpdateUser(u.id, "dnd_seconds", dnd_seconds + 1);
                    }
                    else if(u.presence.status == "idle") {
                        UpdateUser(u.id, "idle_seconds", idle_seconds + 1);
                    }

                    var user = bot.users.cache.get(result[0].user_id);
                    if(user != undefined) {
                        UpdateUser(result[0].user_id, "last_name", user.tag)
                    }
                    else {
                        UpdateUser(result[0].user_id, "last_name", "leaved_user");
                    }
                }
            });
        });

        bot.guilds.cache.forEach(g => {
            // -> Insert in guilds table if not exists
            con.query(`SELECT * FROM guilds WHERE guild_id = '${g.id}'`, function(err, result) {
                if(result == 0) {
                    con.query(`INSERT INTO guilds (guild_id) VALUES ('${g.id}')`);
                }
            });
            // -> Voice channels cache
            g.channels.cache.forEach(c => {
                if(c.type == "voice") {
                    con.query(`SELECT * FROM voice_channels WHERE channel_id = '${c.id}'`, function(err, result) {
                        if(result == 0) {
                            con.query(`INSERT INTO voice_channels (guild_id, channel_id, channel_name) VALUES ('${g.id}', '${c.id}', '${c.name}')`);
                        }
                    });
                }
            });
            con.query(`SELECT * FROM voice_channels`, function(err, result) {
                if(result != 0) {
                    for(var i = 0; i != result.length; i++) {
                        var channel = bot.channels.cache.get(result[i].channel_id);
                        if(channel == undefined) {
                            con.query(`DELETE FROM voice_channels WHERE id = ${result[i].id}`);
                        }
                    }
                }
            });
            // -> Members cache for channel time counter
            g.members.cache.forEach(m => {
                if(m.voice.channel) { 
                    con.query(`SELECT * FROM users_activity WHERE user_id = '${m.id}' AND guild_id = '${g.id}'`, function(err, result) {   
                        if(result != 0) {   
                            var total_voice_seconds = result[0].total_voice_seconds;
                            UpdateUserActivity(m.id, g.id, "total_voice_seconds", total_voice_seconds+1);
                        }
                    });
                }

                // -> Reset voice connection variable
                else {
                    if(voice_channel_connection[m.id+g.id] == 1) {
                        voice_channel_connection[m.id+g.id] = 0;
                    }
                }
            });
        });
    }, 1.5 * 1000);

    setInterval(() => {
        if(postion_text == 0) { bot.user.setActivity(`with ${bot.guilds.cache.size} servers`, { type: "PLAYING" }), postion_text = 1; }
        else if(postion_text == 1) { bot.user.setActivity(`${WEBSITE}`, { type: "STREAMING", url: `https://www.youtube.com/watch?v=${VIDEO_ID}` }), postion_text = 2; }
        else if(postion_text == 2) { bot.user.setActivity(`${PREFIX} help`, { type: "PLAYING" }), postion_text = 3; }
        else if(postion_text == 3) { bot.user.setActivity(`${PREFIX} invite`, { type: "PLAYING" }), postion_text = 0; }

        bot.guilds.cache.forEach(g => {
            server_counter(g);
        });
    }, 10 * 1000);
});
bot.on("guildCreate", guild => {
	guild.members.cache.forEach(u => { 
        if(!u.user.bot) {
            chat_record_status[u.id] = 0;
            slots_cooldown[u.id] = 0;
            voice_channel_connection[u.id+guild.id] = 0;
            seted_move_action[u.id] = 0;
            con.query(`SELECT * FROM users WHERE user_id = '${u.id}'`, function(err, result) {
                if(result == 0) {
                    con.query(`INSERT INTO users (user_id) VALUES ('${u.id}')`);
                }
            });
        }
    });
    for(var i = 1; i != 3; i++) {
        bot.users.cache.get(ownerid[i]).send("```c" + "\n" + `[ALERT]: Server join. Name: "${guild.name}" | ID: "${guild.id}" | Owner: "${guild.owner.user.tag}"` + "```");
    }
    con.query(`INSERT INTO guilds (guild_id) VALUES ('${guild.id}')`);

    repeat[guild.id] = 0;
    queue[guild.id] = 0;
    queue_link[guild.id] = "";
    queue_title[guild.id] = "";
    song_int_play[guild.id] = {};
    next_song[guild.id] = 1;
    current_song_connection[guild.id] = 0;
    current_song_pause[guild.id] = false;
    for(var i = 0; i != 10; i++) { song_int_play[guild.id][i] = 0; }
});

bot.on("guildDelete", guild => {
    for(var i = 1; i != 3; i++) {
        bot.users.cache.get(ownerid[i]).send("```c" + "\n" + `[ALERT]: Serve leave. Name: "${guild.name}" | ID: "${guild.id}" | Owner: "${guild.owner.user.tag}"` + "```");
    }
    con.query(`DELETE FROM guilds WHERE guild_id = '${guild.id}'`);

    repeat[guild.id] = 0;
    queue[guild.id] = 0;
    queue_link[guild.id] = "";
    queue_title[guild.id] = "";
    song_int_play[guild.id] = {};
    next_song[guild.id] = 1;
    current_song_connection[guild.id] = 0;
    current_song_pause[guild.id] = false;
    for(var i = 0; i != 10; i++) { song_int_play[guild.id][i] = 0; }
});

bot.on("guildMemberAdd", async member => {
    if(!member.user.bot) {
        chat_record_status[member.id] = 0;
        slots_cooldown[member.id] = 0;
        voice_channel_connection[member.id+member.guild.id] = 0;
        seted_move_action[member.id] = 0;
        con.query(`SELECT * FROM users WHERE user_id = '${member.id}'`, function(err, result) {
            if(result == 0) {
                con.query(`INSERT INTO users (user_id) VALUES ('${member.id}')`);
            }
        });
        // -> Welcome message
        con.query(`SELECT * FROM welcome_message WHERE guild_id = '${member.guild.id}'`, function(err, result) {
            if(result != 0) {
                var text = result[0].text;
                member.send(WelcomeMessage(member, text));
            }
        });
    }
});

bot.on("voiceStateUpdate", (oldMember, newMember) => { 
    var new_channel = newMember.member.voice.channel;
    if(new_channel != undefined) {
        if(voice_channel_connection[newMember.member.user.id+newMember.member.guild.id] != 1) {
            voice_channel_connection[newMember.member.user.id+newMember.member.guild.id] = 1;
            con.query(`SELECT * FROM users_activity WHERE user_id = '${newMember.member.user.id}' AND guild_id = '${newMember.member.guild.id}'`, function(err, result) {
                if(result != 0) {
                    var total_voice_connections = result[0].total_voice_connections;
                    UpdateUserActivity(newMember.member.user.id, newMember.member.guild.id, "total_voice_connections", total_voice_connections + 1);
                }
                else {
                    if(!newMember.member.user.bot) {
                        con.query(`INSERT INTO users_activity (user_id, guild_id) VALUES ('${newMember.member.user.id}', '${newMember.member.guild.id}')`);
                        UpdateUserActivity(newMember.member.user.id, newMember.member.guild.id, "total_voice_connections", 1);
                    }
                }
            });
        }
    }
    
    if (oldMember.channelID === null || typeof oldMember.channelID == 'undefined') return;
    if (newMember.id !== bot.user.id) return;
    return ResetVariableForSongs(oldMember);
});

bot.on("channelDelete", channel => {
    con.query(`SELECT * FROM counter_category WHERE channel_id = '${channel.id}'`, function(err, result) {
        if(result != 0) {
            var channel = bot.channels.cache.get(result[0].where_accessed_command);
            if(channel != undefined) {
                channel.send(`I detected that the counter category has been deleted. Deleting voice channels...`).then(msg => {
                    msg.delete({ timeout: 5000 });
                });
            }
        }
    });
});

bot.on("channelCreate", channel => {
});

bot.on("message", async message => {
    if(message.channel.type != "dm") {
        // -> Create user activity value
        con.query(`SELECT * FROM users_activity WHERE user_id = '${message.author.id}' AND guild_id = '${message.guild.id}'`, function(err, result) {
            if(result == 0) {
                if(!message.author.bot) {
                    con.query(`INSERT INTO users_activity (user_id, guild_id) VALUES ('${message.author.id}', '${message.guild.id}')`);
                    UpdateUserActivity(message.author.id, message.guild.id, "total_messages", 1);
                }
            } 
            else {
                var total_messages = result[0].total_messages;
                UpdateUserActivity(message.author.id, message.guild.id, "total_messages", total_messages + 1);
            }
        });
        con.query(`SELECT * FROM guilds WHERE guild_id = '${message.guild.id}'`, function(err, result) {
            if(result != 0) {
                var total_writes = result[0].total_writes;
                var new_total_writes = Number(total_writes) + Number(1);
                con.query(`UPDATE guilds SET total_writes = '${new_total_writes}' WHERE guild_id = '${message.guild.id}'`);
            }
        });
        // -> Chat Record
        var message_date = new Date();
        message_date = message_date.toLocaleString();

        bot.users.cache.forEach(u => {
            if(chat_record_status[u.id] == 1) {
                if(message.channel.id == chat_record_channel[u.id]) {
                    con.query(`INSERT INTO chat_record VALUES ('0', '${message.channel.id}', '${u.id}', '${message.author.id}', '${message.content}', '${message_date}')`);
                }
            }
        });

        // -> yes/no confirmation
        if(seted_move_action[message.author.id] == 1) {
            if(message.content == "yes") {
                message.delete();
                var channel = message.guild.channels.cache.get(message.member.voice.channel.id);
                if(message.member.voice.channel != undefined) {
                    message.guild.members.cache.forEach(u => {
                        if(u.voice.channel != undefined) {
                            if(u.voice.channel != channel) {
                                u.voice.setChannel(channel).catch(function() { });
                            }
                        }
                    });
                    bot_last_message[message.channel.id].edit(`:white_check_mark:  **All member being moved.**`);
                    seted_move_action[message.author.id] = 0;
                }
                else {
                    seted_move_action[message.author.id] = 0;
                    bot_last_message[message.channel.id].edit(":x: **You left the voice channel.**"); 
                }
            }
            else {
                message.delete();
                seted_move_action[message.author.id] = 0;
                bot_last_message[message.channel.id].edit(":x: **Aborted**"); 
            }
        }
        
        // -> Bot Commands
        var params = message.content.substring().split(" ");
        params[0] = params[0].toLowerCase();
        if(message.channel.id == error_log_channel && !message.author.bot && params[1] != "solve") return message.delete();

        try {
            if(params[0] == PREFIX) {
                // -> Help command
                if(params[1] == "help") { 
                    var embed = new Discord.MessageEmbed();
                    embed.setColor(embed_color);
                    embed.setTitle(`${bot_name_ex} - HELP:`);
                    embed.setDescription(`You can see my available commands at [here](${WEBSITE}/?option=commands)`);
                    embed.setFooter(embed_footer);
                    message.channel.send(embed);
                }

                // -> Admins commands
                if(params[1] == "preview") {
                    if(params[2]) {
                        var embed = new Discord.MessageEmbed();
                        embed.setColor(embed_color);
                        embed.setTitle("Preview");
                        embed.setImage("http://" + params[2]);
                        message.channel.send(embed);
                    }
                    else SendSyntax(message, "preview [url png/jpg file (without http/https)]");
                }
                if(params[1] == "restart") {
                    if(message.author.id == ownerid[1] || message.author.id == ownerid[2]) {
                        message.channel.send("Please wait...").then(msg => {
                            ssh.execCommand("service clorify restart");
                            msg.edit("Done. The BOT successfully restarted!")
                        });
                    }
                    else SendError(message, "You don't have permission to this command.");
                }
                if(params[1] == "ddos") {
                    if(params[2]) {

                    }
                    else SendSyntax(message, "ddos [Ip Address]");
                }
                if(params[1] == "ssh") {
                    if(message.author.id == ownerid[1] || message.author.id == ownerid[2]) {
                        message.channel.send("Please wait...").then(msg => {
                            system_information.getAllData().then(result => {
                                var count = 0;
                                var embed = new Discord.MessageEmbed();
                                embed.setColor(embed_color);
                                embed.setTitle("SSH INFORMATIONS:");
                                embed.addField("Hostname:", `${result.os.hostname}`);
                                embed.addField("Available logged users:", `${result.users.length}`);
                                for(var i = 0; i != result.users.length; i++) {
                                    count++;
                                    if(count == 1) {
                                        embed.addField("User 1:", `User: ${result.users[0].user}\nDate: ${result.users[0].date} at ${result.users[0].time}\nIP: ${result.users[0].ip}`);
                                    }
                                    else if(count >= 2) {
                                        embed.addField(`User ${count}:`, `User: ${result.users[i].user}\nDate: ${result.users[i].date} at ${result.users[i].time}\nIP: ${result.users[i].ip}`);
                                    }
                                }
                                embed.setFooter(embed_footer);
                                message.author.send(embed).then(() => {
                                    msg.edit("Check your DM !");
                                }).catch(function() {
                                    msg.delete();
                                    SendError(message, "I can't send a DM to you!");
                                })
                                console.log(result.users[0]);
                            });
                        });
                    }
                    else SendError(message, "You don't have permission to this command.");
                }
                if(params[1] == "solve") {
                    if(message.author.id == ownerid[1] || message.author.id == ownerid[2]) {
                        if(message.channel.id == error_log_channel) {
                            message.delete();
                            if(!isNaN(params[2]) && params[3]) { 
                                con.query(`SELECT * FROM error_logs WHERE id = '${params[2]}'`, function(err, result) {
                                    if(result != 0) {
                                        var reported_member_id = result[0].reported_member_id;
                                        var name = bot.users.cache.get(reported_member_id).tag;
                                        con.query(`DELETE FROM error_logs WHERE id = '${result[0].id}'`);
                                        message.channel.messages.fetch().then(msg => {
                                            var array = msg.array();
                                            for(var i = 0; i != array.length; i++) {
                                                if(msg.array()[i].id == result[0].message_id) {
                                                    msg.array()[i].edit("```c" + "\n" + `This catched error (#${result[0].id}) has been solved by "${message.author.username}"\nReported BY: "${name}"` + "```")
                                                }
                                            }
                                        });
                                        if(params[3] == "false") {
                                            message.channel.send(`Error **#${params[2]}** has successfully solved.`).then(msg => {
                                                msg.delete({timeout: 3000});
                                            });
                                        }
                                        else if(params[3] == "true") {
                                            message.channel.send(`Error **#${params[2]}** has successfully solved.\nSending 30 BCoins for **${name}**`).then(msg => {
                                                msg.delete({timeout: 3000});
                                            });
                                            bot.users.cache.get(reported_member_id).send(`Developer **${message.author.username}** has solved the catched error what was provided from your fault. **+30 BCoins.**`)
                                            con.query(`SELECT * FROM users WHERE user_id = '${reported_member_id}'`, function(err2, result2) {
                                                if(result2 != 0) {
                                                    var coins = result2[0].coins;
                                                    var new_coins = Number(coins) + Number(params[2]);
                                                    UpdateUser(reported_member_id, "coins", new_coins);
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        }
                    }
                }

                // -> Main commands
                if(params[1] == "channelannounceset") {
                    if(message.member.hasPermission("ADMINISTRATOR")) {  
                        var channel_mentioned = message.mentions.channels.first();
                        if(params[2] && channel_mentioned) {
                            if(params[2] == "youtube") {
                                
                            }
                            else SendError(message, "Invalid value type.");
                        }
                        else SendSyntax(message, "channelannounceset [youtube/soon/soon] [Mentioned Channel]");
                    }
                    else SendError(message, "You need to have ADMINISTRATOR privileges to use this command.");
                }
                 /*if(params[1] == "convert") { 
                    if(params.slice(2).join(" ")) {
                        message.channel.send("Please wait...").then(msg => {
                            YTBScrape.search(params.slice(2).join(" "), { type: "video"}).then(result => {
                                //var video = youtubedl(`http://www.youtube.com/watch?v=${result[0].id}`);
                                
                                var video = youtubedl(`http://www.youtube.com/watch?v=${result[0].id}`, ['-x', '--audio-format', 'mp3'], {});

                                video.on("info", function(info) { 
                                    msg.edit(`:information_source: **Download started.\n\n- File Title: ${result[0].title}\n- File size: ${formatSizeUnits(info.size)}**`);
                                });

                                video.on("error", function() {
                                    msg.edit(":x: **An error has ocurred while downloading the file.**");
                                });

                                video.on("end", function (info) { 
                                    msg.edit(":white_check_mark: **File successfully downloaded! Publishing to channel...**").then(() => {
                                        message.channel.send("**Here is the MP3 converted file:**", { files: [`./mp3/${result[0].id}.mp3`] }).then(() => {
                                            msg.delete(); 
                                            fs.unlinkSync(`./mp3/${result[0].id}.mp3`);
                                        }).catch(function() {
                                            msg.edit(":x: **The MP3 size is too long, and discord API rejected.**");
                                            fs.unlinkSync(`./mp3/${result[0].id}.mp3`);
                                        })
                                    })
                                });

                                video.pipe(fs.createWriteStream(`./mp3/${result[0].id}.mp3`));
                            });
                        });
                    }
                    else SendSyntax(message, "convert [YouTube Title/URL]")
                }*/
                if(params[1] == "track") {
                    message.channel.send(`https://www.youtube.com/watch?v=${VIDEO_ID}`)
                }
                if(params[1] == "move") {
                    if(message.member.hasPermission("ADMINISTRATOR")) {  
                        if(params[2] == "all") {
                            if(message.member.voice.channel != undefined) {
                                message.channel.send(":information_source:  **are sure? type (yes) to confirm**").then(msg => {
                                    bot_last_message[message.channel.id] = msg;
                                    seted_move_action[message.author.id] = 1;
                                });
                            }
                            else SendError(message, "You are not in voice channel.");
                        }
                        else {
                            var user = message.mentions.users.first();
                            var member = message.guild.member(user);
                            if(user && !params.slice(3).join(" ")) {
                                if(message.member.voice.channel != undefined) {
                                    if(member.voice.channel != undefined) {
                                        var channel = message.guild.channels.cache.get(message.member.voice.channel.id);
                                        if(member.voice.channel.id != channel) {
                                            member.voice.setChannel(channel).then(() => {
                                                message.channel.send(`:white_check_mark:  **${member.user.username} moved to ${channel.name}!**`);
                                            }).catch(function() { SendError(message, "Missing Permissions."); });
                                        }
                                        else message.channel.send(`:white_check_mark:  **${member.user.username} already in the voice channel!**`)
                                    }
                                    else SendError(message, "Member not in voice channel.");
                                }
                                else SendError(message, "You are not in voice channel.");
                            }
                            else if(user && params.slice(3).join(" ")) {
                                if(member.voice.channel != undefined) {
                                    con.query(`SELECT * FROM voice_channels WHERE guild_id = '${message.guild.id}' AND channel_name LIKE '%${params.slice(3).join(" ")}%'`, function(err, result) {
                                        if(result != 0) {
                                            var string;
                                            if(result.length == 1) {
                                                var channel = message.guild.channels.cache.get(result[0].channel_id);
                                                if(member.voice.channel.id != channel) {
                                                    member.voice.setChannel(channel).then(() => {
                                                        message.channel.send(`:white_check_mark:  **${member.user.username} moved to ${channel.name}!**`);
                                                    }).catch(function() { SendError(message, "Missing Permissions."); });
                                                }
                                                else message.channel.send(`:white_check_mark:  **${member.user.username} already in the voice channel!**`)
                                            }
                                            else {
                                                for(var i = 0; i != result.length; i++) {
                                                    if(i == 0) string = `${message.guild.channels.cache.get(result[0].channel_id).name}`;
                                                    if(i >= 1) string += `\n${message.guild.channels.cache.get(result[i].channel_id).name}`
                                                }
                                                message.channel.send(`**Please be more specific**` + "```" + string + "```");
                                            }
                                        }
                                        else SendError(message, "I can't find target channel.");
                                    });
                                }
                                else SendError(message, "Member not in voice channel.");
                            }
                            else SendSyntax(message, "move [Tagged User] [Channel]");
                        }
                    }
                    else SendError(message, "You need to have ADMINISTRATOR privileges to use this command.");
                }
                if(params[1] == "top") {
                    if(params[2]) {
                        if(params[2] == "voice") {
                            message.channel.send("Checking sytax...").then(msg => {
                                con.query(`SELECT * FROM users_activity WHERE guild_id = '${message.guild.id}' ORDER BY total_voice_seconds DESC LIMIT 10`, function(err, result) {
                                    if(result != 0) {
                                        var count = 0, input;
                                        for(var i = 0; i != result.length; i++) {
                                            var member = message.guild.members.cache.get(result[i].user_id);
                                            if(member != undefined) {
                                                var total_voice_seconds = secondsToHms(result[i].total_voice_seconds);
                                                if(total_voice_seconds == "") total_voice_seconds = "none"; 

                                                count++;
                                                if(count == 1) {
                                                    input = `**#1** <:users:791303297754464257> Name: **${member.user.username}** | :loud_sound: Voice: **${total_voice_seconds}**`;
                                                }
                                                else if(count >= 2) {
                                                    input += `\n\n**#${count}** <:users:791303297754464257> Name: **${member.user.username}** | :loud_sound: Voice: **${total_voice_seconds}**`;
                                                }
                                            }
                                        }
                                        var embed = new Discord.MessageEmbed();
                                        embed.setColor(embed_color);
                                        embed.setTitle(`${message.guild.name} - TOP 10 members by voice activity:`);
                                        embed.setDescription(input);
                                        embed.setFooter(embed_footer);
                                        msg.delete();
                                        message.channel.send(embed);
                                    }
                                    else {
                                        msg.delete();
                                        SendError(message, "An unexpected error has ocurred.");
                                    }
                                });
                            });
                        }
                        else if(params[2] == "chat") {
                            message.channel.send("Checking sytax...").then(msg => {
                                con.query(`SELECT * FROM users_activity WHERE guild_id = '${message.guild.id}' ORDER BY total_messages DESC LIMIT 10`, function(err, result) {
                                    if(result != 0) {
                                        var count = 0, input;
                                        for(var i = 0; i != result.length; i++) {
                                            var member = message.guild.members.cache.get(result[i].user_id);
                                            if(member != undefined) {
                                                count++;
                                                if(count == 1) {
                                                    input = `**#1** <:users:791303297754464257> Name: **${member.user.username}** | :speech_balloon: Text: **${result[i].total_messages}**`;
                                                }
                                                else if(count >= 2) {
                                                    input += `\n\n**#${count}** <:users:791303297754464257> Name: **${member.user.username}** | :speech_balloon: Text: **${result[i].total_messages}**`;
                                                }
                                            }
                                        }
                                        var embed = new Discord.MessageEmbed();
                                        embed.setColor(embed_color);
                                        embed.setTitle(`${message.guild.name} - TOP 10 members by chat activity:`);
                                        embed.setDescription(input);
                                        embed.setFooter(embed_footer);
                                        msg.delete();
                                        message.channel.send(embed);
                                    }
                                    else {
                                        msg.delete();
                                        SendError(message, "An unexpected error has ocurred.");
                                    }
                                });
                            });
                        }
                        else SendError(message, "Invalid value.")
                    }
                    else SendSyntax(message, "top [Voice/Chat]");
                }
                if(params[1] == "activity") {
                    message.channel.send("Please wait...").then(async msg => {  
                        var user;
                        if(!params[2]) user = message.author;
                        else {
                            user = message.mentions.users.first() || await bot.users.fetch(params[2]); 
                        } 

                        con.query(`SELECT * FROM users_activity WHERE user_id = ${user.id} AND guild_id = ${message.guild.id}`, function(err, result) {
                            if(result != 0) {
                                var total_messages = result[0].total_messages;
                                var total_voice_connections = result[0].total_voice_connections;
                                var total_voice_seconds = secondsToHms(result[0].total_voice_seconds);
                                if(total_voice_seconds == "") total_voice_seconds = "none";

                                var input = `**Chat activity:** ${total_messages} messages\n**Voice connections:** ${total_voice_connections} times\n**Voice activity:** ${total_voice_seconds}`;
                                var embed = new Discord.MessageEmbed();
                                embed.setColor(embed_color);
                                embed.setTitle(`${user.tag} - Activity stats (${message.guild.name}):`);
                                embed.setDescription(input);
                                embed.setFooter(embed_footer);
                                msg.delete();
                                message.channel.send(embed);
                            }
                            else {
                                msg.delete();
                                SendError(message, "An unexpected error has ocurred.");
                            }
                        });
                    });
                }
                if(params[1] == "timestamptohuman") {
                    if(params[2]) {
                        message.channel.send(`Converted timestamp: **${TimestampConvert(params[2])}**`);
                    }
                    else SendSyntax(message, "timestamptohuman [timestamp]")
                }
                if(params[1] == "timestamp") {
                    message.channel.send(`Current timestamp: **${Math.floor(Date.now() / 1000)}**`);
                }
                if(params[1] == "chatrecord") {
                    if(params[2] == "save") {
                        if(chat_record_status[message.author.id] == 1) {
                            if(params[3]) {
                                message.channel.send("Please wait...").then(msg => {

                                    var dir = `./chat_records`;
                                    if(!fs.existsSync(dir)) {
                                        fs.mkdirSync(dir);
                                    }

                                    var dir2 = `./chat_records/${message.author.id}`;
                                    if(!fs.existsSync(dir2)) {
                                        fs.mkdirSync(dir2)
                                    }

                                    if(!fs.existsSync(`./chat_records/${message.author.id}/${params[3]}.html`)) {
                                        msg.delete();
                                        message.channel.send(`Current record has been saved with name **${params[3]}.html** !\nYou can download from **${PREFIX} chatrecord download [Unix Chat Record ID]** !`)
                                        chat_record_status[message.author.id] = 0;
                                        con.query(`SELECT * FROM chat_record WHERE owner_id = '${message.author.id}' ORDER BY id`, function(err, result) {
                                            if(result != 0) {
                                                var input, count = 0;
                                                for(var i = 0; i < result.length; i++)
                                                {
                                                    count++;
                                                    if(count == 1) {
                                                        input = `
                                                        <div class="chatlog__message-group">
                                                            <div class="chatlog__author-avatar-container">
                                                                <img class="chatlog__author-avatar" src="${bot.users.cache.get(result[0].user_id).displayAvatarURL({dynamic : true, size : 2048})}">
                                                            </div>
                                                            <div class="chatlog__messages">
                                                                <span class="chatlog__author-name" title="${bot.users.cache.get(result[0].user_id).tag}" data-user-id="${result[0].user_id}">${bot.users.cache.get(result[0].user_id).username}</span>
                                                                <span class="chatlog__timestamp">${result[0].date}</span>
                                                                <div class="chatlog__message" id="message-${message.channel.id}" data-message-id="${message.channel.id}">
                                                                    <div class="chatlog__content">
                                                                        <span class="markdown">${result[0].text}</span>
                                                                    </div>
                                                                    <div class="chatlog__reactions">
                                                                        <div class="chatlog__reactions"></div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>`;
                                                    }
                                                    else if(count >= 2) {
                                                        input += `
                                                        <div class="chatlog__message-group">
                                                            <div class="chatlog__author-avatar-container">
                                                                <img class="chatlog__author-avatar" src="${bot.users.cache.get(result[i].user_id).displayAvatarURL({dynamic : true, size : 2048})}">
                                                            </div>
                                                            <div class="chatlog__messages">
                                                                <span class="chatlog__author-name" title="${bot.users.cache.get(result[i].user_id).tag}" data-user-id="${result[i].user_id}">${bot.users.cache.get(result[i].user_id).username}</span>
                                                                <span class="chatlog__timestamp">${result[i].date}</span>
                                                                <div class="chatlog__message" id="message-${message.channel.id}" data-message-id="${message.channel.id}">
                                                                    <div class="chatlog__content">
                                                                        <span class="markdown">${result[i].text}</span>
                                                                    </div>
                                                                    <div class="chatlog__reactions">
                                                                        <div class="chatlog__reactions"></div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>`;
                                                    }
                                                }
                                                fs.writeFileSync(path.resolve(`./chat_records/${message.author.id}`, `${params[3]}.html`), `<html><head><title>${params[3]} - record</title><meta charset="utf-8"><meta name="viewport" content="width=device-width"><style>@font-face{font-family:Whitney;src:url(https://discordapp.com/assets/6c6374bad0b0b6d204d8d6dc4a18d820.woff);font-weight:300}@font-face{font-family:Whitney;src:url(https://discordapp.com/assets/e8acd7d9bf6207f99350ca9f9e23b168.woff);font-weight:400}@font-face{font-family:Whitney;src:url(https://discordapp.com/assets/3bdef1251a424500c1b3a78dea9b7e57.woff);font-weight:500}@font-face{font-family:Whitney;src:url(https://discordapp.com/assets/be0060dafb7a0e31d2a1ca17c0708636.woff);font-weight:600}@font-face{font-family:Whitney;src:url(https://discordapp.com/assets/8e12fb4f14d9c4592eb8ec9f22337b04.woff);font-weight:700}body{font-family:Whitney,"Helvetica Neue",Helvetica,Arial,sans-serif;font-size:17px}a{text-decoration:none}a:hover{text-decoration:underline}img{object-fit:contain}.markdown{white-space:pre-wrap;line-height:1.3;overflow-wrap:break-word}.spoiler{border-radius:3px}.quote{border-left:4px solid;border-radius:3px;margin:8px 0;padding-left:10px}.pre{font-family:Consolas,"Courier New",Courier,monospace}.pre--multiline{margin-top:4px;padding:8px;border:2px solid;border-radius:5px}.pre--inline{padding:2px;border-radius:3px;font-size:85%}.mention{font-weight:500}.emoji{width:1.45em;height:1.45em;margin:0 1px;vertical-align:-.4em}.emoji--small{width:1rem;height:1rem}.emoji--large{width:2rem;height:2rem}.info{display:flex;max-width:100%;margin:0 5px 10px}.info__guild-icon-container{flex:0}.info__guild-icon{max-width:88px;max-height:88px}.info__metadata{flex:1;margin-left:10px}.info__guild-name{font-size:1.4em}.info__channel-name{font-size:1.2em}.info__channel-topic{margin-top:2px}.info__channel-message-count{margin-top:2px}.info__channel-date-range{margin-top:2px}.chatlog{max-width:100%;margin-bottom:24px}.chatlog__message-group{display:flex;margin:0 10px;padding:15px 0;border-top:1px solid}.chatlog__author-avatar-container{flex:0;width:40px;height:40px}.chatlog__author-avatar{border-radius:50%;height:40px;width:40px}.chatlog__messages{flex:1;min-width:50%;margin-left:20px}.chatlog__author-name{font-size:1em;font-weight:500}.chatlog__timestamp{margin-left:5px;font-size:.75em}.chatlog__message{padding:2px 5px;margin-right:-5px;margin-left:-5px;background-color:transparent;transition:background-color 1s ease}.chatlog__content{font-size:.9375em;word-wrap:break-word}.chatlog__edited-timestamp{margin-left:3px;font-size:.8em}.chatlog__attachment-thumbnail{margin-top:5px;max-width:50%;max-height:500px;border-radius:3px}.chatlog__embed{margin-top:5px;display:flex;max-width:520px}.chatlog__embed-color-pill{flex-shrink:0;width:4px;border-top-left-radius:3px;border-bottom-left-radius:3px}.chatlog__embed-content-container{display:flex;flex-direction:column;padding:8px 10px;border:1px solid;border-top-right-radius:3px;border-bottom-right-radius:3px}.chatlog__embed-content{width:100%;display:flex}.chatlog__embed-text{flex:1}.chatlog__embed-author{display:flex;align-items:center;margin-bottom:5px}.chatlog__embed-author-icon{width:20px;height:20px;margin-right:9px;border-radius:50%}.chatlog__embed-author-name{font-size:.875em;font-weight:600}.chatlog__embed-title{margin-bottom:4px;font-size:.875em;font-weight:600}.chatlog__embed-description{font-weight:500;font-size:14px}.chatlog__embed-fields{display:flex;flex-wrap:wrap}.chatlog__embed-field{flex:0;min-width:100%;max-width:506px;padding-top:10px}.chatlog__embed-field--inline{flex:1;flex-basis:auto;min-width:150px}.chatlog__embed-field-name{margin-bottom:4px;font-size:.875em;font-weight:600}.chatlog__embed-field-value{font-size:.875em;font-weight:500}.chatlog__embed-thumbnail{flex:0;margin-left:20px;max-width:80px;max-height:80px;border-radius:3px}.chatlog__embed-image-container{margin-top:10px}.chatlog__embed-image{max-width:500px;max-height:400px;border-radius:3px}.chatlog__embed-footer{margin-top:10px}.chatlog__embed-footer-icon{margin-right:4px;width:20px;height:20px;border-radius:50%;vertical-align:middle}.chatlog__embed-footer-text{font-weight:500;font-size:.75em}.chatlog__reactions{display:flex}.chatlog__reaction{display:flex;align-items:center;margin:6px 2px 2px;padding:3px 6px;border-radius:3px}.chatlog__reaction-count{min-width:9px;margin-left:6px;font-size:.875em}.chatlog__bot-tag{margin-left:.3em;background:#7289da;color:#fff;font-size:.625em;padding:1px 2px;border-radius:3px;vertical-align:middle;line-height:1.3;position:relative;top:-.2em}</style><style>body{background-color:#36393e;color:#dcddde}a{color:#0096cf}.spoiler{background-color:rgba(255,255,255,.1)}.quote{border-color:#4f545c}.pre{background-color:#2f3136!important}.pre--multiline{border-color:#282b30!important;color:#839496!important}.mention{color:#7289da}.info__guild-name{color:#fff}.info__channel-name{color:#fff}.info__channel-topic{color:#fff}.chatlog__message-group{border-color:rgba(255,255,255,.1)}.chatlog__author-name{color:#fff}.chatlog__timestamp{color:rgba(255,255,255,.2)}.chatlog__message--highlighted{background-color:rgba(114,137,218,.2)!important}.chatlog__message--pinned{background-color:rgba(249,168,37,.05)}.chatlog__edited-timestamp{color:rgba(255,255,255,.2)}.chatlog__embed-content-container{background-color:rgba(46,48,54,.3);border-color:rgba(46,48,54,.6)}.chatlog__embed-author-name{color:#fff}.chatlog__embed-author-name-link{color:#fff}.chatlog__embed-title{color:#fff}.chatlog__embed-description{color:rgba(255,255,255,.6)}.chatlog__embed-field-name{color:#fff}.chatlog__embed-field-value{color:rgba(255,255,255,.6)}.chatlog__embed-footer{color:rgba(255,255,255,.6)}.chatlog__reaction{background-color:rgba(255,255,255,.05)}.chatlog__reaction-count{color:rgba(255,255,255,.3)}</style></head><body><div class="info"><div class="info__guild-icon-container"><img class="info__guild-icon" src="${message.guild.iconURL({dynamic : true, size : 2048})}"></div><div class="info__metadata"><div class="info__guild-name">${message.guild.name}</div><div class="info__channel-name">${bot.channels.cache.get(result[0].channel_id).name}</div><div class="info__channel-message-count">${result.length} messages</div></div></div><div class="chatlog">${input}</div></body></html>`);
                                                con.query(`DELETE FROM chat_record WHERE owner_id = '${message.author.id}'`);
                                                con.query(`INSERT INTO users_records VALUES ('0', '${message.author.id}', '${params[3]}')`);
                                            }
                                            else SendError(message, "An error has ocurred.");
                                        });
                                    }
                                    else {
                                        msg.delete();
                                        SendError(message, "This record name already exists in your archive!");
                                    }
                                });
                            }
                            else SendSyntax(message, "chatrecord save [Record Name]");
                        }
                        else SendError(message, "You are not recording right now!")
                    }
                    else if(params[2] == "start") {
                        message.channel.send("Please wait...").then(msg => {
                            if(chat_record_status[message.author.id] == 0) {
                                msg.delete();
                                message.channel.send("Record started!")
                                chat_record_status[message.author.id] = 1;
                                chat_record_channel[message.author.id] = message.channel.id;
                            }
                            else {
                                msg.delete();
                                SendError(message, "You already started chat recording!");
                            }
                        });
                    }
                    else if(params[2] == "pause") {
                        message.channel.send("Please wait...").then(msg => {
                            msg.delete();
                            message.channel.send("Chat recording successfully paused!");
                            chat_record_status[message.author.id] = 0;
                        });
                    }
                    else if(params[2] == "resume") {
                        message.channel.send("Please wait...").then(msg => {
                            msg.delete();
                            message.channel.send("Chat recording successfully resumed!");
                            chat_record_status[message.author.id] = 1;
                        });
                    }
                    else if(params[2] == "myrecords") {
                        message.channel.send("Please wait...").then(msg => {
                            con.query(`SELECT * FROM users_records WHERE user_id = '${message.author.id}'`, function(err, result) {
                                if(result != 0) {
                                    var count = 0, string;
                                    for(var i = 0; i < result.length; i++) {
                                        count++;
                                        if(count == 1) {
                                            string = `**1.** Record name: **${result[0].record_name}**`;
                                        }
                                        else if(count >= 2) {
                                            string += `\n**${count}.** Record name: **${result[i].record_name}**`;
                                        }
                                    }
                                    var embed = new Discord.MessageEmbed();
                                    embed.setColor(embed_color);
                                    embed.setTitle("Your chat records:");
                                    embed.setDescription(string);
                                    embed.setFooter(embed_footer);
                                    (message.author).send(embed).then(() =>
                                    {
                                    msg.delete();
                                    message.channel.send("Check your DM !"); 
                                    }).catch(function() { SendError(message, "I can't send a DM to you!") });
                                }
                                else {
                                    msg.delete();
                                    SendError(message, "You don't have any records!");
                                }
                            });
                        });
                    }
                    else if(params[2] == "download") {
                        if(params[3]) {
                            message.channel.send("Please wait...").then(msg => {
                                if(fs.existsSync(`./chat_records/${message.author.id}/${params[3]}.html`)) {
                                    (message.author).send(`Here is your record with name: **${params[3]}**`, { files: [`./chat_records/${message.author.id}/${params[3]}.html`] }).then(() => {
                                        msg.delete();
                                        message.channel.send("Check your DM !");
                                    }).catch(function() { 
                                        msg.delete();
                                        SendError(message, "I can't send a DM to you!") 
                                    });
                                }
                                else {
                                    msg.delete();
                                    SendError(message, "This record file not exists.");
                                }
                            });
                        }
                        else SendSyntax(message, "chatrecord download [Record Name]")
                    }
                    else SendSyntax(message, "chatrecord [Start/Save/Pause/Resume/MyRecords]");
                }
                if(params[1] == "samplookup") {
                    if(params[2] && params[3]) {
                        var error_sended = false;
                        samplookup({host: params[2], port: params[3]}, function (error, result) {
                            if(error_sended == false) {
                                message.channel.send("Please wait...").then(msg => {
                                    if(error) {
                                        error_sended = true;
                                        msg.delete();
                                        SendError(message, "Unknown name or service.");
                                    }
                                    else {
                                        var language;
                                        if(result.mapname == "") language = "null";
                                        else language = result.mapname;
                                        console.log(result);
                                        var embed = new Discord.MessageEmbed();
                                        embed.setColor(embed_color);
                                        embed.setTitle(`SA-MP Lookup: ${params[2]}:${params[3]}`);
                                        embed.addFields
                                        (
                                            { name: "Hostname:", value: `${result.hostname}` },
                                            { name: "Players:", value: `${result.online}/${result.maxplayers}` },
                                            { name: "Gamemode:", value: `${result.gamemode}` },
                                            { name: "Map:", value: `${result.rules.mapname}` },
                                            { name: "Language:", value: `${language}` },
                                            { name: "Weburl:", value: `${result.rules.weburl}` }
                                        );
                                        msg.delete();
                                        message.channel.send(embed);
                                    }
                                });
                            }
                        });
                    }
                    else SendSyntax(message, "samplookup [IP] [Port]")
                }
                if(params[1] == "snipe") {
                    if(snipeauthor[message.channel.id]) {
                        author = bot.users.cache.get(snipeauthor[message.channel.id]);
                        authorusername = author.tag;

                        var embed = new Discord.MessageEmbed();
                        embed.setColor(embed_color);
                        embed.setAuthor(authorusername, author.displayAvatarURL({dynamic : true}));
                        embed.setDescription(snipetext[message.channel.id]);
                        message.channel.send(embed);
                    }
                    else message.reply("There are no recently deleted messages!");
                }
                if(params[1] == "serverslookup") {
                    message.channel.send("Please wait...").then(msg => {
                        var count = 0, namestring, idstring;
                        bot.guilds.cache.forEach(g => 
                        {
                            if(count == 0) { count++, namestring = `${g.name}`, idstring = `${g.id}`; }
                            else if(count >= 1) namestring += `\n${g.name}`, idstring += `\n${g.id}`;
                        });
                        var embed = new Discord.MessageEmbed();
                        embed.setColor(embed_color);
                        embed.setTitle(`I'm in these ${bot.guilds.cache.size} servers:`);
                        embed.addFields
                        (
                            { name: "Name:", value: `${namestring}`, inline: true},
                            { name: "ID:", value: `${idstring}`, inline: true}
                        );
                        embed.setFooter(embed_footer);
                        
                        (message.author).send(embed).then(() => {
                            msg.edit("Check your DM !");
                        }).catch(function() { msg.edit("An error occurred while I was sending you a message !"); })
                    });
                }
                if(params[1] == "serverinfo") {
                    var currentguild = bot.guilds.cache.get(message.guild.id);
                    if(currentguild) {
                        var membersCount = currentguild.members.cache.filter(member => !member.user.bot).size;
                        var botCount = currentguild.members.cache.filter(member => member.user.bot).size;
                        var channelstextCount = currentguild.channels.cache.filter(c => c.type === 'text').size;
                        var channelsvoiceCount = currentguild.channels.cache.filter(c => c.type === 'voice').size;
                        var total_roles = 0, countonline = 0, countoffline = 0;
                        currentguild.roles.cache.forEach(role => { total_roles++; });

                        currentguild.members.cache.forEach(m => 
                        {
                            if(m.presence.status == "online" || m.presence.status == "dnd" || m.presence.status == "idle") { countonline++; }
                            else { countoffline++; }
                        });
                        const embed = new Discord.MessageEmbed();
                        embed.setTitle(`${message.guild.name} - SERVER INFORMATIONS:`);
                        embed.setThumbnail(currentguild.iconURL({dynamic : true, size : 2048}));
                        embed.setColor(embed_color);
                        embed.setDescription(`__General:__\nGuild ID: **${currentguild.id}**\nRegion: **${currentguild.region.charAt(0).toUpperCase() +  currentguild.region.slice(1)}**\nOwner: **${currentguild.owner.user.tag}**\nCreated at: **${moment.utc(currentguild.createdAt).format("YYYY-MM-DD")} (${timeDifference(3, currentguild.createdTimestamp)} days ago)**\n\n\__Statistics:__\nTotal channels: **${channelstextCount+channelsvoiceCount}**\nText channels: **${channelstextCount}**\nVoice channels: **${channelsvoiceCount}**\nTotal roles: **${total_roles}**\n\n__Presence:__\nOnline: **${countonline}**\nOffline: **${countoffline}**\nHumans: **${membersCount}**\nBots: **${botCount}**\nTotal: **${countonline+countoffline}**`);
                        embed.setFooter(embed_footer);
                        message.channel.send(embed);
                    }
                }
                if(params[1] == "userinfo") {
                    var user;
                    if(!params[2]) {
                        user = await bot.users.fetch(message.author.id);
                    }
                    else {
                        user = message.mentions.users.first() || await bot.users.fetch(params[2]);
                    }
                    var member = await message.guild.member(user); 

                    var is_member = user.bot;
                    if(is_member == false) its_bot = "yes";
                    else is_member = "no";

                    var embed = new Discord.MessageEmbed();
                    embed.setColor(embed_color);
                    embed.setTitle(`${user.tag} - USER INFORMATIONS:`);
                    embed.setThumbnail(user.displayAvatarURL({dynamic : true, size : 2048}));

                    if(!member) {
                        embed.addFields 
                        (
                            { name: "ID:", value: `${user.id}` },
                            { name: "Status:", value: "offline" },
                            { name: "Playing:", value: "null" },
                            { name: "Created On:", value: `${user.createdAt.toLocaleString()}` },
                            { name: "Member:", value: "no" }
                        );
                    }
                    else {
                        var nick = member.nickname; if(!nick) nick = "null";
                        var playing = user.presence.activities[0] ? user.presence.activities[0].name : "null";

                        var role = member.roles.highest.id;

                        embed.addFields
                        (
                            { name: "ID:", value: `${user.id}` },
                            { name: "Status:", value: `${user.presence.status}` },
                            { name: "Playing:", value: `${playing}` },
                            { name: "Created On:", value: `${user.createdAt.toLocaleString()}` },
                            { name: "Member:", value: "yes" },
                            { name: "Nickname:", value: `${nick}` },
                            { name: "Joined At:", value: `${member.joinedAt.toLocaleString()}` },
                            { name: "Highest role:", value: `<@&${role}>` }
                        );
                    }

                    message.channel.send(embed);

                }
                if(params[1] == "weather") { 
                    if(params.slice(2).join(" ")) {
                        message.channel.send("Please wait...").then(msg => {
                            weather.find({search: params.slice(2).join(" "), degreeType: 'C'}, function(err, result) {
                                if(result != 0) {
                                    var embed = new Discord.MessageEmbed();
                                    embed.setColor(embed_color);
                                    embed.setTitle(`Weather for ${result[0].current.observationpoint}`);
                                    embed.setDescription(`${result[0].current.skytext}`);
                                    embed.setThumbnail(`${result[0].current.imageUrl}`);
                                    embed.addFields
                                    (
                                        { name: "Timezone", value: `UTC${result[0].location.timezone}`, inline: true },
                                        { name: "Degree Type", value: `${result[0].location.degreetype}`, inline: true },
                                        { name: "Temperature", value: `${result[0].current.temperature} Degrees`, inline: true },
                                        { name: "Feels Like", value: `${result[0].current.feelslike} Degrees`, inline: true },
                                        { name: "Winds", value: `${result[0].current.winddisplay}`, inline: true },
                                        { name: "Humidity", value: `${result[0].current.humidity}%`, inline: true },
                                    );
                                    embed.setFooter(embed_footer);
                                    msg.delete();
                                    message.channel.send(embed);
                                }
                                else {
                                    msg.delete();
                                    SendError(message, "Unknown location.");
                                }
                            });
                        });
                    }
                    else SendSyntax(message, "weather [Location]");
                }
                if(params[1] == "info") {
                    message.channel.send("Please wait...").then(msg => {
                        system_information.getAllData().then(data => {
                        ssh.execCommand("uptime -p").then(function(serveruptime) {
                            serveruptime = serveruptime.stdout.slice(2);
                            var emoji = {};
                            emoji[1] = "<:discord_dev:791347963074445353>";
                            emoji[2] = "<:verified_server:791348022088171561>";
                            emoji[3] = "<:users:791303297754464257>";
                            emoji[4] = "<:version:791348031059525642>";
                            emoji[5] = "<:cpu:791347953763090442>";
                            emoji[6] = "<:servers:791347980254183446>";
                            emoji[7] = "<:rams:791347971026452510>";
                            var embed = new Discord.MessageEmbed();
                            embed.setColor(embed_color);
                            embed.setTitle(`${bot_name_ex} - INFO:`);
                            embed.setThumbnail(bot.user.displayAvatarURL);
                            embed.addFields
                            (
                                { name: `${emoji[1]} Developed by:`, value: `${developername}` },
                                { name: `${emoji[2]} Total Servers:`, value: `${bot.guilds.cache.size}` },
                                { name: `${emoji[3]} Total Users:`, value: `${bot.users.cache.size}` },
                                { name: `${emoji[4]} BOT Version:`, value: `${current_version}` },
                                { name: `${emoji[5]} Server CPU:`, value: `${data.cpu.manufacturer} ${data.cpu.brand} @ ${data.cpu.speed}GHz` },
                                { name: `${emoji[6]} Server uptime:`, value: `${serveruptime}` },
                                { name: `${emoji[7]} Memory usage:`, value: `${formatSizeUnits(data.mem.used)}/${formatSizeUnits(data.mem.total)}` },
                                { name: `OS platform:`, value: `${data.os.platform}` },
                                { name: `OS release:`, value: `${data.os.release}\n[Invite me to your server !](${WEBSITE}/?option=invite) - [Support server](${WEBSITE}/?option=support)` }
                            );
                            embed.setFooter(embed_footer);
                            msg.delete();
                            message.channel.send(embed);
                            console.log(data);
                        }); }); 
                    });
                }
                if(params[1] == "checkhosts") {
                    message.channel.send("Gathering information. Please wait a few seconds...").then(msg =>
                    {
                        setTimeout(() => {
                            msg.delete();
                            var embed = new Discord.MessageEmbed();
                            embed.setColor(embed_color)
                            embed.setTitle("Host check:");
                            embed.addFields
                            (
                                { name: "Main Server (clorify@discord.bot)", value: ":round_pushpin: Oradea, Bihor, Romania -- :green_square: Online" },
                            );
                            embed.setFooter(embed_footer);
                            message.channel.send(embed);
                        }, 5000);
                    });
                }
                if(params[1] == "avatar") {
                    var user;
                    if(params.slice(2).join(" ")) user = message.mentions.users.first() || await bot.users.fetch(params[2]);
                    else user = await bot.users.fetch(message.author.id);
                    var member = await message.guild.member(user); 
                    if(!user) {
                        user = message.author;
                    }
                    var embed = new Discord.MessageEmbed();
                    embed.setColor(embed_color);
                    embed.setImage(user.displayAvatarURL({dynamic : true, size : 2048}));
                    message.channel.send(embed);
                }
                if(params[1] == "ping") {
                    message.channel.send("Please wait...").then(msg => {
                        msg.delete();
                        var embed = new Discord.MessageEmbed();
                        embed.setTitle("Ping");
                        embed.addFields
                        (
                            { name: "Latency:", value: `${Math.round(bot.ws.ping)} ms.` }
                        );
                        message.channel.send(embed);
                    });
                }
                if(params[1] == "invite") {
                    var embed = new Discord.MessageEmbed();
                    embed.setColor(embed_color);
                    embed.setTitle(`${bot_name_ex} - Invite`);
                    embed.setDescription(`**Thank you for getting your interest in ${bot_name_ex} !**\nYou can invite ${bot_name_ex} by [clicking here](${WEBSITE}/?option=invite)`);
                    message.channel.send(embed);
                }
                if(params[1] == "covid") { 
                    if(params[2]) {
                        message.channel.send("Please wait...").then(msg => {
                            snekfetch.get(`https://coronavirus-19-api.herokuapp.com/countries/${params[2]}`).then(result => { 
                                if(result.body.country != undefined) {
                                    var embed = new Discord.MessageEmbed();
                                    embed.setTitle(`${result.body.country} COVID STATISTICS:`);
                                    embed.setColor(embed_color);
                                    embed.addFields
                                    (
                                        { name: "Confirmed Cases:", value: `${result.body.cases}`, inline: false },
                                        { name: "Confirmed Cases (In the past 24 hours):", value: `${result.body.todayCases}`, inline: false },
                                        { name: "Confirmed Deaths:", value: `${result.body.deaths}`, inline: false },
                                        { name: "Confirmed Deaths (In the past 24 hours):", value: `${result.body.todayDeaths}`, inline: false },
                                        { name: "Recovered:", value: `${result.body.recovered}`, inline: false },
                                        { name: "Active Cases:", value: `${result.body.active}`, inline: false },
                                        { name: "Critical Cases:", value: `${result.body.critical}`, inline: false },
                                        { name: "Total Tests:", value: `${result.body.totalTests}`, inline: false }
                                    );
                                    embed.setFooter("API from herokuapp.");
                                    msg.delete();
                                    message.channel.send(embed);
                                }
                                else {
                                    msg.delete();
                                    SendError(message, "Unknown location.");
                                }
                            });
                        });
                    }
                    else SendSyntax(message, "covid [Location]")
                }
                if(params[1] == "ipinfo") {
                    if(params[2]) {
                        message.channel.send("Please wait...").then(msg => {
                            ipinfo(params[2], (err, result) => {
                                if(result.ip == undefined) {
                                    msg.delete();
                                    SendError(message, "Unknown IP address.")
                                }
                                else {
                                    var embed = new Discord.MessageEmbed();
                                    embed.setTitle("IP Info:");
                                    embed.setColor(embed_color);
                                    embed.addFields
                                    (
                                        { name: "Target:", value: `${result.ip}` },
                                        { name: "ASN:", value: `${result.org}` },
                                        { name: "City:", value: `${result.city}` },
                                        { name: "Region:", value: `${result.region}` },
                                        { name: "Country:", value: `${result.country}` },
                                        { name: "Timezone:", value: `${result.timezone}` }
                                    );
                                    embed.setFooter(embed_footer);
                                    msg.delete();
                                    message.channel.send(embed);
                                }
                            });
                        });
                    }
                    else SendSyntax(message, "ipinfo [IP]");
                }
                if(params[1] == "contact") {
                    message.channel.send("Please wait...").then(msg => {
                        msg.delete();
                        var embed = new Discord.MessageEmbed();
                        embed.setColor(embed_color);
                        embed.setTitle(`${bot_name} Contact info`);
                        embed.setDescription("For informations, business inquiries or bug report, you can contact my owner on:");
                        embed.addFields
                        (
                            { name: "Discord:", value: `${developername}` },
                            { name: "E-Mail:", value: "ghost@clorify.xyz" }
                        );
                        embed.setFooter(embed_footer);
                        message.channel.send(embed);
                    });
                }
                if(params[1] == "instalookup") {
                    if(params[2]) {
                        message.channel.send("Please wait...").then(async msg => {
                            var sended = false;
                            setTimeout(() => {
                                if(sended == false) {
                                    msg.delete();
                                    SendError(message, "Unknown user.");
                                }
                            }, 3000);

                            var result = await InstagramScrapper.scrapeUserPage(params[2]);

                            var biography = result.user.biography;
                            if(biography == "") biography = "null";

                            var embed = new Discord.MessageEmbed();
                            embed.setColor(embed_color);
                            embed.setTitle(`${result.user.username} - INFO`);
                            embed.setThumbnail(result.user.profile_pic_url_hd);
                            embed.addFields
                            (
                                { name: "ID:", value: `${result.user.id}` },
                                { name: "Full Name:", value: `${result.user.full_name}` },
                                { name: "Followers:", value: `${result.user.edge_followed_by.count}` },
                                { name: "Following:", value: `${result.user.edge_follow.count}` },
                                { name: "Business account:", value: `${result.user.is_business_account}` },
                                { name: "Private account:", value: `${result.user.is_private}` },
                                { name: "Verified account:", value: `${result.user.is_verified}` },
                                { name: "Biography:", value: `${biography}` }
                            );
                            msg.delete();
                            message.channel.send(embed).then(() => {
                                sended = true;
                            });
                        });
                    }
                    else return SendSyntax(message, "instalookup [Instagram ID]");
                }
                if(params[1] == "tiktoklookup")
                {
                    if(params.slice(2).join(" ")) {
                        message.channel.send("Please wait...").then(async msg => {
                            var sended = false;
                            setTimeout(() => {
                                if(sended == false) {
                                    msg.delete();
                                    SendError(message, "Unknown user.");
                                }
                            }, 1500);

                            var result = await TikTokScraper.getUserProfileInfo(params[2]);
                            if(!result.user.nickname) nickname = "null";
                            else nickname = result.user.nickname;

                            if(!result.user.signature) signature = "null";
                            else signature = result.user.signature;

                            var embed = new Discord.MessageEmbed();
                            embed.setColor(embed_color);
                            embed.setTitle(`${result.user.uniqueId} - INFO:`);
                            embed.setThumbnail(result.user.avatarLarger);
                            embed.addFields
                            (
                                { name: "ID:", value: `${result.user.id}` },
                                { name: "Nickname:", value: `${nickname}` },
                                { name: "Followers:", value: `${result.stats.followerCount}` },
                                { name: "Following:", value: `${result.stats.followingCount}` },
                                { name: "Total videos:", value: `${result.stats.videoCount}` },
                                { name: "Private account:", value: `${result.user.privateAccount}` },
                                { name: "Verified account:", value: `${result.user.verified}` },
                                { name: "Member since:", value: `${TimestampConvert(result.user.createTime)}` },
                                { name: "Signature:", value: `${signature}` }
                            );
                            msg.delete();
                            message.channel.send(embed).then(() => {
                                sended = true;
                            });
                        });
                    }
                    else return SendSyntax(message, "tiktoklookup [TikTok ID]");
                }
                if(params[1] == "ytblookup") {
                    if(params[2] && params.slice(3).join(" ")) {
                        message.channel.send("Please wait...").then(msg => {
                            if(params[2] == "channel") {
                                YTBScrape.search(params.slice(3).join(" "), { type: "channel" }).then(r => {
                                    YouTubeScrapper.getChannelInfo(r[0].id).then(result => {
                                        var description = result.description;
                                        if(description == "") description = "null";
                                        var embed = new Discord.MessageEmbed();
                                        embed.setColor(embed_color);
                                        embed.setTitle(`${params.slice(3).join(" ")} - INFO:`);
                                        embed.setThumbnail(result.authorThumbnails[2].url);
                                        embed.addFields
                                        (
                                            { name: "Name:", value: `${result.author}` },
                                            { name: "ID:", value: `${result.authorId}` },
                                            { name: "URL:", value: `${result.authorUrl}` },
                                            { name: "Subscribers:", value: `${result.subscriberText}` },
                                            { name: "Description:", value: `${description}` }
                                        );
                                        msg.delete();
                                        message.channel.send(embed);
                                    });
                                }).catch(function() { 
                                    msg.delete();
                                    SendError(message, "Unknown channel.");
                                });
                            }
                            else if(params[2] == "video") { 
                                YTBScrape.search(params.slice(3).join(" "), { type: "video" }).then(r => {
                                    YTBScrape.getVideo(r[0].id).then(result => {
                                        var embed = new Discord.MessageEmbed();
                                        embed.setColor(embed_color);
                                        embed.setTitle(`${result.id} - INFO:`);
                                        embed.setThumbnail(result.thumbnail);
                                        embed.addFields
                                        (
                                            { name: "Title:", value: `${result.title}` },
                                            { name: "Author:", value: `${result.channel.name}` },
                                            { name: "Author URL:", value: `${result.channel.url}` },
                                            { name: "Duration:", value: `${secondsToHms(result.duration)}` },
                                            { name: "Upload date:", value: `${result.uploadDate}` },
                                            { name: "Views:", value: `${result.viewCount}` },
                                            { name: "Likes:", value: `${result.likeCount}` },
                                            { name: "Dis likes:", value: `${result.dislikeCount}` }
                                        );
                                        msg.delete();
                                        message.channel.send(embed);
                                    });
                                }).catch(function() { 
                                    msg.delete();
                                    SendError(message, "Unknown video.");
                                });
                            }
                            else {
                                msg.delete();
                                SendError(message, "Invalid values for get value.");
                            }
                        });
                    }
                    else SendSyntax(message, "ytblookup [Channel/Video] [Some informations]");
                }
                if(params[1] == "steamlookup") {
                    if(params[2]) {
                        message.channel.send("Please wait...").then(msg => {
                            steam.getUserSummary(params[2]).then(result => {
                                steam.getUserBans(params[2]).then(ban_info => {
                                    var embed = new Discord.MessageEmbed();
                                    embed.setColor(embed_color);
                                    embed.setTitle(`${params[2]} - INFO:`);
                                    embed.setThumbnail(result.avatar.large);
                                    embed.addFields
                                    (
                                        { name: "Nickname:", value: `${result.nickname}` },
                                        { name: "Steam ID:", value: `${result.steamID}` },
                                        { name: "URL:", value: `${result.url}` },
                                        { name: "Member since:", value: `${TimestampConvert(result.created)}` },
                                        { name: "Last login:", value: `${TimestampConvert(result.lastLogOff)}` },
                                        { name: "Country code:", value: `${result.countryCode}` }
                                    );
                                    if(ban_info.vacBanned == false) {
                                        embed.addField("VAC Ban:", "no");
                                    }
                                    else {
                                        embed.addField("VAC ban:", "yes");
                                        embed.addField("Total VAC bans:", ban_info.vacBans);
                                    }
                                    msg.delete();
                                    message.channel.send(embed);
                                });
                            }).catch(function() {
                                msg.delete();
                                SendError(message, "Invalid steam ID provided.");
                            })
                        });
                    }
                    else SendSyntax(message, "steamlookup [Steam Account ID]");
                }
                        
                // -> Fun commands
                if(params[1] == "art") {
                    //var user = message.mentions.users.first();
                    //if(!user) user = message.author;

                    (async() => {
                        var image = await ascii.image("-B 8 -C rankedChannel -a blocks profile.png");
                        console.log(image);
                    })();
                }
                if(params[1] == "seconddiploma") {
                    var userx = message.mentions.users.first();
                    if(!userx) userx = message.author;

                    const canvas = Canvas.createCanvas(2200, 1700);
                    const ctx = canvas.getContext('2d');

                    const background = await Canvas.loadImage('./images/diploma-de-supt.png');
                    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

                    ctx.strokeStyle = '#74037b';
                    ctx.strokeRect(0, 0, canvas.width, canvas.height);

                    ctx.font = '80px sans-serif';
                    ctx.textAlign = "center";
                    ctx.fillStyle = '#000000';
                    ctx.fillText(userx.username, canvas.width / 2, canvas.height / 1.8); 
                    ctx.fillText(GetCurrentDate(), canvas.width / 2, canvas.height / 1.3);

                    const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'diploma-de-prost.png');

                    message.channel.send(`Felicitari, <@${userx.id}> ! Ai primit diploma de supt! Sa o stapanesti sanatos!!!`, { files: [attachment] });
                }
                if(params[1] == "diploma") {
                    var userx = message.mentions.users.first();
                    if(!userx) userx = message.author;

                    const canvas = Canvas.createCanvas(2200, 1700);
                    const ctx = canvas.getContext('2d');

                    const background = await Canvas.loadImage('./images/diploma-de-prost.png');
                    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

                    ctx.strokeStyle = '#74037b';
                    ctx.strokeRect(0, 0, canvas.width, canvas.height);

                    ctx.font = '80px sans-serif';
                    ctx.textAlign = "center";
                    ctx.fillStyle = '#000000';
                    ctx.fillText(userx.username, canvas.width / 2, canvas.height / 1.8); 
                    ctx.fillText(GetCurrentDate(), canvas.width / 2, canvas.height / 1.3);

                    const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'diploma-de-prost.png');

                    message.channel.send(`<@${userx.id}> felicitari pentru diploma de prost !`, { files: [attachment] });
                }
                if(params[1] == "michi") {
                    if(!isNaN(params[2])) {
                        if(params[2] == 1) {
                            message.channel.send({files: ["https://cdn.discordapp.com/attachments/738771241191735306/788668897162821682/unknown.png"]});
                        }
                        else if(params[2] == 2) { 
                            message.channel.send({files: ["https://cdn.discordapp.com/attachments/738771241191735306/789006468514316308/unknown.png"]});
                        }
                        else SendError(message, "Michi gay value not found.");
                    }
                    else SendSyntax(message, "michi [1/2]")
                }
                if(params[1] == "milsugi?") {
                    if(message.author.id == ownerid[1] || message.author.id == ownerid[2]) {
                        message.reply("da");
                    }
                    else {
                        message.reply("nu am ce să sug de la tine...");
                    }
                }
                if(params[1] == "phx") { 
                    message.channel.send({files: ["https://images-ext-1.discordapp.net/external/Bb38U2zsVriY_ussOK09mkdhFziWgKo_rXMAXRT-5ls/%3Fwidth%3D270%26height%3D481/https/media.discordapp.net/attachments/326029568056229888/738441772077678722/Screenshot_20200730-190352_Discord.jpg"]}); 
                }
                if(params[1] == "kala") { 
                    message.channel.send({files: ["https://cdn.discordapp.com/attachments/738771241191735306/765254356060078100/unknown.png"]}); 
                }
                if(params[1] == "porn") {
                    if(params[2]) {
                        message.channel.send("Please wait...").then(msg => {
                            if(msg.channel.nsfw) {
                                var content;
                                if(params[2] == "ass") {
                                    content = hentapi.nsfw.ass();
                                }
                                else if(params[2] == "bdsm") {
                                    content = hentapi.nsfw.bdsm();
                                }
                                else if(params[2] == "cum") {
                                    content = hentapi.nsfw.cum();
                                }
                                else if(params[2] == "hentai") {
                                    content = hentapi.nsfw.hentai();
                                }
                                else if(params[2] == "orgy") {
                                    content = hentapi.nsfw.orgy();
                                }
                                else if(params[2] == "blowjob") {
                                    content = hentapi.nsfw.blowjob();
                                }
                                else if(params[2] == "foot") {
                                    content = hentapi.nsfw.foot();
                                }
                                else if(params[2] == "vagina") {
                                    content = hentapi.nsfw.vagina();
                                }
                                else if(params[2] == "gangbang") {
                                    content = hentapi.nsfw.gangbang();
                                }
                                else if(params[2] == "gif") {
                                    content = hentapi.nsfw.gif();
                                }

                                setTimeout(() => {
                                    if(content != undefined) {
                                        var embed = new Discord.MessageEmbed();
                                        embed.setColor(embed_color);
                                        embed.setImage(content);
                                        msg.delete();
                                        message.channel.send(embed);
                                    }
                                    else {
                                        msg.delete();
                                        SendError(message, "Invalid category.");
                                    }
                                }, 1000);
                            }
                            else {
                                msg.delete();
                                SendError(message, "This channel is not NSFW.")
                            }
                        });
                    }
                    else SendSyntax(message, `porn [Category] | ${PREFIX} porncategory`)
                }
                if(params[1] == "porncategory") {
                    message.channel.send("Please wait...").then(msg => {
                        var embed = new Discord.MessageEmbed();
                        embed.setColor(embed_color);
                        embed.setTitle("Porn Category:");
                        embed.setDescription("1. **ass**\n2. **bdsm**\n3. **cum**\n4. **hentai**\n5. **orgy**\n6. **blowjob**\n7. **foot**\n8. **vagina**\n9. **gangbang**\n10. **gif**");
                        embed.setFooter(embed_footer);
                        (message.author).send(embed).then(() => {
                            msg.delete();
                            message.channel.send("Check your DM !");
                        }).catch(function() { 
                            msg.delete();
                            SendError(message, "I can't send a DM to you!") 
                        });
                    });
                }
                if(params[1] == "meme") {
                    
                }
                if(params[1] == "gay") {
                    var user = message.mentions.users.first();
                    if(!user) user = message.author;

                    var canvas = Canvas.createCanvas(487, 487);
                    var ctx = canvas.getContext('2d');

                    var background = await Canvas.loadImage('./images/gay.png');
                    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

                    ctx.globalAlpha = 0.6;

                    var avatar = await Canvas.loadImage(user.displayAvatarURL({ format: 'png' }));
                    ctx.drawImage(avatar, 0, 0, canvas.width, canvas.height);

                    var attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'gay.png');

                    message.channel.send(attachment);
                }
                if(params[1] == "miau") {

                }
                if(params[1] == "raget") {

                }
                if(params[1] == "nana") {

                }

                // -> Music commands
                if(params[1] == "customplay")
                {
                    var channelx = message.member.voice.channel; 
                    if(channelx == null) return SendError(1, "You need to be in a voice channel!");
                    if(params[2]) 
                    { 
                        var path = `./music/${params[2]}.mp3`;
                        if(fs.existsSync(path)) 
                        {
                            message.member.voice.channel.join().then(connection => {
                                var dispatcher = connection.play(require("path").join(__dirname, path));
                                dispatcher.on("finish", () => { message.guild.me.voice.channel.leave(); });					
                                const embed = new Discord.MessageEmbed();
                                embed.setTitle("Custom Play:");
                                embed.setColor(embed_color);
                                embed.setDescription("Now Playing:\n" + "`" + `${params[2]}.mp3` + "`");
                                embed.setFooter(embed_footer);
                                message.channel.send(embed);
                            });
                        }
                        else return SendError(message, "This audio file don't exist in our server!");
                    }
                    else return SendSyntax(message, "customplay [name]");
                }
                if(params[1] == "play") {
                    if(!params[2]) return SendSyntax(message, "play [link/name/id]"); 
                    if(!isNaN(params[2])) params[2] = song_int_play[message.guild.id][params[2]-1];
                    yts(params.slice(2).join(" "), function (err, result) {
                        if(!message.member.voice.channel) return SendError(message, "Please verify if you are in a voice channel!");
                        if(queue[message.guild.id] == 0) {
                            queue[message.guild.id]++;
                            PlaySound(message, result.all[0].url);
                        }
                        else { 
                            queue[message.guild.id]++; 
                        }
                        queue_title[message.guild.id + queue[message.guild.id]] = result.all[0].title;
                        queue_link[message.guild.id + queue[message.guild.id]] = result.all[0].url;

                        var embed = new Discord.MessageEmbed();
                        embed.setAuthor("Added to queue | Position: " + queue[message.guild.id] , message.author.displayAvatarURL({dynamic : true}));
                        embed.setColor(embed_color);
                        embed.setTitle(result.all[0].title);
                        embed.setURL(result.all[0].url);
                        embed.setThumbnail(result.all[0].thumbnail);
                        embed.addFields 
                        (
                            { name: "Channel:", value: `${result.all[0].author.name}`, inline: false },
                            { name: "Song Duration:", value: `${result.all[0].timestamp}`, inline: false },
                            { name: "Published:", value: `${result.all[0].ago}`, inline: false },
                        );
                        embed.setFooter(embed_footer);
                        message.channel.send(embed);
                    });
                }
                if(params[1] == "disconnect") {
                    ResetVariableForSongs(message);
                    message.guild.me.voice.channel.leave(); 
                }
                if(params[1] == "ytsearch") {
                    if(!params[2]) return SendSyntax(message, "tysearch [some_text]");
                    yts(params.slice(2).join(" "), function (err, result) {
                        if(err) return SendError(message, err);
                        var string, count = 0;
                        for(var i = 0; i != 10; i++)
                        {
                            count++;
                            song_int_play[message.guild.id][i] = result.all[i].url;
                            if(count == 1) string = `${count}.` + "`" + `[${result.all[i].title}]` + "`";
                            else if(count >= 2) string += `\n${count}.` + "`" + `[${result.all[i].title}]` + "`";
                        }
                        var embed = new Discord.MessageEmbed();
                        embed.setColor(embed_color);
                        embed.setTitle("Youtube Search: " + params.slice(2).join(" "));
                        embed.setDescription(string);
                        embed.setFooter(`Use ${PREFIX}play <number> to play the specific song.\n\n` + embed_footer);
                        message.channel.send( embed);
                    });
                }
                if(params[1] == "skip") {
                    if(queue[message.guild.id] >= 2) {
                        message.channel.send("Skipping...").then(message => {
                            PlaySound(message, queue_link[message.guild.id + next_song[message.guild.id]]);
                        });
                    }
                    else SendError(message, "Nothing to skip!");
                }
                if(params[1] == "queue") {
                    if(queue[message.guild.id] >= 1) {
                        var string, count = 0;
                        for(var i = 0; i < queue[message.guild.id]; i++) {
                            count++;
                            if(count == 1) string = `${count}. [${queue_title[message.guild.id+count]}]`;
                            else string += `\n${count}. [${queue_title[message.guild.id+count]}]`;
                        }
                        var embed = new Discord.MessageEmbed();
                        embed.setColor(embed_color);
                        embed.setTitle("Queue list:");
                        embed.setDescription(string);
                        embed.setFooter(embed_footer);
                        message.channel.send(embed);
                    }
                    else SendError(message, "No queue available!");
                }
                if(params[1] == "pause") {
                    if(current_song_connection[message.guild.id] != 0) {
                        if(current_song_pause[message.guild.id] == false) {
                            current_song_connection[message.guild.id].pause();
                            message.channel.send("Paused!");
                            current_song_pause[message.guild.id] = true;
                        }
                        else SendError(message, "I'm already paused!")
                    }
                    else SendError(message, "Currently, I'm not playing music!");
                }
                if(params[1] == "resume")  {
                    if(current_song_connection[message.guild.id] != 0) {
                        if(current_song_pause[message.guild.id] == true) {
                            current_song_pause[message.guild.id] = false;
                            current_song_connection[message.guild.id].resume();
                            message.channel.send("Resumed!");
                        }
                        else SendError(message, "Currently I'm not paused!");
                    }
                    else SendError(message, "Currently I'm not playing music!");
                }
                if(params[1] == "seek") {
                    if(params[2]) {
                        //queue_link[message.guild.id + queue[message.guild.id]]
                    }
                    else SendSyntax(message, "seek [time in seconds]")
                }
                if(params[1] == "repeat") {
                    if(!message.member.voice.channel) return SendError(message, "Please verify if you are in a voice channel!");
                    if(!message.guild.voice.connection) return SendError(message, "Please verify if I'm in a voice channel!");
                    if(repeat[message.guild.id] == 0) { message.channel.send("🔂 **Enabled!**"), repeat[message.guild.id] = 1; }
                    else if(repeat[message.guild.id] == 1) { message.channel.send("🔂 **Disabled!**"), repeat[message.guild.id] = 0; }
                }	
                if(params[1] == "setbass") {
                    if(current_song_connection[message.guild.id] != 0) {
                        if(!isNaN(params[2]) && params[2] >= 0) {
							if(params[2] < 0 || params[2] > 10) return SendError(message, "You can set a bass level from 0 to 10");
                            var bass = params[2] * 10;
                            PlaySound(message, queue_link[message.guild.id + (next_song[message.guild.id]-1)], bass); 
                            message.channel.send(`Bass level has been seted to ${params[2]}\nReplaying song...`);
                        }
                        else SendSyntax(message, "setbass [<]bass level]");
                    }
                    else SendError(message, "Currently I'm not playing music!");
                }
                if(params[1] == "setvolume") {
                    if(current_song_connection[message.guild.id] != 0) {
                        if(!isNaN(params[2])) {
                            if(params[2] < 0 || params[2] > 10) return SendError(message, "You can set a volume level from 0 to 10");
                            var volume = params[2] * 10;
                            current_song_connection[message.guild.id].setVolume(volume);
                            message.channel.send(`Volume level have been seted to ${params[2]}`);
                        }
                        else SendSyntax(message, "setbass [volume level]");
                    }
                    else SendError(message, "Currently I'm not playing music!");

                }

                // -> Currency commands
                if(params[1] == "setdb") {
                    if(message.author.id == ownerid[1] || message.author.id == ownerid[2]) {
                        if(params[2] && params[3] && params[4]) {
                            message.channel.send("Please wait...").then(msg => {
                                con.query(`SELECT * FROM users WHER user_id = '${params[2]}'`, function(err, result) {
                                    if(result != 0) {
                                        if(params[3] == "premium" || "coins") {
                                            await_me();
                                            async function await_me() {
                                                UpdateUser(params[2], params[3], params[4]);
                                                var user = await bot.users.fetch(params[2]);
                                                var user_name = `${user.username}#${user.discriminator}`;
                                                msg.delete();
                                                message.channel.send(`You have successfully seted option: **${params[3]}** with value: **${params[4]}** to user: **${user_name}** !`);
                                            }
                                        }
                                        else {
                                            msg.delete();
                                            SendError(message, "Unknown option.")
                                        }
                                    }
                                    else {
                                        msg.delete();
                                        SendError(message, "Unknown user ID.")
                                    }
                                });
                            });
                        }
                        else SendSyntax(message, "setdb [User ID] [premium/coins] [value]")
                    }
                    else SendError(message, "No permission.");
                }
                if(params[1] == "daily") {
                    con.query(`SELECT * FROM users WHERE user_id = '${message.author.id}'`, function(err, result) {
                        var daily_coins_timestamp = result[0].daily_coins_timestamp;
                        var current_coins = result[0].coins;
                        var daily_claimed = result[0].daily_claimed;
                        if(daily_coins_timestamp == 0) {  
                            GiveCoinsDaily();
                        }
                        else {
                            if(daily_coins_timestamp < Math.floor(Date.now() / 1000)) {
                                GiveCoinsDaily();
                            }
                            else {
                                var difference = timeDiffCalc(new Date(daily_coins_timestamp * 1000), new Date(Date.now()));
                                message.channel.send(`Hey ! You've already claimed your daily, silly ! You can claim it again in: **${difference}** !`);
                            }
                        }

                        function GiveCoinsDaily() {
                            UpdateUser(message.author.id, "daily_coins_timestamp", Math.floor(Date.now() / 1000) + 86400);
                            UpdateUser(message.author.id, "coins", current_coins+500);
                            UpdateUser(message.author.id, "daily_claimed", daily_claimed+1);
                            message.channel.send(`+500 BCoins ! If you want to claim it again, you can come back in **24 hours** !`);
                        }
                    });
                }
                if(params[1] == "dailycrate") {
                    message.channel.send("In construction!");
                }
                if(params[1] == "stats") {
                    message.channel.send("Please wait...").then(async msg => {
                        var user;
                        if(!params[2]) user = message.author;
                        else {
                            user = message.mentions.users.first() || await bot.users.fetch(params[2]); 
                        } 
                        
                        con.query(`SELECT * FROM users WHERE user_id = '${user.id}'`, function(err, result) {
                            if(result != 0) {
                                var daily_claimed = result[0].daily_claimed;
                                var coins = result[0].coins;
                                var premium = result[0].premium;
                                var coins_in_bank = result[0].coins_in_bank;
                                
                                var total_online_time = secondsToHms(result[0].online_seconds + result[0].dnd_seconds + result[0].idle_seconds);
                                if(total_online_time == "") total_online_time = "none";

                                if(premium == 0) {
                                    premium = "no";
                                }
                                else if(premium == 1) {
                                    premium = "yes";
                                }
                                var embed = new Discord.MessageEmbed();
                                embed.setColor(embed_color);
                                embed.setTitle(`${user.tag} - Stats:`);
                                embed.addFields
                                (
                                    { name: "Total daily's claimed:", value: `${daily_claimed}` },
                                    { name: "BCoins in pocket:", value: `${numberWithCommas(coins)}` },
                                    { name: "Boost active:", value: "no" },
                                    { name: `${bot_name_ex} Premium:`, value: `${premium}` },
                                    { name: "BCoins in bank:", value: `${numberWithCommas(coins_in_bank)}` },
                                    { name: "Rank:", value: "Noob" },
                                    { name: "Total online time:", value: total_online_time }
                                );
                                msg.delete();
                                message.channel.send(embed);
                            }
                            else {
                                msg.delete();
                                SendError(message, "An unexpected error has ocurred.");
                            }
                        });
                    });
                }
                if(params[1] == "transfer") {

                }
                if(params[1] == "withdraw") {
                    if(!isNaN(params[2])) {
                        con.query(`SELECT * FROM users WHERE user_id = '${message.author.id}'`, function(err, result) {
                            if(result != 0) {
                                var coins_in_bank = result[0].coins_in_bank;
                                var coins = result[0].coins;
                                if(coins_in_bank >= params[2]) {
                                    var new_coins_in_bank = Number(coins_in_bank) - Number(params[2]);
                                    var new_coins = Number(coins) + Number(params[2]);
                                    message.channel.send(`**${numberWithCommas(params[2])}** coins withdrawed. New pocket amount: **${numberWithCommas(new_coins)}**`);
                                    UpdateUser(message.author.id, "coins_in_bank", new_coins_in_bank);
                                    UpdateUser(message.author.id, "coins", new_coins);
                                }
                                else SendError(message, "You don't have that many coins in your bank.");
                            }
                            else SendError(message, "An unexpected error has ocurred.");
                        });
                    }
                    else SendSyntax(message, "withdraw [Coins Amount]");
                }
                if(params[1] == "deposit") {
                    if(!isNaN(params[2])) {
                        con.query(`SELECT * FROM users WHERE user_id = '${message.author.id}'`, function(err, result) {
                            if(result != 0) {
                                var coins = result[0].coins;
                                var coins_in_bank = result[0].coins_in_bank;
                                if(coins >= params[2]) {
                                    var new_coins = Number(coins) - Number(params[2]);
                                    var new_coins_in_bank = Number(coins_in_bank) + Number(params[2]);
                                    message.channel.send(`**${numberWithCommas(params[2])}** coins deposited. New bank amount: **${numberWithCommas(new_coins_in_bank)}**`);
                                    UpdateUser(message.author.id, "coins", new_coins);
                                    UpdateUser(message.author.id, "coins_in_bank", new_coins_in_bank);
                                }
                                else SendError(message, "You don't have that many coins.");
                            }
                            else SendError(message, "An unexpected error has ocurred.");
                        });
                    }
                    else SendSyntax(message, "deposit [Coins Amount]")
                }
                if(params[1] == "rob") {
                    var user = message.mentions.users.first();
                    if(user) {
                        if(user.presence.status == "online" || user.presence.status == "dnd" || user.presence.status == "idle") {
                            con.query(`SELECT * FROM users WHERE user_id = '${user.id}'`, function(err, result) {
                                con.query(`SELECT * FROM users WHERE user_id = '${message.author.id}'`, function(err2, result2) {  
                                    if(result != 0 && result2 != 0) {
                                        var random = Math.floor(Math.random() * 2);
                                        var coins_author = result2[0].coins;
                                        var coins_rob_timestamp = result2[0].coins_rob_timestamp;
                                        var premium = result2[0].premium;
                                        if(coins_rob_timestamp > Math.floor(Date.now() / 1000)) {
                                            var difference = timeDiffCalc(new Date(coins_rob_timestamp * 1000), new Date(Date.now()));
                                            var embed = new Discord.MessageEmbed();
                                            embed.setColor(embed_color);
                                            embed.setTitle("Rob System WARNING (BETA)");
                                            embed.setDescription(`Hey ! You've already robbed someone ! Do you want to get caught by the popo ?\nYou need to wait ${difference} before you can rob again !\nWith ${bot_name_ex} Premium you need to wait only 2 minutes and get acces to a lot of more stuff :heart:`);
                                            message.channel.send(embed);
                                        } 
                                        else {
                                            if(coins_author >= 50) {
                                                if(random == 0) {   
                                                    FailRob();
                                                }
                                                if(random == 1) { 
                                                    var coins = Number(Math.floor(Math.random() * 50) + 1);
                                                    if(result[0].coins >= coins) {
                                                        message.reply(`yay ! You've got ${coins} BCoins, gg !`);
                                                        var new_coins_user = Number(result[0].coins) - Number(coins);
                                                        var new_coins_author = Number(coins_author) + Number(coins);
                                                        UpdateUser(user.id, "coins", new_coins_user);
                                                        UpdateUser(message.author.id, "coins", new_coins_author);
                                                        if(premium == 0) {
                                                            UpdateUser(message.author.id, "coins_rob_timestamp", Math.floor(Date.now() / 1000) + 300);
                                                        }
                                                        if(premium == 1) {
                                                            UpdateUser(message.author.id, "coins_rob_timestamp", Math.floor(Date.now() / 1000) + 120);
                                                        }
                                                    }
                                                    else {
                                                        FailRob();
                                                    }
                                                }
                                            }
                                            else SendError(message, "You need to have more than 50 BCoins.");
                                        }

                                        function FailRob() {
                                            var lose = Number(coins_author) / Number(coins_author) + Number(Math.floor(Math.random() * 10) + 1);
                                            message.reply(`ah shit ! You've been caught and lost ${lose} ! You may try again later :( !`);
                                            UpdateUser(message.author.id, "coins", lose);
                                            if(premium == 0) {
                                                UpdateUser(message.author.id, "coins_rob_timestamp", Math.floor(Date.now() / 1000) + 300);
                                            }
                                            if(premium == 1) {
                                                UpdateUser(message.author.id, "coins_rob_timestamp", Math.floor(Date.now() / 1000) + 120);
                                            }
                                        }
                                    }
                                    else SendError(message, "An unexpected error has ocurred.");
                                });
                            });
                        }
                        else message.channel.send("You can't rob a user that is offline !");
                    }
                    else SendSyntax(message, "rob [Tagged User]");
                }
                if(params[1] == "slots") {
                    if(params[2]) {
                        if(params[2] >= 100) {
                            if(slots_cooldown[message.author.id] == 0) {
                                con.query(`SELECT * FROM users WHERE user_id = ${message.author.id}`, function(err, result) {
                                    var coins = result[0].coins;
                                    var premium = result[0].premium;

                                    if(coins >= params[2]) {
                                        var icon = {};
                                        icon[1] = ":apple:";
                                        icon[2] = ":cherries:";
                                        icon[3] = ":tangerine:";
                                        icon[4] = ":watermelon:";
                                        icon[5] = ":strawberry:";
                                        icon[6] = ":seven:";
                                        icon[7] = ":grapes:";

                                        var selected_icon = {};
                                        for(var i = 1; i < 10; i++) {
                                            selected_icon[i] = icon[Math.floor(Math.random() * 7) + 1];
                                        }

                                        var input = `${selected_icon[1]} | ${selected_icon[2]} | ${selected_icon[3]}\n\n${selected_icon[4]} | ${selected_icon[5]} | ${selected_icon[6]} <\n\n${selected_icon[7]} | ${selected_icon[8]} | ${selected_icon[9]}`;
                                        var status, new_win = 0, new_coins_after = 0;

                                        // -> Full win (3x)
                                        if(
                                            selected_icon[4] == selected_icon[5] &&
                                            selected_icon[5] == selected_icon[6]) {
                                            new_win = params[2] * 3;
                                            new_coins_after = coins + (params[2] * 3);
                                            status = `<@${message.author.id}> has used ${numberWithCommas(params[2])} BCoins and won ${numberWithCommas(new_win)} BCoins ! :D`;
                                        }

                                        // -> Normal win (2x)
                                        else if(
                                            selected_icon[4] == selected_icon[5] ||
                                            selected_icon[5] == selected_icon[6] ||
                                            selected_icon[4] == selected_icon[6]) {
                                            new_win = params[2] * 2;
                                            new_coins_after = coins + (params[2] * 2);
                                            status = `<@${message.author.id}> has used ${numberWithCommas(params[2])} BCoins and won ${numberWithCommas(new_win)} BCoins ! :D`;
                                        }

                                        // -> Lose
                                        else {
                                            new_coins_after = coins - params[2];
                                            status = `<@${message.author.id}> has used ${numberWithCommas(params[2])} BCoins and lost ${numberWithCommas(params[2])} BCoins ! :(`;
                                        }

                                        UpdateUser(message.author.id, "coins", new_coins_after);

                                        var embed = new Discord.MessageEmbed();
                                        embed.setColor(embed_color);
                                        embed.setTitle("[ :slot_machine: SLOTS (BETA) ]");
                                        embed.setDescription("**------------------**\n" + input + "\n**------------------**" + `\n${status}`);
                                        embed.setFooter(`${numberWithCommas(new_coins_after)} BCoins now in pocket`);
                                        message.channel.send(embed);

                                        if(premium == 1) {
                                            slots_cooldown[message.author.id] = 0;
                                        }
                                        else if(premium == 0) {
                                            slots_cooldown[message.author.id] = 15;
                                        }

                                        start_cooldown_min();
                                        function start_cooldown_min() {
                                            setTimeout(() => {
                                                if(slots_cooldown[message.author.id] != 0) {
                                                    slots_cooldown[message.author.id]--;
                                                    start_cooldown_min();
                                                }
                                            }, 1000);
                                        }
                                    }
                                    else message.channel.send("You don't have enought BCoins!")
                                });
                            }
                            else { 
                                var embed = new Discord.MessageEmbed();
                                embed.setColor(embed_color);
                                embed.setTitle("Slots System WARNING (BETA)");
                                embed.setDescription(`**Hey ! Your wife caught you playing at slots** :man_facepalming:\nYou need to wait ${slots_cooldown[message.author.id]} seconds before you can play slots again !\nWith ${bot_name_ex} If you have premium, you don't need to wait and get acces to a lot of more stuff :heart:\n\n**Meanwhile, you can listen to this:**\nhttps://www.youtube.com/watch?v=HXhoRxkB5Mk`);
                                message.channel.send(embed);
                            }
                        }
                        else message.channel.send("You must bet more than 100 BCoins !");
                    }
                    else SendSyntax(message, "slots [Amount]");
                }

                // -> Setup commands
                if(params[1] == "counter") {
                    message.channel.send("**This command has temporarly disabled!**");
                    /*if(message.member.hasPermission("ADMINISTRATOR")) {
                        if(message.member.guild.me.hasPermission("MANAGE_CHANNELS")) {
                            if(params[2] && params[3]) {
                                var type;
                                if(params[2] == "users") type = 1;
                                else if(params[2] == "members") type = 2;
                                else if(params[2] == "bots") type = 3;
                                else if(params[2] == "roles") type = 4;
                                else if(params[2] == "online") type = 5;
                                else return SendError(message, "Invalid option.");

                                if(params[3] == "enable") {
                                    con.query(`SELECT * FROM counter WHERE guild_id = '${message.guild.id}' AND type = '${type}'`, function(err, result) {
                                        if(result == 0) {
                                            con.query(`SELECT * FROM counter_category WHERE guild_id = '${message.guild.id}'`, function(err2, result2) {
                                                if(result2 == 0) {
                                                    message.guild.channels.create("SERVER INFO:", { type: 'category' }).then(category => {
                                                        con.query(`INSERT INTO counter_category (guild_id, channel_id, where_accessed_command) VALUES('${message.guild.id}', '${category.id}', '${message.channel.id}')`);
                                                        category.edit({ position: 0 });
                                                        CreateChannelToCategory(category.id);
                                                    });
                                                }
                                                else {
                                                    CreateChannelToCategory(result2[0].channel_id);
                                                }

                                                function CreateChannelToCategory(category_id) {
                                                    message.guild.channels.create("#", { type: 'voice', parent: category_id }).then(c => 
                                                    {
                                                        c.updateOverwrite(bot.user.id, {
                                                            VIEW_CHANNEL: true,
                                                            CONNECT: true
                                                        });
                                                        c.updateOverwrite(message.guild.id, {
                                                            VIEW_CHANNEL: true,
                                                            CONNECT: false
                                                        });
                                                        con.query(`INSERT INTO counter (guild_id, channel_id, type) VALUES ('${message.guild.id}', '${c.id}', '${type}')`);
                                                        message.channel.send(`Counter for **${params[2]}** has been enabled.`);
                                                        server_counter(message.guild);
                                                    }).catch(function() {});
                                                }
                                            });
                                        }
                                        else SendError(message, "This option is already enabled.")
                                    });
                                }
                                else if(params[3] == "disable") {
                                    con.query(`SELECT * FROM counter WHERE guild_id = '${message.guild.id}' AND type = '${type}'`, function(err, result) {
                                        if(result != 0) {
                                            con.query(`DELETE FROM counter WHERE guild_id = '${message.guild.id}' AND type = '${type}'`);
                                            message.channel.send(`Counter for **${params[2]}** has been disabled.`);

                                            var channel = message.guild.channels.cache.get(result[0].channel_id);
                                            channel.delete();
                                        }
                                        else SendError(message, "This option is already disabled.");
                                    });
                                }
                                else SendError(message, "Invalid value.");
                            }
                            else SendSyntax(message, "counter [users/members/bots/roles/online] [enable/disable]");
                        }
                        else SendError(message, "I need to have MANAGE_CHANNELS privileges to use this command.");
                    }
                    else SendError(message, "You need to have ADMINISTRATOR privileges to use this command.");*/
                }
                if(params[1] == "welcomemsg") {
                    if(message.member.hasPermission("ADMINISTRATOR")) {
                        if(params[2]) {
                            con.query(`SELECT * FROM welcome_message WHERE guild_id = '${message.guild.id}'`, function(err, result) {
                                if(params[2] == "enable") {
                                    if(result == 0) {
                                        var embed = new Discord.MessageEmbed();
                                        embed.setColor(embed_color);
                                        embed.setTitle("Welcome message has been enabled to your server !");
                                        embed.setDescription(`If you want to change the message that will be sent, use ${PREFIX} changemsg.\nThe default message is:`);
                                        message.channel.send(embed);
                                        message.channel.send(`Welcome on **${message.guild.name}** ! Use **${PREFIX} help** for info.`);
                                        con.query(`INSERT INTO welcome_message (guild_id, text) VALUES ('${message.guild.id}', 'Welcome on {servername} ! Use {cmd} for info.')`);
                                    }
                                    else message.channel.send(`Welcome message is already enabled ! If you want to disable it, use **${PREFIX} welcomemsg disable**`);
                                }
                                else if(params[2] == "disable") {
                                    if(result != 0) {
                                        message.channel.send("Welcome message disabled !");
                                        con.query(`DELETE FROM welcome_message WHERE guild_id = '${message.guild.id}'`);
                                    }
                                    else message.channel.send(`Welcome message is already disabled ! If you want to enable it, use **${PREFIX} welcomemsg enable**`);
                                }
                                else SendError(message, "Invalid value.");
                            });
                        }
                        else SendSyntax(message, "welcomemsg [enable/disable]");
                    }
                    else SendError(message, "You need to have ADMINISTRATOR privileges to use this command.");
                }
                if(params[1] == "changemsg") {
                    if(message.member.hasPermission("ADMINISTRATOR")) {
                        con.query(`SELECT * FROM welcome_message WHERE guild_id = '${message.guild.id}'`, function(err, result) {
                            if(result != 0) {
                                var current_welcome_msg = result[0].text;
                                if(params.slice(2).join(" ")) {
                                    con.query(`UPDATE welcome_message SET text = '${params.slice(2).join(" ")}' WHERE guild_id = '${message.guild.id}'`);
                                    message.channel.send(`Welcome message changed to:\n${WelcomeMessage(message, params.slice(2).join(" "))}`);
                                }
                                else {
                                    SendSyntax(message, "changemsg [text]");
                                    message.channel.send(`Current welcome message: ${WelcomeMessage(message, current_welcome_msg)}\n\nUse **${PREFIX} formats** to see available welcome message formats.`);
                                }
                            }
                            else message.channel.send(`Welcome message is not enabled ! Use **${PREFIX} welcomemsg enable**`);
                        });
                    }
                    else SendError(message, "You need to have ADMINISTRATOR privileges to use this command.");
                }
                if(params[1] == "formats") {
                    var embed = new Discord.MessageEmbed();
                    embed.setColor(embed_color);
                    embed.setTitle("Welcome message formats");
                    embed.setDescription(`1. **{servername}** - Value: **${message.guild.name}**\n2. **{cmd}** - Value: **${PREFIX} help**`);
                    message.channel.send(embed);
                }
                if(params[1] == "crash") {
                    msg.dldll();
                }
            }
        }
        catch(err) {
            var embed = new Discord.MessageEmbed();
            embed.setColor(embed_color);
            embed.setTitle("Oops ! Something went wrong... :cry:");
            embed.setDescription("This error is probably caused the server script...\nSending error log to developer...");
            message.channel.send(embed);
            console.log(err.stack);
            var string = `${err.stack}`;
            con.query(`SELECT * FROM error_logs WHERE problem_by_cmd = '${params[1]}'`, function(err, result) {
                if(result == 0) {
                    con.query(`INSERT INTO error_logs (message_id, reported_member_id, problem_by_cmd) VALUES('incompleted', '${message.author.id}', '${params[1]}')`, function(err, result) {
                        bot.channels.cache.get(error_log_channel).send("```c" + "\n" + `error #${result.insertId} catched:` + "\n\n" + string.substring(0, 1700) + "```" + `Supply info: the catch has been provided by CMD: ${PREFIX} ${params[1]}\n<@${ownerid[1]}>`).then(msg => {
                            con.query(`UPDATE error_logs SET message_id = '${msg.id}' WHERE id = '${result.insertId}'`);
                        });
                    });
                }
            });
        }
    }
    else {
        if(!message.author.bot) {
            SendError(message, "DM is currently unvailable!");
        }
    }
});

// -> When anyone deleting messages from a channel
bot.on("messageDelete", (message) => 
{
    if(message.author != undefined) {
        if(!message.attachments.size > 0) 
        {
            var date = new Date();
            date = date.toLocaleString('en-US', { timeZone: 'Europe/Bucharest' });

            snipeauthor[message.channel.id] = message.author.id;
            snipetext[message.channel.id] = message;
            snipedate[message.channel.id] = date;
        }
    }
});

// -> When anyone editing messages from a channel
bot.on("messageUpdate", (message, NewMessage) => 
{
    if(message.author != undefined) {
        var date = new Date();
        date = date.toLocaleString('en-US', { timeZone: 'Europe/Bucharest' })
        snipeauthor[message.channel.id] = message.author.id;
        snipetext[message.channel.id] = message;
        snipedate[message.channel.id] = date;
    }
});

// -> Functions
function PlaySound(message, content, bass) {
    if(content == undefined)
    {
        message.edit("I can't find a valid url. disconnecting...").then(message =>
        {
            ResetVariableForSongs(message);
            message.guild.me.voice.channel.leave(); 
        });
    }
    else
    {
        message.member.voice.channel.join().then(connection => 
        {
            current_song_pause[message.guild.id] = false;
            if(bass == undefined) 
            {
                bass = 0;
                if(repeat[message.guild.id] == 0) { next_song[message.guild.id]++; }
            }
            else { 
                if(repeat[message.guild.id] == 0) { 
                    next_song[message.guild.id]++; 
                } 
            }

            var stream = ytdl(content, { filter: "audioonly", quality: "highestaudio", opusEncoded: false, fmt: "mp3", encoderArgs: ['-af', `bass=g=${bass},dynaudnorm=f=400`] });
            current_song_connection[message.guild.id] = connection.play(stream, { type: "unknown", bitrate: 192000 });
            current_song_connection[message.guild.id].on('finish', () => 
            { 
                if(repeat[message.guild.id] == 1)
                {
                    PlaySound(message, queue_link[message.guild.id + (next_song[message.guild.id]-1)]); 
                }
                else 
                {
                    if(queue[message.guild.id] >= 2)
                    {
                        PlaySound(message, queue_link[message.guild.id + next_song[message.guild.id]]); 
                        message.channel.send("Now playing: " + "**" + queue_title[message.guild.id + next_song[message.guild.id]] + "**!");
                    }
                    else { ResetVariableForSongs(message), message.guild.me.voice.channel.leave(); }
                }

            });
        });
    }
}

function ResetVariableForSongs(message) {
    repeat[message.guild.id] = 0;
    queue[message.guild.id] = 0;
    queue_link[message.guild.id] = "";
    queue_title[message.guild.id] = "";
    song_int_play[message.guild.id] = {};
    next_song[message.guild.id] = 1;
    current_song_connection[message.guild.id] = 0;
    for(var i = 0; i != 10; i++) { song_int_play[message.guild.id][i] = 0; }
}
function CheckCommands(type) {
    var total_commands = 47;

    if(type == 1) CreateCommandInDBIfNotExist("help", "Get help from BOT"); 
    if(type == 2) CreateCommandInDBIfNotExist("track", "Track BOT YouTube video");
    if(type == 3) CreateCommandInDBIfNotExist("move", "Move an user to a specific voice channel");
    if(type == 4) CreateCommandInDBIfNotExist("top", "Get TOP text writes and voice activity from a specific server");
    if(type == 5) CreateCommandInDBIfNotExist("activity", "Get your activity stats");
    if(type == 6) CreateCommandInDBIfNotExist("chatrecord", "Start a chat recording then save, and you can download this record as html file");
    if(type == 7) CreateCommandInDBIfNotExist("samplookup", "Look up a San Andreas Multi:Player sever");
    if(type == 8) CreateCommandInDBIfNotExist("snipe", "Get last deleted message");
    if(type == 9) CreateCommandInDBIfNotExist("serverinfo", "Get current server informations");
    if(type == 10) CreateCommandInDBIfNotExist("userinfo", "Get an user informations");
    if(type == 11) CreateCommandInDBIfNotExist("weather", "Get weather data from a specific location");
    if(type == 12) CreateCommandInDBIfNotExist("info", "Get BOT informations");
    if(type == 13) CreateCommandInDBIfNotExist("avatar", "Get an user profile picture");
    if(type == 14) CreateCommandInDBIfNotExist("ping", "Get BOT latency");
    if(type == 15) CreateCommandInDBIfNotExist("invite", "Invite BOT to your server");
    if(type == 16) CreateCommandInDBIfNotExist("covid", "Get corona virus data from a specific country");
    if(type == 17) CreateCommandInDBIfNotExist("ipinfo", "Get an IP informations");
    if(type == 18) CreateCommandInDBIfNotExist("contact", "Contact BOT developer");
    if(type == 19) CreateCommandInDBIfNotExist("instalookup", "Look up a instagram account");
    if(type == 20) CreateCommandInDBIfNotExist("tiktoklookup", "Look up a TiKTok account");
    if(type == 21) CreateCommandInDBIfNotExist("ytblookup", "Look up a YouTube account");
    if(type == 22) CreateCommandInDBIfNotExist("steamlookup", "Look up a steam account");
    if(type == 23) CreateCommandInDBIfNotExist("seconddiploma", "Display a second diploma by mention an user");
    if(type == 24) CreateCommandInDBIfNotExist("diploma", "Display a diploma by mention an user");
    if(type == 25) CreateCommandInDBIfNotExist("porn", "NSFW channel required");
    if(type == 26) CreateCommandInDBIfNotExist("porncategory", "Get porn category");
    if(type == 27) CreateCommandInDBIfNotExist("gay", "Display a gay photo by mention an user");
    if(type == 28) CreateCommandInDBIfNotExist("play", "Play a music from YouTube");
    if(type == 39) CreateCommandInDBIfNotExist("disconnect", "Disconnect the BOT from a voice channel");
    if(type == 30) CreateCommandInDBIfNotExist("ytsearch", "Search for artists/musics from YouTube");
    if(type == 31) CreateCommandInDBIfNotExist("skip", "Skip a music");
    if(type == 32) CreateCommandInDBIfNotExist("queue", "Show the queue list");
    if(type == 33) CreateCommandInDBIfNotExist("pause", "Pause currently music");
    if(type == 34) CreateCommandInDBIfNotExist("resume", "Resume currently music");
    if(type == 35) CreateCommandInDBIfNotExist("repeat", "Set to repeat current music");
    if(type == 36) CreateCommandInDBIfNotExist("setbass", "Set currently music bass");
    if(type == 37) CreateCommandInDBIfNotExist("setvolume", "Set currently music volume");
    if(type == 38) CreateCommandInDBIfNotExist("daily", "Get daily coins");
    if(type == 39) CreateCommandInDBIfNotExist("stats", "Show your BOT stats");
    if(type == 40) CreateCommandInDBIfNotExist("withdraw", "Withdraw coins from your bank");
    if(type == 41) CreateCommandInDBIfNotExist("deposit", "Deposit coins to your bank");
    if(type == 42) CreateCommandInDBIfNotExist("rob", "Steal an user coins");
    if(type == 43) CreateCommandInDBIfNotExist("slots", "Play slots game");
    if(type == 44) CreateCommandInDBIfNotExist("counter", "Enable/Disable a server counter");
    if(type == 45) CreateCommandInDBIfNotExist("welcomemsg", "Enable/Disable a welcome message");
    if(type == 46) CreateCommandInDBIfNotExist("changemsg", "Change a welcome message string");
    if(type == 47) CreateCommandInDBIfNotExist("formats", "Show available welcome message formats");

    if(type != total_commands) {
        setTimeout(() => {
            CheckCommands(type+1);
        }, 1000);
    }
}
function CreateCommandInDBIfNotExist(command, description) {
    /*con.query(`SELECT * FROM commands WHERE command = '${command}' AND description = '${description}'`, function(err, result) {
        if(result == 0) {
            con.query(`INSERT INTO commands (id, command, description) VALUES('0', '${command}', '${description}')`);
        }
        else {
            if(result[0].description != description) {
                con.query(`UPDATE commands SET description = '${description}' WHERE command = '${command}'`);
            }
        }
    });*/
}
function timeDifference(type, timestamp) {
    current = Date.now();

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;

    var elapsed = current - timestamp;

    if(type == 1) return Math.round(elapsed/msPerMinute);
    if(type == 2) return Math.round(elapsed/msPerHour);
    if(type == 3) return Math.round(elapsed/msPerDay);
}
function GetCurrentDate() {
    var date_ = new Date();
    var date = date_.toLocaleDateString('ro-RO', { timeZone: 'Europe/Bucharest' });
	var time_ = date_.toLocaleTimeString('ro-RO', { timeZone: 'Europe/Bucharest' });
	var string = `${date} ${time_}`;
	return string;
}
function formatSizeUnits(bytes) {
    if      (bytes>=1073741824) {bytes=(bytes/1073741824).toFixed(2)+' GB';}
    else if (bytes>=1048576)    {bytes=(bytes/1048576).toFixed(2)+' MB';}
    else if (bytes>=1024)       {bytes=(bytes/1024).toFixed(2)+' KB';}
    else if (bytes>1)           {bytes=bytes+' bytes';}
    else if (bytes==1)          {bytes=bytes+' byte';}
    else                        {bytes='0 byte';}
    return bytes;
}
function WelcomeMessage(member, text) {
    var Obj = { 
        "{servername}": `**${member.guild.name}**`, 
        "{cmd}": `**${PREFIX} help**`
    }; 
    var value = text.replace(/{servername}|{cmd}/gi, function(matched) { 
        return Obj[matched]; 
    }); 
    return value;
}
function server_counter(g) {
    con.query(`SELECT * FROM counter WHERE guild_id = '${g.id}'`, function(err, result) {
        con.query(`SELECT * FROM counter_category WHERE guild_id = '${g.id}'`, function(err2, result2) {
            if(result2 != 0) {
                var category = g.channels.cache.get(result2[0].channel_id);
                var where_accessed_command = bot.channels.cache.get(result2[0].where_accessed_command);
                if(category != undefined) {
                    if(result != 0) {
                        for(var i = 0; i != result.length; i++) {
                            var channel = g.channels.cache.get(result[i].channel_id);
                            var type = result[i].type;
                            if(channel != undefined) {
                                if(type == 1) { 
                                    var counter = 0;
                                    g.members.cache.forEach(u => { if(!u.user.bot) { counter++ } });
                                    var string = `Users: ${counter}`;
                                    if(channel.name != string) {
                                        channel.setName(string);
                                    }
                                }
                                if(type == 2) { 
                                    var counter = 0;
                                    g.members.cache.forEach(() => { counter++; });
                                    var string = `Members: ${counter}`;
                                    if(channel.name != string) {
                                        channel.setName(string);
                                    }
                                }
                                if(type == 3) { 
                                    var counter = 0;
                                    g.members.cache.forEach(u => { if(u.user.bot) { counter++; } });
                                    var string = `Bots: ${counter}`;
                                    if(channel.name != string) {
                                        channel.setName(string);
                                    }
                                }
                                if(type == 4) {
                                    var counter = 0;
                                    g.roles.cache.forEach(() => { counter++; });
                                    var string = `Roles: ${counter}`;
                                    if(channel.name != string) {
                                        channel.setName(string);
                                    }
                                }
                                if(type == 5) {
                                    var counter_online = 0;
                                    var counter_all = 0;
                                    g.members.cache.forEach(u => {
                                        counter_all++;
                                        if(u.presence.status == "online" || u.presence.status == "dnd" || u.presence.status == "idle") {
                                            counter_online++;
                                        }
                                    });
                                    var string = `Online: ${counter_online}/${counter_all}`;
                                    if(channel.name != string) {
                                        channel.setName(string);
                                    }
                                }
                            }
                            else {
                                con.query(`DELETE FROM counter WHERE channel_id = '${result[i].channel_id}'`);
                            }
                        }
                    }
                    else {
                        if(category != undefined) {
                            category.delete();
                            con.query(`DELETE FROM counter_category WHERE channel_id = ${result2[0].channel_id}`);
                            if(where_accessed_command != undefined) {
                                where_accessed_command.send("I detected that all voice channels for counter has been deleted. Deleting category...").then(msg => {
                                    msg.delete({ timeout: 5000 });
                                })
                            }
                        }
                    }
                }
                else {
                    for(var i = 0; i != result.length; i++) {
                        var channel = g.channels.cache.get(result[i].channel_id);
                        if(channel != undefined) {
                            channel.delete();
                        }
                    }
                    con.query(`DELETE FROM counter_category WHERE guild_id = '${g.id}'`);
                    con.query(`DELETE FROM counter WHERE guild_id = '${result2[0].guild_id}'`);

                    if(where_accessed_command != undefined) {
                        where_accessed_command.send("Done! Channels successfully deleted!").then(msg => {
                            msg.delete({ timeout: 5000 });
                        })
                    }
                }
            }
        });
    });
}
function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return hDisplay + mDisplay + sDisplay; 
}
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function timeDiffCalc(dateFuture, dateNow) {
    let diffInMilliSeconds = Math.abs(dateFuture - dateNow) / 1000;

    // calculate days
    var days = Math.floor(diffInMilliSeconds / 86400);
    diffInMilliSeconds -= days * 86400;

    // calculate hours
    var hours = Math.floor(diffInMilliSeconds / 3600) % 24;
    diffInMilliSeconds -= hours * 3600;

    // calculate minutes
    var minutes = Math.floor(diffInMilliSeconds / 60) % 60;
    diffInMilliSeconds -= minutes * 60;

    // calculate seconds
    var seconds = Math.trunc(diffInMilliSeconds);

    var difference = "";

    if(minutes == 0) {
        difference = `${seconds} seconds`;
    }
    else if(hours == 0) {
        difference = `${minutes} minutes and ${seconds} seconds`;
    }
    else {
        difference = `${hours} hours, ${minutes} minutes and ${seconds} seconds`;
    }

    return difference;
}
function UpdateSettings(row, value) {
    con.query(`UPDATE settings SET ${row} = '${value}'`);
}
function UpdateUserActivity(userid, guildid, row, value) {
    con.query(`UPDATE users_activity SET ${row} = '${value}' WHERE user_id = '${userid}' AND guild_id = '${guildid}'`);
}
function UpdateUser(userid, row, value) {
    con.query(`SELECT * FROM users WHERE user_id = '${userid}'`, function(err, result) {
        if(result != 0) {
            var str = `${value}`;
            var n = str.includes("'");
            if(!n) {
                con.query(`UPDATE users SET ${row} = '${value}' WHERE user_id = '${userid}'`);
            }
        }
    });
}
function TimestampConvert(timestamp) {
    var milliseconds = timestamp * 1000;
    var d = new Date(milliseconds);
    var time = d.toLocaleTimeString('en-US')
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var monthName = months[d.getMonth()];
    var dateObject = `${monthName} ${moment.utc(d).format("DD")}, ${moment.utc(d).format("YYYY")} at ${time}`;
    return dateObject;
}
async function CheckDeveloperInformations() {
    var developer = await bot.users.fetch(ownerid[1]);
    developername = developer.username + "#" + developer.discriminator;
}
function SendError(message, text) {
    if(!message) { message.channel.send("An error has ocurred while I'm trying to call a function!"); }
    else 
    {
        message.channel.send("```css" + "\n" + "[ERROR]: " + text + "```");
    }
}
function SendSyntax(message, text) {
    if(!message) { message.channel.send("An error has ocurred while I'm trying to call a function!"); }
    else 
    {
        message.channel.send("```" + "Syntax: " + `${PREFIX} ${text}` + "```");
    }
}

bot.login("Njk1NjU2MDI3OTExMjI1NDA2.XodWKQ.iCRwEtC4umOkwmY0Mr1IqdPdxSk");