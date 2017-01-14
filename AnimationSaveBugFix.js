//=============================================================================
// Animation Save Bug Fix
// by Fogomax
//=============================================================================

/*:
 * @author Fogomax
 * @plugindesc This plugin fixes the bug that occurs when you save the game
 * while there's an animation playing in a parallel event.
 *
 * @help
 * ===========================================================================
 * » Description
 * ===========================================================================
 * This plugin fixes the bug that occurs when you save the game while there's
 * an animation playing in a parallel event.
 *
 * This plugin is plug-and-play, no configuration is required. Place this
 * plugin on the top of the plugin list.
 *
 * ===========================================================================
 * » License
 * ===========================================================================
 * WTFPL – Do What the Fuck You Want to Public License
 * http://www.wtfpl.net/txt/copying/
*/

(function() {
	'use strict';

	//-----------------------------------------------------------------------------
	// Scene_Map
	//

	var _Scene_Map_terminate = Scene_Map.prototype.terminate;
	
	Scene_Map.prototype.terminate = function() {
		_Scene_Map_terminate.call(this);
		for (var i = 0; i < $gameMap.events().length; i++) {
			if (!$gameMap.events()[i]) continue;
			var event = $gameMap.events()[i];
			if (event._interpreter && event._interpreter._character === event) {
				event._interpreter._character = null;
			}
		};
	};

})();
