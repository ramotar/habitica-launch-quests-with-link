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
  // If a questId parameter was given
  if (event.parameter.hasOwnProperty("questId")) {
    try {
      var questId = event.parameter.questId;

      tryLaunchingQuest(questId);

      let response = {
        "responseCode": 200,
        "success": true,
        "error": "OK",
        "message": "Quest \"" + questId + "\" has been successfully launched."
      }
      
      return ContentService.createTextOutput(JSON.stringify(response));
    }
    catch (error) {
      notifyUserOfError(error);

      // Error was triggered by HTTP request and contains the response as cause
      if (error.hasOwnProperty("cause")) {
        return ContentService.createTextOutput(JSON.stringify(error.cause));
      }
      else {
        return ContentService.createTextOutput(error.message);
      }
    }
  }
  // Show the menu
  else {
    let webAppURL = ScriptApp.getService().getUrl();
    setWebAppURL(webAppURL);

    let user = api_getUser();
    let ownedScrolls = getOwnedScrolls(user);

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
  // Try launching the quest
  try {
    api_fetch("https://habitica.com/api/v3/groups/party/quests/invite/" + questId, POST_PARAMS);
  }
  catch (error) {
    let response = error.cause;

    // If the error message is, that there is already a running quest
    if (response.responseCode == 401 && response.message == "Your party is already on a quest. Try again when the current quest has ended.") {
      // Check the state of the quest
      let party = api_getParty();
      let quest = party.quest;
      if (quest.active) {
        // Party is already on running quest, re-write error message and re-throw
        response.message = "You can not cancel an active quest, use the abort functionality.";
        error.cause = response;
        throw error;
      }
      else if (quest.leader != INT_USER_ID) {
        // There is already an invitation by another user, re-write error message and re-throw
        response.message = "Your party is already invited to a quest by another user. Try again when the current quest has ended.";
        error.cause = response;
        throw error
      }
      else if (quest.key != questId) {
        // Cancel the own pending quest invitation
        api_fetch("https://habitica.com/api/v3/groups/party/quests/cancel", POST_PARAMS);

        // Re-try launching the quest
        api_fetch("https://habitica.com/api/v3/groups/party/quests/invite/" + questId, POST_PARAMS);
      }
      // If none of the above clauses were true,
      // then the party had an active quest invitation by you to the required quest,
      // so there is nothing to do besides being happy
    }
    else {
      // Re-throw the error
      throw error;
    }
  }

  if (PM_ON_QUEST_START) {
    let questName = HabiticaQuestKeys.getQuestName(questId);
    api_sendPM("Your quest **" + (questName ? questName : questId) + "** has been launched!");
  }
}
