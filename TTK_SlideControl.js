//=============================================================================
// TTK - Slide Control (v1.0.0)
// by Fogomax
//=============================================================================
  
 
/*:
  * @author Fogomax
  * @plugindesc This plugin gives information about the slide through script calls
  * <TTK SlideControl>
  * @help
    ===========================================================================
    ● Explanation
    ===========================================================================
    It gives information about the slide from mouse and touchscreen, feature
    that wasn't implemented in the MV.

    ===========================================================================
    ● Script calls
    ===========================================================================
    - TouchInput.slideForce()
    Returns the force of the slide

    - TouchInput.isSlideX()
    Returns true if the user slided the X axis, otherwise returns false

    - TouchInput.isSlideY()
    Return true if the user slided the Y axis, otherwise return false

    @param Slide Force
    @desc The ammount of force to the movement be considered a slide
    @default 3
 */

var Imported = Imported || {};
Imported["TTK_SlideControl"] = "1.0.0";

var TTK = TTK || {};
TTK.SlideControl = {};

"use strict";

(function($) {
	$.Params = $plugins.filter(function(p) { return p.description.contains('<TTK SlideControl>'); })[0].parameters;

	//-----------------------------------------------------------------------------
	// Plugin global variables
	//

	$.slideForce = $.Params["Slide Force"];
	$.clearVariables = 0;

	//-----------------------------------------------------------------------------
	// TouchInput
	//

	var _TouchInput_clear = TouchInput.clear;

	TouchInput.clear = function() {
		_TouchInput_clear.call(this);
		this._forceY = 0;
		this._forceX = 0;
	};

	var _TouchInput_update = TouchInput.update;

	TouchInput.update = function() {
		_TouchInput_update.call(this);
		if ($.clearVariables > 0) {
			$.clearVariables--;
			if ($.clearVariables == 0) {
				this._forceX = 0;
				this._forceY = 0;
			}
		}

	};

	TouchInput.slideForce = function() {
		return this._force;
	}

	TouchInput.isSlideX = function() {
		return (Math.abs(this._forceX) >= $.slideForce);
	}

	TouchInput.isSlideY = function() {
		return (Math.abs(this._forceY >= $.slideForce));
	}

	var _TouchInput_onRelease = TouchInput._onRelease;

	TouchInput._onRelease = function(x, y) {
		this._forceX = (x - this._x) / this._pressedTime;
		this._forceY = (y - this._y) / this._pressedTime;
		$.clearVariables = 2;
		_TouchInput_onRelease.call(this, x, y);
	};
})(TTK.SlideControl);
