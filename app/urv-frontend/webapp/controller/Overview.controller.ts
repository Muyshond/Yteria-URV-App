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
        const userpanel = this.getView()?.byId("byUserId") as sap.m.panel;
        const grouppanel = this.getView()?.byId("bygroup") as sap.m.panel;
        const grouptable = this.getView()?.byId("grouptable") as sap.m.panel;

        const userInput = this.getView()?.byId("UserID") as sap.m.Input;
        const userID = userInput.getValue();
        if(userID === ""){
            MessageToast.show("Please enter a valid ID");
            return;
        }
        const selectinput = this.getView()?.byId("select") as sap.m.select;
        const selectedvalue = selectinput.getSelectedItem();
        //ZOEK OP GROUP
        if(selectedvalue.mProperties.key === "group"){
            const groups = await this.getGroupByWord(userID);
            console.log(groups.value.length)
            if(groups.value.length === 0){
                MessageToast.show("There are no groups that include " + userID);
                grouppanel.setVisible(false);
                grouptable.setVisible(false);
                userpanel.setVisible(false);
                return;
            } else if(groups.value.length > 1 ){
                grouptable.setVisible(true);
                const oJSONModel = new JSONModel({ value: groups.value });
                this.getView().setModel(oJSONModel, "tablegroups");


            } else if(groups.value.length === 1){
                this.setGroup(userID);
                grouptable.setVisible(false);
                return;
            }

        //ZOEK OP USER
        } else if(selectedvalue.mProperties.key === "user"){
            grouptable.setVisible(false);

            const user: any = await this.getIASUser(userID);
            if(user.length === 0){
                MessageToast.show("User with id " + userID + " not found.");
                grouppanel.setVisible(false);
                userpanel.setVisible(false);
                return;
            }
            const userdata = user[0]
            this.setUserDetails(userdata);
            const grouprolerelationship = await this.getUserCollectionsViaGroup(userdata)
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
            this.setDataToTree(result);
            grouppanel.setVisible(false);
            userpanel.setVisible(true);
        } 



    }
    }


    public async setGroup(userID: any){
        const group = await this.getGroup(userID);
        console.log(group)
                const userpanel = this.getView()?.byId("byUserId") as sap.m.panel;
        const grouppanel = this.getView()?.byId("bygroup") as sap.m.panel;

        this.setGroupDetails(group.value[0]);
        const members = group.value[0].members;
        if(members !== undefined){
            const oJSONModel = new JSONModel({ members });
            this.getView()?.setModel(oJSONModel, "groupMembersModel");
            
        }
        const result: any = {}
        const rolecolltions = await this.getGroupRoles(group.value[0].displayName);
        for (const roleCollection of rolecolltions) {
            const response = await this.getRolecollectionRoles(roleCollection); 
            const roleCollectionData = response?.value?.[0]; 
            const roles = roleCollectionData?.roleReferences?.map((role: any) => role.name) || [];

            result[roleCollection] = roles;
        }   



        this.setDataToTree2(result);
        grouppanel.setVisible(true);
        userpanel.setVisible(false);
        return;
    }

    public async getGroupRoles(groupName: string){
        const roleCollectionsData = await this.getRoleCollections();
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


    public async getGroup(id: string){
        try {

            const oModel = this.getView()?.getModel() as sap.ui.model.odata.v4.ODataModel;
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

    public async getGroupByWord(id: string){
        try {

            const oModel = this.getView()?.getModel() as sap.ui.model.odata.v4.ODataModel;
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

    public setDataToTree2(data: Record<string, string[]>) {
        const treeformat = Object.entries(data).map(([roleCollectionName, roles]) => ({
            name: roleCollectionName,
            icon: "sap-icon://manager",
            children: roles.map((role: string) => ({
                name: role,
                icon: "sap-icon://role"
            }))
        }));

        this.getView()?.setModel(new JSONModel({ tree: treeformat }), "TreeModel2");
    }



    public setUserDetails(userdata: any) {
        let oModel = this.getView()?.getModel("userModel") as JSONModel;
        if (!oModel) {
            oModel = new JSONModel();
            this.getView()?.setModel(oModel, "userModel");
        }
        oModel.setData(userdata);
    }

    public setGroupDetails(groupdata: any) {
        let oModel = this.getView()?.getModel("groupModel") as JSONModel;
        if (!oModel) {
            oModel = new JSONModel();
            this.getView()?.setModel(oModel, "groupModel");
        }
        oModel.setData(groupdata);
    }


    public async getUserCollectionsViaGroup(user: any) {
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
            const oModel = this.getView()?.getModel() as sap.ui.model.odata.v4.ODataModel;
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



    public async getRoleCollections(){
        try {

            
            const oModel = this.getView()?.getModel() as sap.ui.model.odata.v4.ODataModel;
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

    public async getRolecollectionRoles(roleCollection: string){
        try {
            const oModel = this.getView()?.getModel() as sap.ui.model.odata.v4.ODataModel;
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

    onSearch2(event: sap.ui.base.Event): void {
        const searchword: string = event.getParameter("newValue")?.toLowerCase() || "";
        const tree = this.byId("RoleTree2") as sap.m.Tree;
        tree.expandToLevel(999); 
        const items = tree.getItems();
        if (!tree) return;
        if (!searchword) {
            items.forEach((item: any) => item.setHighlight("None"));
            return;
        }
        items.forEach((item: any) => {
            const context = item.getBindingContext("TreeModel2");
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


    onGroupPress(event: sap.ui.base.Event): void {
        const oSelectedItem = event.getParameter("listItem") as ColumnListItem; 
        const oContext = oSelectedItem.getBindingContext("tablegroups"); 
        

        const oGroupData = oContext.getObject() as { displayName: string }; 
        const groupName = oGroupData.displayName; 

        this.setGroup(groupName);

        
    }



}