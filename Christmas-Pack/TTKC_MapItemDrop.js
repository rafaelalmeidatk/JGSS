//=============================================================================
// TTKC - Map Item Drop
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
  * @plugindesc Allows items to be thrown to the ground, these items can be
  * collected by the player.
  * <TTKC MapItemDrop>
  * @help
  * ===========================================================================
  * ● Explanation
  * ===========================================================================
  * Allows items to be thrown to the ground, these items can be collected by
  * the player.
  *
  * ===========================================================================
  * ● How to Use
  * ===========================================================================
  * Call the following commands in Plugin commands:
  *
  * * MapItemDrop Drop x Here - throw the item with ID x in the same position
  * of the event, do not use in common events with parallel process or 
  * automatic start.
  *
  * If you want to specify a position for the item, use the command:
  *
  * * MapItemDrop Drop z Position x y - throw the item with ID z in the tiles
  * x and y of the map.
  *
  * There are also additional options:
  *
  * * MapItemDrop Drop x Here Floating - throw the item with ID x in the same position
  * of the event, the item will stay afloat.
  *
  * * MapItemDrop Drop x Here ThrowUp - throw the item with ID x in the same position
  * of the event, the item will be thrown up.
  * 
  * * MapItemDrop Drop x Here Duration y - throw the item with ID x in the same position
  * of the event, after x SECONDS the item will disappear.
  *
  * ===========================================================================
  * ● Important notes
  * ===========================================================================
  * Specify the "Drop x" and a position ("Position XY" or "Here") is required.
  * Options can be placed in any order of command. Examples:
  *
  * * MapItemDrop Drop 1 Here Floating ThrowUp - throw the item with ID x in the same position
  * of the event, it will be thrown up and will be floating.
  *
  * * MapItemDrop Drop 3 Position 2 3 Floating - throw the item with ID 3 in
  * the tiles 2 (x) e 3 (y), it will be floating.
  * 

	@param How to collect the item
	@desc 0 to collect going over, 1 to collect by pressing the action button
	(Z, Space or Enter)
	@default 0

	@param Sound when collecting the item
	@desc Play a sound when collecting an item. Yes: true | No: false
	@default true

    @param Throw errors
    @desc Forgetting to specify a required value in plugin commands, an error
    is triggered (recommended for development)
    @default true
 */

/*:pt
  * @author Fogomax
  * @plugindesc Permite que sejam jogados itens no chão, tais itens podem ser
  * recolhidos pelo jogador.
  * <TTKC MapItemDrop>
  * @help
  * ===========================================================================
  * ● Explicação
  * ===========================================================================
  * Permite que sejam jogados itens no chão, tais itens podem ser recolhidos
  * pelo jogador.
  *
  * ===========================================================================
  * ● Como usar
  * ===========================================================================
  * Chame os seguintes comandos no Comandos de Plugin:
  *
  * * MapItemDrop Drop x Here - joga o item de ID x na mesma posição do evento,
  * não utilize em eventos comuns em processo paralelo ou início automático.
  *
  * Caso queira especificar uma posição para o item, utilize o comando:
  *
  * * MapItemDrop Drop z Position x y - joga o item de ID z nos tiles x e y
  * do mapa.
  *
  * Também há opções adicionais:
  *
  * * MapItemDrop Drop x Here Floating - joga o item de ID x na mesma posição
  * do evento, o item irá ficar flutuando.
  *
  * * MapItemDrop Drop x Here ThrowUp - joga o item de ID x na mesma posição
  * do evento, o item irá ser arremessado para cima.
  * 
  * * MapItemDrop Drop x Here Duration y - joga o item de ID x na mesma posição
  * do evento, após y SEGUNDOS o item sumirá.
  *
  * ===========================================================================
  * ● Observações
  * ===========================================================================
  * Especificar o "Drop x" e uma posição ("Position x y" ou "Here") é
  * obrigatório. As opções podem ser colocadas em qualquer ordem do comando.
  * Exemplos:
  *
  * * MapItemDrop Drop 1 Here Floating ThrowUp - joga o item de ID 1 na mesma
  * posição do evento, ele será arremessado e ficará flutuando.
  *
  * * MapItemDrop Drop 3 Position 2 3 Floating - joga o item de ID 3 nos tiles
  * 2 (x) e 3 (y), ele ficará flutuando.

	@param How to collect the item
	@desc 0 para recolher ao passar por cima, 1 para recolher ao pressionar
	o botão de ação (Z, Espaço ou Enter)
	@default 0

	@param Sound when collecting the item
	@desc Tocar um som ao recolher um item. Sim: true | Não: false
	@default true

    @param Throw errors
    @desc Ao esquecer de especificar um valor obrigatório nos comandos de
    plugin, um erro é disparado (recomendado para desenvolvimento)
    @default true
 */

var Imported = Imported || {};
Imported["TTKC_MapItemDrop"] = "1.0.0";

var TTK = TTK || {};
TTK.MapItemDrop = {};

"use strict";

(function($) {
	$.Params = $plugins.filter(function(p) { return p.description.contains('<TTKC MapItemDrop>'); })[0].parameters;

	//-----------------------------------------------------------------------------
	// Plugin global variables
	//

	$.pickType = parseInt($.Params['How to collect the item']);
	$.playSound = ($.Params['Sound when collecting the item'] === 'true');
	$.throwErrors = ($.Params['Throw errors'] === 'true');
	$.mapDrops = [];

	//-----------------------------------------------------------------------------
	// Scene_Map
	//

	var _Scene_Map_onMapLoaded = Scene_Map.prototype.onMapLoaded;

	Scene_Map.prototype.onMapLoaded = function() {
		_Scene_Map_onMapLoaded.call(this);
	    $.mapDrops.forEach(function(mapDrop) {
	        this._spriteset.addMapItemDrop(mapDrop);
	    }, this);
	};

	Scene_Map.prototype.addMapItemDrop = function(itemId, position, throwUp, floating, duration) {
		var icon = $dataItems[itemId].iconIndex;
		var itemDropSprite = new Drop_Sprite(itemId, icon, position[0], position[1], throwUp, floating, duration);
		this._spriteset.addMapItemDrop(itemDropSprite);
		$.mapDrops.push(itemDropSprite);
	}

	Scene_Map.prototype.removeMapItemDrop = function(itemDropSprite) {
		this._spriteset.addMapItemDrop(itemDropSprite);
	}


	//-----------------------------------------------------------------------------
	// Spriteset_Map
	//

	Spriteset_Map.prototype.addMapItemDrop = function(instance) {
		this._baseSprite.addChild(instance);
	}

	Spriteset_Map.prototype.removeMapItemDrop = function(instance) {
		this._baseSprite.removeChild(instance);
	}


	//-----------------------------------------------------------------------------
	// Game_Player
	//

	var _Game_Player_update = Game_Player.prototype.update;

	Game_Player.prototype.update = function(sceneActive) {
		_Game_Player_update.call(this, sceneActive);
		var p = this;
		if ($.pickType == 0 && $.mapDrops.filter(function (d) { return d._tileX == p._realX && d._tileY == p._realY; })[0])
			this.pickDropItem();
		else if ($.pickType == 1 && Input.isTriggered('ok') && $.mapDrops.filter(function (d) { return d._tileX == p._realX && d._tileY == p._realY; })[0])
			this.pickDropItem();
	};

	Game_Player.prototype.pickDropItem = function() {
		var p = this;
		var drops = $.mapDrops.filter(function (d) { return d._tileX == p._realX && d._tileY == p._realY; });
	    drops.forEach(function(d) {
	    	$gameParty.gainItem($dataItems[d._id], 1);
	    	if ($.playSound) SoundManager.playOk();
	        d.remove();
	    });
	}

	//-----------------------------------------------------------------------------
	// Drop_Sprite
	//

	function Drop_Sprite() {
		this.initialize.apply(this, arguments);
	}

	Drop_Sprite.prototype = Object.create(Sprite_Base.prototype);
	Drop_Sprite.prototype.constructor = Drop_Sprite;

	Drop_Sprite.prototype.initialize = function(id, icon, tileX, tileY, throwUp, floating, duration) {
		Sprite_Base.prototype.initialize.call(this);
		this._id = id;
		this._icon = icon;
		this._durationTick = duration * 60;
		this._throwUp = throwUp;
		this._throwing = throwUp;
		this._throwMin = 0;
		this._throwMax = 0;
		this._throwSide = 0;
		this._removing = false;
		this._removed = false;
		this.bitmap = new Bitmap(32, 32);
		this._floatYSide = 0;
		this._floatTick = 0;
		this.floatingIcon = floating;
		this._tileX = tileX;
		this._tileY = tileY;
		this._lastPos = [-1, -1];
		this.setPosition();
		this._limitFloatY = [this.y - 5, this.y + 5];
		this._throwY = 0;
		this.drawIcon();
	}

	Drop_Sprite.prototype.update = function() {
		if (this._removed)
			return;

		this._incY = 0;
		this._incX = 0;

		if (this.screenX() != this._lastPos[0] || this.screenY() != this._lastPos[1]) {
			this._incX += this.screenX() - this._lastPos[0];
			this._incY += this.screenY() - this._lastPos[1];

			this._throwMin += this._incY;
			this._throwMax += this._incY;

			this._limitFloatY[0] += this._incY;
			this._limitFloatY[1] += this._incY;

			this._lastPos[0] = this.screenX();
			this._lastPos[1] = this.screenY();
		}

		if (this._removing)
			this.updateRemove();

		if (this._durationTick > 0) {
			this._durationTick--;
			if (this._durationTick <= 0)
				this.remove();
		}

		if (this._throwing) {
			if (this._throwSide === 0) {
				if (this.y <= this._throwMin + 5)
					this.y--;
				else
					this.y -= 2;
				if (this.y <= this._throwMin)
					this._throwSide = 1;
			} else {
				this.y += 2;
				if (this.y >= this._throwMax)
					this._throwing = false;
			}
		}

		if (this.floatingIcon && this._floatTick <= 0 && !this._throwing) {
			if (this._floatYSide === 0) {
				this.y++;
				if (this.y >= this._limitFloatY[1])
					this._floatYSide = 1;
			}
			else {
				this.y--;
				if (this.y <= this._limitFloatY[0])
					this._floatYSide = 0;
			}
			this._floatTick = 2;
		} else if (this.floatingIcon) {
			this._floatTick--;
		}

		this.y += this._incY;
		this.x += this._incX;
	}

	Drop_Sprite.prototype.updateRemove = function() {
		if (this.opacity > 0)
			this.opacity -= 25;
		else {
			$.mapDrops.splice($.mapDrops.indexOf(this), 1);
			SceneManager._scene.removeMapItemDrop(this);
			this._removed = true;
		}
	}

	Drop_Sprite.prototype.setPosition = function() {
		this.x = this.screenX();
		this.y = this.screenY();
		this._lastPos[0] = this.screenX();
		this._lastPos[1] = this.screenY();	

		if (this._throwUp) {
			this._throwMin = this.y - 30;
			this._throwMax = this.y;
		}
	}

	Drop_Sprite.prototype.drawIcon = function() {
	    var bitmap = ImageManager.loadSystem('IconSet');
	    var pw = Window_Base._iconWidth;
	    var ph = Window_Base._iconHeight;
	    var sx = this._icon % 16 * pw;
	    var sy = Math.floor(this._icon / 16) * ph;
	    this.bitmap.blt(bitmap, sx, sy, pw, ph, 0, 0);
	}

	Drop_Sprite.prototype.remove = function() {
		this._removing = true;
	}

	Drop_Sprite.prototype.screenX = function() {
	    var tw = $gameMap.tileWidth();
	    return Math.round($gameMap.adjustX(this._tileX) * tw + 8);
	};

	Drop_Sprite.prototype.screenY = function() {
	    var ty = $gameMap.tileHeight();
	    return Math.round($gameMap.adjustY(this._tileY) * ty + 8);
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

	//-----------------------------------------------------------------------------
	// Plugin command
	//

	var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;

	Game_Interpreter.prototype.pluginCommand = function(command, args) {
  		_Game_Interpreter_pluginCommand.call(this, command, args);
  		if (command == "MapItemDrop") {
  			args = args.map(function(w) { return w.toLowerCase(); });
  			var id = parseInt(args.join().contains("drop") ? args[args.indexOf("drop") + 1] : 0);
  			var duration = parseInt(args.join().contains("duration") ? args[args.indexOf("duration") + 1] : 0);
			var floating = args.join().contains('floating');
			var throwUp = args.join().contains('throwup');
			var pos = [0, 0];
			if (args.join().contains('here')) {
				pos[0] = $gameMap.event(this._eventId).x;
				pos[1] = $gameMap.event(this._eventId).y;
			} else if (args.join().contains('position')) {
				pos[0] = args[args.indexOf('position') + 1];
				pos[1] = args[args.indexOf('position') + 2];
			} else if ($.throwErrors) {
				throw new Error('Map Item Drop: Position unspecified');
			} else {
				return;
			}

			if (id === 0 && $.throwErrors)
				throw new Error('Map Item Drop: Item ID unspecified');
			else if (id === 0)
				return;
			SceneManager._scene.addMapItemDrop(id, pos, throwUp, floating, duration);
  		}
  	};
})(TTK.MapItemDrop);
