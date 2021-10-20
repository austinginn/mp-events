# MP Events
A lightweight, responsive, open source event calendar for use with Ministry Platform databases. 

Features:

 - Ministry Platform API integration and event synchronization 
 - Progressive Web App (PWA) compatibility
 - Offline caching
 - Custom dark and light themes
 - ICS hosting
 - ICS calendar invites
 - Admin portal for creating custom themes and enabling features -- /admin
 
 
 <img src="https://mp-events.nyc3.digitaloceanspaces.com/renders/Web%20Calendar%20render_3.gif"/>

A running example: [events.afumc.org](https://events.afumc.org) 

## Installation
### Method #1 (docker)
```
docker build -t mp-events https://github.com/austinginn/mp-events.git
nano .env
```
See [.env section](#env) for creating your environment variables.

```
docker run --env-file ./.env -p 3000:3000 -d --name mp-events mp-events
```

### Method #2 (node)
On a server with node installed:
```
git clone https://github.com/austinginn/mp-events.git
cd mp-events
npm install
nano .env
```
See [.env section](#env) for creating your environment variables.
Once environment variables are configured:
```
npm start
```

<a name="env"></a>
## Environment Variables

Create a .env file:
```
nano .env
```
Modify it with the following variables:
| Key  | Description  |
|--|--|
| CLIENT_ID | Ministry Platform API Client ID (see [MP Configuration](#MP)) |
| CLIENT_SECRET | Ministry Platform API Client Secret (see [MP Configuration](#MP)) |
| ROOT | your subdomain that comes before the ministryplatform.com domain -- example.ministryplatform.com 
| EMAIL_HOST | SMTP server for your email host
| EMAIL_PORT | SMTP server port 
| EMAIL_SECURE | True for port 465, false for other ports |
| EMAIL_USER | Email user name (typically noreply@example.com)
| EMAIL_SECRET | Email password
| PORTAL_SECRET | Password used to access admin portal -- events.example.com/admin
| UPDATE_SECRET | Secret used for webhook (see [MP Configuration](#MP))

Your final .env file should look something like this:
```
CLIENT_ID=client
CLIENT_SECRET=averysecuresecret
ROOT=example
EMAIL_HOST=office.smtp.com
EMAIL_PORT=443
EMAIL_SECURE=false
EMAIL_USER=noreply@example.com
EMAIL_SECRET=noreplypassword
PORTAL_SECRET=averysecurepassword
UPDATE_SECRET=averysecuresecretforwebhook
```
*This file contains sensitive information.  DO NOT push to a public repository.

<a name="MP"></a>
## Ministry Platform Configuration
### API Client
With MP admin credentials navigate to your Ministry Platform page - example.ministryplatform.com/ministryplatform.
 - Administration -> API Clients -> New
 - Fill out the following fields
    - Display Name: MP Events
    - Client ID: mpevents
    - Client Secret: *come up with something secure*
    - Client User: apiuser
    - Authentication Flow: Client Credentials
 ### Webhook
- Administration -> Webhooks -> New
- Fill out the following fields
    - Name: MP-Events Webhook
    - HTTP Method: Post
    - URI: *your mp-events public domain*/api/update -- https://events.example.com/api/update
    - Body Template: { "auth": "*come up with something secure*" } -- this should match .env UPDATE_SECRET from [env section](#env)
    - Headers Template: Content-Type: application/json
    - Table Name: Events


## Notes
There are many things outside of the scope of this document that need to be configured to make your MP-Events Calendar public.  We use Digital Ocean at Alpharetta Methodist.  You can support this project and get $100 in credits to host your own by creating an account using this link:
<br>
[![DigitalOcean Referral Badge](https://web-platforms.sfo2.digitaloceanspaces.com/WWW/Badge%202.svg)](https://www.digitalocean.com/?refcode=145f79cd503d&utm_campaign=Referral_Invite&utm_medium=Referral_Program&utm_source=badge)
<br>
Here are some helpful resources from Digital Ocean: 
- [Nodejs Digital Ocean Droplet](https://marketplace.digitalocean.com/apps/nodejs#getting-started)
- [DNS and subdomains](https://docs.digitalocean.com/products/networking/dns/how-to/add-subdomain/)
- [HTTPS and SSL Certs](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-20-04)
# Credit
Created and maintained by [Austin Ginn](https://github.com/austinginn) for [Alpharetta Methodist](afumc.org) 
- Icons by [fontawesome](https://fontawesome.com/)
