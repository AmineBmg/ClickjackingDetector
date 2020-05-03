
chrome.webRequest.onBeforeRequest.addListener(function(details) {
        //check for reflected xss
        var url= details.url;
                if(url.search("%3Cscript%3E")!=-1 && url.search("if")!=-1 && url.search("top")!=-1 && url.search("self")!=-1 && url.search("location")!=-1){
                                alert("Warning!\n Detected an Reflective XSS attack, the request will blocked.");
                                insertintocache();
                                return {cancel: details.url.indexOf(details.url) != -1};
                                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                                        chrome.tabs.sendMessage(tabs[0].id, {greeting: "removexss",src: url}, function(response) {
                                        console.log(response.farewell);
                                        });
                                });
                        }


        },
        {urls: ["<all_urls>"],
        types : ["sub_frame"]},
        ["blocking"]);

function insert(domain, page){
        var url="http://localhost/clickjacking/feed.php";
        var xhr = new XMLHttpRequest();
        var domain= "domain="+domain+"&page="+page+"";
        xhr.open("POST", url, true);
        //Send the proper header information along with the request
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                        // innerText does not let the attacker inject HTML elements.
                        alert(xhr.responseText);
                }
        }
        xhr.send(domain);
}

//this will insert the current tab url into cache.
function insertintocache(){
        var dd=true;
        chrome.tabs.getSelected(null,function(tab) {
                var pg=tab.url;
                var dom = pg.match(/^[\w-]+:\/{2,}\[?[\w\.:-]+\]?(?::[0-9]*)?/)[0];// give http://www.xyz.com
                chrome.storage.sync.get('urllist', function(items) {
                if(items.urllist== undefined){
                                var urltab=[];
                                urltab.push({domain: dom, page: pg});
                                chrome.storage.sync.set({'urllist': urltab}, function() {// callback body
                                });//end set
                                //insert into db
                                insert(dom, pg);
                }else{
                                for(i=0;i<items.urllist.length; i++)  {
                                        if(items.urllist[i].page== pg) {
                                                dd=false;
                                        }
                                }
                                if(dd==true){
                                        items.urllist.push({domain: dom, page: pg});
                                       chrome.storage.sync.set({'urllist': items.urllist}, function() {// callback body
                                        });//end set
                                        alert(""+tab.url+"\n inserted successfully into cache.");
                                        insert(dom, pg);
                                }

                        }
                });//end get storage

       });//end get url*/
}//end fucniton insertintocache

function getcache(){
        var t0 = performance.now();
        chrome.tabs.getSelected(null,function(tab) {
                var do_it=true;
                var bb=false;
                var dom = tab.url.match(/^[\w-]+:\/{2,}\[?[\w\.:-]+\]?(?::[0-9]*)?/)[0];// give http://www.xyz.com
                chrome.storage.sync.get('urllist', function(items) {
                        for(i=0;i<items.urllist.length; i++)  {
                                if(items.urllist[i].page== tab.url) {
                                        do_it=false;
                                        if (confirm('Local User Cach,\n This websites'+dom+' visited before, it has clickjacking attack!!\n do you want continue?')) {
                                                        //do nothing
                                        } else {
                                                chrome.tabs.getSelected(null, function(tab) {
                                                        chrome.tabs.remove(tab.id);
                                                });
                                         }
                                }
                        }

                        if(do_it==true){
                                var pg=tab.url;
                                        var url="http://localhost/clickjacking/get.php";
                                        var xhr = new XMLHttpRequest();
                                        var domain= "domain="+dom+"&page="+pg+"";
                                        xhr.open("POST", url, true);
                                        //Send the proper header inf ormation along with the request
                                        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                                        xhr.onreadystatechange = function() {
                                                if (xhr.readyState == 4) {
                                                        if(xhr.responseText==1){
                                                               if (confirm('BlackList database\n This websites'+dom+' is reported as malicious website for clickjacking attack\n do you want to continue?')) {
                                                                                //do nothing
                                                                } else {
                                                                        chrome.tabs.getSelected(null, function(tab) {
                                                                                chrome.tabs.remove(tab.id);
                                                                        });
                                                                }
                                                        }
                                                }
                                        }
                                        xhr.send(domain);
                        }
                });//end get storage

        });//end get url*/
         var t1 = performance.now();
        //alert("Call to getfromcache clear took " + (t1 - t0) + " ms.");
}//end fucntion get

//ckeck in google browsing database and our database
chrome.webRequest.onBeforeSendHeaders.addListener(function(details) {
          var t0 = performance.now();
                getcache();
                chrome.storage.sync.get('choice', function(items) {
                        if(items.choice== undefined){
                                 alert("create items.choice");
                                        var choice= true;
                                        chrome.storage.sync.set({'choice': choice}, function() {// callback body
                                        });//end set
                                }
                });//end get storage
                chrome.storage.sync.get('choice', function(items) {

                        if(items.choice==true){
                                var uri_sub= details.url;
                                var origin = uri_sub.match(/^[\w-]+:\/{2,}\[?[\w\.:-]+\]?(?::[0-9]*)?/)[0];// give http://www.xyz.com
                                var xhr = new XMLHttpRequest();
                                //add your google Api key 
                                var url="#";
                                var params= "{" +
                                "    \"client\": {" +
                                "      \"clientId\":      \"clickdetector\"," +
                                "      \"clientVersion\": \"1.0\"" +
                                "    }," +
                                "    \"threatInfo\": {" +
                                "      \"threatTypes\":      [\"MALWARE\", \"SOCIAL_ENGINEERING\"]," +
                                "      \"platformTypes\":    [\"ANY_PLATFORM\"]," +
                                "      \"threatEntryTypes\": [\"URL\"]," +
                                "      \"threatEntries\": [" +
                                "      {\"url\": \""+ origin +"\"}" +
                                "      ]" +
                                "    }" +
                                "  }";

                                xhr.open("POST", url, true);
                        //Send the proper header information along with the request
                                xhr.setRequestHeader("Content-type", "application/json");//send json on header
                                xhr.onreadystatechange = function() {
                                        if (xhr.readyState == 4) {
                                                // WARNING! Might be injecting a malicious script!
                                                var myObj = JSON.parse(xhr.responseText);
                                                if(xhr.responseText.length == 3){
                                                        //alert("Empty answer, this website is no malicious")  ;
                                                        //check ourdatabas
                                                        var t1 = performance.now();
                                                        // alert("Call to frame google safe took " + (t1 - t0) + " ms.");
                                                } else{
                                                        if(myObj.matches[0].threatType=="MALWARE")
                                                                alert("Warning—Visiting this web site may harm your computer.");
                                                        if(myObj.matches[0].threatType=="UNWANTED SOFTWARE")
                                                                alert("Warning—The site ahead may contain harmful programs.");
                                                        if(myObj.matches[0].threatType=="SOCIAL ENGINEERING")
                                                                alert("Warning—Deceptive site ahead. Attackers on "+ origin +" may trick you into doing something dangerous like installing software or revealing your personal information");

                                                }
                                        }//end ready status
                        }
                        xhr.send(params);

             }//end end if choice true
          });//end get storage
       //details.requestHeaders.push({name:"dummyHeader",value:"1"});
      //  return {requestHeaders: details.requestHeaders};

    },
    {urls: ["<all_urls>"],
     types : ["main_frame"]},
    ["requestHeaders", "blocking"]

);
chrome.webRequest.onHeadersReceived.addListener(function(details) {
        //if(details.responseHeaders[0].name== "status")
       // details.responseHeaders.push({name:"amine",value:"ok"});
       // alert(details.url+' => '+JSON.stringify(details.responseHeaders));
        //  return {cancel: details.url.indexOf("https://www.google.ca/?gws_rd=ssl") != -1};
       // return {responseHeaders: details.responseHeaders};
        var uri = details.url;
        var origin = uri.match(/^[\w-]+:\/{2,}\[?[\w\.:-]+\]?(?::[0-9]*)?/)[0];
        //alert("on header rec sub_frame domain is: "+ uri);
        /*chrome.tabs.getSelected(null,function(tab) {
                 var uri_sub= tab.url;
                 var domain_main = uri.match(/^[\w-]+:\/{2,}\[?([\w\.:-]+)\]?(?::[0-9]*)?/)[1];
                  var domain_sub = uri_sub.match(/^[\w-]+:\/{2,}\[?([\w\.:-]+)\]?(?::[0-9]*)?/)[1];
                   alert("Sub_frame url is: "+ domain_main+ "   tab url: "+ domain_sub);
        });//end get url*/
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
         chrome.tabs.sendMessage(tabs[0].id, {greeting: "clearonbeforeunlaod"}, function(response) {
         console.log(response.farewell);
         });
});
        },
        {urls: ["<all_urls>"],
        types : ["sub_frame"]},//, "main_frame","sub_frame", "stylesheet", "script", "image", "object", "xmlhttprequest", "other"
        ["blocking","responseHeaders"]);
        //////end on header recieved

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
        var do_not=true;
        chrome.tabs.getSelected(null,function(tab) {
                 var uri_sub= tab.url;
                 var domain_main = uri_sub.match(/^[\w-]+:\/{2,}\[?([\w\.:-]+)\]?(?::[0-9]*)?/)[1];//www.google.com
                  var domain_sub = uri_sub.match(/^[\w-]+:\/{2,}\[?([\w\.:-]+)\]?(?::[0-9]*)?/)[1];//localhost
                   //if(domain_sub=="www.youtube.com")
                       // do_not=false;

if(do_not==true){
        //recieve message about hiding iframe(from iframechecker)
        if(request.todo == "wload"){
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {greeting: "wload",taburl: domain_sub}, function(response) {
                console.log(response.farewell);
                 });
            });
        }
        if(request.todo == "framechecker"){
            var notifOptions = {
                        type: "basic",
                        iconUrl: "successicon.png",//"warningclick.png"
                        title: "Warning!",
                        message: "The invisible element is removed sucessfully. SAFE NAVIGATION."
                };
                insertintocache();
                chrome.notifications.create('limitNotif', notifOptions);
        }//end message iframe checker

        if(request.todo == "resjs"){
                var notifOptions = {
                        type: "basic",
                        iconUrl: "successicon.png",
                        title: "Warning!",
                        message: "rzssThe malicious element is removed sucessfully. SAFE NAVIGATION."
                };
                insertintocache();
               chrome.notifications.create('limitNotif', notifOptions);
        }
        if(request.todo == "xssres"){
                var notifOptions = {
                        type: "basic",
                        iconUrl: "successicon.png",
                        title: "Warning!",
                        message: "The invisible element is removed sucessfully. SAFE NAVIGATION."
                };
                insertintocache();
               chrome.notifications.create('limitNotif', notifOptions);
        }
        if(request.todo == "Cursorjacking"){
                var notifOptions = {
                        type: "basic",
                        iconUrl: "successicon.png",
                        title: "Warning!",
                        message: "The fake element is removed sucessfully. SAFE NAVIGATION."
                };
                insertintocache();
               chrome.notifications.create('limitNotif', notifOptions);
        }
}
});
});//end onmessage listnner
