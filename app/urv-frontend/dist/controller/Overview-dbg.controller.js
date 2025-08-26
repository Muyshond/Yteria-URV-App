"use strict";

sap.ui.define(["sap/m/MessageToast", "sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel", "../service/dataService", "../service/exportService", "sap/ui/core/BusyIndicator"], function (MessageToast, Controller, JSONModel, __dataService, __exportService, BusyIndicator) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const dataService = _interopRequireDefault(__dataService);
  const exportService = _interopRequireDefault(__exportService);
  /**
   * @namespace urvfrontend.controller
   */
  const Overview = Controller.extend("urvfrontend.controller.Overview", {
    /*eslint-disable @typescript-eslint/no-empty-function*/onInit: function _onInit() {
      document.addEventListener("keydown", this.onKeyDown.bind(this));
      const view = this.getView();
      const initialModels = {
        tablegroups: {},
        tableusers: {},
        groupdetails: {},
        rolecollectiondetails: {},
        TreeModel: {},
        TreeModel2: {},
        userModel: {},
        groupModel: {},
        groupMembersModel: {}
      };
      Object.entries(initialModels).forEach(_ref => {
        let [name, data] = _ref;
        const oJSONModel = new JSONModel(data);
        view?.setModel(oJSONModel, name);
      });
    },
    //Search for data when enter is pressed.
    onKeyDown: function _onKeyDown(event) {
      if (event.key === "Enter") {
        this.getData();
      }
    },
    getData: function _getData() {
      const userInput = this.getUserInput();
      if (userInput.trim() === "") {
        MessageToast.show("Please enter a valid ID");
        return;
      }
      const searchMode = this.getSearchmode();
      if (searchMode === "group") {
        this.HandleGroupSearch(userInput);
      } else if (searchMode === "user") {
        this.HandleUserSearch(userInput);
      }
    },
    showBusy: function _showBusy() {
      BusyIndicator.show(0);
    },
    hideBusy: function _hideBusy() {
      BusyIndicator.hide();
    },
    getUserInput: function _getUserInput() {
      const userInput = this.getView()?.byId("UserID");
      return userInput.getValue();
    },
    getSearchmode: function _getSearchmode() {
      const selectinput = this.getView()?.byId("select");
      return selectinput.getSelectedItem().mProperties.key;
    },
    HandleGroupSearch: async function _HandleGroupSearch(groupID) {
      this.showBusy();
      try {
        const groups = await dataService.getGroupByWord(groupID, this.getView());
        if (groups === undefined) {
          return MessageToast.show(`There went something wrong while trying to fetch the groups`);
        } else if (groups.value.length === 0) {
          this.clearJsonModel("tablegroups");
          return MessageToast.show(`No groups found for "${groupID}"`);
        } else if (groups.value.length === 1) {
          if (groups.value[0] === "Group not found") {
            return MessageToast.show(`No groups found for "${groupID}"`);
            //exact match => set group directly
          } else if (groups.value[0].displayName === groupID) {
            this.setGroup(groupID);
            return;
            //Set groups in table so user can choose
          } else {
            const oJSONModel = new JSONModel({
              value: groups.value
            });
            this.getView()?.setModel(oJSONModel, "tablegroups");
            return;
          }
        } else if (groups.value.length > 1) {
          groups.value.forEach(group => {
            if (group.displayName === groupID) {
              this.setGroup(groupID);
              return;
            }
          });
          const oJSONModel = new JSONModel({
            value: groups.value
          });
          this.getView()?.setModel(oJSONModel, "tablegroups");
          return;
        }
      } catch (error) {
        MessageToast.show(`Error fetching groups: ${error}`);
      } finally {
        this.hideBusy();
      }
    },
    HandleUserSearch: async function _HandleUserSearch(userID) {
      this.showBusy();
      try {
        const users = await dataService.getUserByWord(userID, this.getView());
        if (users === undefined) {
          return MessageToast.show(`There went something wrong while trying to fetch the users`);
        } else if (users.value.length === 0) {
          this.clearJsonModel("tableusers");
          return MessageToast.show(`No users found for "${userID}"`);
        } else if (users.value.length === 1) {
          if (users.value[0] === "User not found") {
            MessageToast.show("user not found");
            return;
          } else if (users.value[0].id === userID) {
            this.setUser(userID);
            return;
          } else {
            const oJSONModel = new JSONModel({
              value: users.value
            });
            this.getView()?.setModel(oJSONModel, "tableusers");
          }
        } else if (users.value.length > 1) {
          users.value.forEach(user => {
            if (user.id === userID) {
              return;
            }
          });
          const oJSONModel = new JSONModel({
            value: users.value
          });
          this.getView()?.setModel(oJSONModel, "tableusers");
        }
      } catch (error) {
        MessageToast.show(`Error fetching groups: ${error}`);
      } finally {
        this.hideBusy();
      }
    },
    clearJsonModel: function _clearJsonModel(modelName) {
      const oJSONModel = new JSONModel({
        value: null
      });
      this.getView()?.setModel(oJSONModel, modelName);
    },
    clearAllJsonModels: function _clearAllJsonModels() {
      const view = this.getView();
      const modelNames = ["tablegroups", "tableusers", "groupdetails", "rolecollectiondetails", "TreeModel", "TreeModel2", "userModel", "groupModel", "groupMembersModel"];
      modelNames.forEach(name => {
        const model = view?.getModel(name);
        if (model) {
          model.setData({});
        }
      });
    },
    onHandleSearchmodeChange: function _onHandleSearchmodeChange() {
      MessageToast.show("Search mode changed");
      this.clearAllJsonModels();
      const searchmode = this.getSearchmode();
      if (searchmode === "group") {} else if (searchmode === "user") {} else {
        MessageToast.show("This searchmode is not supported");
      }
    },
    setUser: async function _setUser(userID) {
      this.showBusy();
      try {
        const user = await dataService.getIASUser(userID, this.getView());
        const userdata = user[0];
        this.setUserDetails(userdata);
        const grouprolerelationship = await this.getUserCollectionsViaGroup(userdata);
        const formattedData = Object.entries(grouprolerelationship).map(_ref2 => {
          let [group, value] = _ref2;
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
            const response = await dataService.getRolecollectionRoles(roleCollection, this.getView());
            const roleCollectionData = response?.value?.[0];
            const roles = roleCollectionData?.roleReferences?.map(role => role.name) || [];
            result[group][roleCollection] = roles;
          }
          const oJSONModel = new JSONModel({
            value: result
          });
          this.getView()?.setModel(oJSONModel, "groupdetails");
        }
        this.setRoleCollectionDataToTree(result);
        return;
      } finally {
        this.hideBusy();
      }
    },
    setGroup: async function _setGroup(userID) {
      this.showBusy();
      try {
        const group = await dataService.getGroup(userID, this.getView());
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
        const rolecolltions = await dataService.getGroupRoles(group.value[0].displayName, this.getView());
        for (const roleCollection of rolecolltions) {
          const response = await dataService.getRolecollectionRoles(roleCollection, this.getView());
          const roleCollectionData = response?.value?.[0];
          const roles = roleCollectionData?.roleReferences?.map(role => role.name) || [];
          result[roleCollection] = roles;
        }
        const oJSONModel = new JSONModel({
          value: result
        });
        this.getView()?.setModel(oJSONModel, "rolecollectiondetails");
        this.setGroupDataToTree(result);
        return;
      } finally {
        this.hideBusy();
      }
    },
    setRoleCollectionDataToTree: function _setRoleCollectionDataToTree(data) {
      const treeformat = Object.entries(data).map(_ref3 => {
        let [groupName, roleCollections] = _ref3;
        return {
          name: groupName,
          icon: "sap-icon://group",
          children: Object.entries(roleCollections).map(_ref4 => {
            let [roleCollectionName, roles] = _ref4;
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
    setGroupDataToTree: function _setGroupDataToTree(data) {
      try {
        const treeformat = Object.entries(data).map(_ref5 => {
          let [roleCollectionName, roles] = _ref5;
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
        }), "TreeModel");
      } catch (error) {
        console.log(error);
      }
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
      const roleCollectionsData = await dataService.getRoleCollections(this.getView());
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
      this.setUser(userID);
    },
    onExportUser: function _onExportUser() {
      const oView = this.getView();
      exportService.onExportUser(oView);
    },
    onExportGroup: function _onExportGroup() {
      const oView = this.getView();
      exportService.onExportGroup(oView);
    }
  });
  return Overview;
});
//# sourceMappingURL=Overview-dbg.controller.js.map
