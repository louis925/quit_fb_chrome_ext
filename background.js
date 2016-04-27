var tabAgeMap = {};
var MAX_AGE_MINUTES = 5;
var UpdatePeriod = 10000;//in mS
var extEnabled = true;

var killTab = function (tabId) {
    chrome.tabs.remove(tabId, function () {
        //console.log('killed', tabId, tabAgeMap[tabId]);
        delete tabAgeMap[tabId];
    });
};

var increaseTabAge = function (tabId) {
    if (typeof tabAgeMap[tabId] == 'undefined') {
        tabAgeMap[tabId] = 0;
    } else {
        tabAgeMap[tabId]++;
    }
};

// Bootstrap method
init = function(){
	chrome.storage.local.get('enabled', function(data){
	        if(data.hasOwnProperty('enabled')){
        	        extEnabled = data.enabled;
	        }else{
				extEnabled = true;
			}

	        if(extEnabled == true){
        	        chrome.browserAction.setIcon({"path" : './icon.png'});
	        }else{
	                chrome.browserAction.setIcon({"path" : './icon-inactive.png'});
	        }
	});
	//console.log('Initialization done. Enable',extEnabled);
}

setInterval(function () {
	if(extEnabled){
		chrome.tabs.query({
			url: 'https://*.facebook.com/*'
		}, function (tabs) {
			//console.log('FB tab',tabAgeMap);
			tabs.forEach(function (tab) {
				increaseTabAge(tab.id);
				if (tabAgeMap[tab.id] >= MAX_AGE_MINUTES*60000/UpdatePeriod) {
					killTab(tab.id);
				}
			});
		});
	}
}, UpdatePeriod);

// On Click Ext. icon
chrome.browserAction.onClicked.addListener(function(){
	extEnabled = !extEnabled;
	//console.log('Enable',extEnabled);
	
	if(extEnabled == false){
		tabAgeMap = {};//Erase the tab age map.
	}
	
	chrome.storage.local.set({"enabled" : extEnabled});

	if(extEnabled == true){
		chrome.browserAction.setIcon({"path" : './icon.png'});
	}else{
		chrome.browserAction.setIcon({"path" : './icon-inactive.png'});
	}
});

window.addEventListener('load', init);
