//=============================================================================
// Animation Save Bug Fix (v1.1)
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
 * WTFPL – Do What the frick You Want to Public License
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
			contents.map._events = this.resolveCircularReference(events);
		}
	};

	DataManager.resolveCircularReference = function (events) {
		for (var i = 0; i < events.length; i++) {
			if (!events[i]) continue;
			if (event._interpreter && event._interpreter._character === event) {
				event._interpreter._character = null;
			}
		}
	}

})();
