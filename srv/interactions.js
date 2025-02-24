const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {

    const username = "Gilles.muyshondt@yteria.com";
    const password = "Decenny01";
    const url = "https://adruyadgk.trial-accounts.ondemand.com/scim/Users";



    this.on('getIASUsers', async (req) => {
        const authHeader = "Basic " + Buffer.from(username + ":" + password).toString("base64");

        fetch(url, {
            method: "GET",
            headers: {
                "Authorization": authHeader
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => console.log(data))
        .catch(error => console.error("Error:", error));
    });



    this.on('getIASUser', async (req) => {
        const id = req.data.id
        console.log(id)
        const authHeader = "Basic " + Buffer.from(username + ":" + password).toString("base64");
        const Userurl = url + "/" + id
        fetch(Userurl, {
            method: "GET",
            headers: {
                "Authorization": authHeader
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => console.log(data))
        .catch(error => console.error("Error:", error));
    });






});