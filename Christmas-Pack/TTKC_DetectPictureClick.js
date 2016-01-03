//=============================================================================
// TTKC - Detect Picture Click (v1.0.3)
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
  * @plugindesc Detect the click and pressing in a specific picture
  *
  * <TTKC DetectPictureClick>
  * @help
  * ===========================================================================
  * ● Explanation
  * ===========================================================================
  * Detect the click and pressing in a specific picture
  *
  * ===========================================================================
  * ● How to Use
  * ===========================================================================
  * The following commands should be used in Plugin Commands:
  *
  * * DetectPictureClick On x - actives detection in the picture with ID x
  *
  * * DetectPictureClick Off x - disables detection in the picture with ID x
  *
  * These must be used in a Conditional structure by script:
  *
  * * DetectPictureClick.Click(x) - checks the click in the picture with ID x
  *
  * * DetectPictureClick.Press(x) - checks the pressing in the picture with
  * ID x. This event is returned several times per second.
  *
  * ===========================================================================
  * ● Observations
  * ===========================================================================
  * For the Click and Press commands works, the detection of the picture need
  * be activated previously. Otherwise the conditions will never be true.

	@param Click stop movement
	@desc By clicking a detectable image, the player will not walk. Yes: true | No: false
	@default true

	@param Press stop movement
	@desc By pressing a detectable image, the player will not walk. Yes: true | No: false
	@default true
*/

/*:pt
  * @author Fogomax
  * @plugindesc Detecta o clique e o pressionamento em uma picture específica
  *
  * <TTKC DetectPictureClick>
  * @help
  * ===========================================================================
  * ● Explicação
  * ===========================================================================
  * Detecta o clique e o pressionamento em uma picture específica 
  *
  * ===========================================================================
  * ● Como usar
  * ===========================================================================
  * Os segintes comandos devem ser utilizados nos Comandos de Plugin:
  *
  * * DetectPictureClick On x - ativa a detecção na imagem de ID x
  *
  * * DetectPictureClick Off x - desativa a detecção na imagem de ID x
  *
  * Esses devem ser utilizados em uma Estrutura Condicional por Script:
  *
  * * DetectPictureClick.Click(x) - verifica o clique na imagem de ID x
  *
  * * DetectPictureClick.Press(x) - verifica o pressionamento na imagem de ID x.
  * Esse evento é retornado várias vezes por segundo.
  *
  * ===========================================================================
  * ● Observações
  * ===========================================================================
  * Para que os comandos Click e Press funcionem, a verificação do ID deve ser
  * ativada previamente. Caso contrário, a condição nunca será verdadeira.

	@param Click stop movement
	@desc Ao clicar em uma imagem detectável, o jogador não andará. Sim: true | Não: false
	@default true

	@param Press stop movement
	@desc Ao pressionar uma imagem detectável, o jogador não andará. Sim: true | Não: false
	@default true
*/

"use strict";

var Imported = Imported || {};
Imported["TTKC_DetectPictureClick"] = "1.0.3";

var TTK = TTK || {};
TTK.DetectPictureClick = {};

(function($) {
  $.Params = $plugins.filter(function(p) { return p.description.contains('<TTKC DetectPictureClick>'); })[0].parameters;

  //-----------------------------------------------------------------------------
  // Plugin global variables
  //

  $.clickStopPlayerMove = ($.Params['Click stop movement'] === 'true');
  $.pressStopPlayerMove = ($.Params['Press stop movement'] === 'true');
  $.pictures = [];
  $.picturesResults = [];
  $.playerCanMove = true;

  //-----------------------------------------------------------------------------
  // TouchInput
  //

  var _TouchInput_onMouseDown = TouchInput._onMouseDown;

  TouchInput._onMouseDown = function(event) {
    _TouchInput_onMouseDown.call(this, event);
    if (SceneManager._scene instanceof Scene_Map) {
      for (var i = 0; i < $.pictures.length; i++) {
        var pictureSprite = SceneManager._scene._spriteset._pictureContainer.children[$.pictures[i] - 1];
        var x = Graphics.pageToCanvasX(event.pageX);
        var y = Graphics.pageToCanvasY(event.pageY);
        if (x >= pictureSprite.getScreenX() && x <= pictureSprite.getScreenX() + pictureSprite.width
          && y >= pictureSprite.getScreenY() && y <= pictureSprite.getScreenY() + pictureSprite.height
          && pictureSprite.visible) {
          $.picturesResults[$.pictures[i]] = true;
        }
      }
    }
  };

  var _TouchInput_onMouseUp = TouchInput._onMouseUp;

  TouchInput._onMouseUp = function(event) {
    _TouchInput_onMouseUp.call(this, event);
    if (SceneManager._scene instanceof Scene_Map) {
      for (var i = 0; i < $.pictures.length; i++) {
        $.picturesResults[$.pictures[i]] = false;
      }
      if (!$.playerCanMove) $.playerCanMove = true;
    }
  };

  TouchInput.isPictureClicked = function(id) {
    var r = $.picturesResults[id] && (this._pressedTime === 0 || this._pressedTime === 1);
    if (r && $.clickStopPlayerMove) $.playerCanMove = false;
    return r;
  };

  TouchInput.isPicturePressed = function(id) {
    var r = $.picturesResults[id];
    if (r && $.pressStopPlayerMove) $.playerCanMove = false;
    return r;
  };

  //-----------------------------------------------------------------------------
  // Sprite_Picture
  //

  Sprite_Picture.prototype.getScreenX = function() {
      return this.x - (this.width * this.anchor.x);
  };

  Sprite_Picture.prototype.getScreenY = function() {
      return this.y - (this.height * this.anchor.y);
  };

  //-----------------------------------------------------------------------------
  // Game_Player
  //

  var _Game_Player_canMove = Game_Player.prototype.canMove;

  Game_Player.prototype.canMove = function() {
    if (!$.playerCanMove) return false;
    return _Game_Player_canMove.call(this);
  };

  //-----------------------------------------------------------------------------
  // Plugin command
  //

  var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;

  Game_Interpreter.prototype.pluginCommand = function(command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);
    if (command == "DetectPictureClick") {
      switch(args[0].toLowerCase()) {
        case "on":
          var id = parseInt(args[1]);
          if (!~$.pictures.indexOf(id))
            $.pictures.push(id);
          break;

        case "off":
          var id = parseInt(args[1]);
          if (~$.pictures.indexOf(id))
            $.pictures.splice($.pictures.indexOf(parseInt(id)), 1);
          break;
      }
    }
  };

  //-----------------------------------------------------------------------------
  // Click & Press functions
  //

  $.Click = function(pictureId) {
    return TouchInput.isPictureClicked(pictureId);
  };

  $.Press = function(pictureId) {
    return TouchInput.isPicturePressed(pictureId);
  };
})(TTK.DetectPictureClick);

//=============================================================================
// * Alias
//=============================================================================
var DetectPictureClick = TTK.DetectPictureClick;
