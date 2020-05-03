
//function to listen comeing messges
var t0 = performance.now();
//clearonbeforeunload();
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if (request.greeting == "wload"){
        clearonbeforeunload();
        checkrestrictingjs();
        framechecker(request.taburl);
        ckeckcursor();
    }

    if (request.greeting == "clearonbeforeunlaod"){
        clearonbeforeunload();
    }

    if (request.greeting == "removexss"){
        var fn = document.getElementsByTagName("iframe");
            for(i=0;i<fn.length;i++){
                    if(fn[i].src== request.src){
                            chrome.runtime.sendMessage({todo: "xssres"});
                            fn[i].parentNode.removeChild(fn[i]);
                            //alert("invisible iframe is removed, succeessfully");
                    }

            }
    }

});//end message listener

window.onload = onWindowLoad();
function onWindowLoad() {
    clearonbeforeunload();
     chrome.runtime.sendMessage({todo: "wload"});
}

// this fucntion ckeck for a cursorjacking
function ckeckcursor(){
    var cursorprop;
    var bdy = document.getElementsByTagName("body");
    if(bdy[0].hasAttribute("style")){
        cursorprop=bdy[0].style.cursor;

    }else {
         var  style = window.getComputedStyle(bdy[0]);
         cursorprop = style.getPropertyValue('cursor');
    }
    if(cursorprop == "none"){
            bdy[0].style.cursor= "default"
            chrome.runtime.sendMessage({todo: "Cursorjacking"});
        }
}

function clearonbeforeunload(){
     var t0 = performance.now();
        var clearit = 'window.onbeforeunload= null;';
        var script = document.createElement('script');
        var code = document.createTextNode('(function() {' + clearit + '})();');
        script.appendChild(code);
        (document.body || document.head).appendChild(script);
        var t1 = performance.now();
       //alert("Call to onbeforeunload clear took " + (t1 - t0) + " ms.");
}

function checkrestrictingjs(){
    var fn = document.getElementsByTagName("iframe");
    for(i=0;i<fn.length;i++){
        if(fn[i].hasAttribute("sandbox")){
            if(getopacity(fn[i]) <= 0.5){
                  // alert("opacity of this iframe is-> "+getopacity(fn[i]));
                    chrome.runtime.sendMessage({todo: "resjs"});
                    fn[i].parentNode.removeChild(fn[i]);
                    //alert("invisible iframe is removed, succeessfully");
             }
        }
    }
}

//get opacity of iframe by iframeid
function getopacity(frameid){
        var opacity=1;
        //check inline style
        if(frameid.hasAttribute("style")){
            opacity=frameid.style.opacity;
        } else{
            //check css file or style tag
             var  style = window.getComputedStyle(frameid);
             opacity = style.getPropertyValue('opacity');
              }
        return opacity;
}

//this will check for frame busting code
function ch(uu){

    var url=uu;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        //Send the proper header information along with the request
        xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
        // innerText does not let the attacker inject HTML elements.
        //var js="<script>if (top.location != self.locaton) {parent.location = self.location;}</script>";
      /*  if(xhr.responseText.indexOf('<script>')>-1){
               if(xhr.responseText.indexOf('(top.location != self.locaton)')>-1){
                    if(xhr.responseText.indexOf('parent.location = self.location')>-1){
                            alert("allright");
                    }
                }
        }  */
        //var n=xhr.responseText.indexOf('self === top');
       // alert(n);

        }
        }
        xhr.send();
}


function framechecker(tab_domain){

    var t0 = performance.now();
    var incase=true;
     var fn = document.getElementsByTagName("iframe");
     var existi=false;
      var c=0;
      //alert("iframe "+ fn.length+ "frame domain"+fn[0].src);
     while(c<fn.length){
         var domain_frame = fn[c].src.match(/^[\w-]+:\/{2,}\[?([\w\.:-]+)\]?(?::[0-9]*)?/)[1];//localhost
        // alert("tab   "+tab_domain+"  frame   "+domain_frame+"  length  "+fn.length);
         if(domain_frame!=tab_domain && domain_frame !=""){
                    if(fn[c].hasAttribute("style")){
                        opacity=fn[c].style.opacity;
                    } else{
                        //check css file or style tag
                        var  style = window.getComputedStyle(fn[c]);
                        opacity = style.getPropertyValue('opacity');
                        }
                    if(!opacity){
                            incase=false;
                            c++;
                    }
                    if(incase){
                        if(  opacity <= 0.7){
                            fn[c].parentNode.removeChild(fn[c]);
                            //fn[i].style.opacity= "1";
                            //fn[i].style.backgroundColor= "red";
                            existi=true;
             } else{
                 c++;
             }
        } //end elso not null
           // alert("frame lenght"+ fn.length);
     }else{
         c++;
     }
     }//end whil
     if(existi){
            chrome.runtime.sendMessage({todo: "framechecker"});
     }
     var t1 = performance.now();
     //alert("Call to frame checker took " + (t1 - t0) + " ms.");
}//end framechecker
