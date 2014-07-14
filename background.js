/************************************************************************************
  This is your background code.
  For more information please visit our wiki site:
  http://docs.crossrider.com/#!/guide/scopes_background
*************************************************************************************/

appAPI.ready(function($) {

  appAPI.browserAction.setResourceIcon('icon_032.png');
  appAPI.browserAction.onClick(function() {
        // Changes the badge text
        appAPI.tabs.create('http://cartbox.parseapp.com');
    });
    
});
