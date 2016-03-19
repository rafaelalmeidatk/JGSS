//=============================================================================
// TTK - Fix Picture (v1.0.0)
// by Fogomax
//=============================================================================
  
 
/*:
  * @author Fogomax
  * @plugindesc This plugin fixes the images in the map
  * <TTK FixPicture>
  * @help
    ===========================================================================
    ● Explanation
    ===========================================================================
    This plugins fixes the image in the map and in the coordenates specifieds
    in the event command, its not necessary the position be 0, 0. Because of
    this feature, you still can use the Move Picture command with fixed
    pictures.

    ===========================================================================
    ● Use
    ===========================================================================
    Just include the prefix in the image file name. Using the default Fix
    Prefix, the image name would be "[FIX]Image.png".

    @param Fix Prefix
    @desc The prefix the image needs have to be fixed
    @default [FIX]
 */

var Imported = Imported || {};
Imported["TTK_FixPicture"] = "1.0.0";

var TTK = TTK || {};
TTK.FixPicture = {};

"use strict";

(function($) {
	$.Params = $plugins.filter(function(p) { return p.description.contains('<TTK FixPicture>'); })[0].parameters;

	//-----------------------------------------------------------------------------
	// Plugin global variables
	//

	$.fixPrefix = $.Params["Fix Prefix"];

	//-----------------------------------------------------------------------------
	// Sprite_Picture
	//

	var _Sprite_Picture_updatePosition = Sprite_Picture.prototype.updatePosition;

	Sprite_Picture.prototype.updatePosition = function() {
		if (~this.picture().name().indexOf($.fixPrefix)) {
		    var picture = this.picture();
		    this.x = (-$gameMap.displayX() * 48) + picture.x();
		    this.y = (-$gameMap.displayY() * 48) + picture.y();
		} else {
			_Sprite_Picture_updatePosition.call(this);
		}
	};
})(TTK.FixPicture);
