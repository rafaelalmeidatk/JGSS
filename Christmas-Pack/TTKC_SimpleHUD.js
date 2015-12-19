//=============================================================================
// TTKC - Simple HUD
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
  * @plugindesc Displays information about the first team player

  * <TTKC SimpleHUD>
  * @help
  * ===========================================================================
  * ● Explicação
  * ===========================================================================
  * Displays information about the first team player: name, HP, MP and level
  *
  * ===========================================================================
  * ● Important notes
  * ===========================================================================
  * The HUD displays the first group member information (the leader), if it is
  * changed, the HUD will update automatically.

	@param Initial visibility
	@desc The HUD will start visible? Yes: true | No: false
	@default true

	@param Font size
	@desc Font size of the HUD
	@default 16

	@param Opacity
	@desc Window transparency amount. 0 = 100% transparent, 255 = 100% opaque.
	@default 200
*/

/*:pt
  * @author Fogomax
  * @plugindesc Exibe informações sobre o primeiro jogador da equipe

  * <TTKC SimpleHUD>
  * @help
  * ===========================================================================
  * ● Explicação
  * ===========================================================================
  * Exibe informações sobre o primeiro jogador da equipe: nome, HP, MP e nível
  *
  * ===========================================================================
  * ● Observações
  * ===========================================================================
  * A HUD exibe as informações do primeiro membro do grupo (o líder), caso ele
  * seja mudado, a HUD irá se atualizar automaticamente.

	@param Initial visibility
	@desc A HUD iniciará visível? Sim: true | Não: false
	@default true

	@param Font size
	@desc Tamanho da fonte na HUD
	@default 16

	@param Opacity
	@desc Quantidade de transparência da janela. 0 = 100% transparente,
	255 = 100% opaco.
	@default 200
*/

var Imported = Imported || {};
Imported["TTKC_SimpleHUD"] = "1.0.0";

var TTK = TTK || {};
TTK.SimpleHUD = {};

"use strict";

(function($) {
	$.Params = $plugins.filter(function(p) { return p.description.contains('<TTKC SimpleHUD>'); })[0].parameters;

	//-----------------------------------------------------------------------------
	// Plugin global variables
	//

	$.on = ($.Params['Initial visibility'] === 'true');
	$.fontSize = parseInt($.Params['Font size']);
	$.opacity = parseInt($.Params['Opacity']);

	//-----------------------------------------------------------------------------
	// Scene_Map
	//

	var _Scene_Map_createAllWindows = Scene_Map.prototype.createAllWindows;

	Scene_Map.prototype.createAllWindows = function() {
		_Scene_Map_createAllWindows.call(this);
		this._windowSimpleHud = new Window_Simple_HUD();
		this.addChild(this._windowSimpleHud);
	};

	//-----------------------------------------------------------------------------
	// Window_Simple_HUD
	//

	function Window_Simple_HUD() {
		this.initialize.apply(this, arguments);
	};

	Window_Simple_HUD.prototype = Object.create(Window_Base.prototype);
	Window_Simple_HUD.prototype.constructor = Window_Simple_HUD;

	Window_Simple_HUD.prototype.initialize = function() {
		Window_Base.prototype.initialize.call(this, 0, 0, 250, 160);
		this.contents.fontSize = $.fontSize;
		this.opacity = $.opacity;
		this._lastStats = [];
		this._needDraw = true;
		this._actor = $gameParty.members()[0];
		this._lastActor = this._actor;
	}

	Window_Simple_HUD_drawBasicInfo = Window_Status.prototype.drawBasicInfo;

	Window_Simple_HUD.prototype.update = function() {
		if ($.on && !this.visible) this.show();
		else if (!$.on && this.visible) this.hide();
		if (!this.visible) return;

		if (this._lastActor != $gameParty.members()[0]) {
			this._actor = $gameParty.members()[0];
			this._lastActor = this._actor;
			this._needDraw = true;
		}

		var updatedStats = [this._actor.name(), this._actor.hp, this._actor.mp, this._actor.level];

		if (this._needDraw || updatedStats.join() != this._lastStats.join()) {
			this.contents.clear();
			this.drawTextEx(this._actor.name(), 0, 0);
			this.drawActorHp(this._actor, 0, this.contents.fontSize + 5, this.width - this.standardPadding() * 2);
			this.drawActorMp(this._actor, 0, this.contents.fontSize * 2 + 18, this.width - this.standardPadding() * 2);
			this.drawActorLevel(this._actor, 0, this.contents.fontSize * 3 + 35, this.width - this.standardPadding() * 2);
			this._lastStats = [this._actor.name(), this._actor.hp, this._actor.mp, this._actor.level];
			if (this._needDraw) this._needDraw = false;
		}
	}

	//-----------------------------------------------------------------------------
	// Plugin command
	//

	var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;

	Game_Interpreter.prototype.pluginCommand = function(command, args) {
  		_Game_Interpreter_pluginCommand.call(this, command, args);
  		if (command == "SimpleHUD") {
  			switch(args[0].toLowerCase()) {
  				case "on":
  					$.on = true;
  					break;

  				case "off":
  					$.on = false;
  					break;
  			}
  		}
  	};
})(TTK.SimpleHUD);
