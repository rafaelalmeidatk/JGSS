//=============================================================================
// TTKC - Double Tap Run
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
  * @plugindesc Ativa o dash ao pressionar a tecla de andar duas vezes rapidamente

  * <TTKC DoubleTapRun>
  * @help
  * ===========================================================================
  * ● Explicação
  * ===========================================================================
  * Ao pressionar a tecla de andar duas vezes rapidamente o herói irá correr

    @param Tempo de pressionamento
    @desc O tempo que o jogador tem para pressionar a tecla novamente para o herói correr
    @default 10
 */

var Imported = Imported || {};
Imported["TTKC_DoubleTapRun"] = "1.0.0";

var TTK = TTK || {};
TTK.DoubleTapRun = {};

"use strict";

(function($) {
	$.Params = $plugins.filter(function(p) { return p.description.contains('<TTKC DoubleTapRun>'); })[0].parameters;

	//-----------------------------------------------------------------------------
	// Plugin global variables
	//

	$.pressTime = parseInt($.Params['Tempo de pressionamento']);
	$.isDashing = false;
	$.dashTick = 0;
	$.keyControl = false;

	//-----------------------------------------------------------------------------
	// Game_Player
	//

	Game_Player.prototype.updateDashing = function() {
	    if (this.isMoving()) {
	        return;
	    }
	    if (this.canMove() && !this.isInVehicle() && !$gameMap.isDashDisabled()) {
	        this._dashing = this.isDashButtonPressed() || $gameTemp.isDestinationValid() || $.isDashing;
	    } else {
	        this._dashing = false;
	    }
	};

	//-----------------------------------------------------------------------------
	// Input
	//

	var _Input_onKeyDown = Input._onKeyDown;

	Input._onKeyDown = function(event) {
		_Input_onKeyDown.call(this, event);
		if (!$.keyControl && (this.isPressed('up') || this.isPressed('down') || this.isPressed('left') || this.isPressed('right'))) {
			if ($.dashTick > 0) {
				$gamePlayer._dashing = true;
				$.isDashing = true;
			}
			else
				$.dashTick = $.pressTime;
		}

		if (!$.keyControl) $.keyControl = true;
	};

	var _Input_onKeyUp = Input._onKeyUp;

	Input._onKeyUp = function(event) {
		_Input_onKeyUp.call(this, event);
		if ($.keyControl) $.keyControl = false;
		if ($.isDashing) $.isDashing = false;
	};

	var _Input_update = Input.update;

	Input.update = function() {
		_Input_update.call(this);
		if ($.dashTick > 0) {
			$.dashTick--;
		}
	};
})(TTK.DoubleTapRun);
