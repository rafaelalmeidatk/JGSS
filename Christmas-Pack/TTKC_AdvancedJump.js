//=============================================================================
// TTKC - Advanced Jump
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
  * @plugindesc Permite que o jogador pule ao pressionar a tecla A

  * <TTKC AdvancedJump>
  * @help
  * ===========================================================================
  * ● Explicação
  * ===========================================================================
  * Permite que o jogador pule ao pressionar a tecla A, ele poderá pular
  * através de obstáculos.
  *
  * ===========================================================================
  * ● Como Usar
  * ===========================================================================
  * Caso tenha distância, o herói irá passar sobre paredes. Para que isso não
  * ocorra, especifique um ou mais IDs de terreno nas configurações do plugin
  * e coloque esses terrenos nas paredes e em objetos que não permitam que o
  * o jogador atravesse durante o pulo.

	@param Distância
	@desc Distância do pulo (em tiles).
	@default 2

	@param Terrenos não passáveis
	@desc Terrenos cujo pulo não será possível (não atravessará). Números
	separados por vírgula. Exemplo: "1, 3, 4"
	@default 1

	@param Iniciar ligado
	@desc O pulo iniciará ligado? Sim: true | Não: false
	@default true
 */

var Imported = Imported || {};
Imported["TTKC_AdvancedJump"] = "1.0.0";

var TTK = TTK || {};
TTK.AdvancedJump = {};

"use strict";

(function($) {
	$.Params = $plugins.filter(function(p) { return p.description.contains('<TTKC AdvancedJump>'); })[0].parameters;

	//-----------------------------------------------------------------------------
	// Plugin global variables
	//

	$.terrains = $.Params['Terrenos não passáveis'].split(',').map(Number);
	$.distance = parseInt($.Params['Distância']);
	$.on = ($.Params['Iniciar ligado'] === 'true');
	Input.keyMapper[65] = "A";
	

	//-----------------------------------------------------------------------------
	// Game_Player
	//

	var _Game_Player_update = Game_Player.prototype.update;

	Game_Player.prototype.update = function(sceneActive) {
		_Game_Player_update.call(this, sceneActive);
		if (Input.isTriggered('A') && $.on) {
			this.advancedJump();
		}
	};

	var _Game_Player_jump = Game_Player.prototype.jump;

	Game_Player.prototype.advancedJump = function() {
		var x = 0, realX = 0, inX = [];
		var y = 0, realY = 0, inY = [];
		switch (this._direction) {
			case 2:
				var y = $.distance;
				break;
			case 4:
				var x = -$.distance;
				break;
			case 6:
				var x = $.distance;
				break;
			case 8:
				var y = -$.distance;
				break;
		}

		for (var i = 1; i <= Math.abs(x); i++) {
			var tX = 0, fX = this._x, fY = this._y;
			switch (this._direction) {
				case 4: tX = -i;
				break;

				case 6: tX = i;
				break;
			}

			if ($gameMap.isValid(fX + tX, fY) && $gameMap.checkPassage(fX + tX, fY, 0x0f)
				&& !$.terrains.contains($gameMap.terrainTag(fX + tX, fY)))
				inX.push(tX);
		}

		for (var i = 1; i <= Math.abs(y); i++) {
			var tY = 0, fX = this._x, fY = this._y;
			switch (this._direction) {
				case 8: tY = -i;
				break;

				case 2: tY = i;
				break;
			}

			if ($gameMap.isValid(fX, fY + tY) && $gameMap.checkPassage(fX, fY + tY, 0x0f)
				&& !$.terrains.contains($gameMap.terrainTag(fX, fY + tY))) 
				inY.push(tY);
		}

		realX = inX.length ? inX[inX.length - 1] : 0;
		realY = inY.length ? inY[inY.length - 1] : 0;
		_Game_Player_jump.call(this, realX, realY);
	};

	//-----------------------------------------------------------------------------
	// Plugin command
	//

	var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;

	Game_Interpreter.prototype.pluginCommand = function(command, args) {
  		_Game_Interpreter_pluginCommand.call(this, command, args);
  		if (command == "AdvancedJump") {
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
})(TTK.AdvancedJump);
