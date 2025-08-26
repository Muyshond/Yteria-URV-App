const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {

    



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


    this.on('getIASUsers', async (req) => {
        const btp = req.data.btp;
        try{
            if(btp === "dev"){
                
                const authHeader = `Basic ${Buffer.from(`${IAS_CONFIG.dev.clientId}:${IAS_CONFIG.dev.clientSecret}`).toString("base64")}`;                    
                const response = await fetch(`${IAS_CONFIG.dev.scimUrl}/Users`, {
                        method: "GET",
                        headers: {
                            "Authorization": authHeader
                        }
                    })
                    const data = await response.json();
                    return data;
                
            } else if(btp === "prod"){
                    const authHeader = `Basic ${Buffer.from(`${IAS_CONFIG.prod.clientId}:${IAS_CONFIG.prod.clientSecret}`).toString("base64")}`;                    
                    const response = await fetch(`${IAS_CONFIG.prod.scimUrl}/Users`, {
                        method: "GET",
                        headers: {
                            "Authorization": authHeader
                        }
                    })
                    const data = await response.json();
                    return data;
                
            }
        } catch(error){
            console.error(error)
            req.error(500, "Error fetching Users")
        }
    });



    this.on('getIASUser', async (req) => {
        const id = req.data.id;
        const btp = req.data.btp;
        try{
            if(btp === "dev"){
                const authHeader = `Basic ${Buffer.from(`${IAS_CONFIG.dev.clientId}:${IAS_CONFIG.dev.clientSecret}`).toString("base64")}`;                    
                const userUrl = `${IAS_CONFIG.dev.scimUrl}/Users/${id}`;
                const response = await fetch(userUrl, {
                    method: "GET",
                    headers: {
                        "Authorization": authHeader
                    }
                })
                const data =  await response.json();
                return data;
                
            } else if (btp === "prod") {
                const authHeader = `Basic ${Buffer.from(`${IAS_CONFIG.prod.clientId}:${IAS_CONFIG.prod.clientSecret}`).toString("base64")}`;                    
                const userUrl = `${IAS_CONFIG.prod.scimUrl}/Users/${id}`;
                const response = await fetch(userUrl, {
                    method: "GET",
                    headers: {
                        "Authorization": authHeader
                    }
                })
                const data =  await response.json();
                return data;
               
            }
        }catch(error){
                console.error(error)
                req.error(500, "Failed to fetch IAS User")
        }
    });



    this.on('getRoleCollections', async (req) => {

        const btp = req.data.btp;
        
        try {
            const jwt = await getjwt(btp);
            console.log("JWT Token:", jwt);
    
            const authHeader = "Bearer " + jwt;

            const roleCollectionURL = `${IAS_CONFIG.apiurl}/sap/rest/authorization/v2/rolecollections`;

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
        const btp = req.data.btp;

        try {
            const jwt = await getjwt(btp);
            console.log("JWT Token:", jwt);
    
            const authHeader = "Bearer " + jwt;
            const roleCollectionURL = `${IAS_CONFIG.apiurl}/sap/rest/authorization/v2/rolecollections/${name}`;

    
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





    async function getjwt(btp) {
        try{
            if (btp === "dev"){
                const url = IAS_CONFIG.dev.tokenUrl;
                const authHeader = `Basic ${Buffer.from(`${IAS_CONFIG.dev.devjwtid}:${IAS_CONFIG.dev.devjwtsecret}`).toString("base64")}`;                    
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
            
                
            } else if (btp === "prod"){
                const url = IAS_CONFIG.prod.tokenUrl;
                const authHeader = `Basic ${Buffer.from(`${IAS_CONFIG.prod.devjwtid}:${IAS_CONFIG.prod.devjwtsecret}`).toString("base64")}`;                     
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
                return data.access_token; 
            
            }
        }catch(error) { 
            throw error; 
        }
        
    };


    


    this.on('getGroups', async (req) => {
        
        try{
            
            const btp = req.data.btp;
            const id = req.data.GroupID

            if (btp === "dev"){
                const groupurl = `${IAS_CONFIG.dev.scimUrl}/Groups/${id}`;
                const authHeader = `Basic ${Buffer.from(`${IAS_CONFIG.dev.clientId}:${IAS_CONFIG.dev.clientSecret}`).toString("base64")}`;                    

        
                const response = await fetch(groupurl, {
                    method: "GET",
                    headers: {
                        "Authorization": authHeader
                    }
                })
                const data = await response.json();
                return data;
            } else if (btp === "prod"){
                const groupurl = `${IAS_CONFIG.prod.scimUrl}/Groups/${id}`;
    
                const authHeader = `Basic ${Buffer.from(`${IAS_CONFIG.prod.clientId}:${IAS_CONFIG.prod.clientSecret}`).toString("base64")}`;                    
        
                const response = await fetch(groupurl, {
                    method: "GET",
                    headers: {
                        "Authorization": authHeader
                    }
                })
                const data = await response.json();
                return data;
            }
        } catch(error){
            console.error("Failed to fetch groups")
                req.error(500, "Failed to fetch groups")
        }
        
    });



    this.on('getGroupByName', async (req) => {
        try {
            const btp = req.data.btp;
            const name = req.data.GroupName;
            let userGroups = [];
            let idx = 1;
            let response;
            console.log(`Start loading IAS UserGroups`);

            if (btp === "dev"){
                const authHeader = `Basic ${Buffer.from(`${IAS_CONFIG.dev.clientId}:${IAS_CONFIG.dev.clientSecret}`).toString("base64")}`;                    
                do {
                    console.log(`Start loading IAS UserGroups from ${idx}`);
                    response = await fetch(`${IAS_CONFIG.dev.scimUrl}/Groups?startIndex=${idx}`, {
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
            } else if (btp === "prod"){
                const authHeader = `Basic ${Buffer.from(`${IAS_CONFIG.prod.clientId}:${IAS_CONFIG.prod.clientSecret}`).toString("base64")}`;                    
                do {
                    console.log(`Start loading IAS UserGroups from ${idx}`);
                    response = await fetch(`${IAS_CONFIG.dev.scimUrl}/Groups?startIndex=${idx}`, {
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
            }

        } catch (error) {
            console.error("Error fetching IAS groups:", error);
            req.error(500, "Failed to fetch groups")
        }
    });




    this.on('getGroupByWord', async (req) => {
        try {
            const btp = req.data.btp;
            const name = req.data.GroupName;
            let userGroups = [];
            let idx = 1;
            let response;
            console.log(`Start loading IAS UserGroups`);

            if (btp === "dev"){
                const authHeader = `Basic ${Buffer.from(`${IAS_CONFIG.dev.clientId}:${IAS_CONFIG.dev.clientSecret}`).toString("base64")}`;                    
                do {
                    console.log(`Start loading IAS UserGroups from ${idx}`);
                    response = await fetch(`${IAS_CONFIG.dev.scimUrl}/Groups?startIndex=${idx}`, {
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
            } else if (btp === "prod"){
                const authHeader = `Basic ${Buffer.from(`${IAS_CONFIG.prod.clientId}:${IAS_CONFIG.prod.clientSecret}`).toString("base64")}`;                    
                do {
                    console.log(`Start loading IAS UserGroups from ${idx}`);
                    response = await fetch(`${IAS_CONFIG.prod.scimUrl}/Groups?startIndex=${idx}`, {
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
            }

            
    
        } catch (error) {
            console.error("Error fetching IAS groups:", error);
            req.error(500, "Error fetching groups")
        }
    });




    this.on('getUserByWord', async (req) => {
        try {
            const id = req.data.id;
            const btp = req.data.btp;

            let users = [];
            let idx = 1;
            let response;

            if(btp === "dev"){
                const authHeader = `Basic ${Buffer.from(`${IAS_CONFIG.dev.clientId}:${IAS_CONFIG.dev.clientSecret}`).toString("base64")}`;                    
                do {
                    console.log(`Start loading IAS Users from ${idx}`);
                    response = await fetch(`${IAS_CONFIG.dev.scimUrl}/Users?startIndex=${idx}`, {
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
            } else if (btp === "prod"){
                const authHeader = `Basic ${Buffer.from(`${IAS_CONFIG.prod.clientId}:${IAS_CONFIG.prod.clientSecret}`).toString("base64")}`;                    
                do {
                    console.log(`Start loading IAS Users from ${idx}`);
                    response = await fetch(`${IAS_CONFIG.prod.scimUrl}/Users?startIndex=${idx}`, {
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
            }
            
    
        } catch (error) {
            console.error("Error fetching IAS groups:", error);
            req.error(500, "Error fetching groups")
        }
    });

    





});