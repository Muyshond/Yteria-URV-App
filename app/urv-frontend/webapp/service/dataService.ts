// /model/MyService.ts
import { ODataModel } from "sap/ui/model/odata/v2/ODataModel";

export default class dataService {
    
    

    static async getGroup(id: string, oView: any){
        try {
            const selectinput = oView?.byId("selectCIS") as sap.m.select;
            const selectedvalue = selectinput.getSelectedItem();
            console.log("hfqsdjklhfjkqslhdfjkqlshdfjklqsmhdfjkSDHJKQSL")

            const oModel = oView?.getModel() as sap.ui.model.odata.v4.ODataModel;
            const oBinding = oModel.bindContext(`/getGroupByName(...)`, undefined, {});
            oBinding.setParameter("GroupName", id);
            oBinding.setParameter("btp", selectedvalue.mProperties.key);

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
            const selectinput = oView?.byId("selectCIS") as sap.m.select;
            const selectedvalue = selectinput.getSelectedItem();

            const oModel = oView.getModel() as sap.ui.model.odata.v4.ODataModel;
            const oBinding = oModel.bindContext(`/getRoleCollectionRoles(...)`, undefined, {});
            oBinding.setParameter("roleCollectionName", roleCollection);
            oBinding.setParameter("btp", selectedvalue.mProperties.key);

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

            const selectinput = oView?.byId("selectCIS") as sap.m.select;
            const selectedvalue = selectinput.getSelectedItem();

            const oModel = oView.getModel() as sap.ui.model.odata.v4.ODataModel;
            const oBinding = oModel.bindContext(`/getRoleCollections(...)`, undefined, {});
            oBinding.setParameter("btp", selectedvalue.mProperties.key);

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
            const selectinput = oView?.byId("selectCIS") as sap.m.select;
            const selectedvalue = selectinput.getSelectedItem();

            const oModel = oView.getModel() as sap.ui.model.odata.v4.ODataModel;
            const oBinding = oModel.bindContext(`/getIASUser(...)`, undefined, {});
            oBinding.setParameter("id", userid);
            oBinding.setParameter("btp", selectedvalue.mProperties.key);

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
            const selectinput = oView?.byId("selectCIS") as sap.m.select;
            const selectedvalue = selectinput.getSelectedItem();
            const oModel = oView.getModel() as sap.ui.model.odata.v4.ODataModel;
            const oBinding = oModel.bindContext(`/getGroupByWord(...)`, undefined, {});
            oBinding.setParameter("GroupName", id);
            oBinding.setParameter("btp", selectedvalue.mProperties.key);

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
            const selectinput = oView?.byId("selectCIS") as sap.m.select;
            const selectedvalue = selectinput.getSelectedItem();
            console.log(selectedvalue.mProperties.key)

            const oModel = oView.getModel() as sap.ui.model.odata.v4.ODataModel;
            const oBinding = oModel.bindContext(`/getUserByWord(...)`, undefined, {});
            oBinding.setParameter("id", id);
            oBinding.setParameter("btp", selectedvalue.mProperties.key);

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


    static async getGroupRoles(groupName: string, oView: any){
        
        const roleCollectionsData = await dataService.getRoleCollections(oView);
        const roleCollections = roleCollectionsData?.value || [];
        const matchedRoles: string[] = [];

        roleCollections.forEach((roleCollection: any) => {
            if (!roleCollection.groupReferences && !roleCollection.samlAttributeAssignment) {
                return;
            }
            const roleGroups = [
                ...(roleCollection.groupReferences || []).map((grp: any) => grp.attributeValue),
                ...(roleCollection.samlAttributeAssignment || []).map((saml: any) => saml.attributeValue)
            ];

            if (roleGroups.includes(groupName)) {
                matchedRoles.push(roleCollection.name);
            }
        });
        return matchedRoles;
    }







    
    



  
}