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
    let ownedScrolls = getOwnedScrolls(user);

    // If a questId parameter was given
    if (event.parameter.hasOwnProperty("questId")) {
      var questId = event.parameter.questId;

      var response;
      // Check inventory state
      if (questId in ownedScrolls) {
        tryLaunchingQuest(questId);

        response = {
          "responseCode": 200,
          "success": true,
          "error": "OK",
          "message": "Quest \"" + questId + "\" has been successfully launched."
        }
      }
      else {
        response = {
          "responseCode": 404,
          "success": false,
          "error": "",
          "message": "Quest \"" + questId + "\" not found in the users inventory."
        }
      }
      return ContentService.createTextOutput(JSON.stringify(response));
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
      if (error.hasOwnProperty("cause")) {
        return ContentService.createTextOutput(JSON.stringify(error.cause));
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

function getOwnedScrolls(user) {
  let userQuests = user.items.quests;

  // Filter quests the user has a scroll of
  let ownedScrolls = {};
  for (let questKey in userQuests) {
    if (userQuests[questKey] > 0) {
      ownedScrolls[questKey] = userQuests[questKey];
    }
  }

  return ownedScrolls;
}

function tryLaunchingQuest(questId) {
  let cancelAndRetry = false;

  // Try launching the quest
  try {
    api_fetch("https://habitica.com/api/v3/groups/party/quests/invite/" + questId, POST_PARAMS);
  }
  catch (error) {
    let response = error.cause;

    // If the error message is, that there is already a quest invitation by me
    if (response.responseCode == 401 && response.message == "Your party is already on a quest. Try again when the current quest has ended.") {
      // Go on and try canceling it
      cancelAndRetry = true;
    }
    else {
      // Re-throw the error
      throw error;
    }
  }

  if (cancelAndRetry) {
    // Try canceling an own pending quest invitation
    api_fetch("https://habitica.com/api/v3/groups/party/quests/cancel", POST_PARAMS);

    // Try launching the quest
    api_fetch("https://habitica.com/api/v3/groups/party/quests/invite/" + questId, POST_PARAMS);
  }

  if (PM_ON_QUEST_START) {
    let questName = HabiticaQuestKeys.getQuestName(questId);
    api_sendPM("Your quest **" + (questName ? questName : questId) + "** has been launched!");
  }
}
