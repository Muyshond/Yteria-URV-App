# URV APP
This app is meant to be used as an application to monitor roles, role collections and groups in your sap environment. 

## DEPLOY
- In controller /odata, remove / to get data => issues with namespace
- Build MTA.yaml
- cf deploy mta_archives/...

## Get BTP data

GET TOKEN (jwt voor BTP role collections https://api.authentication.us10.hana.ondemand.com/sap/rest/authorization/v2/rolecollections)
- Maak instance van Authorization and Trust Management Service (apiaccess, niet application of instance)
    => create service key

## Get CIS data

GET TOKEN VOOR CIS 
- Maak ADMINISTRATOR AAN (SYSTEM)
- Hier secret aanmaken 
- GET MET BASIC AUTH => id + secret.
https://adruyadgk.trial-accounts.ondemand.com/service/scim/Groups


### detailed version
CIS GET SECRET / MAKE SECRET 
1. Ga naar ADMINISTRATORS
2. Ga naar create GEEN USER MAAR system
3. Maak secret aan
4. Gebruik secret voor CIS (BASIC AUTH)
https://ag7jbtfkw.trial-accounts.ondemand.com/service/scim/Groups



## Add a .env file (locally)
```
# DEV IAS
DEV_SCIM_URL="https://adruyadgk.trial-accounts.ondemand.com/service/scim"
DEV_CLIENT_ID="7cf4f5fe-f631-4f70-85f7-984c2ef642e5"
DEV_CLIENT_SECRET="T?Bs3m7_Ag@X3VlYFVaiTTEhpjy=z][A3i7"
DEV_TOKEN_URL="https://fd67edbatrial.authentication.us10.hana.ondemand.com/oauth/token"
DEV_JWT_CLIENT_ID = "sb-na-7e2c147a-2ecb-4bea-90f8-3ec031b884a6!a444990"
DEV_JWT_CLIENT_SECRET = "0c210129-4c0d-499a-9315-ec9e6cf26748$kxHbNKL8EZtDtpspzJumc3urqZcZq3A33wT6vdlMl7o="


# PROD IAS
PROD_SCIM_URL="https://adoje6gpt.trial-accounts.ondemand.com/service/scim"
PROD_CLIENT_ID="7fb432a5-d21b-41c5-aebb-c11e9a563f26"
PROD_CLIENT_SECRET="RVwN8GRKr[eh4tjq=5bqxTrY5K=bjAYuI"
PROD_TOKEN_URL="https://07b313fbtrial.authentication.us10.hana.ondemand.com/oauth/token"
PROD_JWT_CLIENT_ID = "sb-na-7e2c147a-2ecb-4bea-90f8-3ec031b884a6!a444990"
PROD_JWT_CLIENT_SECRET = "0c210129-4c0d-499a-9315-ec9e6cf26748$kxHbNKL8EZtDtpspzJumc3urqZcZq3A33wT6vdlMl7o="


#api authentication url 
BTP_API_URL = "https://api.authentication.us10.hana.ondemand.com"
```

Maak van deze .env file destinations
```
const IAS_CONFIG = {
        apiurl: process.env.BTP_API_URL,
        dev: {
            scimUrl: process.env.DEV_SCIM_URL,
            clientId: process.env.DEV_CLIENT_ID,
            clientSecret: process.env.DEV_CLIENT_SECRET,
            tokenUrl: process.env.DEV_TOKEN_URL,
            devjwtid: process.env.DEV_JWT_CLIENT_ID,
            devjwtsecret: process.env.DEV_JWT_CLIENT_SECRET
        },
        prod: {
            scimUrl: process.env.PROD_SCIM_URL,
            clientId: process.env.PROD_CLIENT_ID,
            clientSecret: process.env.PROD_CLIENT_SECRET,
            tokenUrl: process.env.PROD_TOKEN_URL,
            prodjwtid: process.env.PROD_JWT_CLIENT_ID,
            prodjwtsecret: process.env.PROD_JWT_CLIENT_SECRET
        },
    };
```
wordt dan
```
const IAS_CONFIG = {
        apiurl: /BTP_api,                           //destinationName met jwt
        dev: {
            scimUrl: /scimUrl/,                     //client id, secret (BASIC AUTH)
        },
        prod: {
            scimUrl: process.env.PROD_SCIM_URL,     //client id, secret (BASIC AUTH)
        },
    };

 ```