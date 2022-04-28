//requires
import request from 'request';

var MP = function()
{
  //private methods and vars
  var oauth = {};

  //constructor
  var constructor = function MP(client_id, client_secret, root){
    // console.log("in constructor");
    oauth.config = {
    	rootPath: "https://" + root + ".ministryplatform.com/ministryplatformapi",
    	url: "https://" + root + ".ministryplatform.com/ministryplatformapi/oauth/connect/authorize",
    	logoutUrl: "/ministryplatformapi/oauth/connect/endsession",
    	clientId: client_id,
    	clientSecret: client_secret,
    	scope: "openid http://www.thinkministry.com/dataplatform/scopes/all",
    };

    //private methods
    var getAuth = function() {
      return new Promise( resolve => {
        request({
          url: oauth.config.rootPath + "/oauth/connect/token",
          method: 'POST',
          form: {
            'grant_type': 'client_credentials',
            'client_id': oauth.config.clientId,
            'client_secret': oauth.config.clientSecret,
            'scope': 'http://www.thinkministry.com/dataplatform/scopes/all'
          }
        }, function(err, res, body){
              //store token
              var response = JSON.parse(body);
              oauth.token = response.access_token;
              // console.log(oauth.token);
              //console.log(response);
              resolve("authorized");
            });
        });
    };

    var getEvents = function(filter){
      return new Promise( resolve => {
        var urlQ = oauth.config.rootPath + '/tables/events?%24select=Event_ID%2C%20Event_Title%2C%20Event_Start_Date%2C%20Event_End_Date%2C%20Meeting_Instructions%2C%20Visibility_Level_ID&%24filter=';

        //default filter month year???

        if(filter == null){
          urlQ = urlQ + 'DATEADD(mm%2C%200%2C%20DATEDIFF(mm%2C%200%2C%20Event_Start_Date))%20%3D%20DATEADD(mm%2C%200%2C%20DATEDIFF(mm%2C%200%2C%20GETDATE()))&%24orderby=Event_Start_Date';
        } else {
          urlQ = urlQ + filter;
        }

        request({
          //url is current day event query - change this query to get a different selecetion
          url: urlQ,
          json: true,
          auth: {
          'bearer': oauth.token
          }
        }, function(err, res, body) {
               if(body == null){
                   //error email? token renew here
              //  console.log(body);
              return -1;
              }
          resolve(body);
        });
      })
    }

    //public methods
  this.getEvents = async function(filter){
    // console.log("in get events");
    var events;
    //get authorize
    await getAuth();
    const result = await getEvents(filter);
    return result;
  }
};
  //end constructor

  //public static methods

  return constructor;
}();

export default MP;
