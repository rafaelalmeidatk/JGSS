//=============================================================================
// TTKCC - Items HUD (v1.1.2)
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
  * @plugindesc Create a HUD items in a corner of the screen
  *
  * <TTKC ItemsHUD>
  * @help
  * ===========================================================================
  * ● Explanation
  * ===========================================================================
  * Create a HUD items in a corner of the screen, showing its icon and the
  * amount of items that the team has.

  * ===========================================================================
  * ● How to Use
  * ===========================================================================
  * Make the following calls in Plugin commands (3rd tab in the event
  * commands):

  * * ItemsHUD On - shows the HUD

  * * ItemsHUD Off - hides HUD

  * * ItemsHUD AddItem x - adds an item with ID x on the HUD

  * * ItemsHUD RemoveItem x - removes an item with ID x on the HUD

  * * ItemsHUD SetPosition x y - put the HUD in the position "x" where "x" can
  * be "top-left", "top-middle", "top-right", "bottom-left", "bottom-middle"
  and "bottom-right". E.g.:
  * "ItemsHUD SetPosition bottom-left"

	@param Items
	@desc Place the ID of the initial items separated by commas. E.g.: 1, 2, 3
	@default 1, 2

	@param Initial vision
	@desc The window will be appearing at the beginning of the game? Yes: true | No: false
	@default false

	@param Initial position
	@desc Avaliable values: "top-left", "top-middle", "top-right", "bottom-left", "bottom-middle" and "bottom-right"
	@default top-left
*/

/*:pt
  * @author Fogomax
  * @plugindesc Cria uma HUD de itens em um canto da tela

  * <TTKC ItemsHUD>
  * @help
  * ===========================================================================
  * ● Explicação
  * ===========================================================================
  * Cria uma HUD de itens em um canto da tela, mostrando seu ícone e a
  * quantidade de items que a equipe possui.

  * ===========================================================================
  * ● Como usar
  * ===========================================================================
  * Faça as seguintes chamadas nos Comandos de Plugin (3ª aba nos comandos de
  * eventos):

  * * ItemsHUD On - mostra a HUD

  * * ItemsHUD Off - esconde a HUD

  * * ItemsHUD AddItem x - adiciona um item de ID x na HUD

  * * ItemsHUD RemoveItem x - remove o item de ID x da HUD

  * * ItemsHUD RemoveItem position - coloca a HUD na posição "position", sendo
  * ela: "top-left", "top-middle", "top-right", "bottom-left", "bottom-middle"
  * ou "bottom-right".

	@param Items
	@desc Coloque o ID dos itens iniciais separados por vírgula. Exemplo: 1, 2, 3
	@default 1, 2

	@param Initial vision
	@desc A janela estará aparecendo no início do jogo? Sim: true | Não: false
	@default false

	@param Initial position
	@desc  Valores disponíveis: "top-left", "top-middle", "top-right", "bottom-left", "bottom-middle" e "bottom-right"
	@default top-left
*/

var Imported = Imported || {};
Imported["TTKC_ItemsHUD"] = "1.1.2";

var TTK = TTK || {};
TTK.ItemsHUD = {};

"use strict";

(function($) {
	$.Params = $plugins.filter(function(p) { return p.description.contains('<TTKC ItemsHUD>'); })[0].parameters;

	//-----------------------------------------------------------------------------
	// Plugin global variables
	//

	$.TOP_LEFT = 0;
	$.TOP_MIDDLE = 1;
	$.TOP_RIGHT = 2;
	$.BOTTOM_LEFT = 3;
	$.BOTTOM_MIDDLE = 4;
	$.BOTTOM_RIGHT = 5;

	$.items = $.Params['Items'].split(',').map(Number).filter(Boolean);
	$.on = ($.Params["Initial vision"].toLowerCase() === 'true');
	setPositionByName($.Params['Initial position'].toLowerCase());
	$.lastItemsValues = [];

	//-----------------------------------------------------------------------------
	// Scene_Map
	//

	var _Scene_Map_createAllWindows = Scene_Map.prototype.createAllWindows;

	Scene_Map.prototype.createAllWindows = function() {
		_Scene_Map_createAllWindows.call(this);
		this._windowItemsHud = new Window_Items_HUD();
		this.addChild(this._windowItemsHud);
	};

	//-----------------------------------------------------------------------------
	// Window_Items_HUD
	//

	function Window_Items_HUD() {
		this.initialize.apply(this, arguments);
	};

	Window_Items_HUD.prototype = Object.create(Window_Base.prototype);
	Window_Items_HUD.prototype.constructor = Window_Items_HUD;

	Window_Items_HUD.prototype.initialize = function() {
		Window_Base.prototype.initialize.call(this, 0, 0, Graphics.width, 48 + this.standardPadding());
		this.setPosition();
		this.opacity = 0;
		this._lastPos = -1;
		this._firstDraw = true;
	};

	Window_Items_HUD.prototype.update = function() {
		if ($.on && !this.visible) {
			this.show();
		} else if (!$.on && this.visible) {
			this.hide();
		}

		if (!this.visible)
			return;

		if (this._lastPos != $.position)
			this.setPosition();

		var newValues = [];
		for (var i = 0; i < $.items.length; i++)
			newValues.push($gameParty.numItems($dataItems[$.items[i]]));

		if (newValues.join() !== $.lastItemsValues.join() || this._firstDraw) {
			this.contents.clear();

			var lastSpace = 0;

			for (var i = 0; i < $.items.length; i++) {
				this.drawIcon($dataItems[$.items[i]].iconIndex, i * 32 + lastSpace, 0);
				this.drawTextEx(newValues[i].toString(), i * 32 + 40 + lastSpace, 2);
				lastSpace += 40 + this.textWidth(newValues[i]);
			}

			var w = lastSpace;
			this.width = lastSpace + 40 + this.textWidth(newValues[0]) + this.textWidth(newValues[newValues.length - 1]);
			this._lastPos = null;

			$.lastItemsValues = newValues;
			if (this._firstDraw) _firstDraw = false;
		}
	};

	Window_Items_HUD.prototype.standardPadding = function() {
		return 10;
	};

	Window_Items_HUD.prototype.setPosition = function() {
		switch ($.position) {
			case $.TOP_LEFT:
				this.y = 0;
				this.x = 0;
				break;

			case $.TOP_MIDDLE:
				this.y = 0;
				this.x = (Graphics.width - this.width) / 2;
				break;

			case $.TOP_RIGHT:
				this.y = 0;
				this.x = Graphics.width - this.width;
				break;

			case $.BOTTOM_LEFT:
				this.y = Graphics.height - this.height;
				this.x = 0;
				break;

			case $.BOTTOM_MIDDLE:
				this.y = Graphics.height - this.height;
				this.x = (Graphics.width - this.width) / 2;
				break;

			case $.BOTTOM_RIGHT:
				this.y = Graphics.height - this.height;
				this.x = Graphics.width - this.width;
				break;
		}

		this._lastPos = $.position;
	};

	//-----------------------------------------------------------------------------
	// Plugin command
	//

	var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;

	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		_Game_Interpreter_pluginCommand.call(this, command, args);
		if (command == "ItemsHUD") {
			switch(args[0]) {
				case "On":
					$.on = true;
					break;

				case "Off":
					$.on = false;
					break;

				case "AddItem":
					var itemId = parseInt(args[1]);
					if (!~$.items.indexOf(itemId))
						$.items.push(itemId);
					break;

				case "RemoveItem":
					var itemId = parseInt(args[1]);
					if (~$.items.indexOf(itemId))
						$.items.splice($.items.indexOf(parseInt(itemId)), 1);
					break;

				case "SetPosition":
					setPositionByName(args[1].toLowerCase());
					break;
			}
		}
	};

	function setPositionByName(name) {
		switch(name) {
			case "top-left":
				$.position = $.TOP_LEFT;
				break;
			case "top-middle":
				$.position = $.TOP_MIDDLE;
				break;
			case "top-right":
				$.position = $.TOP_RIGHT;
				break;
			case "bottom-left":
				$.position = $.BOTTOM_LEFT;
				break;
			case "bottom-middle":
				$.position = $.BOTTOM_MIDDLE;
				break;
			case "bottom-right":
				$.position = $.BOTTOM_RIGHT;
				break;
			default:
				$.position = 0;
				break;
		}
	}
})(TTK.ItemsHUD);
