//======================================================================
// TTK - Choices Cursor
// Por Konoke
//======================================================================

/*:
  * @author Konoke
  * @plugindesc Shows a cursor in choices
  * @help The plugin is plug-and-play, you just need configure it the way you preffer.

  * @param Image
  * @desc Image to be used in the cursor
  * @default ./img/system/ChoicesCursor.png

  * @param Velocity
  * @desc Velocity of animation of the cursor
  * @default 5

  * @param Distance
  * @desc Distance of cursor to the options
  * @default 40

  * <TTK ChoicesCursor>
*/

/*:pt
  * @author Konoke
  * @plugindesc Exibe um cursor na seleção de escolhas
  * @help O plugin é plug-and-play, você precisa apenas configurá-lo da maneira que preferir.

  * @param Image
  * @desc Imagem para ser usada no cursor
  * @default ./img/system/ChoicesCursor.png

  * @param Velocity
  * @desc Velocidade de animação do cursor
  * @default 5

  * @param Distance
  * @desc Distância do cursor para as opções
  * @default 40

  * <TTK ChoicesCursor>
*/

var Imported = Imported || {};

var TTK = TTK || {};
TTK.ChoicesCursor = {};

"use strict";

(function ($) {
	$.Params = $plugins.filter(function(p) { return p.description.contains('<TTK ChoicesCursor>'); })[0].parameters;
	$.Vars = $.Vars || {};

	$.cursorImage = $.Params["Cursor Image"];
	$.cursorVelocity = $.Params["Cursor Velocity"];
	$.cursorDistance = $.Params["Distance"] * -1;

	//-----------------------------------------------------------------------------
	// Window_Selectable
	//

	var _Window_Selectable_initialize = Window_Selectable.prototype.initialize;
	Window_Selectable.prototype.initialize = function(x, y, width, height) {
		_Window_Selectable_initialize.call(this, x, y, width, height);
		this._choicesCursorDestinationY = 0;
		this._choicesCursor = new Sprite(ImageManager.loadNormalBitmap($.cursorImage, 0));
		this._choicesCursor.x = $.cursorDistance;
		this._choicesCursor.y = this.standardPadding();
		this.addChild(this._choicesCursor);
	};

	var _Window_Selectable_update = Window_Selectable.prototype.update;
	Window_Selectable.prototype.update = function() {
	    _Window_Selectable_update.call(this);
	    if (this._choicesCursor.y != this._choicesCursorDestinationY) {
	    	if (this._choicesCursorDestinationY > this._choicesCursor.y) {
	    		this._choicesCursor.y = (this._choicesCursor.y + $.cursorVelocity >= this._choicesCursorDestinationY) ? (this._choicesCursorDestinationY) : (this._choicesCursor.y + $.cursorVelocity);
	    	} else {
	    		this._choicesCursor.y = (this._choicesCursor.y - $.cursorVelocity <= this._choicesCursorDestinationY) ? (this._choicesCursorDestinationY) : (this._choicesCursor.y - $.cursorVelocity);
	    	}
	    }
	};

	var _Window_Selectable_select = Window_Selectable.prototype.select;

	Window_Selectable.prototype.select = function(index) {
		_Window_Selectable_select.call(this, index);
		this.updateChoicesCursor(index);
	};

	Window_Selectable.prototype.updateChoicesCursor = function(index) {
		if (typeof this._choicesCursor != 'undefined')
			this._choicesCursorDestinationY = this.standardPadding() + ((this.contents.fontSize + this.textPadding()) * index);
	}

	var _Window_Selectable_activate = Window_Selectable.prototype.activate;

	Window_Selectable.prototype.activate = function() {
	    _Window_Selectable_activate.call(this);
	    if (typeof this._choicesCursor != 'undefined' && $gameMessage.isBusy()) {
	    	this._choicesCursor.y = this.standardPadding();
	    	this._choicesCursor.visible = true;
	    }
	    else
	    	this._choicesCursor.visible = false;
	};

	var _Window_Selectable_deactivate = Window_Selectable.prototype.deactivate;

	Window_Selectable.prototype.deactivate = function() {
	    _Window_Selectable_deactivate.call(this);
	    if (typeof this._choicesCursor != 'undefined')
	    	this._choicesCursor.visible = false;
	};

})(TTK.ChoicesCursor);
