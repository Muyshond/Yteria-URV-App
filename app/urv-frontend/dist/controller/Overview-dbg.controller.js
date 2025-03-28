"use strict";

sap.ui.define(["sap/m/MessageToast", "sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel", "sap/ui/export/Spreadsheet"], function (MessageToast, Controller, JSONModel, Spreadsheet) {
  "use strict";

  /**
   * @namespace urvfrontend.controller
   */
  const Overview = Controller.extend("urvfrontend.controller.Overview", {
    /*eslint-disable @typescript-eslint/no-empty-function*/onInit: function _onInit() {
      document.addEventListener("keydown", this.onKeyDown.bind(this));
    },
    onKeyDown: function _onKeyDown(event) {
      if (event.key === "Enter") {
        console.log("Pressed Enter");
        this.getUser();
      }
    },
    getUser: async function _getUser() {
      const userpanel = this.getView()?.byId("byUserId");
      const grouppanel = this.getView()?.byId("bygroup");
      const grouptable = this.getView()?.byId("grouptable");
      const usertable = this.getView()?.byId("usertable");
      const userInput = this.getView()?.byId("UserID");
      const userID = userInput.getValue();
      if (userID === "") {
        MessageToast.show("Please enter a valid ID");
        return;
      }
      const selectinput = this.getView()?.byId("select");
      const selectedvalue = selectinput.getSelectedItem();
      //ZOEK OP GROUP
      if (selectedvalue.mProperties.key === "group") {
        usertable.setVisible(false);
        userpanel.setVisible(false);
        const groups = await this.getGroupByWord(userID);
        console.log(groups.value.length);
        if (groups.value.length === 0) {
          MessageToast.show("There are no groups that include " + userID);
          grouppanel.setVisible(false);
          grouptable.setVisible(false);
          userpanel.setVisible(false);
          usertable.setVisible(false);
          return;

          //Kan meerdere in lijst zitten maar niet getoond worden omdat er altijd 2 inzitten => Group en Group 2.
          //Group matches exact maar toch 2 in lijst.
        } else if (groups.value.length > 1) {
          let exactMatch = false;
          groups.value.forEach(group => {
            if (group.displayName === userID) {
              exactMatch = true;
            }
          });
          if (exactMatch) {
            this.setGroup(userID);
            grouptable.setVisible(false);
            return;
          } else {
            grouppanel.setVisible(false);
            grouptable.setVisible(true);
            const oJSONModel = new JSONModel({
              value: groups.value
            });
            this.getView().setModel(oJSONModel, "tablegroups");
          }

          //IN ORDE 
        } else if (groups.value.length === 1) {
          console.log(groups.value[0]);
          if (groups.value[0] === "Group not found") {
            return;
          } else if (groups.value[0].displayName === userID) {
            this.setGroup(userID);
            grouptable.setVisible(false);
            return;
          } else {
            grouppanel.setVisible(false);
            grouptable.setVisible(true);
            const oJSONModel = new JSONModel({
              value: groups.value
            });
            this.getView().setModel(oJSONModel, "tablegroups");
          }
        }

        //ZOEK OP USER
      } else if (selectedvalue.mProperties.key === "user") {
        grouptable.setVisible(false);
        grouppanel.setVisible(false);
        const users = await this.getUserByWord(userID);
        console.log(users);
        if (users.value.length === 0) {
          MessageToast.show("There are no Users that include " + userID);
          grouppanel.setVisible(false);
          grouptable.setVisible(false);
          userpanel.setVisible(false);
          usertable.setVisible(false);
          return;
        } else if (users.value.length > 1) {
          let exactMatch = false;
          users.value.forEach(user => {
            if (user.id === userID) {
              exactMatch = true;
            }
          });
          if (exactMatch) {
            this.setUser(userID);
            usertable.setVisible(false);
            return;
          } else {
            userpanel.setVisible(false);
            usertable.setVisible(true);
            const oJSONModel = new JSONModel({
              value: users.value
            });
            this.getView().setModel(oJSONModel, "tableusers");
          }
        } else if (users.value.length === 1) {
          console.log(users.value[0]);
          if (users.value[0] === "User not found") {
            MessageToast.show("user not found");
            return;
          } else if (users.value[0].id === userID) {
            this.setUser(userID);
            usertable.setVisible(false);
            return;
          } else {
            userpanel.setVisible(false);
            usertable.setVisible(true);
            const oJSONModel = new JSONModel({
              value: users.value
            });
            this.getView().setModel(oJSONModel, "tableusers");
          }
        }
      }
    },
    setUser: async function _setUser(userID) {
      const userpanel = this.getView()?.byId("byUserId");
      const grouppanel = this.getView()?.byId("bygroup");
      const user = await this.getIASUser(userID);
      const userdata = user[0];
      this.setUserDetails(userdata);
      const grouprolerelationship = await this.getUserCollectionsViaGroup(userdata);
      const formattedData = Object.entries(grouprolerelationship).map(_ref => {
        let [group, value] = _ref;
        return {
          group,
          roleCollections: value
        };
      });
      const result = {};
      for (const {
        group,
        roleCollections
      } of formattedData) {
        result[group] = {};
        for (const roleCollection of roleCollections) {
          const response = await this.getRolecollectionRoles(roleCollection);
          const roleCollectionData = response?.value?.[0];
          const roles = roleCollectionData?.roleReferences?.map(role => role.name) || [];
          result[group][roleCollection] = roles;
        }
        const oJSONModel = new JSONModel({
          value: result
        });
        this.getView().setModel(oJSONModel, "groupdetails");
        this.setDataToTree(result);
        grouppanel.setVisible(false);
        userpanel.setVisible(true);
      }
      this.setDataToTree2(result);
      grouppanel.setVisible(true);
      userpanel.setVisible(false);
      return;
    },
    setGroup: async function _setGroup(userID) {
      const group = await this.getGroup(userID);
      console.log(group);
      const userpanel = this.getView()?.byId("byUserId");
      const grouppanel = this.getView()?.byId("bygroup");
      this.setGroupDetails(group.value[0]);
      const members = group.value[0].members;
      if (members !== undefined) {
        const oJSONModel = new JSONModel({
          members
        });
        this.getView()?.setModel(oJSONModel, "groupMembersModel");
      }
      const result = {};
      const rolecolltions = await this.getGroupRoles(group.value[0].displayName);
      for (const roleCollection of rolecolltions) {
        const response = await this.getRolecollectionRoles(roleCollection);
        const roleCollectionData = response?.value?.[0];
        const roles = roleCollectionData?.roleReferences?.map(role => role.name) || [];
        result[roleCollection] = roles;
      }
      const oJSONModel = new JSONModel({
        value: result
      });
      this.getView().setModel(oJSONModel, "rolecollectiondetails");
      this.setDataToTree2(result);
      grouppanel.setVisible(true);
      userpanel.setVisible(false);
      return;
    },
    getGroupRoles: async function _getGroupRoles(groupName) {
      const roleCollectionsData = await this.getRoleCollections();
      const roleCollections = roleCollectionsData?.value || [];
      const matchedRoles = [];
      roleCollections.forEach(roleCollection => {
        if (!roleCollection.groupReferences && !roleCollection.samlAttributeAssignment) {
          return;
        }
        const roleGroups = [...(roleCollection.groupReferences || []).map(grp => grp.attributeValue), ...(roleCollection.samlAttributeAssignment || []).map(saml => saml.attributeValue)];
        if (roleGroups.includes(groupName)) {
          matchedRoles.push(roleCollection.name);
        }
      });
      return matchedRoles;
    },
    getGroup: async function _getGroup(id) {
      try {
        const oModel = this.getView()?.getModel();
        const oBinding = oModel.bindContext(`/getGroupByName(...)`, undefined, {});
        oBinding.setParameter("GroupName", id);
        const data = await oBinding.execute().then(() => {
          const oContext = oBinding.getBoundContext();
          if (!oContext) {
            return;
          }
          const group = oContext.getObject();
          return group;
        }).catch(oError => {
          console.error("Error fetching Group:", oError);
        });
        return data;
      } catch (error) {
        console.error("Error:", error);
      }
    },
    getGroupByWord: async function _getGroupByWord(id) {
      try {
        const oModel = this.getView()?.getModel();
        const oBinding = oModel.bindContext(`/getGroupByWord(...)`, undefined, {});
        oBinding.setParameter("GroupName", id);
        const data = await oBinding.execute().then(() => {
          const oContext = oBinding.getBoundContext();
          if (!oContext) {
            return;
          }
          const group = oContext.getObject();
          return group;
        }).catch(oError => {
          console.error("Error fetching Group:", oError);
        });
        return data;
      } catch (error) {
        console.error("Error catching groups:", error);
      }
    },
    getUserByWord: async function _getUserByWord(id) {
      try {
        const oModel = this.getView()?.getModel();
        const oBinding = oModel.bindContext(`/getUserByWord(...)`, undefined, {});
        oBinding.setParameter("id", id);
        const data = await oBinding.execute().then(() => {
          const oContext = oBinding.getBoundContext();
          if (!oContext) {
            return;
          }
          const group = oContext.getObject();
          return group;
        }).catch(oError => {
          console.error("Error fetching Group:", oError);
        });
        return data;
      } catch (error) {
        console.error("Error catching groups:", error);
      }
    },
    setDataToTree: function _setDataToTree(data) {
      const treeformat = Object.entries(data).map(_ref2 => {
        let [groupName, roleCollections] = _ref2;
        return {
          name: groupName,
          icon: "sap-icon://group",
          children: Object.entries(roleCollections).map(_ref3 => {
            let [roleCollectionName, roles] = _ref3;
            return {
              name: roleCollectionName,
              icon: "sap-icon://manager",
              children: (roles || []).map(role => ({
                name: role,
                icon: "sap-icon://role"
              }))
            };
          })
        };
      });
      this.getView()?.setModel(new JSONModel({
        tree: treeformat
      }), "TreeModel");
    },
    setDataToTree2: function _setDataToTree2(data) {
      const treeformat = Object.entries(data).map(_ref4 => {
        let [roleCollectionName, roles] = _ref4;
        return {
          name: roleCollectionName,
          icon: "sap-icon://manager",
          children: roles.map(role => ({
            name: role,
            icon: "sap-icon://role"
          }))
        };
      });
      this.getView()?.setModel(new JSONModel({
        tree: treeformat
      }), "TreeModel2");
    },
    setUserDetails: function _setUserDetails(userdata) {
      let oModel = this.getView()?.getModel("userModel");
      if (!oModel) {
        oModel = new JSONModel();
        this.getView()?.setModel(oModel, "userModel");
      }
      oModel.setData(userdata);
      console.log(userdata);
    },
    setGroupDetails: function _setGroupDetails(groupdata) {
      let oModel = this.getView()?.getModel("groupModel");
      if (!oModel) {
        oModel = new JSONModel();
        this.getView()?.setModel(oModel, "groupModel");
      }
      oModel.setData(groupdata);
    },
    getUserCollectionsViaGroup: async function _getUserCollectionsViaGroup(user) {
      const userGroups = user.groups.map(group => group.display);
      const roleCollectionsData = await this.getRoleCollections();
      const roleCollections = roleCollectionsData?.value || [];
      const groupRoleCollections = {};
      userGroups.forEach(group => {
        groupRoleCollections[group] = [];
      });
      roleCollections.forEach(roleCollection => {
        if (!roleCollection.groupReferences && !roleCollection.samlAttributeAssignment) {
          return;
        }
        const roleGroups = [...(roleCollection.groupReferences || []).map(grp => grp.attributeValue), ...(roleCollection.samlAttributeAssignment || []).map(saml => saml.attributeValue)];
        userGroups.forEach(group => {
          if (roleGroups.includes(group)) {
            groupRoleCollections[group].push(roleCollection.name);
          }
        });
      });
      return groupRoleCollections;
    },
    getIASUser: async function _getIASUser(userid) {
      try {
        const oModel = this.getView()?.getModel();
        const oBinding = oModel.bindContext(`/getIASUser(...)`, undefined, {});
        oBinding.setParameter("id", userid);
        const data = oBinding.execute().then(() => {
          const oContext = oBinding.getBoundContext();
          if (!oContext) {
            return;
          }
          const user = oContext.getObject();
          return user.value;
        }).catch(oError => {
          console.error("Error fetching IAS User:", oError);
        });
        return data;
      } catch (error) {
        console.error("Error :", error);
      }
    },
    getRoleCollections: async function _getRoleCollections() {
      try {
        const oModel = this.getView()?.getModel();
        const oBinding = oModel.bindContext(`/getRoleCollections(...)`, undefined, {});
        const data = oBinding.execute().then(() => {
          const oContext = oBinding.getBoundContext();
          if (!oContext) {
            return;
          }
          const user = oContext.getObject();
          return user;
        }).catch(oError => {
          console.error("Error fetching role collectons:", oError);
        });
        return data;
      } catch (error) {
        console.error("Error:", error);
      }
    },
    getRolecollectionRoles: async function _getRolecollectionRoles(roleCollection) {
      try {
        const oModel = this.getView()?.getModel();
        const oBinding = oModel.bindContext(`/getRoleCollectionRoles(...)`, undefined, {});
        oBinding.setParameter("roleCollectionName", roleCollection);
        const data = oBinding.execute().then(() => {
          const oContext = oBinding.getBoundContext();
          if (!oContext) {
            return;
          }
          const user = oContext.getObject();
          return user;
        }).catch(oError => {
          console.error("Error fetching role collecton roles:", oError);
        });
        return data;
      } catch (error) {
        console.error("Error:", error);
      }
    },
    onSearch: function _onSearch(event) {
      const searchword = event.getParameter("newValue")?.toLowerCase() || "";
      const tree = this.byId("RoleTree");
      tree.expandToLevel(999);
      const items = tree.getItems();
      if (!tree) return;
      if (!searchword) {
        items.forEach(item => item.setHighlight("None"));
        return;
      }
      items.forEach(item => {
        const context = item.getBindingContext("TreeModel");
        if (context) {
          const index = tree.indexOfItem(item);
          const name = context.getProperty("name").toLowerCase();
          if (name.includes(searchword)) {
            console.log(name + searchword);
            item.setHighlight("Success");
          } else {
            item.setHighlight("None");
            //tree.collapse(index);
          }
        }
      });
    },
    onSearch2: function _onSearch2(event) {
      const searchword = event.getParameter("newValue")?.toLowerCase() || "";
      const tree = this.byId("RoleTree2");
      tree.expandToLevel(999);
      const items = tree.getItems();
      if (!tree) return;
      if (!searchword) {
        items.forEach(item => item.setHighlight("None"));
        return;
      }
      items.forEach(item => {
        const context = item.getBindingContext("TreeModel2");
        if (context) {
          const index = tree.indexOfItem(item);
          const name = context.getProperty("name").toLowerCase();
          if (name.includes(searchword)) {
            console.log(name + searchword);
            item.setHighlight("Success");
          } else {
            item.setHighlight("None");
            //tree.collapse(index);
          }
        }
      });
    },
    onGroupPress: function _onGroupPress(event) {
      const oSelectedItem = event.getParameter("listItem");
      const oContext = oSelectedItem.getBindingContext("tablegroups");
      const oGroupData = oContext.getObject();
      const groupName = oGroupData.displayName;
      this.setGroup(groupName);
    },
    onUserPress: function _onUserPress(event) {
      const oSelectedItem = event.getParameter("listItem");
      const oContext = oSelectedItem.getBindingContext("tableusers");
      const oUserData = oContext.getObject();
      const userID = oUserData.id;
      console.log(userID);
      this.setUser(userID);
    },
    onExportUser: function _onExportUser() {
      const oView = this.getView();
      const oUserModel = oView.getModel("userModel");
      const oUserData = oUserModel?.getData() || {};
      console.log(oUserData);
      const oGroupModel = oView.getModel("groupdetails");
      const oGroupData = oGroupModel?.getData() || {};
      const aCombinedData = [];
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
        "Source System": oUserData.sourceSystem || ""
      };
      Object.entries(oGroupData.value || {}).forEach(_ref5 => {
        let [groupName, roleCollections] = _ref5;
        if (typeof roleCollections === "object" && roleCollections !== null && Object.keys(roleCollections).length > 0) {
          Object.entries(roleCollections).forEach(_ref6 => {
            let [roleCollectionName, roles] = _ref6;
            const aRoles = Array.isArray(roles) ? roles : [roles];
            aRoles.forEach(role => {
              aCombinedData.push({
                "Group": groupName,
                "Role Collection": roleCollectionName,
                "Role": role
              });
            });
          });
        }
      });
      aCombinedData[0] = {
        ...aCombinedData[0],
        ...userData
      };
      console.log(aCombinedData[0]);
      const aCombinedColumns = [{
        label: "User ID",
        property: "User ID"
      }, {
        label: "User Name",
        property: "User Name"
      }, {
        label: "Full Name",
        property: "Full Name"
      }, {
        label: "Email",
        property: "Email"
      }, {
        label: "User Type",
        property: "User Type"
      }, {
        label: "User UUID",
        property: "User UUID"
      }, {
        label: "Login Time",
        property: "Login Time"
      }, {
        label: "Password Status",
        property: "Password Status"
      }, {
        label: "Mail Verified",
        property: "Mail Verified"
      }, {
        label: "Source System",
        property: "Source System"
      }, {
        label: "Group",
        property: "Group"
      }, {
        label: "Role Collection",
        property: "Role Collection"
      }, {
        label: "Role",
        property: "Role"
      }];
      const oSettings = {
        workbook: {
          columns: aCombinedColumns
        },
        dataSource: Array.isArray(aCombinedData) && aCombinedData.length > 0 ? aCombinedData : [],
        fileName: `export.xlsx`
      };
      try {
        const oSpreadsheet = new Spreadsheet(oSettings);
        oSpreadsheet.build().finally(() => oSpreadsheet.destroy());
      } catch (error) {
        console.error("Export failed:", error);
      }
    },
    onExportGroup: function _onExportGroup() {
      const oView = this.getView();
      const oUserModel = oView.getModel("groupModel");
      const oGroupData = oUserModel?.getData() || {};
      const oMembersModel = oView.getModel("groupMembersModel");
      const oMembersData = oMembersModel?.getData() || {};
      const oRolecollectionModel = oView.getModel("rolecollectiondetails");
      const oRolecollectionData = oRolecollectionModel?.getData() || {};
      const roleCollections = oRolecollectionData.value || [];
      const groupMembers = oGroupData.members || [];
      let aExcelData = [];
      const maxLength = Math.max(groupMembers.length, Object.keys(roleCollections).length);
      for (let i = 0; i < maxLength; i++) {
        aExcelData.push({
          id: i === 0 ? oGroupData.id || "" : "",
          // Only show Group ID in the first row
          GroupName: i === 0 ? oGroupData.displayName || "" : "",
          // Only show Group Name in the first row
          UserID: groupMembers[i]?.value || "",
          "Display Name": groupMembers[i]?.display || "",
          "Role Collection": Object.keys(roleCollections)[i] || "",
          Role: roleCollections[Object.keys(roleCollections)[i]]?.join(", ") || "" // Join roles in case of multiple
        });
      }
      const aColumns = [{
        label: "Group ID",
        property: "id"
      }, {
        label: "Group Name",
        property: "GroupName"
      }, {
        label: "UserID",
        property: "UserID"
      }, {
        label: "Display Name",
        property: "Display Name"
      }, {
        label: "Role Collection",
        property: "Role Collection"
      }, {
        label: "Role",
        property: "Role"
      }];
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
  });
  return Overview;
});
//# sourceMappingURL=Overview-dbg.controller.js.map
