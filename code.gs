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

  try {
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
        tryLaunchingQuest(questId);

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
  catch (error) {
    if (event.parameter.hasOwnProperty("questId")) {
      notifyUserOfError(error);

      // Error was triggered by HTTP request and contains the response as cause
      if (error.hasOwnProperty("cause") && error.cause.getContentText) {
        let response = error.cause;
        let content = parseJSON(response.getContentText());
        content = Object.assign({ "responseCode": response.getResponseCode() }, content);

        return ContentService.createTextOutput(JSON.stringify(content));
      }
      else {
        return ContentService.createTextOutput(error.message);
      }
    }
    else {
      throw error;
    }
  }
}

function tryLaunchingQuest(questId) {
  // Try canceling an own pending quest invitation
  try {
    api_fetch("https://habitica.com/api/v3/groups/party/quests/cancel", POST_PARAMS);
  }
  catch (error) {
    let response = error.cause;
    let content = parseJSON(response.getContentText());

    // If the error message is, that no invitation has been sent, that can be canceled
    if (response.getResponseCode() == 404 && content.message == "No quest invitation has been sent out yet.") {
      // Everything is fine, ignore the error
    }
    else {
      // Re-throw the error
      throw error;
    }
  }

  // Try launching the quest
  api_fetch("https://habitica.com/api/v3/groups/party/quests/invite/" + questId, POST_PARAMS);
}
