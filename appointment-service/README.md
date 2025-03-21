[![Node.js CI/CD Workflow](https://github.com/tuonghuynh11/MarketNest-API/actions/workflows/main.yml/badge.svg)](https://github.com/tuonghuynh11/MarketNest-API/actions/workflows/main.yml)
# MarketNest
Host :https://marketnest-api.onrender.com/api/v1

# Structure
* Connect to DB in __src/configuration.ts__
* Work with typeorm in __src/database/__
* All API_URL will be define in __src/routers/index.ts__

# Setup
* Install package: npm install
* Run dev: npm start
* http://localhost:4000

# ENV
```ini
# This line is ignored since it's a comment
DB_HOST=''
DB_DATABASE=''
DB_USERNAME=''
DB_PASSWORD=''
# SMTP
SMTP_HOST=''
SMTP_PORT=''
SMTP_SECURE=''
SMTP_USER=''
SMTP_PASSWORD=''


# Google OAuth 2.0

GOOGLE_CLIENT_ID= ""
GOOGLE_CLIENT_SECRET = ""
GOOGLE_REDIRECT_URI =""
CLIENT_REDIRECT_CALLBACK = ""

# Client
CLIENT_SITE = ""
SERVER_SITE = ""
ADMIN_SITE = "";
SHOPKEEPER_SITE = "";


## Zalo Payment
ZALO_APP_ID = ""
ZALO_KEY_1 = ""
ZALO_KEY_2 = ""
ZALO_END_POINT = ""
ZALO_REDIRECT_URL = ""
ZALO_APP_USER = ""


#Cloudary API Upload Image
CLOUD_NAME= ""
API_KEY = ""
API_SECRET= ""

ADMIN_MAIL = ""
```
