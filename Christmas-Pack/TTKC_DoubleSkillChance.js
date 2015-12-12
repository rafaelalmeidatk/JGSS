//=============================================================================
// TTKC - Double Skill Chance
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
  * @plugindesc Ao utilizar uma skill específica, há uma chance de usá-la
  * novamente
  * <TTKC DoubleSkillChance>
  * @help
  * ===========================================================================
  * ● Explicação
  * ===========================================================================
  * Ao utilizar uma skill específica, há uma chance de usá-la novamente

  * ===========================================================================
  * ● Como usar
  * ===========================================================================
  * Nas habilidades que poderão ter uma chance de ser repetidas, adicione a
  * seguinte nota:

  * * <RepeatChance=x> - A habilidade terá x% chances de ser repetida. Exemplo:
  * <RepeatChance=50>: 50% de chances de ser repetida

  * Por padrão (nas configurações do plugin), uma habilidade só será repetida
  * até uma vez, isso pode ser mudado adicionando a seguinte nota:

  * * <MaxRepeatTimes=x> - A habilidade poderá ser repetida até x vezes. Exemplo:
  * <MaxRepeatTimes=2>: a habilidade não será repetida mais de 2 vezes.

	@param Máximo de repetições padrões
	@desc Caso a tag de máximo de repetições não seja usada, esse valor será.
	@default 1
 */

var Imported = Imported || {};
Imported["TTKC_DoubleSkillChance"] = "1.0.0";

var TTK = TTK || {};
TTK.DoubleSkillChance = {};

"use strict";

(function($) {
	$.Params = $plugins.filter(function(p) { return p.description.contains('<TTKC DoubleSkillChance>'); })[0].parameters;

	//-----------------------------------------------------------------------------
	// Plugin global variables
	//

	$.defaultRepeatMax = parseInt($.Params['Máximo de repetições padrões']);
	$.repeatMax = 0;
	$.repeatTimes = 0;
	$.rate = 0;
	$.action = null;
	$.targets = null;
	$.repeat = false;
	$.forceEnd = false;

	//-----------------------------------------------------------------------------
	// BattleManager
	//

	var _BattleManager_startAction = BattleManager.startAction;

	BattleManager.startAction = function() {
	    var subject = this._subject;
	    var action = subject.currentAction();

	    var note = action.item().note;

		if (/<RepeatChance=/.test(note)) {
			$.rate = parseInt(note.match(/<RepeatChance=(\d+)>/)[1]);

			if (/<MaxRepeatTimes=/.test(note))
				$.repeatMax = parseInt(note.match(/<MaxRepeatTimes=(\d+)>/)[1]);
			else
				$.repeatMax = $.defaultRepeatMax;
		} else {
			$.rate = 0;
		}

	    var targets = action.makeTargets();
	    $.repeatTimes = 0;
		$.action = action;
		$.targets = targets.slice();
	    this._phase = 'action';
	    this._action = action;
	    this._targets = targets;
	    subject.useItem(action.item());
	    this._action.applyGlobal();
	    this.refreshStatus();
	    this._logWindow.startAction(subject, action, targets);
	};

	BattleManager.updateAction = function() {
		if ($.repeat) this._targets = $.targets.slice();
	    var target = this._targets.shift();
	    if (target) {
	        this.invokeAction(this._subject, target);
	    } else {
	        this.endAction();
	    }
	    $.repeat = false;
	};

	BattleManager.endAction = function() {
		if ($.rate > 0 && !$.forceEnd) {
			if (Math.random() < $.rate / 100)
				this.repeatAction();
			else {
				$.forceEnd = true;
				this.endAction();
			}
		} else {
	    	$.forceEnd = false;
		    this._logWindow.endAction(this._subject);
		    this._phase = 'turn';
		}
	};

	BattleManager.repeatAction = function() {
		if ($.repeatTimes >= $.repeatMax) {
			$.forceEnd = true;
			this.endAction();
			return;
		}

		$.repeatTimes++;
	    var subject = this._subject;
	    var action = $.action;

	    for (var i = 0; i < $.targets.length; i++) {
	    	if ($.targets[i].isDead())
	    		$.targets.splice($.targets.indexOf($.targets[i]), 1);
	    }

	    if ($.targets.length <= 0) {
	    	$.repeat = false;
	    	$.forceEnd = true;
	    	this.endAction();
	    	return;
	    }

		$.repeat = true;
	    var targets = $.targets.slice();
	    this._phase = 'action';
	    this._action = action;
	    this._targets = targets;
	    subject.useItem(action.item());
	    this._action.applyGlobal();
	    this.refreshStatus();
	    this._logWindow.startAction(subject, action, targets);
	}
})(TTK.DoubleSkillChance);
