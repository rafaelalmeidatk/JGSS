//=============================================================================
// TTKCC - Items HUD (v1.0.2)
// by Fogomax
// Licença: Attribution-ShareAlike 4.0 International - Creative Commons
//=============================================================================

//=============================================================================
// * Esse plugin faz parte do meu pack de Natal, que contém varios outros
// * plugins simples e úteis. Link para o pack completo:
// * https://github.com/rafaelalmeidatk/JGSS/tree/master/Christmas-Pack
//=============================================================================
 
/*:
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

    @param Itens
    @desc Coloque o ID dos itens iniciais separados por vírgula. Exemplo: 1, 2, 3
    @default 1, 2

    @param Visão inicial
    @desc A janela estará aparecendo no início do jogo? Sim: true | Não: false
    @default false

    @param Posição inicial
    @desc "top" para aparecer em cima da tela e "bottom" para aparecer embaixo da tela
    @default top
 */

var Imported = Imported || {};
Imported["TTKC_ItemsHUD"] = "1.0.1";

var TTK = TTK || {};
TTK.ItemsHUD = {};

"use strict";

(function($) {
	$.Params = $plugins.filter(function(p) { return p.description.contains('<TTKC ItemsHUD>'); })[0].parameters;

	//-----------------------------------------------------------------------------
	// Plugin global variables
	//

	$.items = $.Params['Itens'].split(',').map(Number).filter(Boolean);
	$.on = ($.Params["Visão inicial"].toLowerCase() === 'true');
	$.position = ($.Params['Posição inicial'].toLowerCase() === 'bottom' ? 1 : 0);
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
