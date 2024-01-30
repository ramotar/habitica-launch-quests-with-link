function doGet(e) {
  user = api_getUser();

  var allQuests = user.items.quests;
  var userName = user.auth.local.username;
  var ownedScrolls = positiveInventoryOnly(allQuests);


  //If no path info specified show menu
  if (Object.keys(e.parameters).length === 0) {
    let numQuests = Object.keys(ownedScrolls).length;
    var urlList = "\n\n";
    var scrollCode = "";

    let count = 0;
    while (count < (numQuests)) {
      scrollCode = Object.keys(ownedScrolls)[count].toString();
      urlList = urlList + scrollCode + " : " + Object.values(ownedScrolls)[count] + " owned" + '\n\n';
      count++;
    }
    var menu = userName.toString() + "'s quest inventory and codes:" + urlList + "\n\n\nQuest line code reference: 'atom' is Attack of the Mundane, 'moon' is Lunar Battle, and 'moonstone' is Recidvate.\n\n\nINSTRUCTIONS: Copy-paste the url below into browser address bar, followed by the quest code above, then hit ‘enter’.\n\nIMPORTANT NOTE: The links will only work when there is ONE and ONLY ONE Google account signed in to the browser.\nRather than logging out of your Google accounts, it's easier to just open an unused browser, or an incognito (Chrome),\nprivate (Firefox), or inPrivate (Internet Explorer) window, log in to one Google account, and paste the link there.\n\nLink:\n" + getWebAppURL() + "?questId=";

    var content = ContentService.createTextOutput(menu);
    return content;
  }

  var chosenScroll = e.parameters.questId[0];

  //Check if scroll is in inventory. End script if not available.
  var chosenInventory = ownedScrolls[chosenScroll];

  if (chosenInventory === undefined) {
    chosenInventory = 0;
  }
  var content = launchQuest(chosenInventory);
  return content;

  function launchQuest(chosenInventory) {
    if (chosenInventory < 1) {
      var content = ContentService.createTextOutput("The quest " + chosenScroll.toString() + " is NOT in " + userName + "'s inventory.\n\nClick back button to try again.");
    } else {
      api_cancelQuest();
      api_launchQuest(chosenScroll);
      var content = ContentService.createTextOutput("Command to launch the quest " + chosenScroll.toString() + " has been sent.");

    }
    return content;
  }
}


// Delete from schema all quests with no scrolls
function positiveInventoryOnly(allQuests) {
  var noScrolls = "start"
  while (typeof noScrolls !== 'undefined') {

    function getKeyByValue(object, value) {
      return Object.keys(object).find(key => object[key] === value);
    }

    var noScrolls = (getKeyByValue(allQuests, 0));
    delete allQuests[noScrolls];
  }
  var ownedScrolls = allQuests
  return ownedScrolls
}


// Cancel unstarted user quest
function api_cancelQuest() {
  const params = {
    "method": "post",
    "headers": HEADERS,
    "contentType": "application/json",
    "muteHttpExceptions": true,
  }
  const urlA = "https://habitica.com/api/v3/groups/party/quests/cancel"
  return UrlFetchApp.fetch(urlA, params);
}


// Launch quest
function api_launchQuest(chosenScroll) {
  const params = {
    "method": "post",
    "headers": HEADERS,
    "contentType": "application/json",
    "muteHttpExceptions": true,
  }
  const urlB = "https://habitica.com/api/v3/groups/party/quests/invite/" + chosenScroll;
  return UrlFetchApp.fetch(urlB, params);
}
