//=============================================================================
// TTKCC - Slideshow Intro
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
  * @plugindesc Cria uma introdução com um slideshow de imagens

  * <TTKC SlideshowIntro>
  * @help
  * ===========================================================================
  * ● Explicação
  * ===========================================================================
  * Cria uma introdução com um slideshow de imagens
  *
  * ===========================================================================
  * ● Como Usar
  * ===========================================================================
  * Coloque o nome das imagens, em ordem, nas configurações. Elas devem estar
  * na pasta img/Pictures e devem estar na extenção ".png".

    @param Imagens
    @desc Coloque o nome das imagens separadas por vírgula. Exemplo: Img1, Img2
    @default Intro1, Intro2, Intro3

    @param Delay
    @desc O tempo que cada imagem ficará na tela (em frames, 60 = 1s)
    @default 120

    @param Incremento de opacidade
    @desc A quantidade de opacidade que será aumentada a cada loop, quanto
    maior o valor mais rápido a imagem aparecerá. 0 para mudança instantânea.
    @default 3

    @param Encerrar introdução ao apertar tecla
    @desc A introdução será pulada quando as teclas Z, Espaço ou Enter forem
    pressionadas. Sim: true | Não: false
    @default true

    @param Scene ao término
    @desc Próxima scene após o término da introdução. Não mexa se não souber
    o que está fazendo
    @default Scene_Title
 */

var Imported = Imported || {};
Imported["TTKC_SlideshowIntro"] = "1.0.0";

var TTK = TTK || {};
TTK.SlideshowIntro = {};

"use strict";

(function($) {
	$.Params = $plugins.filter(function(p) { return p.description.contains('<TTKC SlideshowIntro>'); })[0].parameters;

	//-----------------------------------------------------------------------------
	// Plugin global variables
	//

	$.imagesName = $.Params['Imagens'].split(',').map(function(w) { return w.trim(); });
	$.delay = parseInt($.Params['Delay']);
	$.opacityInc = parseInt($.Params['Incremento de opacidade']);
	$.jumpIfPress = ($.Params['Encerrar introdução ao apertar tecla'] === 'true');
	$.nextScene = eval($.Params['Scene ao término']);
	$.images = [];
	$.imagesLoaded = false;

	//-----------------------------------------------------------------------------
	// Scene_Boot
	//

	Scene_Boot.prototype.start = function() {
		Scene_Base.prototype.start.call(this);
		SoundManager.preloadImportantSounds();
		if (DataManager.isBattleTest()) {
			DataManager.setupBattleTest();
			SceneManager.goto(Scene_Battle);
		} else if (DataManager.isEventTest()) {
			DataManager.setupEventTest();
			SceneManager.goto(Scene_Map);
		} else {
			this.checkPlayerLocation();
			DataManager.setupNewGame();
			SceneManager.goto(Scene_Intro);
		}
		this.updateDocumentTitle();
	};

	//-----------------------------------------------------------------------------
	// Scene_Intro
	//

    function Scene_Intro() {
        this.initialize.apply(this, arguments);
    }

    Scene_Intro.prototype = Object.create(Scene_Base.prototype);
    Scene_Intro.prototype.constructor = Scene_Intro;

    Scene_Intro.prototype.create = function() {
        Scene_Base.prototype.create.call(this);
        $.imagesName.forEach(function(imageName) {
        	var sprite = new Sprite(ImageManager.loadPicture(imageName));
        	sprite.opacity = 0;
        	sprite.visible = false;
        	$.images.push(sprite);
        	this.addChild(sprite);
        }, this);
        $.images[$.images.length - 1].bitmap.addLoadListener(function() {
        	$.imagesLoaded = true;
        });
        this._index = 0;
        this._imageTick = 0;
        this._imageTickEnabled = false;
    };

    Scene_Intro.prototype.update = function() {
    	Scene_Base.prototype.update.call(this);
    	if (!$.imagesLoaded) return;

    	if ($.images[this._index].visible === false) {
    		this._imageTick = $.delay;
    		this._imageTickEnabled = false;
    		$.images[this._index].visible = true;
    	}

    	if ($.images[this._index].opacity < 255) {
    		$.images[this._index].opacity += $.opacityInc;
    		if ($.opacityInc === 0) $.images[this._index].opacity = 255;
    	} else {
    		this._imageTickEnabled = true;
    	}

    	if (this._imageTickEnabled) {
    		if (this._imageTick > 0) {
    			this._imageTick--;
    		} else {
    			this._imageTickEnabled = false;
    			this._index++;
    		}
    	}

    	if (!$.images[this._index] || (Input.isTriggered('ok') && $.jumpIfPress)) {
    		SceneManager.goto($.nextScene);
    	}
    }
})(TTK.SlideshowIntro);
