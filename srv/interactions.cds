
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
    
}