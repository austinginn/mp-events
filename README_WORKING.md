# MP Events
A lightweight, responsive, open source event calendar for use with Ministry Platform databases. 

Features:

 - Ministry Platform API integration and event synchronization 
 - Progressive Web App (PWA) compatibility
 - Offline caching
 - Custom dark and light themes
 - ICS hosting
 - ICS calendar invites

A running example: events.afumc.org  

## Quick Installation and Run
Using docker environment:
```
docker build https://github.com/austinginn/mp-events.git
```
Create a .env file with text editor of choice (see "Environmnet Variables" section).
```
docker run 
```

## Custom Installation
```
git clone https://github.com/austinginn/mp-events.git
cd mp-events
```
Modify opitions as needed and then either docker build from mp-events or npm install.
## Server Options
Modify mp-events/node/config.json with the following options:
| Key | Value | Default | Description |
|--|--|--|--
| title | string | "Events" | web page title 
| description | string  |  "event calendar" | description used for SEO
| ics | boolean | true | enable global ics calendar hosting
| ics_email | boolean | true | enable sending ics event files as email attachments
| webhook_update | boolean | true | enable Ministry Platform webhooks (see MP Configuration)
| scheduled_update | boolean | true | enable daily Ministry Platform events pull
| portal | boolean | true | enables administrative portal for debug and dynamic server option changes
| light_theme | object | {"text": "#303036","background": "#FFFAFF", "header": "#4B696C"} | hex color values for the light theme of the web app
| dark_theme | object | {"text": "#FFFAFF", "background": "#303036", "header": "#4B696C"} | hex color values for the dark theme of the web app

## Icons
In the mp-events/node/static/images directory you will find all of the default icon files.  You can create your own and replace the .png files in this directory.  Be sure to match naming scheme and image dimensions. You cannot achieve this by using the 
```
docker build https://github.com/austinginn/mp-events.git
```
installation method.  You will need to clone this repo, make your changes and then build from the cloned repo.

| File Name | Dimensions | Description
|--|--|--|
| apple-touch-icon.png |   | icon used for apple devices when web app is added to home screen
| favicon.png | 512x512 | icon used in browser tab
| maskable-icon.png | 512x512 | icon required for cross-platform PWA support (use https://maskable.app/editor to ensure compatibility)
| splash-screen.png | 512x512 | PWA splash screen


## Environment Variables
Create a .env file:
```
touch .env
```
Modify it with the following variables:
| Key  | Description  |
|--|--|
| CLIENT_ID | Ministry Platform API Client ID (see MP Configuration) |
| CLIENT_SECRET | Ministry Platform API Client Secret (see MP Configuration) |
| CLIENT_SECRET | Ministry Platform API Client Secret (see MP Configuration) |
| ROOT | your subdomain that comes before the ministryplatform.com domain *.ministryplatform.com 
| EMAIL_HOST | smtp server for your email host (required if ICS_EMAIL is set to true)
| EMAIL_PORT | smtp server port 
| EMAIL_SECURE | |
| EMAIL_USER | Email user name (typically noreply@example.com)
| EMAIL_SECRET | Email password

This file contains sensitive information.  Do not push to a public repository.

## Ministry Platform Configuration

-With MP admin credentials navigate to your Ministry Platform page - *.ministryplatform.com/ministryplatform.
 -Administration -> API Clients -> New
 
## Start Server
From mp-event/node
```
npm start
```

## Notes
There are many things outside of the scope of this document that need to be configured to make your Event Calendar public. 
Here are some helpful resources:
- Web Server Hosting
- DNS and subdomains
- HTTPS and SSL Certs

# Credit
Created and maintained by Austin Ginn for Alpharetta Methodist.  
