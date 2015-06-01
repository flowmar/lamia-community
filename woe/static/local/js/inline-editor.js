// Generated by CoffeeScript 1.9.2
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  $(function() {
    var InlineEditor;
    InlineEditor = (function() {
      function InlineEditor(element, url, cancel_button) {
        if (url == null) {
          url = "";
        }
        if (cancel_button == null) {
          cancel_button = false;
        }
        this.toolbarHTML = bind(this.toolbarHTML, this);
        this.editordivHTML = bind(this.editordivHTML, this);
        this.submitButtonHTML = bind(this.submitButtonHTML, this);
        this.setupEditor = bind(this.setupEditor, this);
        this.quillID = this.getQuillID();
        this.element = $(element);
        if (this.element.data("editor_is_active")) {
          return false;
        }
        this.element.data("editor_is_active", true);
        if (url !== "") {
          $.get(url, (function(_this) {
            return function(data) {
              _this.element.data("editor_initial_html", data.content);
              return _this.setupEditor(cancel_button);
            };
          })(this));
        } else {
          this.element.data("editor_initial_html", this.element.html());
          this.setupEditor(cancel_button);
        }
      }

      InlineEditor.prototype.setupEditor = function(cancel_button) {
        var quill;
        if (cancel_button == null) {
          cancel_button = false;
        }
        this.element.html(this.editordivHTML());
        this.element.before(this.toolbarHTML);
        this.element.after(this.submitButtonHTML(cancel_button));
        quill = new Quill("#post-editor-" + this.quillID, {
          modules: {
            'link-tooltip': true,
            'image-tooltip': true,
            'toolbar': {
              container: "#toolbar-" + this.quillID
            }
          },
          theme: 'snow'
        });
        quill.setHTML(this.element.data("editor_initial_html"));
        this.element.data("_editor", this);
        this.element.data("editor", quill);
        $("#save-text-" + this.quillID).click((function(_this) {
          return function(e) {
            e.preventDefault();
            if (_this.saveFunction != null) {
              return _this.saveFunction(_this.element.data("editor").getHTML());
            }
          };
        })(this));
        return $("#cancel-edit-" + this.quillID).click((function(_this) {
          return function(e) {
            e.preventDefault();
            if (_this.cancelFunction != null) {
              return _this.cancelFunction(_this.element.data("editor").getHTML());
            }
          };
        })(this));
      };

      InlineEditor.prototype.getQuillID = function() {
        return Quill.editors.length + 1;
      };

      InlineEditor.prototype.resetElementHtml = function() {
        return this.element.html(this.element.data("editor_initial_html"));
      };

      InlineEditor.prototype.onSave = function(saveFunction) {
        return this.saveFunction = saveFunction;
      };

      InlineEditor.prototype.onCancel = function(cancelFunction) {
        return this.cancelFunction = cancelFunction;
      };

      InlineEditor.prototype.onFullPage = function(fullPageFunction) {
        return this.fullPageFunction = fullPageFunction;
      };

      InlineEditor.prototype.destroyEditor = function() {
        this.element.data("editor_is_active", false);
        $("#inline-editor-buttons-" + this.quillID).remove();
        $("#toolbar-" + this.quillID).remove();
        return $("#post-editor-" + this.quillID).remove();
      };

      InlineEditor.prototype.submitButtonHTML = function(cancel_button) {
        if (cancel_button == null) {
          cancel_button = false;
        }
        if (cancel_button === true) {
          return "<div id=\"inline-editor-buttons-" + this.quillID + "\" class=\"inline-editor-buttons\">\n  <button type=\"button\" class=\"btn btn-default post-post\" id=\"save-text-" + this.quillID + "\">Save</button>\n  <button type=\"button\" class=\"btn btn-default\" id=\"cancel-edit-" + this.quillID + "\">Cancel</button>\n</div>";
        } else {
          return "<div id=\"inline-editor-buttons-" + this.quillID + "\" class=\"inline-editor-buttons\">\n  <button type=\"button\" class=\"btn btn-default save-button\" id=\"save-text-" + this.quillID + "\">Save</button>\n</div>";
        }
      };

      InlineEditor.prototype.editordivHTML = function() {
        return "<div id=\"post-editor-" + this.quillID + "\" class=\"editor-box\" data-placeholder=\"\"></div>";
      };

      InlineEditor.prototype.toolbarHTML = function() {
        return "<div id=\"toolbar-" + this.quillID + "\" class=\"toolbar\">\n  <span class=\"ql-format-group\">\n    <select title=\"Font\" class=\"ql-font\">\n      <option value=\"sans-serif\" selected>Sans Serif</option>\n      <option value=\"serif\">Serif</option>\n      <option value=\"monospace\">Monospace</option>\n    </select>\n    <select title=\"Size\" class=\"ql-size\">\n      <option value=\"8px\">Micro</option>\n      <option value=\"10px\">Small</option>\n      <option value=\"14px\" selected>Normal</option>\n      <option value=\"18px\">Large</option>\n      <option value=\"24px\">Larger</option>\n      <option value=\"32px\">Huge</option>\n    </select>\n  </span>\n  <span class=\"ql-format-group\">\n    <span title=\"Bold\" class=\"ql-format-button ql-bold\"></span>\n    <span class=\"ql-format-separator\"></span>\n    <span title=\"Italic\" class=\"ql-format-button ql-italic\"></span>\n    <span class=\"ql-format-separator\"></span>\n    <span title=\"Underline\" class=\"ql-format-button ql-underline\"></span>\n    <span class=\"ql-format-separator\"></span>\n    <span title=\"Strikethrough\" class=\"ql-format-button ql-strike\"></span>\n  </span>\n  <span class=\"ql-format-group\">\n    <select title=\"Text Color\" class=\"ql-color\">\n      <option value=\"rgb(0, 0, 0)\" label=\"rgb(0, 0, 0)\" selected></option>\n      <option value=\"rgb(230, 0, 0)\" label=\"rgb(230, 0, 0)\"></option>\n      <option value=\"rgb(255, 153, 0)\" label=\"rgb(255, 153, 0)\"></option>\n      <option value=\"rgb(255, 255, 0)\" label=\"rgb(255, 255, 0)\"></option>\n      <option value=\"rgb(0, 138, 0)\" label=\"rgb(0, 138, 0)\"></option>\n      <option value=\"rgb(0, 102, 204)\" label=\"rgb(0, 102, 204)\"></option>\n      <option value=\"rgb(153, 51, 255)\" label=\"rgb(153, 51, 255)\"></option>\n      <option value=\"rgb(255, 255, 255)\" label=\"rgb(255, 255, 255)\"></option>\n      <option value=\"rgb(250, 204, 204)\" label=\"rgb(250, 204, 204)\"></option>\n      <option value=\"rgb(255, 235, 204)\" label=\"rgb(255, 235, 204)\"></option>\n      <option value=\"rgb(255, 255, 204)\" label=\"rgb(255, 255, 204)\"></option>\n      <option value=\"rgb(204, 232, 204)\" label=\"rgb(204, 232, 204)\"></option>\n      <option value=\"rgb(204, 224, 245)\" label=\"rgb(204, 224, 245)\"></option>\n      <option value=\"rgb(235, 214, 255)\" label=\"rgb(235, 214, 255)\"></option>\n      <option value=\"rgb(187, 187, 187)\" label=\"rgb(187, 187, 187)\"></option>\n      <option value=\"rgb(240, 102, 102)\" label=\"rgb(240, 102, 102)\"></option>\n      <option value=\"rgb(255, 194, 102)\" label=\"rgb(255, 194, 102)\"></option>\n      <option value=\"rgb(255, 255, 102)\" label=\"rgb(255, 255, 102)\"></option>\n      <option value=\"rgb(102, 185, 102)\" label=\"rgb(102, 185, 102)\"></option>\n      <option value=\"rgb(102, 163, 224)\" label=\"rgb(102, 163, 224)\"></option>\n      <option value=\"rgb(194, 133, 255)\" label=\"rgb(194, 133, 255)\"></option>\n      <option value=\"rgb(136, 136, 136)\" label=\"rgb(136, 136, 136)\"></option>\n      <option value=\"rgb(161, 0, 0)\" label=\"rgb(161, 0, 0)\"></option>\n      <option value=\"rgb(178, 107, 0)\" label=\"rgb(178, 107, 0)\"></option>\n      <option value=\"rgb(178, 178, 0)\" label=\"rgb(178, 178, 0)\"></option>\n      <option value=\"rgb(0, 97, 0)\" label=\"rgb(0, 97, 0)\"></option>\n      <option value=\"rgb(0, 71, 178)\" label=\"rgb(0, 71, 178)\"></option>\n      <option value=\"rgb(107, 36, 178)\" label=\"rgb(107, 36, 178)\"></option>\n      <option value=\"rgb(68, 68, 68)\" label=\"rgb(68, 68, 68)\"></option>\n      <option value=\"rgb(92, 0, 0)\" label=\"rgb(92, 0, 0)\"></option>\n      <option value=\"rgb(102, 61, 0)\" label=\"rgb(102, 61, 0)\"></option>\n      <option value=\"rgb(102, 102, 0)\" label=\"rgb(102, 102, 0)\"></option>\n      <option value=\"rgb(0, 55, 0)\" label=\"rgb(0, 55, 0)\"></option>\n      <option value=\"rgb(0, 41, 102)\" label=\"rgb(0, 41, 102)\"></option>\n      <option value=\"rgb(61, 20, 102)\" label=\"rgb(61, 20, 102)\"></option>\n    </select>\n    <span class=\"ql-format-separator\"></span>\n    <select title=\"Background Color\" class=\"ql-background\">\n      <option value=\"rgb(0, 0, 0)\" label=\"rgb(0, 0, 0)\"></option>\n      <option value=\"rgb(230, 0, 0)\" label=\"rgb(230, 0, 0)\"></option>\n      <option value=\"rgb(255, 153, 0)\" label=\"rgb(255, 153, 0)\"></option>\n      <option value=\"rgb(255, 255, 0)\" label=\"rgb(255, 255, 0)\"></option>\n      <option value=\"rgb(0, 138, 0)\" label=\"rgb(0, 138, 0)\"></option>\n      <option value=\"rgb(0, 102, 204)\" label=\"rgb(0, 102, 204)\"></option>\n      <option value=\"rgb(153, 51, 255)\" label=\"rgb(153, 51, 255)\"></option>\n      <option value=\"rgb(255, 255, 255)\" label=\"rgb(255, 255, 255)\" selected></option>\n      <option value=\"rgb(250, 204, 204)\" label=\"rgb(250, 204, 204)\"></option>\n      <option value=\"rgb(255, 235, 204)\" label=\"rgb(255, 235, 204)\"></option>\n      <option value=\"rgb(255, 255, 204)\" label=\"rgb(255, 255, 204)\"></option>\n      <option value=\"rgb(204, 232, 204)\" label=\"rgb(204, 232, 204)\"></option>\n      <option value=\"rgb(204, 224, 245)\" label=\"rgb(204, 224, 245)\"></option>\n      <option value=\"rgb(235, 214, 255)\" label=\"rgb(235, 214, 255)\"></option>\n      <option value=\"rgb(187, 187, 187)\" label=\"rgb(187, 187, 187)\"></option>\n      <option value=\"rgb(240, 102, 102)\" label=\"rgb(240, 102, 102)\"></option>\n      <option value=\"rgb(255, 194, 102)\" label=\"rgb(255, 194, 102)\"></option>\n      <option value=\"rgb(255, 255, 102)\" label=\"rgb(255, 255, 102)\"></option>\n      <option value=\"rgb(102, 185, 102)\" label=\"rgb(102, 185, 102)\"></option>\n      <option value=\"rgb(102, 163, 224)\" label=\"rgb(102, 163, 224)\"></option>\n      <option value=\"rgb(194, 133, 255)\" label=\"rgb(194, 133, 255)\"></option>\n      <option value=\"rgb(136, 136, 136)\" label=\"rgb(136, 136, 136)\"></option>\n      <option value=\"rgb(161, 0, 0)\" label=\"rgb(161, 0, 0)\"></option>\n      <option value=\"rgb(178, 107, 0)\" label=\"rgb(178, 107, 0)\"></option>\n      <option value=\"rgb(178, 178, 0)\" label=\"rgb(178, 178, 0)\"></option>\n      <option value=\"rgb(0, 97, 0)\" label=\"rgb(0, 97, 0)\"></option>\n      <option value=\"rgb(0, 71, 178)\" label=\"rgb(0, 71, 178)\"></option>\n      <option value=\"rgb(107, 36, 178)\" label=\"rgb(107, 36, 178)\"></option>\n      <option value=\"rgb(68, 68, 68)\" label=\"rgb(68, 68, 68)\"></option>\n      <option value=\"rgb(92, 0, 0)\" label=\"rgb(92, 0, 0)\"></option>\n      <option value=\"rgb(102, 61, 0)\" label=\"rgb(102, 61, 0)\"></option>\n      <option value=\"rgb(102, 102, 0)\" label=\"rgb(102, 102, 0)\"></option>\n      <option value=\"rgb(0, 55, 0)\" label=\"rgb(0, 55, 0)\"></option>\n      <option value=\"rgb(0, 41, 102)\" label=\"rgb(0, 41, 102)\"></option>\n      <option value=\"rgb(61, 20, 102)\" label=\"rgb(61, 20, 102)\"></option>\n    </select>\n  </span>\n  <span class=\"ql-format-group\">\n    <span title=\"List\" class=\"ql-format-button ql-list\"></span>\n    <span class=\"ql-format-separator\"></span>\n    <span title=\"Bullet\" class=\"ql-format-button ql-bullet\"></span>\n    <span class=\"ql-format-separator\"></span>\n    <select title=\"Text Alignment\" class=\"ql-align\">\n      <option value=\"left\" label=\"Left\" selected></option>\n      <option value=\"center\" label=\"Center\"></option>\n      <option value=\"right\" label=\"Right\"></option>\n      <option value=\"justify\" label=\"Justify\"></option>\n    </select>\n  </span>\n  <span class=\"ql-format-group\">\n    <span title=\"Link\" class=\"ql-format-button ql-link\"></span>\n    <span class=\"ql-format-separator\"></span>\n    <span title=\"Image\" class=\"ql-format-button ql-image\"></span>\n  </span>\n</div>";
      };

      return InlineEditor;

    })();
    return window.InlineEditor = InlineEditor;
  });

}).call(this);
