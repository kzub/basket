const request = require('async-request');
const utils = require('./utils');
const config = utils.getBotSettings();

const botURL = `https://api.telegram.org/bot${config.token}/`;
const recipients = {
	owner: config.owner,
	channel: config.channel
};

async function botCmd(method, params) {
	let url = botURL + method;
	let opts = {
		method: 'POST',
		data: params,
		headers: {
			'Content-Type': 'application/json'
		}
	};
	return request(url, opts);
}

exports.send = async (who, msg) => {
	// console.log('bot', msg)
	let id = recipients[who] || recipients.owner;
	return botCmd('sendMessage', {
		chat_id: id,
		text: msg
	});
};

function getUpdates() {
	botCmd('getUpdates',{
		offset: -1
	}).then( r => {
		console.log(r);
	})
}
// getUpdates();