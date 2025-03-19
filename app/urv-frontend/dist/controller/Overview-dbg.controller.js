"use strict";

sap.ui.define(["sap/m/MessageToast", "sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"], function (MessageToast, Controller, JSONModel) {
  "use strict";

  /**
   * @namespace urvfrontend.controller
   */
  const Overview = Controller.extend("urvfrontend.controller.Overview", {
    /*eslint-disable @typescript-eslint/no-empty-function*/onInit: function _onInit() {},
    getUser: async function _getUser() {
      const userpanel = this.getView()?.byId("byUserId");
      const grouppanel = this.getView()?.byId("bygroup");
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
        const group = await this.getGroup(userID);
        if (group.value[0] === "error fetching group") {
          MessageToast.show("Could not find Group with id " + userID);
          return;
        }
        this.setGroupDetails(group.value[0]);
        const members = group.value[0].members;
        if (members.length !== 0) {
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
        this.setDataToTree2(result);
        grouppanel.setVisible(true);
        userpanel.setVisible(false);
        //ZOEK OP USER
      } else if (selectedvalue.mProperties.key === "user") {
        const user = await this.getIASUser(userID);
        if (user.length === 0) {
          MessageToast.show("User with id " + userID + " not found.");
          grouppanel.setVisible(false);
          userpanel.setVisible(false);
          return;
        }
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
          this.setDataToTree(result);
          grouppanel.setVisible(false);
          userpanel.setVisible(true);
        }
      }
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
        const oBinding = oModel.bindContext(`/getGroups(...)`, undefined, {});
        oBinding.setParameter("GroupID", id);
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
    }
  });
  return Overview;
});
//# sourceMappingURL=Overview-dbg.controller.js.map
