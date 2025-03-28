// /model/MyService.ts
import { ODataModel } from "sap/ui/model/odata/v2/ODataModel";

export default class dataService {
    
    static testfunction(): String {
        return "test hsjldlmqHDFJKLMSQDHJFKQSLH"
    }

    static async getGroup(id: string, oView: any){
        try {
            console.log("hfqsdjklhfjkqslhdfjkqlshdfjklqsmhdfjkSDHJKQSL")

            const oModel = oView?.getModel() as sap.ui.model.odata.v4.ODataModel;
            const oBinding = oModel.bindContext(`/getGroupByName(...)`, undefined, {});
            oBinding.setParameter("GroupName", id);

            const data = await oBinding.execute()
                .then(() => {
                    const oContext = oBinding.getBoundContext();
                    if (!oContext) {
                        return;
                    }
                    const group = oContext.getObject();
                    return group;
                })
                .catch((oError: any) => {
                    console.error("Error fetching Group:", oError);
                    
                });

            return data;


        } catch (error) {
            console.error("Error:", error);
        }
    }


    static async getRolecollectionRoles(roleCollection: string, oView: any){
        try {
            const oModel = oView.getModel() as sap.ui.model.odata.v4.ODataModel;
            const oBinding = oModel.bindContext(`/getRoleCollectionRoles(...)`, undefined, {});
            oBinding.setParameter("roleCollectionName", roleCollection);
            const data = oBinding.execute()
                .then(() => {
                    const oContext = oBinding.getBoundContext();
                    if (!oContext) {
                        return;
                    }
                    const user = oContext.getObject();
                    return user;
                })
                .catch((oError: any) => {
                    console.error("Error fetching role collecton roles:", oError);
                });
            return data;
        } catch (error) {
            console.error("Error:", error);
        }
    }

    
    static async getRoleCollections(oView: any){
        try {

            
            const oModel = oView.getModel() as sap.ui.model.odata.v4.ODataModel;
            const oBinding = oModel.bindContext(`/getRoleCollections(...)`, undefined, {});
            
            const data = oBinding.execute()
                .then(() => {
                    const oContext = oBinding.getBoundContext();
                    if (!oContext) {
                        return;
                    }
                    const user = oContext.getObject();
                    return user;
                })
                .catch((oError: any) => {
                    console.error("Error fetching role collectons:", oError);
                });

            return data;

        } catch (error) {
            console.error("Error:", error);
        }
        
    }


    static async getIASUser(userid: string, oView: any) {
        try {
            const oModel = oView.getModel() as sap.ui.model.odata.v4.ODataModel;
            const oBinding = oModel.bindContext(`/getIASUser(...)`, undefined, {});
            oBinding.setParameter("id", userid);

            const data = oBinding.execute()
                .then(() => {
                    const oContext = oBinding.getBoundContext();
                    if (!oContext) {
                        return;
                    }
                    const user = oContext.getObject();
                    return user.value;
                })
                .catch((oError: any) => {
                    console.error("Error fetching IAS User:", oError);
                });
            return data;
                


        } catch (error) {
            console.error("Error :", error);
        }
    }


    static async getGroupByWord(id: string, oView: any){
        try {

            const oModel = oView.getModel() as sap.ui.model.odata.v4.ODataModel;
            const oBinding = oModel.bindContext(`/getGroupByWord(...)`, undefined, {});
            oBinding.setParameter("GroupName", id);

            const data = await oBinding.execute()
                .then(() => {
                    const oContext = oBinding.getBoundContext();
                    if (!oContext) {
                        return;
                    }
                    const group = oContext.getObject();
                    return group;
                })
                .catch((oError: any) => {
                    console.error("Error fetching Group:", oError);
                    
                });

            return data;

        } catch (error) {
            console.error("Error catching groups:", error);
        }
    }

    static async getUserByWord(id: string, oView: any){
        try {

            const oModel = oView.getModel() as sap.ui.model.odata.v4.ODataModel;
            const oBinding = oModel.bindContext(`/getUserByWord(...)`, undefined, {});
            oBinding.setParameter("id", id);

            const data = await oBinding.execute()
                .then(() => {
                    const oContext = oBinding.getBoundContext();
                    if (!oContext) {
                        return;
                    }
                    const group = oContext.getObject();
                    return group;
                })
                .catch((oError: any) => {
                    console.error("Error fetching Group:", oError);
                    
                });

            return data;

        } catch (error) {
            console.error("Error catching groups:", error);
        }
    }








    
    



  
}