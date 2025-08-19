import MessageToast from "sap/m/MessageToast";
import Controller from "sap/ui/core/mvc/Controller";
import { form } from "sap/ui/layout/library";
import JSONModel from "sap/ui/model/json/JSONModel";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import containsOrEquals from "sap/ui/dom/containsOrEquals";
import { foreach } from "@sap/cds";
import Spreadsheet from "sap/ui/export/Spreadsheet";
import testService from "../service/testService"; 
import dataService from "../service/dataService"; 
import exportService from "../service/exportService"; 


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
            const groups = await dataService.getGroupByWord(userID, this.getView());
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
                
            const users = await dataService.getUserByWord(userID, this.getView());
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
        
        const user: any = await dataService.getIASUser(userID, this.getView());
            console.log(user)
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
                    const response = await dataService.getRolecollectionRoles(roleCollection, this.getView()); 
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

        const group = await dataService.getGroup(userID, this.getView())
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
        const rolecolltions = await dataService.getGroupRoles(group.value[0].displayName, this.getView());
        for (const roleCollection of rolecolltions) {
            const response = await dataService.getRolecollectionRoles(roleCollection, this.getView()); 
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
        const roleCollectionsData = await dataService.getRoleCollections(this.getView());
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
        exportService.onExportUser(oView);
        
    }

    public onExportGroup(): void {
        const oView = this.getView();
        exportService.onExportGroup(oView);
        
    }
    

}