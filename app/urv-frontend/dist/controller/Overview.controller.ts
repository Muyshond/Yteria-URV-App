import MessageToast from "sap/m/MessageToast";
import Controller from "sap/ui/core/mvc/Controller";
import { form } from "sap/ui/layout/library";
import JSONModel from "sap/ui/model/json/JSONModel";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import containsOrEquals from "sap/ui/dom/containsOrEquals";
import { foreach } from "@sap/cds";
import Spreadsheet from "sap/ui/export/Spreadsheet";

/**
 * @namespace urvfrontend.controller
 */
export default class Overview extends Controller {

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {
        document.addEventListener("keydown", this.onKeyDown.bind(this));

    }

    private onKeyDown(event: KeyboardEvent): void {
        if (event.key === "Enter") {
            console.log("Pressed Enter");
            this.getUser();
        }
    }
    
    

    

    


    public async getUser() {
    


        const userpanel = this.getView()?.byId("byUserId") as sap.m.panel;
        const grouppanel = this.getView()?.byId("bygroup") as sap.m.panel;
        const grouptable = this.getView()?.byId("grouptable") as sap.m.panel;
        const usertable = this.getView()?.byId("usertable") as sap.m.panel;

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
            usertable.setVisible(false);
            userpanel.setVisible(false)
            const groups = await this.getGroupByWord(userID);
            console.log(groups.value.length)
            if(groups.value.length === 0){
                MessageToast.show("There are no groups that include " + userID);
                grouppanel.setVisible(false);
                grouptable.setVisible(false);
                userpanel.setVisible(false);
                usertable.setVisible(false);
                return;

                //Kan meerdere in lijst zitten maar niet getoond worden omdat er altijd 2 inzitten => Group en Group 2.
                //Group matches exact maar toch 2 in lijst.
            } else if(groups.value.length > 1 ){
                let exactMatch = false;
    
                groups.value.forEach((group: { displayName: string }) => {
                    if (group.displayName === userID) {
                        exactMatch = true;
                    }
                });

                if(exactMatch){
                    this.setGroup(userID);
                    grouptable.setVisible(false);
                    
                    return;

                }else{
                    grouppanel.setVisible(false);
                    grouptable.setVisible(true);
                    const oJSONModel = new JSONModel({ value: groups.value });
                    this.getView().setModel(oJSONModel, "tablegroups"); 
                }
            
               


                //IN ORDE 
            } else if(groups.value.length === 1){
                console.log(groups.value[0])
                if(groups.value[0] === "Group not found"){
                    return;
                }
                else if(groups.value[0].displayName === userID){
                    this.setGroup(userID);
                    grouptable.setVisible(false);
                    return;
                } else{
                    grouppanel.setVisible(false);
                    grouptable.setVisible(true);
                    const oJSONModel = new JSONModel({ value: groups.value });
                    this.getView().setModel(oJSONModel, "tablegroups");
                }
            }
                
        
        

        //ZOEK OP USER
        } else if(selectedvalue.mProperties.key === "user"){
            grouptable.setVisible(false);
            grouppanel.setVisible(false);
                
            const users = await this.getUserByWord(userID);
            console.log(users)
            if(users.value.length === 0){
                MessageToast.show("There are no Users that include " + userID);
                grouppanel.setVisible(false);
                grouptable.setVisible(false);
                userpanel.setVisible(false);
                usertable.setVisible(false);
                return;
            } else if(users.value.length > 1){
                let exactMatch = false;
    
                users.value.forEach((user: { id: string }) => {
                    if (user.id === userID) {
                        exactMatch = true;
                    }
                });

                if(exactMatch){
                    this.setUser(userID);
                    usertable.setVisible(false);
                    return;
                }else{
                    userpanel.setVisible(false);
                    usertable.setVisible(true);
                    const oJSONModel = new JSONModel({ value: users.value });
                    this.getView().setModel(oJSONModel, "tableusers"); 
                }

            } else if (users.value.length === 1){
                console.log(users.value[0])
                if(users.value[0] === "User not found"){
                    MessageToast.show("user not found")
                    return;
                }
                else if(users.value[0].id === userID){
                    this.setUser(userID);
                    usertable.setVisible(false);
                    return;
                } else{
                    userpanel.setVisible(false);
                    usertable.setVisible(true);
                    const oJSONModel = new JSONModel({ value: users.value });
                    this.getView().setModel(oJSONModel, "tableusers");
                }
                
            }
            
        } 
    }
    

    public async setUser(userID: any){
        const userpanel = this.getView()?.byId("byUserId") as sap.m.panel;
        const grouppanel = this.getView()?.byId("bygroup") as sap.m.panel;

        const user: any = await this.getIASUser(userID);
            
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
            const oJSONModel = new JSONModel({ value: result });
            this.getView().setModel(oJSONModel, "groupdetails");

            this.setDataToTree(result);
            grouppanel.setVisible(false);
            userpanel.setVisible(true);
        }   

        
        
       
        this.setDataToTree2(result);
        grouppanel.setVisible(true);
        userpanel.setVisible(false);
        return;
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
        
        const oJSONModel = new JSONModel({ value: result });
        this.getView().setModel(oJSONModel, "rolecollectiondetails");   



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

    public async getUserByWord(id: string){
        try {

            const oModel = this.getView()?.getModel() as sap.ui.model.odata.v4.ODataModel;
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
        console.log(userdata)
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
    onUserPress(event: sap.ui.base.Event): void {
        const oSelectedItem = event.getParameter("listItem") as ColumnListItem; 
        const oContext = oSelectedItem.getBindingContext("tableusers"); 
        

        const oUserData = oContext.getObject() as { id: string }; 
        const userID = oUserData.id; 
        console.log(userID)
        this.setUser(userID);

        
    }

    public onExportUser(): void {
        const oView = this.getView();
        
        const oUserModel = oView.getModel("userModel") as JSONModel;
        const oUserData = oUserModel?.getData() || {};
        console.log(oUserData)
        const oGroupModel = oView.getModel("groupdetails") as JSONModel;
        const oGroupData = oGroupModel?.getData() || {};
    
        const aCombinedData: any[] = [];
    
        const userData = {
            "User ID": oUserData.id || "",
            "User Name": oUserData.userName || "",
            "Full Name": `${oUserData.name?.givenName || ""} ${oUserData.name?.familyName || ""}`,
            "Email": oUserData.emails?.[0]?.value || "",
            "User Type": oUserData.userType || "",
            "User UUID": oUserData.userUuid || "",
            "Login Time": oUserData.loginTime || "",
            "Password Status": oUserData.passwordStatus || "",
            "Mail Verified": oUserData.mailVerified || "",
            "Source System": oUserData.sourceSystem || "",
        };
    
        Object.entries(oGroupData.value || {}).forEach(([groupName, roleCollections]) => {
            if (typeof roleCollections === "object" && roleCollections !== null && Object.keys(roleCollections).length > 0) {
                Object.entries(roleCollections).forEach(([roleCollectionName, roles]) => {
                    const aRoles = Array.isArray(roles) ? roles : [roles];
                    aRoles.forEach((role) => {
                        aCombinedData.push({
                            "Group": groupName,
                            "Role Collection": roleCollectionName,
                            "Role": role
                        });
                    });
                });
            }
        });
        aCombinedData[0] = { ...aCombinedData[0], ...userData };        
        console.log(aCombinedData[0]); 
    
        const aCombinedColumns = [
            { label: "User ID", property: "User ID" },
            { label: "User Name", property: "User Name" },
            { label: "Full Name", property: "Full Name" },
            { label: "Email", property: "Email" },
            { label: "User Type", property: "User Type" },
            { label: "User UUID", property: "User UUID" },
            { label: "Login Time", property: "Login Time" },
            { label: "Password Status", property: "Password Status" },
            { label: "Mail Verified", property: "Mail Verified" },
            { label: "Source System", property: "Source System" },
            { label: "Group", property: "Group" },
            { label: "Role Collection", property: "Role Collection" },
            { label: "Role", property: "Role" }
        ];
    
        const oSettings = {
            workbook: {
                columns: aCombinedColumns  
            },
            dataSource: Array.isArray(aCombinedData) && aCombinedData.length > 0 ? aCombinedData : [],  
            fileName: `export.xlsx`  
        };
    
        try {
            const oSpreadsheet = new Spreadsheet(oSettings); 
            oSpreadsheet.build()  
                .finally(() => oSpreadsheet.destroy());  
        } catch (error) {
            console.error("Export failed:", error);  
        }
    }



    public onExportGroup(): void {
        const oView = this.getView();
        const oUserModel = oView.getModel("groupModel") as JSONModel;
        const oGroupData = oUserModel?.getData() || {};
        const oMembersModel = oView.getModel("groupMembersModel") as JSONModel;
        const oMembersData = oMembersModel?.getData() || {};
        const oRolecollectionModel = oView.getModel("rolecollectiondetails") as JSONModel;
        const oRolecollectionData = oRolecollectionModel?.getData() || {};
    
        const roleCollections = oRolecollectionData.value || [];
        const groupMembers = oGroupData.members || [];
    
        let aExcelData: any[] = [];
        const maxLength = Math.max(groupMembers.length, Object.keys(roleCollections).length);
    
        for (let i = 0; i < maxLength; i++) {
            aExcelData.push({
                id: i === 0 ? oGroupData.id || "" : "", // Only show Group ID in the first row
                GroupName: i === 0 ? oGroupData.displayName || "" : "", // Only show Group Name in the first row
                UserID: groupMembers[i]?.value || "", 
                "Display Name": groupMembers[i]?.display || "", 
                "Role Collection": Object.keys(roleCollections)[i] || "", 
                Role: roleCollections[Object.keys(roleCollections)[i]]?.join(", ") || "" // Join roles in case of multiple
            });
        }
    
        const aColumns = [
            { label: "Group ID", property: "id" },
            { label: "Group Name", property: "GroupName" },
            { label: "UserID", property: "UserID" },
            { label: "Display Name", property: "Display Name" },
            { label: "Role Collection", property: "Role Collection" },
            { label: "Role", property: "Role" }
        ];
    
        const oSettings = {
            workbook: {
                columns: aColumns
            },
            dataSource: aExcelData,
            fileName: `Groups_Export.xlsx`
        };
    
        try {
            const oSpreadsheet = new Spreadsheet(oSettings);
            oSpreadsheet.build().finally(() => oSpreadsheet.destroy());
        } catch (error) {
            console.error("Export failed:", error);
        }
    }
    
    

   



}