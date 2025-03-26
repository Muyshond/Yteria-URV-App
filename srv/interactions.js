const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {

    
    const url = "https://adruyadgk.trial-accounts.ondemand.com/service/scim/Users";
    const clientid = "976a672a-f46c-4340-bf8e-f0bc9c636ea4"
    const clientsecret = "doLAg_EfYVOss].suaSs=WmNo=BrQbQk"


    this.on('getIASUsers', async (req) => {7
        try{
            const authHeader = "Basic " + Buffer.from(clientid + ":" + clientsecret).toString("base64");

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Authorization": authHeader
                }
            })
            const data = await response.json();
            return data;
        }catch(error){
            return "error fetching user"
        }
        
    });



    this.on('getIASUser', async (req) => {
        const id = req.data.id
        console.log(id)
        const authHeader = "Basic " + Buffer.from(clientid + ":" + clientsecret).toString("base64");
        const Userurl = url + "/" + id
        const response = await fetch(Userurl, {
            method: "GET",
            headers: {
                "Authorization": authHeader
            }
        })
        try{
            const data =  await response.json();
            return data;
        }catch{
            return 
        }
        
        
        
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
    };


    this.on('getGroups', async (req) => {
        try{
            const id = req.data.GroupID
            const groupurl = `https://adruyadgk.trial-accounts.ondemand.com/service/scim/Groups/${id}`;
    
            const authHeader = "Basic " + Buffer.from(clientid + ":" + clientsecret).toString("base64");
    
            const response = await fetch(groupurl, {
                method: "GET",
                headers: {
                    "Authorization": authHeader
                }
            })
            const data = await response.json();
            return data;
        } catch(error){
            return "error fetching group"; 
        }
        
    });

    this.on('getGroupByName', async (req) => {
        try {
            const name = req.data.GroupName;
            let userGroups = [];
            let idx = 1;
            let response;
            console.log(`Start loading IAS UserGroups`);
            const authHeader = "Basic " + Buffer.from(clientid + ":" + clientsecret).toString("base64");
            do {
                console.log(`Start loading IAS UserGroups from ${idx}`);
                response = await fetch(`https://adruyadgk.trial-accounts.ondemand.com/service/scim/Groups?startIndex=${idx}`, {
                    headers: {
                        "Authorization": authHeader
                    },
                    method: "GET"
                });
    
                const data = await response.json();
                userGroups = [...userGroups, ...data.Resources];
    
                console.log(`Loading IAS UserGroups - current count ${userGroups.length}`);
                idx += 100;
    
            } while (userGroups.length < response.totalResults);
    
            console.log(`Finished loading IAS UserGroups - count ${userGroups.length}`);
    
            const foundGroup = userGroups.find(group => group.displayName === name);
            return foundGroup || `Group not found`;
    
        } catch (error) {
            console.error("Error fetching IAS groups:", error);
            return "Error fetching group";
        }
    });

    this.on('getGroupByWord', async (req) => {
        try {
            const name = req.data.GroupName;
            let userGroups = [];
            let idx = 1;
            let response;
            console.log(`Start loading IAS UserGroups`);
            const authHeader = "Basic " + Buffer.from(clientid + ":" + clientsecret).toString("base64");
            do {
                console.log(`Start loading IAS UserGroups from ${idx}`);
                response = await fetch(`https://adruyadgk.trial-accounts.ondemand.com/service/scim/Groups?startIndex=${idx}`, {
                    headers: {
                        "Authorization": authHeader
                    },
                    method: "GET"
                });
    
                const data = await response.json();
                userGroups = [...userGroups, ...data.Resources];
    
                console.log(`Loading IAS UserGroups - current count ${userGroups.length}`);
                idx += 100;
    
            } while (userGroups.length < response.totalResults);
    
            console.log(`Finished loading IAS UserGroups - count ${userGroups.length}`);
            let includesword = []
            userGroups.forEach(group => {
                if (group.displayName.toLowerCase().includes(name.toLowerCase())) {
                    includesword.push(group);
                }
            });
            
            return includesword;
    
        } catch (error) {
            console.error("Error fetching IAS groups:", error);
            return "Error fetching group";
        }
    });


    this.on('getUserByWord', async (req) => {
        try {
            const id = req.data.id;
            
            let users = [];
            let idx = 1;
            let response;
            console.log(`Start loading IAS UserGroups`);
            const authHeader = "Basic " + Buffer.from(clientid + ":" + clientsecret).toString("base64");
            do {
                console.log(`Start loading IAS Users from ${idx}`);
                response = await fetch(`https://adruyadgk.trial-accounts.ondemand.com/service/scim/Users?startIndex=${idx}`, {
                    headers: {
                        "Authorization": authHeader
                    },
                    method: "GET"
                });
    
                const data = await response.json();
                users = [...users, ...data.Resources];
    
                console.log(`Loading IAS User - current count ${users.length}`);
                idx += 100;
    
            } while (users.length < response.totalResults);
    
            console.log(`Finished loading IAS Users - count ${users.length}`);
            let includesword = []
            users.forEach(user => {
                if (user.id.toLowerCase().includes(id.trim().toLowerCase())) {
                    
                    includesword.push(user);
                }
            });
            
            return includesword;
    
        } catch (error) {
            console.error("Error fetching IAS groups:", error);
            return "Error fetching User";
        }
    });

    





});