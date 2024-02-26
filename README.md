# Launch Quests with Link by Turac
This version of **Launch Quests with Link** is a port of the original [Launch Quests with Link](https://habitica.fandom.com/wiki/Launch_Quests_With_Link) by [Snefferdy](https://habitica.com/profile/7d2dce0e-4197-407b-b40f-8b5530774486) to the [Habitica GAS Template](https://habitica.fandom.com/wiki/Habitica_GAS_Template) by Turac.

## Features
This version basically features the same capabilities as the original script, but has some improvements:

* improved user interface listing all the quests
* option to receive a PM, when an own quest is launched
* meaningful responses when opening a link (is evaluated by the ported version of the Quest Queue)
* better error handling and recovery

## Installation
For the installation follow the [installation instructions](https://habitica.fandom.com/wiki/Habitica_GAS_Template#Installation) for the GAS Template.

Additional information and steps are given below.

### Getting the script
You can find the source code of the script on [Google Apps Script](https://script.google.com/d/1Ratt-J01CfNcS78A9zCLah6h44PurAZU5Z1lgquwb9UZO5RLrOkMQLWt/edit?usp=sharing).

### Deploying the script
When you open the script interface by clicking the URL listed under "Web app", you will already see the list of all your quests. Those are provided with their key, the number of scrolls you own and the full name of the quest. The key is a clickable link, that can be used directly to launch one of your quests.

Instead of the usual "Install" button, you will only find "Check credentials" because the script needs no installation (i.e. has no webhooks or triggers). But to be certain, that you configured your `USER_ID` and `API_TOKEN` correctly, you can click that button and the status should switch to **CHECKED**

### Using the script
Finally, your launch links are ready to be used. Usually it will be used together with a Quest Queue run by your party leader. Simply send your Web App URL as shown on the bottom of your script interface (which is actually the URL of the script interface you are looking at right now).

## Contributions
Users and authors alike can contribute to this template and a hassle-free script experience for everyone:

|  |  |  |
| :---: | :---: | --- |
| :lady_beetle: | [Issues](https://github.com/ramotar/habitica-launch-quests-with-link/issues) | If you detect an issue, feel free to raise it |
| :grey_question: | [Questions](https://github.com/ramotar/habitica-launch-quests-with-link/discussions/categories/q-a) | Any questions you have, are welcome |
| :bulb: | [Suggestions](https://github.com/ramotar/habitica-launch-quests-with-link/discussions/categories/suggestions) | I will be happy to discuss your suggestions |

## Acknowledgement
* This version is based on the original [Launch Quests with Link](https://habitica.fandom.com/wiki/Launch_Quests_With_Link) by [Snefferdy](https://habitica.com/profile/7d2dce0e-4197-407b-b40f-8b5530774486)
