//=============================================================================
// TTKC - Class Terrain Passage
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
  * @plugindesc Permite que uma classe específica tenha uma passibilidade
  * diferente em um terreno

  * <TTKC ClassTerrainPassage>
  * @help
  * ===========================================================================
  * ● Explicação
  * ===========================================================================
  * Permite que uma classe específica tenha uma passibilidade diferente em um
  * terreno
  *
  * ===========================================================================
  * ● Como Usar
  * ===========================================================================
  * Para alterar a passibilidade de uma classe em um terreno, insira a
  * seguinte tag nas notas da classe:
  *
  * * <TerrainPassage(x)=y> - Sendo x uma letra:
  *      o: passagem livre
  *      x: passagem bloqueada
  *      i: inverte a passagem (se ela estiver bloqueada fica livre, e
  *         se estiver livre fica bloqueada)
  *
  *  E sendo y o número dos terrenos em que a passagem irá ser mudada,
  *  sepadados por vírgula.
  *
  * ===========================================================================
  * ● Exemplos
  * ===========================================================================
  *
  * * <TerrainPassage(o)=1> - A classe passará pelos tiles com terreno 1.
  * * <TerrainPassage(x)=3, 4> - A classe não passará pelos tiles com terrenos
  * 3 e 4
  * * <TerrainPassage(i)=2> - A classe terá a passagem invertida pelos tiles
  * com terreno 2.

    @param Imagens
    @desc Coloque o nome das imagens separadas por vírgula. Exemplo: Img1, Img2
    @default Intro1, Intro2, Intro3
 */

var Imported = Imported || {};
Imported["TTKC_ClassTerrainPassage"] = "1.0.0";

var TTK = TTK || {};
TTK.ClassTerrainPassage = {};

"use strict";

(function($) {
	$.Params = $plugins.filter(function(p) { return p.description.contains('<TTKC ClassTerrainPassage>'); })[0].parameters;

	//-----------------------------------------------------------------------------
	// Plugin global variables
	//

	$.symbolMap = { "o" : true, "x" : false };

	//-----------------------------------------------------------------------------
	// Game_Player
	//

    var _Game_Player_isMapPassable = Game_Player.prototype.isMapPassable;

    Game_Player.prototype.isMapPassable = function(x, y, d) {
        var terrain = $gameMap.terrainTag($gameMap.roundXWithDirection(x, d), $gameMap.roundYWithDirection(y, d));
        var thisTerrain = $gameMap.terrainTag(this._x, this._y);
        var passageInfo = this.getClassTerrainPassageInfo();
        if (passageInfo && passageInfo[2].split(',').map(Number).contains(terrain)) {
            if (passageInfo[1].toLowerCase() === 'i')
                return !_Game_Player_isMapPassable.call(this, x, y, d);
            else
                return $.symbolMap[passageInfo[1].toLowerCase()];
        } else if (passageInfo && passageInfo[2].split(',').map(Number).contains(thisTerrain)) {
            var x2 = $gameMap.roundXWithDirection(x, d);
            var y2 = $gameMap.roundYWithDirection(y, d);
            if (_Game_Player_isMapPassable.call(this, x2, y2, d)) {
                if (passageInfo[1].toLowerCase() === 'i')
                    return !_Game_Player_isMapPassable.call(this, x, y, d);
                else
                    return $.symbolMap[passageInfo[1].toLowerCase()];
            } else {
            console.log("a");
                return _Game_Player_isMapPassable.call(this, x, y, d);
            }
        } else {
            return _Game_Player_isMapPassable.call(this, x, y, d);
        }
    };

    Game_Player.prototype.getClassTerrainPassageInfo = function() {
        return $dataClasses[$gameActors.actor(1)._classId].note.match(/<TerrainPassage\(([iox])\)=(.+)>/);
    };
})(TTK.ClassTerrainPassage);
