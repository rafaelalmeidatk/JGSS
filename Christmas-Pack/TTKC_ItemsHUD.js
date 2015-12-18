//=============================================================================
// TTKCC - Items HUD (v1.0.2)
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

  * * ItemsHUD SetPosition x - put the HUD in the position "x" where "x" can
  * be: "top" or "bottom" (without the quotation marks) E. g.:
  * "ItemsHUD SetPosition bottom"

    @param Items
    @desc Place the ID of the initial items separated by commas. E.g.: 1, 2, 3
    @default 1, 2

    @param Initial vision
    @desc The window will be appearing at the beginning of the game? Yes: true | No: false
    @default false

    @param Initial position
    @desc "top" to appear on top of the screen and "bottom" to appear on bottom of the screen
    @default top
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
  * ela: "top": no topo da tela, "bottom": em baixo da tela

    @param Items
    @desc Coloque o ID dos itens iniciais separados por vírgula. Exemplo: 1, 2, 3
    @default 1, 2

    @param Initial vision
    @desc A janela estará aparecendo no início do jogo? Sim: true | Não: false
    @default false

    @param Initial position
    @desc "top" para aparecer em cima da tela e "bottom" para aparecer embaixo da tela
    @default top
*/

var Imported = Imported || {};
Imported["TTKC_ItemsHUD"] = "1.0.2";

var TTK = TTK || {};
TTK.ItemsHUD = {};

"use strict";

(function($) {
	$.Params = $plugins.filter(function(p) { return p.description.contains('<TTKC ItemsHUD>'); })[0].parameters;

	//-----------------------------------------------------------------------------
	// Plugin global variables
	//

	$.items = $.Params['Items'].split(',').map(Number).filter(Boolean);
	$.on = ($.Params["Initial vision"].toLowerCase() === 'true');
	$.position = ($.Params['Initial position'].toLowerCase() === 'bottom' ? 1 : 0);
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
		this.opacity = 0;
		this._lastPos = -1;
		this._firstDraw = true;
	}

	Window_Items_HUD.prototype.update = function() {
		if ($.on && !this.visible) {
			this.show();
		}
		else if (!$.on && this.visible) {
			this.hide();
		}

		if (!this.visible)
			return;

		if (this._lastPos != $.position) {
			if ($.position == 0)
				this.y = 0;
			else
				this.y = Graphics.height - 48;
		}

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

			$.lastItemsValues = newValues;
			if (this._firstDraw) _firstDraw = false;
		}
	}

	Window_Items_HUD.prototype.standardPadding = function() {
	    return 10;
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
  					$.position = (args[1].toLowerCase() === 'top' ? 0 : 1);
  					break;
  			}
  		}
  	};
})(TTK.ItemsHUD);
