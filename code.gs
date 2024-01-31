// [Authors] Place all other functions in this or other separate files
// - Ideally prefix functions that access the API with "api_" to quickly see which ones
//   access the API and to be able to budget your 30 requests per minute limit well

/**
 * doGet(event)
 *
 * Function to handle GET requests to the Web App.
 * Serves the interface to the script user.
 */
function doGet(event) {
  let webAppURL = ScriptApp.getService().getUrl();
  setWebAppURL(webAppURL);

  let user = api_getUser();

  let userQuests = user.items.quests;
  // Filter quests the user has a scroll of
  let ownedScrolls = {};
  for (let questKey of Object.keys(userQuests)) {
    if (userQuests[questKey] > 0) {
      ownedScrolls[questKey] = userQuests[questKey];
    }
  }

  // If a questId parameter was given
  if (event.parameter.hasOwnProperty("questId")) {
    var questId = event.parameter.questId;

    var content;
    // Check inventory state
    if (questId in ownedScrolls) {
      // Launch quest
      api_fetch("https://habitica.com/api/v3/groups/party/quests/cancel", POST_PARAMS);
      api_fetch("https://habitica.com/api/v3/groups/party/quests/invite/" + questId, POST_PARAMS);
      content = ContentService.createTextOutput("Command to launch the quest " + questId.toString() + " has been sent.");
    }
    else {
      content = ContentService.createTextOutput("The quest " + questId.toString() + " is NOT in " + userName + "'s inventory.\n\nClick back button to try again.");
    }
    return content;
  }
  // Show the menu
  else {
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
    // return content;

    let template = HtmlService.createTemplateFromFile('template/doGet');
    template.installTime = getInstallTime();

    let output = template.evaluate();
    output.setTitle(getScriptName());

    return output;
  }
}

function processWebhookInstant(type, data) {
  // [Authors] This function gets called immediately,
  //   whenever a webhook of your script is activated.
  // - Place immediate reactions here.
  // - Make sure, that the processing time does not exceed 30 seconds.
  //   Otherwise you risk the deactivation of your webhook.

}

function processWebhookDelayed(type, data) {
  // [Authors] This function gets called asynchronously,
  //   whenever a webhook of your script is activated.
  // - Here you can take care of heavy work, that may take longer.
  // - It may take up to 30 - 60 seconds for this function to activate
  //   after the webhook was triggered.

}

function processTrigger() {
  // [Authors] This function gets called by the example trigger.
  // - This is the place for recurrent tasks.
}
