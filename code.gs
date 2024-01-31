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
      if (error.hasOwnProperty("cause") && error.cause.getContentText) {
        let response = error.cause;
        let content = parseJSON(response.getContentText());
        content = Object.assign({"responseCode": response.getResponseCode()}, content);
        
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
  // Try canceling an own pending quest invitation
  try {
    api_fetch("https://habitica.com/api/v3/groups/party/quests/cancel", POST_PARAMS);
  }
  catch (error) {
    let response = error.cause;
    let content = parseJSON(response.getContentText());

    // If the error message is, that no quest is active right now
    if (true || content.message == "Text, that is sent, when no quest is active") {
      // Everything is fine, ignore the error

      // TEMP: Notify user to find out the correct message
      notifyUserOfError(error);
    }
    else {
      // Re-throw the error
      throw error;
    }
  }

  // Try launching the quest
  api_fetch("https://habitica.com/api/v3/groups/party/quests/invite/" + questId, POST_PARAMS);
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
