//=============================================================================
// TTKC - Class Terrain Passage
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
  * @plugindesc It allows a specific class has a different possibility on a 
  * terrain
  *
  * <TTKC ClassTerrainPassage>
  * @help
  * ===========================================================================
  * ● Explanation
  * ===========================================================================
  * It allows a specific class has a different possibility on a terrain
  *
  * ===========================================================================
  * ● How to Use
  * ===========================================================================
  * To change the possibility of a class in a terrain, enter the following tag
  * in the class notes:
  *
  * * <TerrainPassage(x)=y> - Where x is a character:
  *      o: Free passage
  *      x: Blocked passage
  *      i: inverts the passage (if its blocked then it becomes free, and if
  *         its free then it becomes blocked)
  *
  *  And y is the number of land on which the passage will be changed,
  *  separated by commas.
  *
  * ===========================================================================
  * ● Example
  * ===========================================================================
  *
  * * <TerrainPassage(o)=1> - The class will go through the tiles with terrain
  *    1.
  *
  * * <TerrainPassage(x)=3, 4> - The class will not pass the tiles with terrain
  *   3 and 4.
  *
  * * <TerrainPassage(i)=2> - The class will have the passage inverted by tiles
  *   with terrain 2.
 */

/*:pt
  * @author Fogomax
  * @plugindesc Permite que uma classe específica tenha uma passibilidade
  * diferente em um terreno
  *
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
 */

var Imported = Imported || {};
Imported["TTKC_ClassTerrainPassage"] = "1.0.0";

var TTK = TTK || {};
TTK.ClassTerrainPassage = {};

"use strict";

(function($) {
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
