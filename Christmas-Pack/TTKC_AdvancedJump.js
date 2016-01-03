//=============================================================================
// TTKC - Advanced Jump (v1.2.0)
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
	* @plugindesc Allows the player to jump by pressing the A key

	* <TTKC AdvancedJump>
	* @help
	* ===========================================================================
	* ● Explanation
	* ===========================================================================
	* Allows the player to jump by pressing the A key, he can jump through 
	* obstacles.
	*
	* ===========================================================================
	* ● How to use
	* ===========================================================================
	* If the hero has a distance, he will pass on walls. To avoid this, specify
	* one or more Terrain IDs in the plugin settings and put that Terrains on
	* walls and objects that do not allow the player to go through during jump.
	*
	* To change the distance of the jump during the game, use this Plugin
	* Command:
	*
	* * AdvancedJump Distance x - The jump will change to x tiles
	*
	* To on/off the jump, use this command:
	*
	* * AdvancedJump x - Where x: "On" or "Off"
	*
	* Is possible change the graph of the first character of the group when jump.
	* For this to work, you must change the setting "Change graphic" to "true"
	* (without quotes) and specify the file prefix. The file name when jumping,
	* should be the same as the one being use, containing only the prefix at the
	* beginning. The plugin automatically detects which graph file the hero is
	* currently using. The index is maintained. Example:
	*
	* - Prefix set: [JUMP]
	* - Current graph: Actor_1.png
	* - Current index: 1
	*
	* When jumping:
	* - Current graph: [JUMP]Actor_1.png
	* - Current index: 1


	@param Distance
	@desc Distance of jump (tiles).
	@default 2

	@param Terrains not passable
	@desc Terrain whose jump is not possible (dont through). Numbers
	separated by commas. Example: "1, 3, 4"
	@default 1

	@param Jump end on events?
	@desc You can finish the jump into events? Yes: true | No: false
	@default false

	@param Events intercept jump
	@desc Events will intercept the jump? Yes: true | No: false
	@default true

	@param Start on
	@desc The jump will start on? Yes: true | No: false
	@default true

	@param Change graphic
	@desc When jumping the graph will change? Yes: true | No: false
	@default true

	@param Change graphic prefix
	@desc File prefix to change to when player is jumping
	@default [JUMP]
 */

/*:pt
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
	*
	* Para mudar a distância do pulo durante o jogo, utilize esse Comando de
	* Plugin:
	*
	* * AdvancedJump Distance x - O pulo mudará para x tiles
	*
	* Para ligar/desligar o pulo, utilize esse comando:
	*
	* * AdvancedJump x - Sendo x: "On" (ligado) ou "Off" (desligado)
	*
	* É possível mudar o gráfico do primeiro personagem do grupo ao pular. Para
	* que isso funcione, é necessário alterar a configuração "Change graphic"
	* para "true" (sem aspas) e especificar o prefixo do arquivo. O nome do
	* arquivo ao pular deve ser o mesmo que está sendo utilizado, contendo apenas
	* o prefixo no início. O plugin detecta automaticamente qual arquivo o herói
	* está usando no momento. O index é mantido. Exemplo:
	*
	* - Prefixo configurado: [JUMP]
	* - Gráfico atual: Actor_1.png
	* - Index atual: 1
	*
	* Ao pular:
	* - Gráfico atual: [JUMP]Actor_1.png
	* - Index atual: 1

	@param Distance
	@desc Distância do pulo (em tiles).
	@default 2

	@param Terrains not passable
	@desc Terrenos cujo pulo não será possível (não atravessará). Números
	separados por vírgula. Exemplo: "1, 3, 4"
	@default 1

	@param Jump end on events?
	@desc Será possível terminar o pulo em eventos? Sim: true | Não: false
	@default false

	@param Events intercept jump
	@desc Eventos irão interceptar o pulo? Sim: true | Não: false
	@default true

	@param Start on
	@desc O pulo iniciará ligado? Sim: true | Não: false
	@default true

	@param Change graphic
	@desc Ao pular o gráfico será alterado? Sim: true | Não: false
	@default true

	@param Change graphic prefix
	@desc Prefixo do arquivo para mudar ao estiver pulando.
	@default [JUMP]
 */

var Imported = Imported || {};
Imported["TTKC_AdvancedJump"] = "1.2.0";

var TTK = TTK || {};
TTK.AdvancedJump = {};

"use strict";

(function($) {
	$.Params = $plugins.filter(function(p) { return p.description.contains('<TTKC AdvancedJump>'); })[0].parameters;

	//-----------------------------------------------------------------------------
	// Plugin global variables
	//

	$.terrains = $.Params['Terrains not passable'].split(',').map(Number);
	$.distance = parseInt($.Params['Distance']);
	$.on = ($.Params['Start on'].toLowerCase() === 'true');
	$.eventIntercept = ($.Params['Events intercept jump'].toLowerCase() === 'true');
	$.eventEnd = ($.Params['Jump end on events?'].toLowerCase() === 'true');
	$.changeGraphic = ($.Params['Change graphic'].toLowerCase() === 'true');
	$.changePrefix = $.Params['Change graphic prefix'];
	$.characterStore = ["", 0];
	$.jumpEnded = true;
	Input.keyMapper[65] = "A";
	
	//-----------------------------------------------------------------------------
	// Game_Player
	//

	var _Game_Player_update = Game_Player.prototype.update;

	Game_Player.prototype.update = function(sceneActive) {
		_Game_Player_update.call(this, sceneActive);
		if (Input.isTriggered('A') && $.on && $.jumpEnded)
			this.advancedJump();
	};

	var _Game_Player_jump = Game_Player.prototype.jump;

	Game_Player.prototype.advancedJump = function() {
		var x = 0, realX = 0, inX = [];
		var y = 0, realY = 0, inY = [];
		switch (this._direction) {
			case 2:
				y = $.distance;
				break;
			case 4:
				x = -$.distance;
				break;
			case 6:
				x = $.distance;
				break;
			case 8:
				y = -$.distance;
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

			if ($.eventIntercept && $gameMap.eventsXyNt(fX + tX, fY).length > 0) {
				break;
			} else if (!$.eventEnd) {
				if ($gameMap.eventsXyNt(fX + tX, fY).length === 0
					&& $gameMap.isValid(fX + tX, fY) && $gameMap.checkPassage(fX + tX, fY, 0x0f)
					&& !$.terrains.contains($gameMap.terrainTag(fX + tX, fY))) {
					inX.push(tX);
				}
			} else if ($gameMap.isValid(fX + tX, fY) && $gameMap.checkPassage(fX + tX, fY, 0x0f)
				&& !$.terrains.contains($gameMap.terrainTag(fX + tX, fY))) {
				inX.push(tX);
			}
		}

		for (var i = 1; i <= Math.abs(y); i++) {
			var tY = 0, fX = this._x, fY = this._y;
			switch (this._direction) {
				case 8: tY = -i;
				break;

				case 2: tY = i;
				break;
			}

			if ($.eventIntercept && $gameMap.eventsXyNt(fX, fY + tY).length > 0) {
				break;
			} else if (!$.eventEnd) {
				if ($gameMap.eventsXyNt(fX, fY + tY).length === 0
					&& $gameMap.isValid(fX, fY + tY) && $gameMap.checkPassage(fX, fY + tY, 0x0f)
					&& !$.terrains.contains($gameMap.terrainTag(fX, fY + tY))) {
					inY.push(tY);
				}
			} else if ($gameMap.isValid(fX, fY + tY) && $gameMap.checkPassage(fX, fY + tY, 0x0f)
				&& !$.terrains.contains($gameMap.terrainTag(fX, fY + tY))) {
				inY.push(tY);
			}
		}

		realX = inX.length ? inX[inX.length - 1] : 0;
		realY = inY.length ? inY[inY.length - 1] : 0;

		if ($.changeGraphic) {
			$.characterStore[0] = $gamePlayer._characterName;
			$.characterStore[1] = $gamePlayer._characterIndex;
			$gameActors.actor(1).setCharacterImage($.changePrefix + $gamePlayer._characterName, $gamePlayer._characterIndex);
			$gamePlayer.refresh();
			$.jumpEnded = false;
		}
		_Game_Player_jump.call(this, realX, realY);
	};

	var _Game_CharacterBase_updateJump = Game_CharacterBase.prototype.updateJump;

	Game_CharacterBase.prototype.updateJump = function() {
		_Game_CharacterBase_updateJump.call(this);
		if (this._jumpCount === 0 && !$.jumpEnded) {
			$gameActors.actor(1).setCharacterImage($.characterStore[0], $.characterStore[1]);
			$gamePlayer.refresh();
			$.jumpEnded = true;
		}
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

					case "distance":
						$.distance = parseInt(args[1]);
						break;
				}
			}
		};
})(TTK.AdvancedJump);
