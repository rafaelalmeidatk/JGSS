//=============================================================================
// TTKC - Simple Event Popup Name (v1.0.2)
// by Fogomax
// License: Attribution-ShareAlike 4.0 International - Creative Commons
//=============================================================================

//=============================================================================
// * This plugin is part of my Christmas pack, which contains several other
// * simple and useful plugins. Link to the full pack:
// * https://github.com/rafaelalmeidatk/JGSS/tree/master/Christmas-Pack
//=============================================================================

/*:
  * @author Fogomax
  * @plugindesc Adds a popup with a name in events
  *
  * <TTKC SimpleEventPopupName>
  * @help
  * ===========================================================================
  * ● Explanation
  * ===========================================================================
  * Adds a popup with a name in events
  *
  * ===========================================================================
  * ● How to Use
  * ===========================================================================
  * Place the following tag within a comment in the desired page of the event:
  *
  * * <PopupName=x> - Creates a popup with the name "x".
  *                   Example: <PopupName = Max>
  *
  * Custom tags (must be accompanied name):
  *
  * * <FloatPopup> - The popup will be floating
  *
  * * <PopupOffset=x> - The popup will rise x pixels. This tag accepts negative
  *                     numbers, they will make the popup go down.

    @param Font size
    @desc Font size
    @default 18

    @param Offset Y
    @desc Standard distance of the popup from the event in the Y axis.
    Positive numbers will rise, negative will make it go down.
    @default 10
 */

/*:pt
  * @author Fogomax
  * @plugindesc Adiciona um popup com um nome em eventos
  * <TTKC SimpleEventPopupName>
  * @help
  * ===========================================================================
  * ● Explicação
  * ===========================================================================
  * Adiciona um popup com um nome em eventos
  *
  * ===========================================================================
  * ● Como usar
  * ===========================================================================
  * Coloque a seguinte tag dentro de um comentário na página desejada do
  * evento:
  *
  * * <PopupName=x> - Criará um popup com o nome "x". Exemplo: <PopupName=Max>
  *
  * Tags de personalização (devem vir acompanhadas do nome):
  *
  * * <FloatPopup> - O popup ficará flutuando
  *
  * * <PopupOffset=x> - O popup subirá x pixels. Essa tag aceita números
  * negativos, eles irão fazer o popup descer.

    @param Font size
    @desc Tamanho da fonte
    @default 18

    @param Offset Y
    @desc Distância padrão que o popup ficará do evento no eixo Y. Números
    positivos o farão subir, negativos irão fazê-lo descer.
    @default 10
 */

"use strict";

var Imported = Imported || {};
Imported["TTKC_SimpleEventPopupName"] = "1.0.2";

var TTK = TTK || {};
TTK.SimpleEventPopupName = {};

(function($) {
	$.Params = $plugins.filter(function(p) { return p.description.contains('<TTKC SimpleEventPopupName>'); })[0].parameters;

	//-----------------------------------------------------------------------------
	// Plugin global variables
	//

	$.fontSize = parseInt($.Params['Font size']);
	$.defaultOffset = parseInt($.Params['Offset Y']);
	$.popupNames = [];

	//-----------------------------------------------------------------------------
	// Scene_Map
	//

	var _Scene_Map_onMapLoaded = Scene_Map.prototype.onMapLoaded;

	Scene_Map.prototype.onMapLoaded = function() {
		_Scene_Map_onMapLoaded.call(this);
	    $.popupNames.forEach(function(popupName) {
	        this._spriteset.addEventPopupName(popupName);
	    }, this);
	};

	//-----------------------------------------------------------------------------
	// Game_Event
	//

	var _Game_Event_setupPage = Game_Event.prototype.setupPage;

	Game_Event.prototype.setupPage = function() {
		_Game_Event_setupPage.call(this);
		if (!this._erased && this.page()) {
			var name = "";
			var floatPopup = false;
			var offset = null;

			for (var i = 0; i < this.page().list.length; i++) {
				if (this.page().list[i].code == "108" || this.page().list[i].code == "408") {
					if (/<PopupName=/.test(this.page().list[i].parameters[0])) {
						name = this.page().list[i].parameters[0].match(/<PopupName=(.+)>/)[1];
					}

					if (/<FloatPopup>/.test(this.page().list[i].parameters[0]))
						floatPopup = true;

					if (/<PopupOffset=/.test(this.page().list[i].parameters[0]))
						offset = parseInt(this.page().list[i].parameters[0].match(/<PopupOffset=([+|-]?\d+)>/)[1], 10);
				}
			}

			if (offset == null)
				offset = $.defaultOffset;

			if (name != "" && !$.popupNames[this.eventId()]) {
				var popupName = new EventPopupName(name, this, floatPopup, offset);
				$.popupNames[this.eventId()] = popupName
			} else if (name != "" && $.popupNames[this.eventId()]) {
				$.popupNames[this.eventId()].renovate(name, floatPopup, offset);
			} else if ($.popupNames[this.eventId()]) {
				$.popupNames[this.eventId()].remove();
				$.popupNames[this.eventId()] = null;
			}
		}
	};

	//-----------------------------------------------------------------------------
	// Spriteset_Map
	//

	Spriteset_Map.prototype.addEventPopupName = function(instance) {
		this._baseSprite.addChild(instance);
	}

	//-----------------------------------------------------------------------------
	// EventPopupName
	//

	function EventPopupName() {
		this.initialize.apply(this, arguments);
	}

	EventPopupName.prototype = Object.create(Sprite_Base.prototype);
	EventPopupName.prototype.constructor = EventPopupName;

	EventPopupName.prototype.initialize = function(name, target, floatPopup, offset) {
		Sprite_Base.prototype.initialize.call(this);
		this._name = name;
		this._target = target;
		this._floatPopup = floatPopup;
		this._offsetY = offset;
		var width = name.length * ($.fontSize + 2);
		this.bitmap = new Bitmap(width, $.fontSize);
    	this.bitmap.fontSize = $.fontSize;
		this._lastPos = [-1, -1];
    	this.setInitialPos();
		this._lastName = "";
		this._limitFloatY = [this.y - 5, this.y + 5];
		this._floatYSide = 0;
		this._floatTick = 0;
		this._dontMoveY = false;
		this._dontFloat = false;
	}

	EventPopupName.prototype.update = function() {
		this._incY = 0;
		this._incX = 0;

		if (this._target.screenX() != this._lastPos[0] || this._target.screenY() != this._lastPos[1]) {
			this._incX += this._target.screenX() - this._lastPos[0];
			this._incY += this._target.screenY() - this._lastPos[1];

			this._limitFloatY[0] += this._incY;
			this._limitFloatY[1] += this._incY;

			this._lastPos[0] = this._target.screenX();
			this._lastPos[1] = this._target.screenY();
		}

		if (this._floatPopup && this._floatTick <= 0 && !this._dontFloat) {
			if (this._floatYSide === 0) {
				this.y++;
				if (this.y >= this._limitFloatY[1]) {
					this._floatYSide = 1;
				}
			}
			else {
				this.y--;
				if (this.y <= this._limitFloatY[0])
					this._floatYSide = 0;
			}
			this._floatTick = 2;
		} else if (this._floatPopup) {
			this._floatTick--;
		}

		this.y += this._incY;
		this.x += this._incX;

		if (this._name != this._lastName) {
			this.bitmap.clear();
			this.bitmap.drawText(this._name, 0, 0, this.bitmap.width, this.bitmap.fontSize, "center");
			this._lastName = this._name;
		}
	}

	EventPopupName.prototype.setName = function(name) {
		this._name = name;
	}

	EventPopupName.prototype.renovate = function(name, floatPopup, offset) {
		this._name = name;
		this._floatPopup = floatPopup;
		this._offsetY = offset;
		this.setInitialPos();
		this._limitFloatY = [this.y - 5, this.y + 5];
		if (this._floatPopup) this.y = this._limitFloatY[0];
	}

	EventPopupName.prototype.setInitialPos = function() {
		this.x = this._target.screenX() - (this.bitmap.width / 2);
		this.y = this._target.screenY() - this.bitmap.fontSize - 48 - this._offsetY;
		this._lastPos[0] = this._target.screenX();
		this._lastPos[1] = this._target.screenY();
		this._limitFloatY = [this.y - 5, this.y + 5];
	}

	EventPopupName.prototype.remove = function() {
		SceneManager._scene._spriteset._baseSprite.removeChild(this);
		this._target._popupName = null;
	}
})(TTK.SimpleEventPopupName);
