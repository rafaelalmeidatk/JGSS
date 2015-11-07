//======================================================================
// TTK - Message Plus (v1.0.1)
// Por Fogomax
//======================================================================

/*:
	* @author Fogomax
	* @plugindesc This plugin improves the default message system, adding new features to it.
	* <TTK MessagePlus>
	* @help
	● Available commands:
	  - MessagePlus set x
	  Creates a Ballon Text on the event of ID x, if 0, the Ballon Texts
	  will be on player

	  - MessagePlus off
	  Turn off the plugin, the messages come back to default

	@param Face Padding
	@desc The padding (in pixels) of face window
	@default 8
*/

var Imported = Imported || {};

var TTK = TTK || {};
TTK.MessagePlus = {};

"use strict";

(function ($) {
	$.Params = $plugins.filter(function(p) { return p.description.contains('<TTK MessagePlus>'); })[0].parameters;

	//-----------------------------------------------------------------------------
	// Plugin global variables
	//

	$.facePadding = parseInt($.Params["Face Padding"]);
	$.characterFocus = -1;

	//-----------------------------------------------------------------------------
	// Game_Message
	//

	var _Game_Message_clear = Game_Message.prototype.clear;

	Game_Message.prototype.clear = function() {
		_Game_Message_clear.call(this);
	};

	var _Game_Message_add = Game_Message.prototype.add;

	Game_Message.prototype.add = function(text) {
    	this._texts.push(text);
		SceneManager._scene._messageWindow.refreshSize(this._texts);
		SceneManager._scene._messageWindow.refreshPosition();
	};

	//-----------------------------------------------------------------------------
	// Window_Message
	//
	var _Window_Message_initialize = Window_Message.prototype.initialize;

	Window_Message.prototype.initialize = function() {
		_Window_Message_initialize.call(this);
		this._faceWindow = new Window_Message_Face(Window_Base._faceWidth, Window_Base._faceWidth);
		this._faceWindow.hide();
		this.addChild(this._faceWindow);
	}

	var _Window_Message_open = Window_Message.prototype.open;

	Window_Message.prototype.open = function() {
		_Window_Message_open.call(this);
		this._faceWindow.open();
	}

	var _Window_Message_close = Window_Message.prototype.close;

	Window_Message.prototype.close = function() {
		_Window_Message_close.call(this);
		this._faceWindow.close();
	}

	Window_Message.prototype.refreshSize = function(texts) {
		if ($.characterFocus < 0) {
			this.width = this.windowWidth();
			this.height = this.windowHeight();
		} else {
			var width = 0;
			for (var i = 0; i < texts.length; i++) {
				width = (this.textWidth(texts[i]) > width) ? this.textWidth(texts[i]) : width;
			}
			this.width = width + (this.standardPadding() * 1.5) + this.textPadding();
			this.height = this.fittingHeight(texts.length);
		}
	};

	Window_Message.prototype.refreshPosition = function() {
		if ($.characterFocus < 0) {
			this.x = 0;
			return;
		}

		if ($.characterFocus == 0)
			var pos = [$gamePlayer.screenX(), $gamePlayer.screenY()];
		else
			var pos = [$gameMap.event($.characterFocus).screenX(), $gameMap.event($.characterFocus).screenY()];

		var stdP = this._faceWindow.standardPadding();
		var x = (pos[0] - (this.width / 2));
		var px = (this.hasFace()) ? (x - Window_Base._faceWidth - (stdP * 2)) : (x);
		if (x + this.width > Graphics.width)
			x = Graphics.width - this.width;
		else if (px < 0) {
			console.log("aaa");
			x = (this.hasFace()) ? (Window_Base._faceWidth + (stdP * 2)) : (0);
		}

		var y = (pos[1] - (this.height + 48));
		var py = (this.hasFace()) ? (y - Window_Base._faceWidth - (stdP * 2)) : (y);
		if (y < 0)
			y = 0;
		else if (py > Graphics.height)
			y = (this.hasFace()) ? (Graphics.height - Window_Base._faceHeight - (stdP *2)) : (Graphics.height - this.height);
		this.move(x, y, this.width, this.height);
	};

	Window_Message.prototype.updatePlacement = function() {
		if ($.characterFocus < 0) {
		    this._positionType = $gameMessage.positionType();
		    this.y = this._positionType * (Graphics.boxHeight - this.height) / 2;
		    this._goldWindow.y = this.y > 0 ? 0 : Graphics.boxHeight - this._goldWindow.height;
		}
	};

	Window_Message.prototype.drawMessageFace = function() {
		if ($.characterFocus >= 0)
	    	this._faceWindow.drawMessageFace($gameMessage.faceName(), $gameMessage.faceIndex());
	    else
    		this.drawFace($gameMessage.faceName(), $gameMessage.faceIndex(), 0, 0);
	};

	Window_Message.prototype.newLineX = function() {
	    return $gameMessage.faceName() === '' || $.characterFocus >= 0 ? 0 : 168;
	};

	var _Window_Message_newPage = Window_Message.prototype.newPage;

	Window_Message.prototype.newPage = function(textState) {
		_Window_Message_newPage.call(this, textState);
		this._faceWindow.contents.clear();
		if (this.hasFace() && $.characterFocus >= 0)
			this._faceWindow.show();
		else
			this._faceWindow.hide();
	};

	Window_Message.prototype.hasFace = function() {
		return !($gameMessage.faceName() === '');
	}

	//-----------------------------------------------------------------------------
	// Window_Message_Face
	//

	function Window_Message_Face() {
		this.initialize.apply(this, arguments);
	}

	Window_Message_Face.prototype = Object.create(Window_Base.prototype);
	Window_Message_Face.prototype.constructor = Window_Message_Face;

	Window_Message_Face.prototype.initialize = function(width, height) {
		var stdP = this.standardPadding();
		Window_Base.prototype.initialize.call(this, -width - (stdP * 2), 0, width + (stdP * 2), height + (stdP));
	};

	Window_Message_Face.prototype.drawMessageFace = function(faceName, faceIndex) {
		this.drawFace(faceName, faceIndex, 0, 0);
	};

	Window_Message_Face.prototype.standardPadding = function() {
	    return $.facePadding;
	};

	//-----------------------------------------------------------------------------
	// Plugin command
	//

	var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;

	Game_Interpreter.prototype.pluginCommand = function (command, args) {
  		_Game_Interpreter_pluginCommand.call(this, command, args);
  		if (command == "MessagePlus") {
  			if (args[0] == "set") {
  				$.characterFocus = parseInt(args[1]);
  			}

  			if (args[0] == "off") {
  				$.characterFocus = -1;
  			}
  		}
  	};

	//-----------------------------------------------------------------------------
	// DataManager
	//

	var _DataManager_makeSaveContents = DataManager.makeSaveContents;

	DataManager.makeSaveContents = function() {
		contents = _DataManager_makeSaveContents.call(this);
		contents.ktkMessagePlus_characterFocus = $.characterFocus * 548;
		return contents;
	};

	var _DataManager_extractSaveContents = DataManager.extractSaveContents;

	DataManager.extractSaveContents = function(contents) {
		_DataManager_extractSaveContents.call(this, contents);
		$.characterFocus = contents.ktkMessagePlus_characterFocus / 548;
	};
})(TTK.MessagePlus);
