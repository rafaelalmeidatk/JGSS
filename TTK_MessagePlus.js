//======================================================================
// TTK - Message Plus (v1.3.5)
// By Fogomax
//======================================================================

/*:
	* @author Fogomax
	* @plugindesc This plugin improves the default message system, adding new features to it
	* <TTK MessagePlus>
	* @help
    ===========================================================================
    ● Features explanation
    ===========================================================================
    Ballon Texts: when you start the Ballon Texts (setBallon plug-in command),
    every message will have the ballon effect until you disable it. You can set
    the ballon text to a specific event or to the player (ID = 0), to avoid
    setting the event ID every time, leave the ID to "current", with this, the
    ballon will always aim to the current event that is speaking.

    Dialog names: you can show a name with the message using the setName plug-in
    command. Be aware: if the name you want have blank spaces, use the script
    call command instead. When finishing a dialog remember to remove the name
    (with removeName), otherwise the name will be shown in the next message,
    even if it is from a diferent event.

    Animated faces: your faces can have life too! To give a animation to a face,
    create a file with the animation sheets you want and move it to img/faces
    folder. The file need have this name format:
    prefix_index_Filename.png
    Where:
    prefix = the prefix you setted up in the options. Default is "anim_".
    index = the index of the face in your faceset
    Filename = the name of the faceset

    Example:
    You want animate the face with index 0 in Actor1.png (the first one), so
    you will do a file named anim_0_Actor1.png and inset the animations there.
    You use one line per animations, the file does not have width limit. The
    animation frames go from left to right and then go back. Image example:
    http://i.imgur.com/gTQ65mq.png (thanks to TrueCronus)

    The Animated Faces also comes with a special feature: the Speak Animated
    Face. This will run a animation while the text is being writed. You can
    combine the Animated Face with the Speak Animated Face to an awesome effect!

    Tip: always remember to change the Animated Face or disable it when you
    change the message face and it does not have an animation file, or the
    plugin will cause bugs and errors.

    ===========================================================================
    ● Available commands
    ===========================================================================
    - MessagePlus setBallon x
    Creates a Ballon Text on the event of ID x, if 0, the Ballon Texts
    will be on player

    - MessagePlus setBallon current
    Creates a Ballon Text on the event that is showing the message, this can
    be used to avoid set the event ID everytime you want a ballon text

    - MessagePlus removeBallon
    Turn off the Ballon Text, the messages come back to default

    - MessagePlus setName x
    Shows the name window with the name x

    - SCRIPT CALL: this.setMessageName(x)
    Shows the name window with the name x. Use this if the name you want have blank
    spaces (example: "John Rick")

    - MessagePlus removeName
    Hide the name window

    - MessagePlus enableAnimatedFace a b c,d
    Enable the Animated Face to the next message that has a face.
    a = The vertical row of the desired animation (starting from 1)
    b = The number of frames the animation have (starting from 1)
    c,d = The delay between a animation and other, using this format: min,max
    To a constant animation, dont write a value to c,d

    - MessagePlus setSpeakAnimatedFace a b
    Enable the Speak Animated Face to the next message that has a face.
    a = The vertical row of the speak animation (starting from 1)
    b = The number of frames the animation have (starting from 1)

    - MessagePlus disableAnimatedFace
    Disable the Animated Face

	@param Face Padding
	@desc The padding (in pixels) of the face window
	@default 8

	@param Window Name Height
	@desc The height (in pixels) of the name window
	@default 50

	@param Window Name Dim
	@desc If the main message window dim, the name window will do too?
	@default true

	@param Animated Faces Prefix
	@desc Prefix used in the animated faces files (e.g. anim_0_Actor1.png)
	@default anim_
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
	$.windowNameHeight = parseInt($.Params["Window Name Height"]);
	$.windowNameDim = ($.Params["Window Name Dim"] === 'true');
	$.characterFocus = -1;
	$.characterFocusCurrent = false;
	$.messageName = "";

	$.animatedFacesPrefix = $.Params["Animated Faces Prefix"];
	$.animatedFace = false;
	$.animatedFaceSprite;
	$.afMaxFrames = 0;
	$.afY = -1;
	$.afFrame = 0;
	$.afTick = 0;
	$.afTickMax = 6;
	$.afFrameSide = 0; // 0: to right | 1: to left
	$.afDelay = [0, 0];
	$.afSpeakY = -1;
	$.afSpeakFrames = 0;

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
		SceneManager._scene._messageWindow.refreshBackground();
	};

	//-----------------------------------------------------------------------------
	// Game_Map
	//

	Game_Map.prototype.getInterpreter = function() {
	    return this._interpreter;
	};

	//-----------------------------------------------------------------------------
	// Scene_Map
	//

	var _Scene_Map_initialize = Scene_Map.prototype.initialize;

	Scene_Map.prototype.initialize = function() {
		_Scene_Map_initialize.call(this);
	};

	var _Scene_Map_update = Scene_Map.prototype.update;

	Scene_Map.prototype.update = function() {
		_Scene_Map_update.call(this);
		if ($gameMessage.hasText())
			this._messageWindow.updateFaceAnimation()
	}

	//-----------------------------------------------------------------------------
	// Window_Message
	//
	var _Window_Message_initialize = Window_Message.prototype.initialize;

	Window_Message.prototype.initialize = function() {
		_Window_Message_initialize.call(this);
		this._faceWindow = new Window_Message_Face(Window_Base._faceWidth, Window_Base._faceWidth);
		this._faceWindow.hide();
		this._nameWindow = new Window_Message_Name(this);
		this._nameWindow.hide();
		this._animatedFaceSprite = new Sprite();
		this.addChild(this._faceWindow);
		this.addChild(this._nameWindow);
		this._allowAfUpdate = false;
	};

	var _Window_Message_open = Window_Message.prototype.open;

	Window_Message.prototype.open = function() {
		_Window_Message_open.call(this);
		this._faceWindow.open();
		this._nameWindow.open();
	};

	var _Window_Message_close = Window_Message.prototype.close;

	Window_Message.prototype.close = function() {
		_Window_Message_close.call(this);
		this._faceWindow.close();
		this._nameWindow.close();
	};

	Window_Message.prototype.refreshSize = function(texts) {
		this._nameWindow.refreshSize();
		if ($.characterFocus < 0 && !$.characterFocusCurrent) {
			this.width = this.windowWidth();
			this.height = this.windowHeight();
		} else {
			var width = 0;
			for (var i = 0; i < texts.length; i++) {
				width = (this.textWidth(texts[i]) > width) ? this.textWidth(texts[i]) : width;
			}
			var stdP = this._faceWindow.standardPadding();
			var maxWidth = (this.hasFace()) ? (Graphics.width - Window_Base._faceWidth - (stdP * 2)) : (Graphics.width);
			var width = width + (this.standardPadding() * 1.5) + (this.textPadding() * 2);
			this.width = ((this.hasFace() && width + Window_Base._faceWidth - (stdP * 2) > Graphics.width) || width > Graphics.width) ? (maxWidth) : (width);
			this.height = this.fittingHeight(texts.length);
		}
	};

	Window_Message.prototype.refreshPosition = function() {
		if ($.characterFocus < 0 && !$.characterFocusCurrent) {
			this.x = 0;
		} else {
			if ($.characterFocusCurrent)
				$.characterFocus = $gameMap.getInterpreter().eventId();

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
				x = (this.hasFace()) ? (Window_Base._faceWidth + (stdP * 2)) : (0);
			}

			var y = (pos[1] - (this.height + 48));
			var py = (this.hasFace()) ? (y - Window_Base._faceWidth - (stdP * 2)) : (y);
			if (y < 0)
				y = 0;
			else if (py > Graphics.height)
				y = (this.hasFace()) ? (Graphics.height - Window_Base._faceHeight - (stdP *2)) : (Graphics.height - this.height);
			this.move(x, y, this.width, this.height);
		}
		this._nameWindow.refreshPosition();
	};

	Window_Message.prototype.refreshBackground = function() {
		this._nameWindow.refreshBackground();
	};

	Window_Message.prototype.updatePlacement = function() {
		if ($.characterFocus < 0) {
		    this._positionType = $gameMessage.positionType();
		    this.y = this._positionType * (Graphics.boxHeight - this.height) / 2;
		    this._goldWindow.y = this.y > 0 ? 0 : Graphics.boxHeight - this._goldWindow.height;
		}
	};

	Window_Message.prototype.updateFaceAnimation = function() {
		if (this.hasFace() && $.animatedFace && this._allowAfUpdate) {
			if ($.afDelayTick > 0) {
				$.afDelayTick--;
			} else {
				$.afTick++;
				if ($.afTick >= $.afTickMax) {
					if ($.afFrameSide == 0) {
						$.afFrame++;
						if ($.afFrame >= $.afMaxFrames || ($.afFrame >= $.afSpeakFrames && this._textState)) {
							$.afFrameSide = 1;
						}
						$.afTick = 0;
					}
					else {
						$.afFrame--;
						if ($.afFrame <= 0) {
							$.afFrameSide = 0;
							if ($.afDelay[1] > 0 && (this._textState == null || $.afSpeakY < 0)) {
								$.afDelayTick =  ~~(Math.random() * ($.afDelay[1] - $.afDelay[0] + 1) + $.afDelay[0]);
							}
						}
						$.afTick = 0;
					}
				}
				this.drawMessageFace();
			}
		}
	};

	var _Window_Message_startMessage = Window_Message.prototype.startMessage;

	Window_Message.prototype.startMessage = function() {
		_Window_Message_startMessage.call(this);
		$.afFrame = 0;
		$.afDelayTick = 0;
	};

	Window_Message.prototype.drawMessageFace = function() {
		if ($.animatedFace)
			var fileName = $.animatedFacesPrefix + $gameMessage.faceIndex() + "_" + $gameMessage.faceName();
		if ($.characterFocus >= 0)
			if ($.animatedFace)
	    		this._faceWindow.drawMessageFace(fileName, $.afFrame, this._textState);
	    	else
	    		this._faceWindow.drawMessageFace($gameMessage.faceName(), $gameMessage.faceIndex(), this._textState);
	    else {
	    	if ($.animatedFace)
    			this.drawFace(fileName, $.afFrame, 0, 0);
    		else
    			this.drawFace($gameMessage.faceName(), $gameMessage.faceIndex(), 0, 0);
	    }
	};

	Window_Message.prototype.newLineX = function() {
	    return $gameMessage.faceName() === '' || $.characterFocus >= 0 ? 2 : 168;
	};

	var _Window_Message_newPage = Window_Message.prototype.newPage;

	Window_Message.prototype.newPage = function(textState) {
		this._allowAfUpdate = false;
		_Window_Message_newPage.call(this, textState);

		this._faceWindow.contents.clear();
		if (this.hasFace() && $.characterFocus >= 0)
			this._faceWindow.show();
		else
			this._faceWindow.hide();

		if (this.hasName()) {
			this._nameWindow.show();
			this._nameWindow.refreshName();
		}
		else
			this._nameWindow.hide();
		this._allowAfUpdate = true;
	};

	Window_Message.prototype.hasFace = function() {
		return !($gameMessage.faceName() === '');
	};

	Window_Message.prototype.hasName = function() {
		return !($.messageName === "");
	};

	Window_Message.prototype.drawFace = function(faceName, faceIndex, x, y, width, height) {
		if ($.animatedFace && $.afSpeakY >= 0 && !this._textState && $.afY < 0) {
			faceName = $gameMessage.faceName();
			faceIndex = $gameMessage.faceIndex();
		}
	    width = width || Window_Base._faceWidth;
	    height = height || Window_Base._faceHeight;
	    var bitmap = ImageManager.loadFace(faceName);
	    var pw = Window_Base._faceWidth;
	    var ph = Window_Base._faceHeight;
	    var sw = Math.min(width, pw);
	    var sh = Math.min(height, ph);
	    var dx = Math.floor(x + Math.max(width - pw, 0) / 2);
	    var dy = Math.floor(y + Math.max(height - ph, 0) / 2);
	    var sx = faceIndex % 4 * pw + (pw - sw) / 2;
	    var sy = Math.floor(faceIndex / 4) * ph + (ph - sh) / 2;
		if ($.animatedFace && $.afSpeakY >= 0 && this._textState) {
			sx = faceIndex * pw;
			sy = ph * $.afSpeakY;
		} else if ($.animatedFace && $.afY >= 0 && !this._textState) {
			sx = faceIndex * pw;
			sy = ph * $.afY;
		}
		this.contents.clearRect(dx, dy, pw, ph);
	    this.contents.blt(bitmap, sx, sy, sw, sh, dx, dy);
	}

	//-----------------------------------------------------------------------------
	// Window_Message_Face
	//

	function Window_Message_Face() {
		this.initialize.apply(this, arguments);
		this._textState = null;
	};

	Window_Message_Face.prototype = Object.create(Window_Base.prototype);
	Window_Message_Face.prototype.constructor = Window_Message_Face;

	Window_Message_Face.prototype.initialize = function(width, height) {
		var stdP = this.standardPadding();
		Window_Base.prototype.initialize.call(this, -width - (stdP * 2), 0, width + (stdP * 2), height + (stdP));
	};

	Window_Message_Face.prototype.drawMessageFace = function(faceName, faceIndex, textState) {
		this._textState = textState;
		this.drawFace(faceName, faceIndex, 0, 0);
	};

	Window_Message_Face.prototype.standardPadding = function() {
		return $.facePadding;
	};

	Window_Message_Face.prototype.drawFace = function(faceName, faceIndex, x, y, width, height) {
		if ($.animatedFace && $.afSpeakY >= 0 && !this._textState && $.afY < 0) {
			faceName = $gameMessage.faceName();
			faceIndex = $gameMessage.faceIndex();
		}
	    width = width || Window_Base._faceWidth;
	    height = height || Window_Base._faceHeight;
	    var bitmap = ImageManager.loadFace(faceName);
	    var pw = Window_Base._faceWidth;
	    var ph = Window_Base._faceHeight;
	    var sw = Math.min(width, pw);
	    var sh = Math.min(height, ph);
	    var dx = Math.floor(x + Math.max(width - pw, 0) / 2);
	    var dy = Math.floor(y + Math.max(height - ph, 0) / 2);
	    var sx = faceIndex % 4 * pw + (pw - sw) / 2;
	    var sy = Math.floor(faceIndex / 4) * ph + (ph - sh) / 2;
		if ($.animatedFace && $.afSpeakY >= 0 && this._textState) {
			sx = faceIndex * pw;
			sy = ph * $.afSpeakY;
		} else if ($.animatedFace && $.afY >= 0 && !this._textState) {
			sx = faceIndex * pw;
			sy = ph * $.afY;
		}
		this.contents.clearRect(dx, dy, pw, ph);
	    this.contents.blt(bitmap, sx, sy, sw, sh, dx, dy);
	}

	//-----------------------------------------------------------------------------
	// Window_Message_Name
	//

	function Window_Message_Name(_windowMain) {
		this.initialize.apply(this, arguments);
		this.windowMain = _windowMain;
	};

	Window_Message_Name.prototype = Object.create(Window_Base.prototype);
	Window_Message_Name.prototype.constructor = Window_Message_Name;

	Window_Message_Name.prototype.initialize = function(width, height) {
		Window_Base.prototype.initialize.call(this, 0, 0, Graphics.width, $.windowNameHeight);
	};

	Window_Message_Name.prototype.drawName = function(name) {
		this.contents.textColor = "#EED99E";
		this.drawText(name, 0, 0, this.width - this.textPadding(), "center");
	};

	Window_Message_Name.prototype.refreshSize = function() {
		this.width = this.textWidth($.messageName) + 60 + (this.standardPadding() * 2);
	};

	Window_Message_Name.prototype.refreshPosition = function() {
		var x = 0;
		var y = -this.height;
		if (($gameMessage.positionType() == 0 || this.windowMain.y - -y < 0) && $gameMessage.positionType() != 1 && $gameMessage.positionType() != 2)
			var y = this.windowMain.height;
		if (this.windowMain.x + this.width > Graphics.width)
			x = (Graphics.width - this.width) - this.windowMain.x;
		this.move(x, y, this.width, this.height);
	};

	Window_Message_Name.prototype.refreshBackground = function() {
		if ($.windowNameDim)
			this.setBackgroundType($gameMessage.background());
	};

	Window_Message_Name.prototype.refreshName = function() {
		this.contents.clear();
		this.contents.width = this.width;
		this.drawName($.messageName);
	};

	Window_Message_Name.prototype.standardPadding = function() {
		return 5;
	};

	Window_Message_Name.prototype.lineHeight = function() {
		return $.windowNameHeight - this.standardPadding() * 2;
	};

	//-----------------------------------------------------------------------------
	// Plugin command
	//

	var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;

	Game_Interpreter.prototype.pluginCommand = function(command, args) {
  		_Game_Interpreter_pluginCommand.call(this, command, args);
  		if (command == "MessagePlus") {
  			if (args[0] == "setBallon") {
  				if (args[1] == "current") {
  					$.characterFocusCurrent = true;
  				} else {
  					$.characterFocusCurrent = false;
  					$.characterFocus = parseInt(args[1]);
  				}
  			}

  			if (args[0] == "removeBallon") {
  				$.characterFocusCurrent = false;
  				$.characterFocus = -1;
  			}

  			if (args[0] == "setName")
  				$.messageName = args[1];

  			if (args[0] == "removeName")
  				$.messageName = "";

  			if (args[0] == "enableAnimatedFace") {
  				$.afY = parseInt(args[1]) - 1;
  				$.afMaxFrames = parseInt(args[2]) - 1;
  				if (args[3]) {
  					$.afDelay = args[3].split(',').map(Number);
  				}
  				else
  					$.afDelay = [0, 0];
  				$.animatedFace = true;
  				$.afFrame = 0;
  			}

  			if (args[0] == "setSpeakAnimatedFace") {
				$.afSpeakY = parseInt(args[1]);
				$.afSpeakFrames = parseInt(args[2] - 1);
  				$.animatedFace = true;
  			}

  			if (args[0] == "disableAnimatedFace") {
  				$.afY = -1;
  				$.afSpeakY = -1;
  				$.animatedFace = false;
  			}
  		}
  	};

  	Game_Interpreter.prototype.setMessageName = function(name) {
  		$.messageName = name;
  	};

	//-----------------------------------------------------------------------------
	// DataManager
	//

	var _DataManager_makeSaveContents = DataManager.makeSaveContents;

	DataManager.makeSaveContents = function() {
		contents = _DataManager_makeSaveContents.call(this);
		contents.ktkMessagePlus_characterFocus = $.characterFocus;
		contents.ktkMessagePlus_characterFocusCurrent = $.characterFocusCurrent;
		return contents;
	};

	var _DataManager_extractSaveContents = DataManager.extractSaveContents;

	DataManager.extractSaveContents = function(contents) {
		_DataManager_extractSaveContents.call(this, contents);
		$.characterFocus = contents.ktkMessagePlus_characterFocus;
  		$.characterFocusCurrent = contents.ktkMessagePlus_characterFocusCurrent;
	};
})(TTK.MessagePlus);
