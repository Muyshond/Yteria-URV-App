const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {

    const username = "Gilles.muyshondt@yteria.com";
    const password = "Decenny01";
    const url = "https://adruyadgk.trial-accounts.ondemand.com/scim/Users";



    this.on('getIASUsers', async (req) => {
        const authHeader = "Basic " + Buffer.from(username + ":" + password).toString("base64");

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": authHeader
            }
        })
        const data = await response.json();
        return data
    });



    this.on('getIASUser', async (req) => {
        const id = req.data.id
        console.log(id)
        const authHeader = "Basic " + Buffer.from(username + ":" + password).toString("base64");
        const Userurl = url + "/" + id
        const response = await fetch(Userurl, {
            method: "GET",
            headers: {
                "Authorization": authHeader
            }
        })
        
        const data =  await response.json();
        return data;
        
        
    });

    this.on('getRoleCollections', async (req) => {

        
        try {
            const jwt = await getjwt();
            console.log("JWT Token:", jwt);
    
            const authHeader = "Bearer " + jwt;
            const roleCollectionURL = "https://api.authentication.us10.hana.ondemand.com/sap/rest/authorization/v2/rolecollections?showGroups=true";
    
            const response = await fetch(roleCollectionURL, {
                method: "GET",
                headers: {
                    "Authorization": authHeader
                }
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const data = await response.json();
            console.log("Role Collections:", data);
    
            return data; 
        } catch (error) {
            console.error("Error fetching Role Collections:", error);
            req.error(500, "Failed to fetch role collections");
        }
    });



    this.on('getRoleCollectionRoles', async (req) => {

        const name = req.data.roleCollectionName

        try {
            const jwt = await getjwt();
            console.log("JWT Token:", jwt);
    
            const authHeader = "Bearer " + jwt;
            const roleCollectionURL = `https://api.authentication.us10.hana.ondemand.com/sap/rest/authorization/v2/rolecollections/${name}`;
    
            const response = await fetch(roleCollectionURL, {
                method: "GET",
                headers: {
                    "Authorization": authHeader
                }
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const data = await response.json();
            console.log("Role Collections:", data);
    
            return data; 
        } catch (error) {
            console.error("Error fetching Role Collections:", error);
            req.error(500, "Failed to fetch role collections");
        }
    });





    async function getjwt() {
        const url = "https://64b4765dtrial.authentication.us10.hana.ondemand.com/oauth/token";
        const client = "sb-na-7f7c1b12-d578-4563-a01e-4959c896365d!a396111";
        const secret = "288aa128-433a-4f39-9b69-4cd8d98ddeba$rNqufHgZe6QrIQBFc6Bt3dqpWaeQ0wCcMtPkYBBOcYs=";
        const authHeader = "Basic " + Buffer.from(client + ":" + secret).toString("base64");
    
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Authorization": authHeader,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({ grant_type: "client_credentials" })
            });
    
            if (!response.ok) {
                throw new Error(`Failed to fetch token: ${response.status}`);
            }
    
            const data = await response.json();
            console.log("Access Token:", data.access_token);
            return data.access_token; 
    
        } catch (error) {
            console.error("Error fetching JWT:", error);
            throw error; 
        }
    }





});