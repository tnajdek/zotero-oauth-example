/*eslint no-console: 0*/
'use strict';

const OAuth = require('oauth-1.0a');
const crypto = require('crypto');
const rlp = require('readline');
const rl = rlp.createInterface({
	input: process.stdin,
	output: process.stdout
});
const api = require('zotero-api-client');

// In order to start using OAuth to create API keys on behalf of users,
// you must register your application with Zotero to obtain a Client
// Key and Client Secret at https://www.zotero.org/oauth/apps
// Once you have registered your app, please enter 
// ZOTERO_APP_CLIENT_KEY and ZOTERO_APP_CLIENT_SECRET here:
const ZOTERO_APP_CLIENT_KEY = '';
const ZOTERO_APP_CLIENT_SECRET = '';

const ask = async () => {
	return new Promise( resolve => {
		rl.question('Enter oauth_verifier: ', input => resolve(input) );
	});
}

(async () => {
	const oauth = OAuth({
		consumer: {
			key: ZOTERO_APP_CLIENT_KEY,
			secret: ZOTERO_APP_CLIENT_SECRET
		},
		signature_method: 'HMAC-SHA1',
		hash_function(base_string, key) {
			return crypto.createHmac('sha1', key).update(base_string).digest('base64');
		}
	});

	const tokenRequestConfig = {
		url: 'https://www.zotero.org/oauth/request',
		method: 'POST',
		data: {
			oauth_callback: 'https://www.zotero.org'
		}
	};

	const tokenRequestResponse = await fetch('https://www.zotero.org/oauth/request', {
		headers: oauth.toHeader(oauth.authorize(tokenRequestConfig)),
		method: 'post'
	});

	const tokenRequestData = await tokenRequestResponse.text();
	const obj = {};
	tokenRequestData.replace(/([^=&]+)=([^&]*)/g, (m, key, value) => {
		obj[decodeURIComponent(key)] = decodeURIComponent(value);
	});
	const oAuthToken = obj['oauth_token'];
	const oAuthTokenSecret = obj['oauth_token_secret'];
	const url = `https://www.zotero.org/oauth/authorize?oauth_token=${oAuthToken}&library_access=1&notes_access=1&write_access=1&all_groups=write`;
	console.log(`Please go to the following url and allow access: \n\n ${url}\n`);
	console.log("Afterwards you will be redirected to the zotero.org main page. Please copy the value of 'oauth_verifier' from the URL and pase it here:\n\n")
	const oAuthVerifier = await ask();

	var tokenExchangeConfig = {
		url: `https://www.zotero.org/oauth/access?oauth_token=${oAuthToken}`,
		method: 'POST',
		data: {
			oauth_verifier: oAuthVerifier
		}
	};

	const tokenExchangeResponse = await fetch(`https://www.zotero.org/oauth/access?oauth_token=${oAuthToken}`, {
		headers: oauth.toHeader(oauth.authorize(tokenExchangeConfig, {
			public: oAuthToken,
			secret: oAuthTokenSecret
		})),
		method: 'post'
	});
	const tokenExchangeData = await tokenExchangeResponse.text();
	try {
		const username = tokenExchangeData.match(/username=(\w+)/)[1];
		const userId = tokenExchangeData.match(/userID=([0-9]+)/)[1];
		const userAPIKey = tokenExchangeData.match(/oauth_token_secret=([a-zA-Z0-9]+)/)[1];
		try {
			console.log(`\nFirst 10 items from ${username}'s library:\n`);
			const apiResponse = await api(userAPIKey)
				.library('user', userId)
				.items()
				.get({ limit: 10 });
			console.log(apiResponse.getData().map(i => `[${i.key}] ${i.title} (${i.itemType})`).join('\n'));
		} catch(e) {
			console.error("Error has occurred:", e);
		}
	} catch(_) {
		console.error(`oAuthFailed: ${tokenExchangeData}`)
	}
})().then(process.exit);