//=============================================================================
// TTKC - Ignore Keyboard
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
  * @plugindesc Remove the keyboard functionality in the game, this feature can
  * be turned on / off
  * <TTKC IgnoreKeyboard>
  * @help
  * ===========================================================================
  * ● Explanation
  * ===========================================================================
  * Remove the functionality of the keyboard in the game. However, this can be
  * enabled or disabled in the course of it.
  *
  * ===========================================================================
  * ● How to Use
  * ===========================================================================
  * By default the keyboard comes off (in the settings), but if you want to
  * change it during the game, make the following calls in the Plugin Command:
  *
  * * IgnoreKeyboard On - activate the plugin, the keyboard will be ignored
  * * IgnoreKeyboard Off - disable the plugin, the keyboard will work
  *
  * ===========================================================================
  * ● Important note
  * ===========================================================================
  * For this plugin also has an effect on others, and not just in engine
  * standards, put it as the last plugin in the list.

    @param Starts on
    @desc O mouse e o touch iniciarão desligados? Sim: true | Não: false
    @default true
*/

/*:pt
  * @author Fogomax
  * @plugindesc Remove a funcionalidade do teclado no jogo, tal funcionalidade
  * pode ser ligada/desligada
  * <TTKC IgnoreKeyboard>
  * @help
  * ===========================================================================
  * ● Explicação
  * ===========================================================================
  * Remove a funcionalidade do teclado no jogo. No entanto, isso pode ser
  * ativado ou desativado no decorrer dele.
  *
  * ===========================================================================
  * ● Como usar
  * ===========================================================================
  * Por padrão o teclado já vem desativado (nas configurações), mas caso você
  * queira mudar isso durante o jogo, faça as seguintes chamadas no Comando de
  * Plugin:
  *
  * * IgnoreKeyboard On - ativa o plugin, o teclado será ignorado
  * * IgnoreKeyboard Off - desativa o plugin, o teclado funcionará
  *
  * ===========================================================================
  * ● Observação importante
  * ===========================================================================
  * Para que esse plugin também tenha efeito sobre os outros, e não apenas nos
  * originais da engine, coloque-o como último plugin na lista.

    @param Starts on
    @desc O mouse e o touch iniciarão desligados? Sim: true | Não: false
    @default true
*/

"use strict";

var Imported = Imported || {};
Imported["TTKC_IgnoreKeyboard"] = "1.0.0";

var TTK = TTK || {};
TTK.IgnoreKeyboard = {};

(function($) {
	$.Params = $plugins.filter(function(p) { return p.description.contains('<TTKC IgnoreKeyboard>'); })[0].parameters;

	//-----------------------------------------------------------------------------
	// Plugin global variables
	//

	$.on = ($.Params['Starts on'] === 'true');

	//-----------------------------------------------------------------------------
	// Input
	//

	var _TouchInput_onKeyDown = Input._onKeyDown;

	Input._onKeyDown = function(event) {
		if (!$.on)
			_Input_onKeyDown.call(this, event);
	};

  var _Input_onKeyUp = Input._onKeyUp;

  Input._onKeyUp = function(event) {
    if (!$.on)
      _Input_onKeyUp.call(this, event);
  };

	//-----------------------------------------------------------------------------
	// Plugin command
	//

	var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;

	Game_Interpreter.prototype.pluginCommand = function(command, args) {
  		_Game_Interpreter_pluginCommand.call(this, command, args);
  		if (command == "IgnoreKeyboard") {
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
})(TTK.IgnoreKeyboard);
