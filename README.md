Zotero OAuth Client Example
----

This is a minimal example showing how to authenticate using oAuth 1.0a and read from user's library using Zotero API. This example uses [oauth-1.0a](https://www.npmjs.com/package/oauth-1.0a#client-side-usage-caution) to talk to oAuth endpoint and [zotero-api-client](https://github.com/tnajdek/zotero-api-client/) to talk to Zotero API. Check relevant project pages for documentation & support.

How to use this example
-----

1. Clone this example and change dir:

    git clone https://github.com/tnajdek/zotero-api-client/
	cd zotero-oauth-example/

2. https://www.zotero.org/oauth/apps and create a new App
3. Copy Client Key and Client Secret and populate `ZOTERO_APP_CLIENT_KEY` and `ZOTERO_APP_CLIENT_SECRET` in `index.js` respectively
4. Install dependencies:

    npm install

5. Run the example

    npm start