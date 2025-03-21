
service CatalogService {

    

    function getIASUsers() returns array of {
        id: String;
        userName: String;
        name: {
            familyName: String;
            givenName: String;
        };
        active: Boolean;
    };

    function getIASUser(id: String) returns array of {
        id: String;
        userName: String;
        name: {
            familyName: String;
            givenName: String;
        };
        active: Boolean;
    };

    function getRoleCollections() returns array of {

    };

    function getRoleCollectionRoles(roleCollectionName: String) returns array of {
        
    };

    function getGroups(GroupID: String) returns array of {
        
    };

    function getGroupByName(GroupName: String) returns array of{

    };
    
    function getGroupByWord(GroupName: String) returns array of{

    }
    
}