import MessageToast from "sap/m/MessageToast";
import Controller from "sap/ui/core/mvc/Controller";
import { form } from "sap/ui/layout/library";
import JSONModel from "sap/ui/model/json/JSONModel";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import containsOrEquals from "sap/ui/dom/containsOrEquals";
import Spreadsheet from "sap/ui/export/Spreadsheet";
import dataService from "../service/dataService"; 
import exportService from "../service/exportService"; 


/**
 * @namespace urvfrontend.controller
 */
export default class Overview extends Controller {

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {
        document.addEventListener("keydown", this.onKeyDown.bind(this));
        const view = this.getView();
        const initialModels: Record<string, any> = {
            tablegroups: {  },
            tableusers: {  },
            groupdetails: {  },
            rolecollectiondetails: { },
            TreeModel: { },
            TreeModel2: { },
            userModel: {},
            groupModel: {},
            groupMembersModel: {  }
        };

        Object.entries(initialModels).forEach(([name, data]) => {
            const oJSONModel = new JSONModel(data);
            view?.setModel(oJSONModel, name);
        });
    }

        //Search for data when enter is pressed.
    private onKeyDown(event: KeyboardEvent): void {
        if (event.key === "Enter") {
            this.getData();
        }
    }
    
    
    public getData() {
        const userInput = this.getUserInput();
        if (userInput.trim() === "") { MessageToast.show("Please enter a valid ID"); return } 


        const searchMode = this.getSearchmode();
        if (searchMode === "group") {
            this.HandleGroupSearch(userInput);
        } else if (searchMode === "user") {
            this.HandleUserSearch(userInput);
        }
    }


    public getUserInput(){
        const userInput = this.getView()?.byId("UserID") as sap.m.Input;
        return userInput.getValue();
    }

    public getSearchmode() {
        const selectinput = this.getView()?.byId("select") as sap.m.select;
        return selectinput.getSelectedItem().mProperties.key;
    }


    public async HandleGroupSearch(groupID: string) {
        try{        
            const groups = await dataService.getGroupByWord(groupID, this.getView());
            if (groups === undefined) {
                return MessageToast.show(`There went something wrong while trying to fetch the groups`);
            } else if (groups.value.length === 0) {
                this.clearJsonModel("tablegroups");
                return MessageToast.show(`No groups found for "${groupID}"`);
            }else if (groups.value.length === 1){
                if(groups.value[0] === "Group not found"){
                    return MessageToast.show(`No groups found for "${groupID}"`);
                //exact match => set group directly
                } else if(groups.value[0].displayName === groupID){
                    this.setGroup(groupID);
                    return;
                //Set groups in table so user can choose
                } else{
                    const oJSONModel = new JSONModel({ value: groups.value });
                    this.getView()?.setModel(oJSONModel, "tablegroups"); 
                    return;
                }
            } else if (groups.value.length > 1){
                groups.value.forEach((group: { displayName: string }) => {
                    if (group.displayName === groupID) {
                        this.setGroup(groupID);
                        return;
                    }
                });
                const oJSONModel = new JSONModel({ value: groups.value });
                this.getView()?.setModel(oJSONModel, "tablegroups"); 
                return;
            }
        } catch (error) {
            MessageToast.show(`Error fetching groups: ${error}`);
        }   
    }

    public async HandleUserSearch(userID: string){
        try{
            const users = await dataService.getUserByWord(userID, this.getView());
            if (users === undefined) {
                return MessageToast.show(`There went something wrong while trying to fetch the users`);
            } else if (users.value.length === 0) {
                this.clearJsonModel("tableusers");
                return MessageToast.show(`No users found for "${userID}"`);
            } else if (users.value.length === 1){
                if(users.value[0] === "User not found"){
                    MessageToast.show("user not found")
                    return;
                } else if(users.value[0].id === userID){
                    this.setUser(userID)
                    return;
                } else{
                    const oJSONModel = new JSONModel({ value: users.value });
                    this.getView()?.setModel(oJSONModel, "tableusers");
                }
            }else if(users.value.length > 1){
                users.value.forEach((user: { id: string }) => {
                    if (user.id === userID) {

                        return;
                    }
                });
                const oJSONModel = new JSONModel({ value: users.value });
                this.getView()?.setModel(oJSONModel, "tableusers"); 
            }
        } catch (error) {
        MessageToast.show(`Error fetching groups: ${error}`);
        } 
    }
    
    public clearJsonModel(modelName: string): void{
        const oJSONModel = new JSONModel({ value: null });
        this.getView()?.setModel(oJSONModel, modelName);
    }


    public clearAllJsonModels(): void {
        const view = this.getView();
        const modelNames = [
        "tablegroups",
        "tableusers",
        "groupdetails",
        "rolecollectiondetails",
        "TreeModel",
        "TreeModel2",
        "userModel",
        "groupModel",
        "groupMembersModel"
        ];
        modelNames.forEach((name) => {
            const model = view?.getModel(name) as JSONModel;
            if (model) {
                model.setData({});
            }
        });
    }

    public onHandleSearchmodeChange(): void {
        MessageToast.show("Search mode changed");
        this.clearAllJsonModels();
        const searchmode = this.getSearchmode();

        if(searchmode === "group"){

        } else if (searchmode === "user"){

        } else {
            MessageToast.show("This searchmode is not supported");
        }
    }


    public async setUser(userID: any){
       
        
        const user: any = await dataService.getIASUser(userID, this.getView());
        const userdata = user[0]
        this.setUserDetails(userdata);

        const grouprolerelationship = await this.getUserCollectionsViaGroup(userdata);
        console.log(grouprolerelationship)
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
        this.getView()?.setModel(oJSONModel, "groupdetails");        
        }   

        this.setRoleCollectionDataToTree(result);
        return;
    }

    public async setGroup(userID: any){

        const group = await dataService.getGroup(userID, this.getView())
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
        this.getView()?.setModel(oJSONModel, "rolecollectiondetails");   



        this.setGroupDataToTree(result);
        return;
    }


    public setRoleCollectionDataToTree(data: any) {
        console.log(data)
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
        console.log(treeformat)
        this.getView()?.setModel(new JSONModel({ tree: treeformat }), "TreeModel");
    }

    public setGroupDataToTree(data: Record<string, string[]>) {
        try{
            console.log("test")
            console.log(data)
            const treeformat = Object.entries(data).map(([roleCollectionName, roles]) => ({
                    name: roleCollectionName,
                    icon: "sap-icon://manager",
                    children: roles.map((role: string) => ({
                        name: role,
                        icon: "sap-icon://role"
                    }))
                }));
            this.getView()?.setModel(new JSONModel({ tree: treeformat }), "TreeModel");
        }catch(error ) {
            console.log(error)
        }
        
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
        console.log(roleCollections)
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