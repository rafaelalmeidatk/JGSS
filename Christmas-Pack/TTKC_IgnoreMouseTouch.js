//=============================================================================
// TTKC - Ignore Mouse & Touch
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
  * @plugindesc Remove the mouse and touch functionality in the game, this
  * feature can be turned on / off
  * <TTKC IgnoreMouseTouch>
  * @help
  * ===========================================================================
  * ● Explanation
  * ===========================================================================
  * Remove the functionality of the mouse and touch in the game. However, this
  * can be enabled or disabled in the course of it.
  *
  * ===========================================================================
  * ● How to Use
  * ===========================================================================
  * By default the mouse and touch comes off (in the settings), but if you want
  * to change it during the game, make the following calls in the Plugin
  * Command:
  *
  * * IgnoreMouseTouch On - activate the plugin, the mouse and touch will be
                            ignored
  * * IgnoreMouseTouch Off - disable the plugin, the mouse and touch will work
  *
  * ===========================================================================
  * ● Important note
  * ===========================================================================
  * For this plugin also has an effect on others, and not just in engine
  * standards, put it as the last plugin in the list.

    @param Start on
    @desc The mouse and the touch will start disabled? Yes: true | No: false
    @default true
 */

/*:pt
  * @author Fogomax
  * @plugindesc Remove a funcionalidade do mouse e do touch no jogo, tal
  * funcionalidade pode ser ligada/desligada
  * <TTKC IgnoreMouseTouch>
  * @help
  * ===========================================================================
  * ● Explicação
  * ===========================================================================
  * Remove a funcionalidade do mouse e do touch no jogo. No entanto, isso pode
  * ser ativado ou desativado no decorrer dele.
  *
  * ===========================================================================
  * ● Como usar
  * ===========================================================================
  * Por padrão o mouse e o touch já vem desativados (nas configurações), mas
  * caso você queira mudar isso durante o jogo, faça as seguintes chamadas no
  * Comando de Plugin:
  *
  * * IgnoreMouseTouch On - ativa o plugin, o mouse e o touch serão ignorados
  * * IgnoreMouseTouch Off - desativa o plugin, o mouse e o touch funcionarão
  *
  * ===========================================================================
  * ● Observação importante
  * ===========================================================================
  * Para que esse plugin também tenha efeito sobre os outros, e não apenas nos
  * originais da engine, coloque-o como último plugin na lista.

    @param Inicio ligado
    @desc O mouse e o touch iniciarão desligados? Sim: true | Não: false
    @default true
 */

var Imported = Imported || {};
Imported["TTKC_IgnoreMouseTouch"] = "1.0.0";

var TTK = TTK || {};
TTK.IgnoreMouseTouch = {};

"use strict";

(function($) {
	$.Params = $plugins.filter(function(p) { return p.description.contains('<TTKC IgnoreMouseTouch>'); })[0].parameters;

	//-----------------------------------------------------------------------------
	// Plugin global variables
	//

	$.on = ($.Params['Inicio ligado'] === 'true');

	//-----------------------------------------------------------------------------
	// TouchInput
	//

	var _TouchInput_onMouseDown = TouchInput._onMouseDown;

	TouchInput._onMouseDown = function(event) {
		if (!$.on)
			_TouchInput_onMouseDown.call(this, event);
	};

	var _TouchInput_onMouseMove = TouchInput._onMouseMove;

	TouchInput._onMouseMove = function(event) {
		if (!$.on)
			_TouchInput_onMouseMove.call(this, event);
	};

	var _TouchInput_onMouseUp = TouchInput._onMouseUp;

	TouchInput._onMouseUp = function(event) {
		if (!$.on)
			_TouchInput_onMouseUp.call(this, event);
	};

	var _TouchInput_onWheel = TouchInput._onWheel;

	TouchInput._onWheel = function(event) {
		if (!$.on)
			_TouchInput_onWheel.call(this, event);
	};

	var _TouchInput_onTouchStart = TouchInput._onTouchStart;

	TouchInput._onTouchStart = function(event) {
		if (!$.on)
			_TouchInput_onTouchStart.call(this, event);
	};

	var _TouchInput_onTouchMove = TouchInput._onTouchMove;

	TouchInput._onTouchMove = function(event) {
		if (!$.on)
			_TouchInput_onTouchMove.call(this, event);
	};

	var _TouchInput_onTouchEnd = TouchInput._onTouchEnd;

	TouchInput._onTouchEnd = function(event) {
		if (!$.on)
			_TouchInput_onTouchEnd.call(this, event);
	};

	var _TouchInput_onTouchCancel = TouchInput._onTouchCancel;

	TouchInput._onTouchCancel = function(event) {
		if (!$.on)
			_TouchInput_onTouchCancel.call(this, event);
	};

	var _TouchInput_onPointerDown = TouchInput._onPointerDown;

	TouchInput._onPointerDown = function(event) {
		if (!$.on)
			_TouchInput_onPointerDown.call(this, event);
	};

	//-----------------------------------------------------------------------------
	// Plugin command
	//

	var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;

	Game_Interpreter.prototype.pluginCommand = function(command, args) {
  		_Game_Interpreter_pluginCommand.call(this, command, args);
  		if (command == "IgnoreMouseTouch") {
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
})(TTK.IgnoreMouseTouch);
