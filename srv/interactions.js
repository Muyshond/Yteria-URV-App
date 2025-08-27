const cds = require('@sap/cds');
const { getDestination } = require('@sap-cloud-sdk/connectivity');
const { executeHttpRequest } = require('@sap-cloud-sdk/http-client'); 




    // const IAS_CONFIG = {
    //     apiurl: "https://api.authentication.us10.hana.ondemand.com",
    //     dev: {
    //         scimUrl: "https://1b9caf5a.trial-accounts.ondemand.com/service/scim",
    //         clientId: "7cf4f5fe-f631-4f70-85f7-984c2ef642e5",
    //         clientSecret: "T?Bs3m7_Ag@X3VlYFVaiTTEhpjy=z][A3i7",
    //         tokenUrl: "https://1b9caf5atrial.authentication.us10.hana.ondemand.com/oauth/token",
    //         jwtid: "sb-na-7612fc93-da2f-44c1-bd96-1be4a79c655f!a505822",
    //         jwtsecret: "6d234971-7a04-4624-a05c-17204291dab4$JyKR40Vw_twKQpIZuQ_1QgKm8kxjGxQsOgaF8UJQ65s="
    //     },
    //     prod: {
    //         scimUrl: "https://amw0sflcw.trial-accounts.ondemand.com/service/scim",
    //         clientId: "ef36dfb9-a993-42f1-8c9a-0f267f55a486",
    //         clientSecret: "A.=/1SNPk2SmoeB[NHK@rf0T=_v=fgsaM/",
    //         tokenUrl: "https://1b9caf5atrial.authentication.us10.hana.ondemand.com/oauth/token",
    //         jwtid: "sb-na-7612fc93-da2f-44c1-bd96-1be4a79c655f!a505822",
    //         jwtsecret: "6d234971-7a04-4624-a05c-17204291dab4$JyKR40Vw_twKQpIZuQ_1QgKm8kxjGxQsOgaF8UJQ65s="
    //     },
    // };

    const SCIM_DESTINATION_MAP = {
        prod: "prod-scim",
        dev: "dev-scim",
        //acc: "acc-scim"
        //...
    };

    const BTP_DESTINATION_MAP = {
        prod: "btp-prod-url",
        dev: "btp-dev-url",
        //acc: "acc-scim"
        //...
    };

    async function getDestinationConfig(btp) {
        const destName = SCIM_DESTINATION_MAP[btp];
        if (!destName) {
            throw new Error(`No destination configured for btp "${btp}"`);
        }
        
        const dest = await getDestination({ destinationName: destName });
        if (!dest) {
            throw new Error(`Destination "${destName}" not found`);
        }
        return dest;
    }

    async function getBTPDestination(btp) {
        const destName = BTP_DESTINATION_MAP[btp];
        if (!destName) {
            throw new Error(`No destination configured for btp "${btp}"`);
        }

        const dest = await getDestination({ destinationName: destName });
        if (!dest) {
            throw new Error(`BTP Destination not found`);
        }
        return dest;
    }

module.exports = cds.service.impl(async function () {

    this.on('getIASUsers', async (req) => {
        try {
        const dest = await getDestinationConfig(req.data.btp);
        const response = await executeHttpRequest(dest, {
                method: 'GET',
                url: `/Users` 
            });
        return response.data;
        } catch (error) {
        console.error(error);
        req.error(500, "Error fetching Users"+ error);
        }
    });



    this.on('getIASUser', async (req) => {
        try {
        const dest = await getDestinationConfig(req.data.btp);
        const response = await executeHttpRequest(dest, {
                method: 'GET',
                url: `/Users/${req.data.id}` 
            });
            return response.data;     
        } catch (error) {
        console.error(error);
        req.error(500, "Failed to fetch IAS User" + error);
        }
    });



    this.on('getRoleCollections', async (req) => {

        const btp = req.data.btp;
        try {
            

            const dest = await getBTPDestination(btp);
            const response = await executeHttpRequest(dest, {
                method: 'GET',
                url: `/sap/rest/authorization/v2/rolecollections?showGroups=true` 
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching Role Collections:", error);
            req.error(500, "Failed to fetch role collections");
        }
    });



    this.on('getRoleCollectionRoles', async (req) => {

        const name = req.data.roleCollectionName
        const btp = req.data.btp;


        try {

            const dest = await getBTPDestination(btp);
            const response = await executeHttpRequest(dest, {
                method: 'GET',
                url: `/sap/rest/authorization/v2/rolecollections/${name}` 
            });
            

    
    
            return response.data;

        } catch (error) {
            console.error("Error fetching Role Collections:", error);
            req.error(500, "Failed to fetch role collections");
        }
    });


    // async function getjwt(btp) {
    //     try{
            
    //             const config = IAS_CONFIG[btp];
    //             const url = config.tokenUrl;
    //             const { jwtid, jwtsecret } = IAS_CONFIG[btp];
    //             const authHeader = `Basic ${Buffer.from(`${jwtid}:${jwtsecret}`).toString("base64")}`;
    //             const response = await fetch(url, {
    //                 method: "POST",
    //                 headers: {
    //                     "Authorization": authHeader,
    //                     "Content-Type": "application/x-www-form-urlencoded"
    //                 },
    //                 body: new URLSearchParams({ grant_type: "client_credentials" })
    //             });
            
    //             if (!response.ok) {
    //                 throw new Error(`Failed to fetch token: ${response.status}`);
    //             }
            
    //             const data = await response.json();
    //             return data.access_token; 
            
            
    //     }catch(error) { 
    //         throw error; 
    //     }
        
    // };


    this.on('getGroups', async (req) => {
        try {
            const dest = await getDestinationConfig(req.data.btp);
            const response = await executeHttpRequest(dest, {
                method: 'GET',
                url: `/Groups/${req.data.GroupID}`
            });
            return response.data;
        } catch (error) {
            console.error("Failed to fetch groups", error);
            req.error(500, "Failed to fetch groups");
        }
    });



    this.on('getGroupByName', async (req) => {
        try {
            const dest = await getDestinationConfig(req.data.btp);
            let idx = 1;
            let allGroups = [];
            let response;

            do {
                response = await executeHttpRequest(dest, {
                    method: 'GET',
                    url: `/Groups?startIndex=${idx}`
                });
                allGroups = [...allGroups, ...response.data.Resources];
                idx += 100;
            } while (allGroups.length < response.data.totalResults);

            const foundGroup = allGroups.find(g => g.displayName === req.data.GroupName);
            return foundGroup || `Group not found`;

        } catch (error) {
            console.error("Error fetching IAS groups:", error);
            req.error(500, "Failed to fetch groups");
        }
    });




    this.on('getGroupByWord', async (req) => {
        try {
            const dest = await getDestinationConfig(req.data.btp);
            let idx = 1;
            let allGroups = [];
            let response;

            do {
                response = await executeHttpRequest(dest, {
                    method: 'GET',
                    url: `/Groups?startIndex=${idx}`
                });
                allGroups = [...allGroups, ...response.data.Resources];
                idx += 100;
            } while (allGroups.length < response.data.totalResults);

            return allGroups.filter(g => g.displayName.toLowerCase().includes(req.data.GroupName.toLowerCase()));

        } catch (error) {
            console.error("Error fetching IAS groups by word:", error);
            req.error(500, "Failed to fetch groups");
        }
    });




    this.on('getUserByWord', async (req) => {
        try {
            const dest = await getDestinationConfig(req.data.btp);
            let idx = 1;
            let allUsers = [];
            let response;

            do {
                response = await executeHttpRequest(dest, {
                    method: 'GET',
                    url: `/Users?startIndex=${idx}`
                });
                allUsers = [...allUsers, ...response.data.Resources];
                idx += 100;
            } while (allUsers.length < response.data.totalResults);

            return allUsers.filter(u => u.id.toLowerCase().includes(req.data.id.trim().toLowerCase()));

        } catch (error) {
            console.error("Error fetching IAS users by word:", error);
            req.error(500, "Failed to fetch users");
        }
    });

    // function getAuthHeader(btp) {
    //     const { clientId, clientSecret } = IAS_CONFIG[btp];
    //     return `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
    // }
    
    

});