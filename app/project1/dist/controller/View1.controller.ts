import Controller from "sap/ui/core/mvc/Controller";

/**
 * @namespace project1.controller
 */
export default class View1 extends Controller {

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {

    }

    public async getRoleCollections(){
        this.getToken();
        this.getTest()
        try {
            const response = await fetch("/Ypto-URV-Application-srv-api/getRoleCollections");
            
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            const data = await response.json();
            console.log(data);
            return data;
        } catch (error) {
            console.error("Error:", error);
        }
    }


    public async getToken() {

        if (sessionStorage.getItem("access_token")){
            console.log("jwt found")
            return sessionStorage.getItem("access_token");
        }
        const clientId = "sb-ypto-urv-application!t396111";
        const clientSecret = "290924ba-2bf3-4f26-9993-e127c7f8bac7$FAGnOcnTYsekIPnf-MfOVk_AhKU0LTd627D_M5wdXnc=";
        const authHeader = `Basic ${btoa(`${clientId}:${clientSecret}`)}`;
        const data = new URLSearchParams();
        data.append("grant_type", "client_credentials");
        try {
            const response = await fetch(
                "https://64b4765dtrial.authentication.us10.hana.ondemand.com/oauth/token",
                {
                    method: "POST",
                    headers: {
                        Authorization: authHeader,
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: data
                }
            );

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const result = await response.json();
            console.log("Access Token:", result.access_token);
            sessionStorage.setItem("access_token", result.access_token);
            return result.access_token;
        } catch (error) {
            console.error("Failed to get token:", error);
            return null;
        }

    }



    public async getTest(){
        
        try {
            const response = await fetch(
                "https://64b4765dtrial-dev-ypto-urv-application-srv.cfapps.us10-001.hana.ondemand.com/odata/v4/catalog/getIASUsers",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${sessionStorage.access_token}`,
                        "Content-Type": "application/json"
                    }
                }
            );
    
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    
            const result = await response.json();
            console.log("IAS Users:", result);
            return result;
        } catch (error) {
            console.error("Failed to fetch IAS users:", error);
            return null;
        }
    }
}