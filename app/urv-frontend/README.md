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