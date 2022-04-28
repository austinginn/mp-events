//requires fetch
import fetch from "node-fetch"

//EVENT OBJECT

//WEBHOOK OBJECT

//SPACES OBJECT

//RESOURCES OBJECT

//ESPACE API ACCESS OBJECT
var Espace = function () {
    //private vars
    let server_url = "";

    ///////////////
    //CONSTRUCTOR//
    ///////////////
    var constructor = function espace(url) {
      server_url = url
        // console.log(config);

        ///////////////////
        //PRIVATE METHODS//
        ///////////////////
        //Fetch GET request wrapper and error handling
        const get = async (url) => {
            try {
                const response = await fetch(url);
                const status = checkStatus(await response.status);
                const data = await response.json();
                return data;
            } catch (error) {
                console.log(error);
            }
        }

        //Fetch response status error handling
        const checkStatus = status => {
            if (status >= 200 && status < 300) {
                return status;
            } else {
                let err = new Error(status.statusText);
                err.response = status;
                throw err
            }
        }

        const getEventList = function () {
            return new Promise(resolve => {
                resolve(get(server_url));
            });
        }
        
        this.getEvents = async function () {
            //maybe consider passing optional vars as an object?
            return await getEventList();
        }
    };
    //end constructor

    //public static methods

    return constructor;
}();

export default Espace;