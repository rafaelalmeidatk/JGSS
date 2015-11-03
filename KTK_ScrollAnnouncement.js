//======================================================================
// KTK - Scroll Announcement
// Por Fogomax
//======================================================================
 
/*:

  @author Fogomax
  @plugindesc Permite a criação de anuncios rolantes
  @help
  ● Como utilizar:
    Em um evento, escreva no Chamar Script um comando nesse formato:
      scroll_announ("Texto", IndiceIcone, "Cor", Itálico, Contorno, Velocidade)
      ScrollAnnouncement Texto IndiceIcone Cor Itálico Contorno Velocidade

    Sendo:
      Texto - Texto a ser exibido
      IndiceIcone - Índice do ícone do iconset, se nenhum deixe 0
      Cor - Cor do texto em formato CSS
      Itálico - Se o texto irá ou não ser em itálico, "true" para sim e "false" para não
      Contorno - Tamanho do contorno do texto, 0 para nenhum
      Velocidade - Velocidade de rolagem do texto, quanto maior, mais rápido

  ● Exemplo:
      scroll_announ("Frase de exemplo", 0, "#FFFFFF", false, 3, 2)
      O texto a ser exibido será "Frase de exemplo", de cor branca, com contorno, sem
      ser itálico e sem icone, com velocidade 2.

 */

var Imported = Imported || {};

var scroll_announ;

"use strict";

(function() {
  var parameters = PluginManager.parameters('KTK_ScrollAnnouncement');
  var xposText = 0;
  var textRev = 0;
  var text = "";
  var iconIndex = 0;
  var velocity = 0;
  var activeAnnouncement = false;

  //-----------------------------------------------------------------------------
  // Window_WindowAnnouncement
  //

  function Window_WindowAnnouncement() {
    this.initialize.apply(this, arguments);
  };

  Window_WindowAnnouncement.prototype = Object.create(Window_Base.prototype);
  Window_WindowAnnouncement.prototype.constructor = Window_WindowAnnouncement;

  Window_WindowAnnouncement.prototype.initialize = function() {
    var width = Graphics.width;
    var height = 48;
    Window_Base.prototype.initialize.call(this, 0, 0, width, height);
    this.opacity = 0;
    this.hide();
  };

  Window_WindowAnnouncement.prototype.standardPadding = function() {
    return 0;
  };

  Window_WindowAnnouncement.prototype.showAnnouncement = function(_Text, _IconIndex, _Color, _Italic, _Outline, _Velocity) {
    if (activeAnnouncement)
      return;
    
    activeAnnouncement = true;
    text = _Text;
    iconIndex = _IconIndex;
    velocity = _Velocity;

    xposText = this.width - 20;
    textRev = -(this.textWidth(text));

    this.contents.textColor = _Color;
    this.contents.fontItalic = _Italic;
    this.contents.outlineWidth = _Outline;
    this.drawText(text, xposText, 0, Graphics.width, 0);

    this.show();
  }

  Window_WindowAnnouncement.prototype.update = function() {
    if (!activeAnnouncement)
      return;

    xposText -= velocity;
    this.contents.clear();
    this.contents.fillRect(0, 0, Graphics.width, 48, "rgba(0, 0, 0, .5");
    this.drawText(text, xposText, 6, Graphics.width, 0);
    this.drawIcon(iconIndex, 12, 6);
    this.drawIcon(iconIndex, Graphics.width - 42, 6);

    if (xposText + 10 < textRev) {
      this.contents.clear();
      xposText = 0;
      textRev = 0;
      textTimer = 0;
      text = "";
      iconIndex = 0;
      activeAnnouncement = false;
    }
  }

  //-----------------------------------------------------------------------------
  // Scene_Map
  //

  var _Scene_Map_start = Scene_Map.prototype.start;
  Scene_Map.prototype.start = function() {
    _Scene_Map_start.call(this);
    this.createScrollAnnouncementWindow();
  };

  var _Scene_Map_update = Scene_Map.prototype.update;
  Scene_Map.prototype.update = function () {
    _Scene_Map_update.call(this);
  };

  Scene_Map.prototype.createScrollAnnouncementWindow = function() {
    this._announ_window = new Window_WindowAnnouncement();
    this.addWindow(this._announ_window);
  };

  //-----------------------------------------------------------------------------
  // Scroll Announcement function
  //

  scroll_announ = function(a, b, c, d, e, f) {
    SceneManager._scene._announ_window.showAnnouncement(a, b, c, d, e, f);
  }
})();
