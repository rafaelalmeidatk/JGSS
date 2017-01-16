//=============================================================================
// Animation Save Bug Fix (v1.2)
// by Fogomax
//=============================================================================

/*:
 * @author Fogomax
 * @plugindesc This plugin fixes the bug that turns impossible to save the game
 * while an event running in parallel mode is playing an animation on itself.
 *
 * @help
 * ===========================================================================
 * » Description
 * ===========================================================================
 *
 * This plugin fixes the bug that turns impossible to save the game while
 * an event running in parallel mode is playing an animation on itself.
 *
 * It is plug-and-play, no configuration is required. Place this plugin on 
 * the top of the plugin list.
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
	// DataManager
	//

	var _DataManager_makeSaveContents = DataManager.makeSaveContents;
	
	DataManager.makeSaveContents = function() {
		var contents = _DataManager_makeSaveContents.call(this);
		if (contents.map) {
			var events = contents.map._events;
			this.resolveCircularReference(events);
		}
		return contents;
	};

	DataManager.resolveCircularReference = function(events) {
		for (var i = 0; i < events.length; i++) {
			if (!events[i]) continue;
			if (events[i]._interpreter && events[i]._interpreter._character === events[i]) {
				events[i]._interpreter._character = null;
			}
		}
	};

})();
