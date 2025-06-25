const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {

    
    const devscimurl = "https://ag7jbtfkw.trial-accounts.ondemand.com/service/scim/Users";
    const devclientid = "7cf4f5fe-f631-4f70-85f7-984c2ef642e5"
    const devclientsecret = "T?Bs3m7_Ag@X3VlYFVaiTTEhpjy=z][A3i7"

    const prodscimurl = "https://adoje6gpt.trial-accounts.ondemand.com/service/scim/Users"
    const prodclientid = "7fb432a5-d21b-41c5-aebb-c11e9a563f26"
    const prodclientsecret = "RVwN8GRKr[eh4tjq=5bqxTrY5K=bjAYuI"


    this.on('getIASUsers', async (req) => {
        const btp = req.data.btp;
        if(btp === "dev"){
            try{
                const authHeader = "Basic " + Buffer.from(devclientid + ":" + devclientsecret).toString("base64");
    
                const response = await fetch(devscimurl, {
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
        } else if(btp === "prod"){
            try{
                const authHeader = "Basic " + Buffer.from(prodclientid + ":" + prodclientsecret).toString("base64");
    
                const response = await fetch(prodscimurl, {
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
        }

        
    });



    this.on('getIASUser', async (req) => {
        const id = req.data.id;
        const btp = req.data.btp;
        
        if(btp === "dev"){
            const authHeader = "Basic " + Buffer.from(devclientid + ":" + devclientsecret).toString("base64");
            const Userurl = devscimurl + "/" + id
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
        } else if (btp === "prod") {
            const authHeader = "Basic " + Buffer.from(prodclientid + ":" + prodclientsecret).toString("base64");
            const Userurl = prodscimurl + "/" + id
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
        }
        
    });



    this.on('getRoleCollections', async (req) => {

        const btp = req.data.btp;
        
        try {
            const jwt = await getjwt(btp);
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
        const btp = req.data.btp;

        try {
            const jwt = await getjwt(btp);
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





    async function getjwt(btp) {
        if (btp === "dev"){
            const url = "https://fd67edbatrial.authentication.us10.hana.ondemand.com/oauth/token";
            const client = "sb-na-7e2c147a-2ecb-4bea-90f8-3ec031b884a6!a444990";
            const secret = "0c210129-4c0d-499a-9315-ec9e6cf26748$kxHbNKL8EZtDtpspzJumc3urqZcZq3A33wT6vdlMl7o=";
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
        } else if (btp === "prod"){
            const url = "https://07b313fbtrial.authentication.us10.hana.ondemand.com/oauth/token";
            const client = "sb-na-0d360c9e-809a-4c89-a3d3-0a61cbc48a76!a472391";
            const secret = "f41fcabb-202d-4920-bd48-ef4d6c984ec2$HgXMhyY2B0lCt7dJh-ctrJ7BR3uWqm4dqK4FZwG34nA=";
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
        
    };


    


    this.on('getGroups', async (req) => {
        
        try{
            
            const btp = req.data.btp;
            const id = req.data.GroupID

            if (btp === "dev"){
                const groupurl = `https://adruyadgk.trial-accounts.ondemand.com/service/scim/Groups/${id}`;
    
                const authHeader = "Basic " + Buffer.from(devclientid + ":" + devclientsecret).toString("base64");
        
                const response = await fetch(groupurl, {
                    method: "GET",
                    headers: {
                        "Authorization": authHeader
                    }
                })
                const data = await response.json();
                return data;
            } else if (btp === "prod"){
                const groupurl = `https://adoje6gpt.trial-accounts.ondemand.com/service/scim/Groups/${id}`;
    
                const authHeader = "Basic " + Buffer.from(prodclientid + ":" + prodclientsecret).toString("base64");
        
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
            return "error fetching group"; 
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
                const authHeader = "Basic " + Buffer.from(devclientid + ":" + devclientsecret).toString("base64");
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
            } else if (btp === "prod"){
                const authHeader = "Basic " + Buffer.from(prodclientid + ":" + prodclientsecret).toString("base64");
                do {
                    console.log(`Start loading IAS UserGroups from ${idx}`);
                    response = await fetch(`https://adoje6gpt.trial-accounts.ondemand.com/service/scim/Groups?startIndex=${idx}`, {
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
            return "Error fetching group";
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
                const authHeader = "Basic " + Buffer.from(devclientid + ":" + devclientsecret).toString("base64");
                do {
                    console.log(`Start loading IAS UserGroups from ${idx}`);
                    response = await fetch(`https://ag7jbtfkw.trial-accounts.ondemand.com/service/scim/Groups?startIndex=${idx}`, {
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
                const authHeader = "Basic " + Buffer.from(prodclientid + ":" + prodclientsecret).toString("base64");
                do {
                    console.log(`Start loading IAS UserGroups from ${idx}`);
                    response = await fetch(`https://adoje6gpt.trial-accounts.ondemand.com/service/scim/Groups?startIndex=${idx}`, {
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
            return "Error fetching group";
        }
    });




    this.on('getUserByWord', async (req) => {
        try {
            const id = req.data.id;
            const btp = req.data.btp;

            let users = [];
            let idx = 1;
            let response;
            console.log(`Start loading IAS UserGroups`);


            if(btp === "dev"){
                const authHeader = "Basic " + Buffer.from(devclientid + ":" + devclientsecret).toString("base64");
                do {
                    console.log(`Start loading IAS Users from ${idx}`);
                    response = await fetch(`https://ag7jbtfkw.trial-accounts.ondemand.com/service/scim/Users?startIndex=${idx}`, {
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
                const authHeader = "Basic " + Buffer.from(prodclientid + ":" + prodclientsecret).toString("base64");
                do {
                    console.log(`Start loading IAS Users from ${idx}`);
                    response = await fetch(`https://adoje6gpt.trial-accounts.ondemand.com/service/scim/Users?startIndex=${idx}`, {
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
            return "Error fetching User";
        }
    });

    





});