//Event calendar for integrating with a Ministry Platform database 
//TODO
//Debug
///Add debug portal login and security
///favicon upload in debug portal
//PWA
///local storage for events
///Online / Offline icon
///all other icon stuff
//Add event

///////
require('dotenv').config();
///////

//INCLUDES
const express = require('express');
const http = require('http');
const _dirname = require('path').dirname(require.main.filename);
const app = express();
const nodemailer = require("nodemailer");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
app.use('/static', express.static(_dirname + "/static"));


const server = http.Server(app);
const FastRateLimit = require("@kidkarolis/not-so-fast");
const bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
const MP = require("./mp-events.js");
const fs = require('fs');
const Mail = require('nodemailer/lib/mailer');



var test = new MP(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.ROOT);
var events = [];
var cal = "";

//RATE LIMITING
var ips = [];
var highCostLimiter = new FastRateLimit({
	threshold : 10, // available tokens over timespan
	ttl       : 60  // time-to-live value of token bucket (in seconds)
  });

//Default Server Config
var WEB_TITLE = "Events";
var META_DESCRIPTION = "This is a test";
var ICS_ENABLED = true;
var ICS_EMAIL = true;
var WEBHOOK_UPDATE = true;
var SCHEDULED_UPDATE = true;
var DEBUG_PORTAL = true;
var LIGHT_THEME = {
    "text": "#00000",
    "background": "#fff",
    "header": "#024873"
};
var DARK_THEME = {
	"text": "#fff",
	"background": "#000",
	"header": "#024873"
}
var LAST_SYNCED = Date.now();

//socket io
///sockets init
const iot = require('socket.io')(server);
////Socket Init////
iot.on('connection', function(socket){
  console.log('client connected');

  socket.on('disconnect', function(){
    console.log('client disconencted');
  });
});
debug(process.env.CLIENT_ID + " " + process.env.CLIENT_SECRET + " " + process.env.ROOT);


///HTTP client listen on 3000
server.listen(3000, function(){
	debug('listening on *:3000');
	// main().catch(console.error);
	//configure server
	configServer();
	
	//if scheduled update -- 24hr timer
	asyncEvents();

	debug("Number of events loaded: " + events.length);
	setInterval(() => {
		debug("hello world");
	}, 5000)
});

app.get("/api/ics", (req, res) => { 
	if(ICS_ENABLED){
		res.set('Content-Type', 'text/calendar;charset=utf-8');
		res.set('Content-Disposition', 'attachment; filename="afumc.ics"');
		res.send(cal);
	} else {
		res.sendStatus(404);
	}
});

app.get("/", (req, res) => {
		res.sendFile(_dirname + "/html/events.html");
});

app.get("/admin", (req, res) => {
	res.sendFile(_dirname + "/html/login.html");
});

app.get("/service-worker.js", (req, res) => {
	res.sendFile(_dirname + "/service-worker.js");
});

app.get("/api/data/config", (req, res) => {
	highCostLimiter.consume(ips[ipTrack(req.ip)].ip)
	.then(() => {
		res.send({"title": WEB_TITLE, "email": ICS_EMAIL, "ics": ICS_ENABLED, "webhook": WEBHOOK_UPDATE, "light_theme": LIGHT_THEME, "dark_theme": DARK_THEME, "last_synced": LAST_SYNCED});
	})
	.catch(() => {
		debug("All tokens consumed by " + req.ip);
	})
	
});


app.get("/api/data", (req, res) => {
	highCostLimiter.consume(ips[ipTrack(req.ip)].ip)
	.then(() => {
		//token consumed
		//okay to send
		res.send(events);
	})
	.catch(() => {
		// No more token for namespace in current timespan
    	// Silently discard message
    	debug("All tokens consumed by " + req.ip);
    	//res.send({"result": "failed", "reason": "rate limit", "data": ""});
	});
});

//post
//wrap in rate limiter
app.post("/api/send", (req, res) => {
	if(ICS_EMAIL){
		highCostLimiter.consume(ips[ipTrack(req.ip)].ip)
	.then(() => {
		console.log(req.body);
		//token consumed
		//okay to send
		//add email to list
		//do we need to make people confirm there email here?
		let f_event;
		let found = false;
		for(let i = 0; i < events.length && !found; i++){
			if(events[i].Event_ID == req.body.eid){
				f_event = events[i];
				found = true;
				console.log(events[i]);
			}
		}

		if(found){
			main(req.body.email, f_event, () => {
				res.send({"result": "success"});
				return 0;
			}).catch(() => {
				console.error;
				res.send({"result": "failed", "reason": "unable to send -- failed sending email", "data": ""});
				return -1;
			});
		} else {
			res.send({"result": "failed", "reason": "unable to send -- could not find event", "data": ""});
			return -1;
		}
	})
	.catch(() => {
		debug("All tokens consumed by " + req.ip);
	});
	}	
});

//wrap in rate limiter
app.post("/auth/login", async (req, res) => {
	console.log("in auth");
	//research timing attacks and do i need bcrypt?
	if(req.body.password == process.env.PORTAL_SECRET){
		res.status(200).json({status:"ok"})
	} else {
		res.send("failed");
		console.log("failed");
	}
});

//wrap in rate limiter
app.post("/auth/token", async (req, res) => {
	console.log("in auth");
	//research timing attacks and do i need bcrypt?
	if(req.body.password == process.env.PORTAL_SECRET){
		res.status(200).json({status:"ok"})
	} else {
		res.send("failed");
		console.log("failed");
	}
});


//wrap in rate limiter
app.post("/auth/logout", async (req, res) => {
	console.log("in auth");
	//research timing attacks and do i need bcrypt?
	if(req.body.password == process.env.PORTAL_SECRET){
		res.status(200).json({status:"ok"})
	} else {
		res.send("failed");
		console.log("failed");
	}
});

//convert to post with secret
app.get('/api/update', function(req, res){
	debug(req.get('host'));
	debug(req.get('origin'));
	debug(req.hostname);
	highCostLimiter.consume(ips[ipTrack(req.ip)].ip)
	.then(() => {
		if(WEBHOOK_UPDATE){
			debug("update triggered");
			res.send("Success!");
			asyncEvents();
		} else 
		res.sendStatus(404);
	})
	.catch(() => {
		debug("All tokens consumed by " + req.ip);
	});
});

app.get("/api/debug", (req, res) => {
	if(DEBUG_PORTAL){
		res.sendFile(_dirname + "/html/debug.html");
	}
});

async function asyncEvents(){
	var newE = [];
	var nevents = await test.getEvents();
	for (var x = 1; x < 12; x++){
		var itt = 31 * x;

		newE = await test.getEvents('DATEADD(mm%2C%200%2C%20DATEDIFF(mm%2C%20' + itt.toString() + '%2C%20Event_Start_Date))%20%3D%20DATEADD(mm%2C%200%2C%20DATEDIFF(mm%2C%200%2C%20GETDATE()))&%24orderby=Event_Start_Date');
		for(var i = 0; i < newE.length; i++){
			nevents.push(newE[i]);
		}
	}

	events = visibilityFilter(nevents);
	//set server time
	ignoreTZ(events);
	cal = newCreateICS(events);
	debug("Events updated!");
}

function ignoreTZ(eventArr){
	for(var i = 0; i < eventArr.length; i++){
		var startT = new Date(eventArr[i].Event_Start_Date);
		var endT = new Date(eventArr[i].Event_End_Date);
		var est = timeParse(startT.getHours() + ":" + startT.getMinutes()) + " - " + timeParse(endT.getHours() + ":" + endT.getMinutes());
		//insert key value pair
		eventArr[i]["est"] = est;
	}
}

function timeParse(time){
	time = time.split(':'); // convert to array
	// fetch
	var hours = Number(time[0]);
	var minutes = Number(time[1]);

	// calculate
	var timeValue;

	if (hours > 0 && hours <= 12) {
		timeValue= "" + hours;
	} else if (hours > 12) {
		timeValue= "" + (hours - 12);
	} else if (hours == 0) {
		timeValue= "12";
	}

	timeValue += (minutes < 10) ? ":0" + minutes : ":" + minutes;  // get minutes
	timeValue += (hours >= 12) ? "pm" : "am";  // get AM/PM
	return timeValue
}

function visibilityFilter(eventArr){
	//find indexes of non public events
	// debug(events[0].Visibility_Level_ID);
	debug("eventArr length: " + eventArr.length);
	debug(eventArr[0].Visibility_Level_ID);
	var removeIndexes = [];
	for(var i = 0; i < eventArr.length; i++){
		if(eventArr[i].Visibility_Level_ID != 4){
			// debug("found");
			removeIndexes.push(i);
		}
	}
	// debug(removeIndexes);

	//remove all removeIndexes
	for(var i = removeIndexes.length - 1; i >= 0; i--){
		eventArr.splice(removeIndexes[i], 1);
	}
	// debug(eventArr);
	return eventArr;
}

function msToTime(duration) {
	var milliseconds = parseInt((duration % 1000) / 100),
	minutes1 = Math.floor((duration / (1000 * 60)) % 60),
	hours1 = Math.floor((duration / (1000 * 60 * 60)) % 24);


	return {hours: hours1, minutes: minutes1}
}

function newCreateICS(eventArr){
	var icsFormat = '';
	icsFormat += 'BEGIN:VCALENDAR\r\n';
	icsFormat += 'VERSION:2.0\r\n';
	icsFormat += 'CALSCALE:GREGORIAN\r\n';
	icsFormat += 'PRODID:am/ics\r\n';
	icsFormat += 'METHOD:PUBLISH\r\n';
	// icsFormat += calName ? (foldLine(`X-WR-CALNAME:${calName}`) + '\r\n') : '';
	icsFormat += `X-PUBLISHED-TTL:PT1H\r\n`;

	//append events
	for(var i = 0; i < eventArr.length; i++){
		var icsEvent = '';
		var duration = msToTime(new Date(eventArr[i].Event_End_Date).getTime() - new Date(eventArr[i].Event_Start_Date).getTime());
		var minstruction = eventArr[i].Meeting_Instructions;
		if(!minstruction){
			minstruction = "";
		}

		icsEvent += 'BEGIN:VEVENT\r\n';
		icsEvent += 'UID:' + eventArr[i].Event_ID + '\r\n';
		icsEvent += 'SUMMARY:' + eventArr[i].Event_Title + '\r\n';
		icsEvent += 'DTSTAMP:' + convertToICSDate(new Date)  + '\r\n';
		icsEvent += 'DTSTART:' + convertToICSDate(new Date(eventArr[i].Event_Start_Date)) + '\r\n';
		icsEvent += 'DESCRIPTION:' + minstruction.trim() + '\r\n';
		if(duration.minutes == 0){
			icsEvent += 'DURATION:PT' + duration.hours + 'H\r\n';
		} else {
			icsEvent += 'DURATION:PT' + duration.hours + 'H' + duration.minutes + 'M\r\n';
		}
		icsEvent += 'END:VEVENT\r\n';
		icsFormat += icsEvent;
	}

	//end ical
	icsFormat += 'END:VCALENDAR\r\n';

	return icsFormat;
}

function createICSEvent(event){
	//ics header
	var icsFormat = '';
	icsFormat += 'BEGIN:VCALENDAR\r\n';
	icsFormat += 'VERSION:2.0\r\n';
	icsFormat += 'PRODID:am/ics\r\n';
	icsFormat += 'METHOD:PUBLISH\r\n';

	//event info
	var icsEvent = '';
		var duration = msToTime(new Date(event.Event_End_Date).getTime() - new Date(event.Event_Start_Date).getTime());
		var minstruction = event.Meeting_Instructions;
		if(!minstruction){
			minstruction = "";
		}

	icsEvent += 'BEGIN:VEVENT\r\n';
	icsEvent += 'UID:' + event.Event_ID + '\r\n';
	icsEvent += 'SUMMARY:' + event.Event_Title + '\r\n';
	icsEvent += 'DTSTAMP:' + convertToICSDate(new Date)  + '\r\n';
	icsEvent += 'DTSTART:' + convertToICSDate(new Date(event.Event_Start_Date)) + '\r\n';
	icsEvent += 'DESCRIPTION:' + minstruction.trim() + '\r\n';

	if(duration.minutes == 0){
		icsEvent += 'DURATION:PT' + duration.hours + 'H\r\n';
	} else {
		icsEvent += 'DURATION:PT' + duration.hours + 'H' + duration.minutes + 'M\r\n';
	}
	icsEvent += 'END:VEVENT\r\n';
	icsFormat += icsEvent;

	//end ics
	icsFormat += 'END:VCALENDAR\r\n';

	return icsFormat;
}

function convertToICSDate(dateT) {
		//correct for EST offset
		dateTime = new Date(dateT.valueOf() + 3600000 * 5);
			 const year = dateTime.getFullYear().toString();
			 const month = (dateTime.getMonth() + 1) < 10 ? "0" + (dateTime.getMonth() + 1).toString() : (dateTime.getMonth() + 1).toString();
			 const day = dateTime.getDate() < 10 ? "0" + dateTime.getDate().toString() : dateTime.getDate().toString();
			 const hours = dateTime.getHours() < 10 ? "0" + dateTime.getHours().toString() : dateTime.getHours().toString();
			 const minutes = dateTime.getMinutes() < 10 ? "0" +dateTime.getMinutes().toString() : dateTime.getMinutes().toString();

			 return year + month + day + "T" + hours + minutes + "00" + "Z";
}

function configServer(){
	const config = JSON.parse(fs.readFileSync(_dirname + '/config.json', 'utf8'));
	if(config){
		if(config.title){
			WEB_TITLE = config.title;
		}
		if(config.meta_description){
			META_DESCRIPTION = config.meta_description;
		}
		if(config.ics){
			ICS_ENABLED = config.ics;
		}
		if(config.ics_email){
			ICS_EMAIL = config.ics_email;
		}
		if(config.webhook_update){
			WEBHOOK_UPDATE = config.webhook_update;
		}
		if(config.scheduled_update){
			SCHEDULED_UPDATE = config.scheduled_update;
		}
		if(config.debug_portal){
			DEBUG_PORTAL = config.debug_portal;
		}
		if(config.light_theme){
			if(config.light_theme.text){
				LIGHT_THEME.text = config.light_theme.text;
			}
			if(config.light_theme.background){
				LIGHT_THEME.background = config.light_theme.background;
			}
			if(config.light_theme.header){
				LIGHT_THEME.header = config.light_theme.header;
			}
		}
		if(config.dark_theme){
			if(config.dark_theme.text){
				DARK_THEME.text = config.dark_theme.text;
			}
			if(config.dark_theme.background){
				DARK_THEME.background = config.dark_theme.background;
			}
			if(config.dark_theme.header){
				DARK_THEME.header = config.dark_theme.header;
			}
		}
	}
	ready = true;
	return 0;
}

//ip address push and namespace
function ipTrack(ip){
	for(var i = 0; i < ips.length; i++){
	  if(ip == ips[i].ip){
		//return index of ip
		return i;
	  }
	}

	//ips.push({"ip": ip, "to": to});
	ips.push({"ip": ip});
  
	//return index
	return ips.length - 1;
  }


function debug(msg){
	//console
	console.log(msg);

	//socket.io
	iot.emit('debug', msg);

	//fs
	//not implemented yet
}


//YEET some mail
// async..await is not allowed in global scope, must use a wrapper
async function main(rec, event, callback) {
	// Generate test SMTP service account from ethereal.email
	// Only needed if you don't have a real mail account for testing
	// let testAccount = await nodemailer.createTestAccount();
	let sDate = new Date(event.Event_Start_Date);
	let eDate = new Date(event.Event_End_Date);
	//correct month
	let sDateMonth = sDate.getMonth() + 1;
	let eDateMonth = eDate.getMonth() + 1;
	//correct day
	const dow = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	
	// create reusable transporter object using the default SMTP transport
	let transporter = nodemailer.createTransport({
	  host: process.env.EMAIL_HOST,
	  port: process.env.EMAIL_PORT,
	  secure: toB(process.env.EMAIL_SECURE), // true for 465, false for other ports
	  auth: {
		user: process.env.EMAIL_USER, // generated ethereal user
		pass: process.env.EMAIL_SECRET, // generated ethereal password
	  },
	});
  
	// send mail with defined transport object
	let info = await transporter.sendMail({
	  from: '"YEET 👻" <aginn@afumc.org>', // sender address
	  to: rec, // list of receivers
	  subject: "🗓 Add " + event.Event_Title + " to your calendar", // Subject line
	  text: "Hello! Here is the calendar event you requested: \r\n\r\n" + event.Event_Title + "\r\n" + event.Meeting_Instructions + 
	  	"\r\n" + dow[sDate.getDay()+1] + ", " + sDateMonth + "-" + sDate.getDate() + "-" + sDate.getFullYear() + " to " +
		  dow[eDate.getDay()+1] + ", " + eDateMonth + "-" + eDate.getDate() + "-" + eDate.getFullYear() +
		  "\r\n" + event.est + 
		  "\r\n\r\nIf you email client does not prompt you to add the event to your calendar, open the attached .ics file." +
		  "\r\n\r\nThank you,\r\nAlpharetta Methodist", // plain text body
	  icalEvent: {
		  filename: event.Event_Title + ".ics",
		  method: 'publish',
		  content: createICSEvent(event)
	  }
	});
  
	console.log("Message sent: %s", info.messageId);
	callback();
  }

  function toB(str){
	  if(str == "true"){
		  return true;
	  }
	  return false;
  }