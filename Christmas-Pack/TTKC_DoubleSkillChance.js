//=============================================================================
// TTKC - Double Skill Chance
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
  * @plugindesc When using a specific skill, there's a chance to use it again
  *
  * <TTKC DoubleSkillChance>
  * @help
  * ===========================================================================
  * ● Explanation
  * ===========================================================================
  * When using a specific skill, there's a chance to use it again

  * ===========================================================================
  * ● How to Use
  * ===========================================================================
  * In the skills that may have a chance to be repeated, add the following
  * note:

  * * <RepeatChance=x> - The skill will have x% chances to be repeated. E. g.:
  * <RepeatChance=50>: 50% chance of being repeated.

  * By default (in the plugin settings), a skill will be repeated only once,
  * this can be changed by adding the following note:

  * * <MaxRepeatTimes=x> - The skill can be repeated up to x times. E. g:
  * <MaxRepeatTimes=2>: the skill will not be repeated more than 2 times.

	@param Maximum repetitions default
	@desc If the maximum repetitions tag is not used, this value will be.
	@default 1
*/

/*:pt
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

	@param Maximum repetitions default
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

	$.defaultRepeatMax = parseInt($.Params['Maximum repetitions default']);
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
