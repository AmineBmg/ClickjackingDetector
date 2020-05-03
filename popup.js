$(function(){
        //this function is for be sure if the user want safebrowsing or not
        chrome.storage.sync.get('choice', function(items) {
                if(items.choice)
                         $("#chk").attr("checked", "checked");
        });//end get storage
        $('#chk').click(function(){
        if(!this.checked){
                    chrome.storage.sync.get('choice', function(items) {
                                items.choice= false;
                                chrome.storage.sync.set({'choice': items.choice}, function() {// callback body
                                });//end set

                });//end get storage
        }else
                chrome.storage.sync.get('choice', function(items) {
                                alert("Google Safe Browsing is activated successfully ...");
                                items.choice= true;
                                chrome.storage.sync.set({'choice': items.choice}, function() {// callback body
                                });//end set

                });//end get storage
    });
    chrome.storage.sync.get('urllist', function(items) {
        $("#show").text(JSON.stringify(items.urllist));
        });//end get storage



    $('#log').click(function(){
        $.get("http://localhost/try/scriptt.php");
        alert("sucess");
    });





    $('#options').click(function(){
       // chrome.tabs.create({ url: "options.html" });
        });
    });

    function getcache(){
    chrome.storage.sync.get('urllist', function(items) {
         alert(JSON.stringify(items.urllist));
         alert(items.urllist.length);
        });//end get storage
}//end fucntion get
