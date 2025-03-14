import MessageToast from "sap/m/MessageToast";
import Controller from "sap/ui/core/mvc/Controller";
import { form } from "sap/ui/layout/library";
import JSONModel from "sap/ui/model/json/JSONModel";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import containsOrEquals from "sap/ui/dom/containsOrEquals";
/**
 * @namespace urvfrontend.controller
 */
export default class Overview extends Controller {

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {

    }

    


    public async getUser() {
        const userInput = this.getView()?.byId("UserID") as sap.m.Input;
        const userID = userInput.getValue();
        if(userID === ""){
            MessageToast.show("Please enter a valid ID");
            return
        }
        const user = await this.getIASUser(userID);
        const userdata = user.value?.[0]
        //const userGroups = userdata.groups.map((group: any) => group.display); //groups deftig zetten 
        //this.getRolecollectionRoles("AuthGroup.Content.Admin") //test (delete erna)
        this.setUserDetails(userdata);
        const grouprolerelationship = await this.getUserCollectionsViaGroup(userdata)
        console.log(grouprolerelationship)

        const formattedData = Object.entries(grouprolerelationship).map(([group, value]) => ({
            group, 
            roleCollections: value

        }));

        const result: any = {}
        for (const { group, roleCollections } of formattedData) {
            result[group] = {}; 
    
            for (const roleCollection of roleCollections) {
                const response = await this.getRolecollectionRoles(roleCollection); 
                const roleCollectionData = response?.value?.[0]; 
                const roles = roleCollectionData?.roleReferences?.map((role: any) => role.name) || [];

                result[group][roleCollection] = roles;
        }
        console.log(result)
        this.setDataToTree(result);

    }
}



public setDataToTree(data: any) {
    const treeformat = Object.entries(data).map(([groupName, roleCollections]) => ({
        name: groupName,
        icon: "sap-icon://group", 
        children: Object.entries(roleCollections as Record<string, string[]>).map(([roleCollectionName, roles]) => ({
            name: roleCollectionName,
            icon: "sap-icon://manager",  
            children: (roles || []).map((role: string) => ({ 
                name: role,
                icon: "sap-icon://role"  
            }))
        }))
    }));
    
    this.getView()?.setModel(new JSONModel({ tree: treeformat }), "TreeModel");
}



    public setUserDetails(userdata: any) {
        let oModel = this.getView()?.getModel("userModel") as JSONModel;
        if (!oModel) {
            oModel = new JSONModel();
            this.getView()?.setModel(oModel, "userModel");
        }
        oModel.setData(userdata);
    }



    public async getUserCollectionsViaGroup(user: any) {
        console.log(user)
        const userGroups = user.groups.map((group: any) => group.display);
        const roleCollectionsData = await this.getRoleCollections();
        const roleCollections = roleCollectionsData?.value || [];
        const groupRoleCollections: Record<string, string[]> = {};

        userGroups.forEach((group: any) => {
            groupRoleCollections[group] = [];
        });

        roleCollections.forEach((roleCollection: any) => {
            if (!roleCollection.groupReferences && !roleCollection.samlAttributeAssignment) {
                return;
            }
            const roleGroups = [
                ...(roleCollection.groupReferences || []).map((grp: any) => grp.attributeValue),
                ...(roleCollection.samlAttributeAssignment || []).map((saml: any) => saml.attributeValue)
            ];
            userGroups.forEach((group: any) => {
                if (roleGroups.includes(group)) {
                    groupRoleCollections[group].push(roleCollection.name);
                }
            });
        });
        return groupRoleCollections
    }



    



    public async getIASUser(userid: string) {
        try {
            // const model = this.getOwnerComponent()?.getModel() as ODataModel;
            // const bookBinding = model.getKeepAliveContext(`/getIASUser(id='${userid}')`);
            // console.log( await bookBinding.requestObject());
                
            const response = await fetch(`/odata/v4/catalog/getIASUser(id='${userid}')`);
            console.log(response);
            
    
            const data = await response.json();
            console.log("Users:", data);
            return data;
    
        } catch (error) {
            console.error("Error :", error);
        }
    }

    // public async getUsers() {
    //     try {
    //         const response = await fetch("/odata/v4/catalog/getIASUsers");
    //         if (!response.ok) {
    //             throw new Error(`Error: ${response.status}`);
    //         }
    //         const data = await response.json();
    //         console.log("Fetched Users:", data);
    //     } catch (error) {
    //         console.error("Error:", error);
    //     }
    // } 

    public async getRoleCollections(){
        try {
            const response = await fetch("/odata/v4/catalog/getRoleCollections");
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error:", error);
        }
    }

    public async getRolecollectionRoles(roleCollection: string){
        try {
            const response = await fetch(`/odata/v4/catalog/getRoleCollectionRoles(roleCollectionName='${roleCollection}')`);
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error:", error);
        }
    }

    onSearch(event: sap.ui.base.Event): void {
        
        const searchword: string = event.getParameter("newValue")?.toLowerCase() || "";
        const tree = this.byId("RoleTree") as sap.m.Tree;
        tree.expandToLevel(999); 

        const items = tree.getItems();
        if (!tree) return;
        if (!searchword) {
            items.forEach((item: any) => item.setHighlight("None"));
            return;
        }

        items.forEach((item: any) => {
            const context = item.getBindingContext("TreeModel");
            if (context) {
                const index = tree.indexOfItem(item);
                const name: string = context.getProperty("name").toLowerCase();
                if (name.includes(searchword)) {
                    console.log(name + searchword)
                    item.setHighlight("Success")  
                }else{

                    item.setHighlight("None");
                    //tree.collapse(index);
                }
            }
        });
    }

    


}