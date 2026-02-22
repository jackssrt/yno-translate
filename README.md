# YNO Translate

YNO Translate is a [userscript](https://en.wikipedia.org/wiki/Userscript) which adds translation features to the chat system on <https://ynoproject.net/>.

## Features

- Automatically translate incoming messages
- Automatically translate outgoing messages
- Settings menu to configure which languages to use

## Installation

To use YNO Translate you will need a userscript manager. They are browser extensions that handle installing, updating and running userscripts.

There are several userscript managers out there but I recommend [Violentmonkey](https://violentmonkey.github.io/):

- [Firefox AMO](https://addons.mozilla.org/firefox/addon/violentmonkey/)
- [Chrome Web Store](https://chrome.google.com/webstore/detail/violent-monkey/jinjaccalgkegednnccohejagnlnfdag)
- [Microsoft Edge Addons](https://microsoftedge.microsoft.com/addons/detail/eeagobfjdenkkddmbclomhiblgggliao)

---

Once you have a userscript manager installed, [click here to install the userscript](https://github.com/jackssrt/yno-translate/releases/latest/download/yno-translate.user.js). Click on the install button and then open up a game on <https://ynoproject.net/>.

<details>
<summary><b>Explanation of permissions</b></summary>

- `GM_xmlhttpRequest` - used to request the translations
    - `@connect "translate.googleapis.com"` - allows access to only the Google Translate api used to translate messages
- `GM_setValue` - used to save settings
- `GM_getValue` - used to load settings
- `GM_log` - used to log debug messages to the console

</details>

## Usage

- Install and then see incoming messages translated into your native language
- Click on the icon so it turns into a speech bubble and not a thought bubble to translate outgoing messages

## Development

This repo uses vite with typescript to compile the userscript js file.
