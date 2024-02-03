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
  for (let questKey in userQuests) {
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
    let template = HtmlService.createTemplateFromFile('template/doGet');
    template.webAppURL = webAppURL;
    template.installTime = getInstallTime();
    template.userName = user.profile.name;
    template.ownedScrolls = ownedScrolls;

    let output = template.evaluate();
    output.setTitle(getScriptName());

    return output;
  }
}
