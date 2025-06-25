
service CatalogService {

    

    function getIASUsers(btp: String) returns array of {
        id: String;
        userName: String;
        name: {
            familyName: String;
            givenName: String;
        };
        active: Boolean;
    };

    function getIASUser(id: String, btp: String) returns array of {
        id: String;
        userName: String;
        name: {
            familyName: String;
            givenName: String;
        };
        active: Boolean;
    };

    function getRoleCollections(btp: String) returns array of {

    };

    function getRoleCollectionRoles(roleCollectionName: String, btp: String) returns array of {
        
    };

    function getGroups(GroupID: String, btp: String) returns array of {
        
    };

    function getGroupByName(GroupName: String, btp: String) returns array of{

    };
    
    function getGroupByWord(GroupName: String, btp: String) returns array of{

    };

    function getUserByWord(id: String, btp: String) returns array of{

    };
    

    


}