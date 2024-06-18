URI = require("urijs");
var baseApi = "http://localhost:3000/records";

var page = 3;
var perPage = 2;
var apiResponse = [];

// Your retrieve function plus any additional functions go here ...
retrieve({ page: 2, color: ["red", "brown", "blue", "yellow", "green"] });

function retrieve(input) {
    
    var url = URI.build({
        path: baseApi,
        query: URI.buildQuery( {            
            limit: 20,
            color: input['color'],
            //if null retrieve all 
            offset: 0
        })
    });

    /*
    Upon a successful API response, transform the fetched payload into an object containing the following keys:

        ids: An array containing the ids of all items returned from the request.
        open: An array containing all of the items returned from the request that have a disposition value of "open". Add a fourth key to each item called isPrimary indicating whether or not the item contains a primary color (red, blue, or yellow).
        closedPrimaryCount: The total number of items returned from the request that have a disposition value of "closed" and contain a primary color.
        previousPage: The page number for the previous page of results, or null if this is the first page.
        nextPage: The page number for the next page of results, or null if this is the last page.
    */

    //if null page 1
    page = input['page'];

    getRecords(url);

}

function getRecords(url = is_required("url")) 
{
    let elements = ["red", "blue", "yellow"];
    let isPrimary = false;

    fetch(url)    
        .then(res => {
            if (!res.ok) {
                throw new Error("HTTP error " + res.status);
            }
            return res.json();
        })
        .then(data => { 
            let ids=[];
            let open=[];
            let closedPrimaryCount=[];

            data.map(x =>
                {
                    //ids: An array containing the ids of all items returned from the request.
                    ids.push(x.id);

                    //open: An array containing all of the items returned from the request that have a disposition value of "open". 
                    if (x.disposition == 'open') {

                        let tmpAry=[];
                        let color = x.color;
                        isPrimary = elements.includes(x.color);
                        tmpAry.push(x);
                                
                        //Add a fourth key to each item called isPrimary indicating whether or not the item 
                        //contains a primary color (red, blue, or yellow).
                        if (isPrimary) {
                            tmpAry.map(i=>{i["isPrimary"] = isPrimary});
                        }
                        
                        open.push(tmpAry);                        
                    }

                    //closedPrimaryCount: The total number of items returned from the request that 
                    //have a disposition value of "closed" and contain a primary color.                    
                    closedPrimaryCount = data
                        .filter(item => (item.disposition === "closed" && elements.includes(item.color)));
                }
            )
            
            console.log();
            console.log('ids of all items');
            console.log(ids);

            console.log();
            console.log('all items with disposition value of "open" and isPrimary color flag');
            //Paginate the response;
            apiResponse = open;
            generateList();
            
            console.log();
            console.log('number of items with disposition value of "closed" and contains a primary color');
            console.log(closedPrimaryCount.length);
            console.log();

            

        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });        
    }

    function generateList() {            
        var min = page * perPage;
        var max = min + perPage;
        let previousPage;
        let nextPage;
        let idx;

        // loop over responses
        for (var i=0; i < Math.min(apiResponse.length, max); i++) {
            // get response
            console.log(apiResponse[i]);
            previousPage = i;
            nextPage = previousPage+1;

            if (i >= 0 && i < min-1) {
                nextPage++;
                console.log('nextPage: ' + nextPage);

            } 
            // console.log('nextPage: ' + nextPage);
            if (i != 0 && i <= min) {
                console.log('previousPage: ' + previousPage);
            }
        }
    }