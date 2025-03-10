"use strict";

sap.ui.define(["sap/m/MessageToast", "sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"], function (MessageToast, Controller, JSONModel) {
  "use strict";

  /**
   * @namespace urvfrontend.controller
   */
  const Overview = Controller.extend("urvfrontend.controller.Overview", {
    /*eslint-disable @typescript-eslint/no-empty-function*/onInit: function _onInit() {},
    getUser: async function _getUser() {
      const userInput = this.getView()?.byId("UserID");
      const userID = userInput.getValue();
      if (userID === "") {
        MessageToast.show("Please enter a valid ID");
        return;
      }
      const user = await this.getIASUser(userID);
      const userdata = user.value?.[0];
      //const userGroups = userdata.groups.map((group: any) => group.display); //groups deftig zetten 
      //this.getRolecollectionRoles("AuthGroup.Content.Admin") //test (delete erna)
      this.setUserDetails(userdata);
      const grouprolerelationship = await this.getUserCollectionsViaGroup(userdata);
      console.log(grouprolerelationship);
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
        console.log(result);
        this.setDataToTree(result);
      }
    },
    setDataToTree: function _setDataToTree(data) {
      const treeformat = Object.entries(data).map(_ref2 => {
        let [groupName, roleCollections] = _ref2;
        return {
          name: groupName,
          children: Object.entries(roleCollections).map(_ref3 => {
            let [roleCollectionName, roles] = _ref3;
            return {
              name: roleCollectionName,
              children: (roles || []).map(role => ({
                name: role
              }))
            };
          })
        };
      });
      this.getView()?.setModel(new JSONModel({
        tree: treeformat
      }), "TreeModel");
    },
    setUserDetails: function _setUserDetails(userdata) {
      let oModel = this.getView()?.getModel("userModel");
      if (!oModel) {
        oModel = new JSONModel();
        this.getView()?.setModel(oModel, "userModel");
      }
      oModel.setData(userdata);
    },
    getUserCollectionsViaGroup: async function _getUserCollectionsViaGroup(user) {
      console.log(user);
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
        const response = await fetch(`/odata/v4/catalog/getIASUser(id='${userid}')`);
        if (!response.ok) {
          throw new Error(`Error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Users:", data);
        return data;
      } catch (error) {
        console.error("Error :", error);
      }
    },
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
    getRoleCollections: async function _getRoleCollections() {
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
    },
    getRolecollectionRoles: async function _getRolecollectionRoles(roleCollection) {
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
    }
  });
  return Overview;
});
//# sourceMappingURL=Overview-dbg.controller.js.map
