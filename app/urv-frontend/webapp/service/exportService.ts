// /model/MyService.ts
import { ODataModel } from "sap/ui/model/odata/v2/ODataModel";
import Spreadsheet from "sap/ui/export/Spreadsheet";

export default class exportService {
    
    

    static onExportUser(oView: any): void {
        
        const oUserModel = oView.getModel("userModel") as JSONModel;
        const oUserData = oUserModel?.getData() || {};
        
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


    
    static onExportGroup(oView: any): void {
        
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