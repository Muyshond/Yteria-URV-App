import Controller from "sap/ui/core/mvc/Controller";

/**
 * @namespace captest.controller
 */
export default class View1 extends Controller {

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {

    }

    public async getRoleCollections(){
       
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
}