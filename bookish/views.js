// Generated by CoffeeScript 1.3.3
(function() {

  define(['exports', 'underscore', 'backbone', 'marionette', 'jquery', 'aloha', 'bookish/controller', 'bookish/models', './languages', 'hbs!bookish/views/content-edit', 'hbs!bookish/views/search-box', 'hbs!bookish/views/search-results', 'hbs!bookish/views/search-results-item', 'hbs!bookish/views/modal-wrapper', 'hbs!bookish/views/edit-metadata', 'hbs!bookish/views/edit-roles', 'hbs!bookish/views/language-variants', 'hbs!bookish/views/aloha-toolbar', 'hbs!bookish/views/sign-in-out', 'hbs!bookish/views/book-edit', 'i18n!bookish/nls/strings', 'bootstrap', 'select2', 'css!font-awesome'], function(exports, _, Backbone, Marionette, jQuery, Aloha, Controller, Models, Languages, CONTENT_EDIT, SEARCH_BOX, SEARCH_RESULT, SEARCH_RESULT_ITEM, DIALOG_WRAPPER, EDIT_METADATA, EDIT_ROLES, LANGUAGE_VARIANTS, ALOHA_TOOLBAR, SIGN_IN_OUT, BOOK_EDIT, __) {
    var DELAY_BEFORE_SAVING, LANGUAGES, METADATA_SUBJECTS, SELECT2_AJAX_HANDLER, SELECT2_MAKE_SORTABLE, languageCode, value, _ref;
    DELAY_BEFORE_SAVING = 3000;
    SELECT2_AJAX_HANDLER = function(url) {
      return {
        quietMillis: 500,
        url: url,
        dataType: 'json',
        data: function(term, page) {
          return {
            q: term
          };
        },
        results: function(data, page) {
          var id;
          return {
            results: (function() {
              var _i, _len, _results;
              _results = [];
              for (_i = 0, _len = data.length; _i < _len; _i++) {
                id = data[_i];
                _results.push({
                  id: id,
                  text: id
                });
              }
              return _results;
            })()
          };
        }
      };
    };
    SELECT2_MAKE_SORTABLE = function($el) {
      return Aloha.ready(function() {
        return $el.select2('container').find('ul.select2-choices').sortable({
          cursor: 'move',
          containment: 'parent',
          start: function() {
            return $el.select2('onSortStart');
          },
          update: function() {
            return $el.select2('onSortEnd');
          }
        });
      });
    };
    METADATA_SUBJECTS = ['Arts', 'Mathematics and Statistics', 'Business', 'Science and Technology', 'Humanities', 'Social Sciences'];
    LANGUAGES = [
      {
        code: '',
        "native": '',
        english: ''
      }
    ];
    _ref = Languages.getLanguages();
    for (languageCode in _ref) {
      value = _ref[languageCode];
      value = jQuery.extend({}, value);
      jQuery.extend(value, {
        code: languageCode
      });
      LANGUAGES.push(value);
    }
    exports.SearchResultsItemView = Marionette.ItemView.extend({
      tagName: 'tr',
      template: SEARCH_RESULT_ITEM,
      onRender: function() {
        var _this = this;
        return this.$el.on('click', function() {
          return Controller.editModel(_this.model);
        });
      },
      templateHelpers: function() {
        var attribute, changes;
        changes = this.model.changedAttributes() || {};
        for (attribute in changes) {
          if (!this.model.previous(attribute)) {
            delete changes[attribute];
          }
        }
        return {
          hasChanged: _.keys(changes).length
        };
      }
    });
    exports.SearchResultsView = Marionette.CompositeView.extend({
      template: SEARCH_RESULT,
      itemViewContainer: 'tbody',
      itemView: exports.SearchResultsItemView,
      initialize: function() {
        var _this = this;
        this.listenTo(this.collection, 'reset', function() {
          return _this.render();
        });
        this.listenTo(this.collection, 'add', function() {
          return _this.render();
        });
        return this.listenTo(this.collection, 'remove', function() {
          return _this.render();
        });
      }
    });
    exports.SearchBoxView = Marionette.ItemView.extend({
      template: SEARCH_BOX,
      events: {
        'keyup #search': 'setFilter',
        'change #search': 'setFilter'
      },
      initialize: function() {
        if (!this.model.setFilter) {
          throw 'BUG: You must wrap the collection in a FilterableCollection';
        }
      },
      setFilter: function(evt) {
        var $searchBox, filterStr;
        $searchBox = jQuery(this.$el).find('#search');
        filterStr = $searchBox.val();
        if (filterStr.length < 2) {
          filterStr = '';
        }
        return this.model.setFilter(filterStr);
      }
    });
    exports.AlohaEditView = Marionette.ItemView.extend({
      template: function() {
        throw 'You need to specify a template, modelKey, and optionally alohaOptions';
      },
      modelKey: null,
      alohaOptions: null,
      initialize: function() {
        var _this = this;
        this.listenTo(this.model, 'change:_done', function(model, value, options) {
          return _this.render();
        });
        return this.listenTo(this.model, "change:" + this.modelKey, function(model, value, options) {
          var alohaEditable, alohaId, editableBody;
          if (options.internalAlohaUpdate) {
            return;
          }
          alohaId = _this.$el.attr('id');
          if (alohaId && _this.$el.parents()[0]) {
            alohaEditable = Aloha.getEditableById(alohaId);
            editableBody = alohaEditable.getContents();
            if (value !== editableBody) {
              return alohaEditable.setContents(value);
            }
          } else {
            return _this.$el.empty().append(value);
          }
        });
      },
      onRender: function() {
        var updateModelAndSave,
          _this = this;
        if (typeof MathJax !== "undefined" && MathJax !== null) {
          MathJax.Hub.Configured();
        }
        if (this.model.get('_done')) {
          this.$el.addClass('disabled');
          Aloha.ready(function() {
            _this.$el.aloha(_this.alohaOptions);
            return _this.$el.removeClass('disabled');
          });
          updateModelAndSave = function() {
            var alohaEditable, alohaId, editableBody;
            alohaId = _this.$el.attr('id');
            if (alohaId) {
              alohaEditable = Aloha.getEditableById(alohaId);
              editableBody = alohaEditable.getContents();
              return _this.model.set(_this.modelKey, editableBody, {
                internalAlohaUpdate: true
              });
            }
          };
          return this.$el.on('blur', updateModelAndSave);
        }
      }
    });
    exports.ContentEditView = exports.AlohaEditView.extend({
      template: CONTENT_EDIT,
      modelKey: 'body'
    });
    exports.TitleEditView = exports.AlohaEditView.extend({
      template: function(serialized_model) {
        return "" + (serialized_model.title || 'Untitled');
      },
      modelKey: 'title',
      tagName: 'span'
    });
    exports.ContentToolbarView = Marionette.ItemView.extend({
      template: ALOHA_TOOLBAR,
      onRender: function() {
        var _this = this;
        this.$el.addClass('disabled');
        return Aloha.ready(function() {
          return _this.$el.removeClass('disabled');
        });
      }
    });
    exports.MetadataEditView = Marionette.ItemView.extend({
      template: EDIT_METADATA,
      events: {
        'change *[name=language]': '_updateLanguageVariant'
      },
      initialize: function() {
        var _this = this;
        this.listenTo(this.model, 'change:language', function() {
          return _this._updateLanguage();
        });
        this.listenTo(this.model, 'change:subjects', function() {
          return _this._updateSubjects();
        });
        return this.listenTo(this.model, 'change:keywords', function() {
          return _this._updateKeywords();
        });
      },
      _updateLanguage: function() {
        var lang, language;
        language = this.model.get('language') || '';
        lang = language.split('-')[0];
        this.$el.find("*[name=language]").select2('val', lang);
        return this._updateLanguageVariant();
      },
      _updateLanguageVariant: function() {
        var $label, $language, $variant, code, lang, language, variant, variants, _ref1, _ref2;
        $language = this.$el.find('*[name=language]');
        language = this.model.get('language') || '';
        _ref1 = language.split('-'), lang = _ref1[0], variant = _ref1[1];
        if ($language.val() !== lang) {
          lang = $language.val();
          variant = null;
        }
        $variant = this.$el.find('*[name=variantLanguage]');
        $label = this.$el.find('*[for=variantLanguage]');
        variants = [];
        _ref2 = Languages.getCombined();
        for (code in _ref2) {
          value = _ref2[code];
          if (code.slice(0, 2) === lang) {
            jQuery.extend(value, {
              code: code
            });
            variants.push(value);
          }
        }
        if (variants.length > 0) {
          $variant.removeAttr('disabled');
          $variant.html(LANGUAGE_VARIANTS({
            'variants': variants
          }));
          $variant.find("option[value=" + language + "]").attr('selected', true);
          $label.removeClass('hidden');
          return $variant.removeClass('hidden');
        } else {
          $variant.empty().attr('disabled', true);
          $variant.addClass('hidden');
          return $label.addClass('hidden');
        }
      },
      _updateSelect2: function(key) {
        return this.$el.find("*[name=" + key + "]").select2('val', this.model.get(key));
      },
      _updateSubjects: function() {
        return this._updateSelect2('subjects');
      },
      _updateKeywords: function() {
        return this._updateSelect2('keywords');
      },
      onRender: function() {
        var $keywords, $lang, $languages, $subjects, lang, _i, _len;
        $languages = this.$el.find('*[name=language]');
        for (_i = 0, _len = LANGUAGES.length; _i < _len; _i++) {
          lang = LANGUAGES[_i];
          $lang = jQuery('<option></option>').attr('value', lang.code).text(lang["native"]);
          $languages.append($lang);
        }
        $languages.select2({
          placeholder: __('Select a language')
        });
        $subjects = this.$el.find('*[name=subjects]');
        $subjects.select2({
          tags: METADATA_SUBJECTS,
          tokenSeparators: [','],
          separator: '|'
        });
        $keywords = this.$el.find('*[name=keywords]');
        $keywords.select2({
          tags: this.model.get('keywords') || [],
          tokenSeparators: [','],
          separator: '|',
          initSelection: function(element, callback) {
            var data;
            data = [];
            _.each(element.val().split('|'), function(str) {
              return data.push({
                id: str,
                text: str
              });
            });
            return callback(data);
          }
        });
        this._updateLanguage();
        this._updateSubjects();
        this._updateKeywords();
        return this.delegateEvents();
      },
      attrsToSave: function() {
        var keywords, kw, language, subjects, variant;
        language = this.$el.find('*[name=language]').val();
        variant = this.$el.find('*[name=variantLanguage]').val();
        language = variant || language;
        subjects = (function() {
          var _i, _len, _ref1, _results;
          _ref1 = this.$el.find('*[name=subjects]').val().split('|');
          _results = [];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            kw = _ref1[_i];
            _results.push(kw);
          }
          return _results;
        }).call(this);
        if ('' === subjects[0]) {
          subjects = [];
        }
        keywords = (function() {
          var _i, _len, _ref1, _results;
          _ref1 = this.$el.find('*[name=keywords]').val().split('|');
          _results = [];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            kw = _ref1[_i];
            _results.push(kw);
          }
          return _results;
        }).call(this);
        if ('' === keywords[0]) {
          keywords = [];
        }
        return {
          language: language,
          subjects: subjects,
          keywords: keywords
        };
      }
    });
    exports.RolesEditView = Marionette.ItemView.extend({
      template: EDIT_ROLES,
      onRender: function() {
        var $authors, $copyrightHolders;
        $authors = this.$el.find('*[name=authors]');
        $copyrightHolders = this.$el.find('*[name=copyrightHolders]');
        $authors.select2({
          tags: this.model.get('authors') || [],
          tokenSeparators: [','],
          separator: '|'
        });
        $copyrightHolders.select2({
          tags: this.model.get('copyrightHolders') || [],
          tokenSeparators: [','],
          separator: '|'
        });
        SELECT2_MAKE_SORTABLE($authors);
        SELECT2_MAKE_SORTABLE($copyrightHolders);
        this._updateAuthors();
        this._updateCopyrightHolders();
        return this.delegateEvents();
      },
      _updateAuthors: function() {
        return this.$el.find('*[name=authors]').select2('val', this.model.get('authors') || []);
      },
      _updateCopyrightHolders: function() {
        return this.$el.find('*[name=copyrightHolders]').select2('val', this.model.get('copyrightHolders') || []);
      },
      attrsToSave: function() {
        var authors, copyrightHolders, kw;
        authors = (function() {
          var _i, _len, _ref1, _results;
          _ref1 = this.$el.find('*[name=authors]').val().split('|');
          _results = [];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            kw = _ref1[_i];
            _results.push(kw);
          }
          return _results;
        }).call(this);
        copyrightHolders = (function() {
          var _i, _len, _ref1, _results;
          _ref1 = this.$el.find('*[name=copyrightHolders]').val().split('|');
          _results = [];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            kw = _ref1[_i];
            _results.push(kw);
          }
          return _results;
        }).call(this);
        return {
          authors: authors,
          copyrightHolders: copyrightHolders
        };
      }
    });
    exports.DialogWrapper = Marionette.ItemView.extend({
      template: DIALOG_WRAPPER,
      onRender: function() {
        var _this = this;
        this.options.view.render();
        this.$el.find('.dialog-body').append(this.options.view.$el);
        this.$el.on('click', '.cancel', function() {
          return _this.trigger('cancelled');
        });
        return this.$el.on('click', '.save', function(evt) {
          var attrs;
          evt.preventDefault();
          attrs = _this.options.view.attrsToSave();
          return _this.options.view.model.save(attrs, {
            success: function(res) {
              _this.options.view.model.trigger('sync');
              return _this.trigger('saved');
            },
            error: function(res) {
              return alert('Something went wrong when saving: ' + res);
            }
          });
        });
      }
    });
    exports.AuthView = Marionette.ItemView.extend({
      template: SIGN_IN_OUT,
      events: {
        'click #sign-in': 'signIn',
        'click #sign-out': 'signOut',
        'click #save-content': 'saveContent'
      },
      initialize: function() {
        var beforeUnload, disableSave,
          _this = this;
        beforeUnload = function() {
          if (_this.hasChanged) {
            return 'You have unsaved changes. Are you sure you want to leave this page?';
          }
        };
        jQuery(window).on('beforeunload', beforeUnload);
        this.listenTo(this.model, 'change', function() {
          return _this.render();
        });
        this.listenTo(this.model, 'change:userid', function() {
          return _this.render();
        });
        this.listenTo(Models.ALL_CONTENT, 'change', function(model, b, c) {
          var $save, checkIfContentActuallyChanged;
          $save = _this.$el.find('#save-content');
          checkIfContentActuallyChanged = function() {
            if (model.hasChanged()) {
              _this.hasChanged = true;
              $save.removeClass('disabled');
              return $save.addClass('btn-primary');
            }
          };
          return setTimeout((function() {
            return checkIfContentActuallyChanged();
          }), 100);
        });
        disableSave = function() {
          var $save;
          _this.hasChanged = false;
          $save = _this.$el.find('#save-content');
          $save.addClass('disabled');
          return $save.removeClass('btn-primary');
        };
        this.listenTo(Models.ALL_CONTENT, 'sync', disableSave);
        this.listenTo(Models.ALL_CONTENT, 'reset', disableSave);
        return this.listenTo(this.model, 'change', function() {
          return _this.render();
        });
      },
      onRender: function() {
        return this.$el.find('*[title]').tooltip();
      },
      signIn: function() {},
      signOut: function() {
        return this.model.signOut();
      },
      saveContent: function() {
        var $alertError, $errorBar, $label, $save, $saving, $successBar, allContent, errorCount, finished, recSave, total;
        if (!this.model.get('password')) {
          return alert('You need to sign (and make sure you can edit) before you can save changes');
        }
        $save = this.$el.find('#save-progress-modal');
        $saving = $save.find('.saving');
        $alertError = $save.find('.alert-error');
        $successBar = $save.find('.progress > .bar.success');
        $errorBar = $save.find('.progress > .bar.error');
        $label = $save.find('.label');
        allContent = Models.ALL_CONTENT.filter(function(model) {
          return model.hasChanged();
        });
        total = allContent.length;
        errorCount = 0;
        finished = false;
        recSave = function() {
          var model, saving;
          $successBar.width(((total - allContent.length - errorCount) * 100 / total) + '%');
          $errorBar.width((errorCount * 100 / total) + '%');
          if (allContent.length === 0) {
            if (errorCount === 0) {
              finished = true;
              Models.ALL_CONTENT.trigger('sync');
              Models.ALL_CONTENT.each(function(model) {
                return delete model.changed;
              });
              return $save.modal('hide');
            } else {
              return $alertError.removeClass('hide');
            }
          } else {
            model = allContent.shift();
            $label.text(model.get('title'));
            saving = model.save(null, {
              success: recSave,
              error: function() {
                return errorCount += 1;
              }
            });
            if (!saving) {
              console.log("Skipping " + model.id + " because it is not valid");
              return recSave();
            }
          }
        };
        $alertError.addClass('hide');
        $saving.removeClass('hide');
        $save.modal('show');
        recSave();
        return setTimeout(function() {
          if (total && (!finished || errorCount)) {
            $save.modal('show');
            $alertError.removeClass('hide');
            return $saving.addClass('hide');
          }
        }, 5000);
      }
    });
    exports.BookEditView = Marionette.ItemView.extend({
      template: BOOK_EDIT,
      events: {
        'click .edit-content': 'editModel',
        'click #nav-close': 'closeView',
        'click #add-section': 'prependSection',
        'click #add-content': 'prependContent'
      },
      initialize: function() {
        var _this = this;
        return this.listenTo(this.model, 'all', function() {
          return _this.render();
        });
      },
      prependSection: function() {
        return this.model.prependNewContent({
          title: 'Untitled Section'
        });
      },
      prependContent: function() {
        return this.model.prependNewContent({
          title: 'Untitled Content'
        }, 'application/vnd.org.cnx.module');
      },
      closeView: function() {
        return Controller.hideSidebar();
      },
      editModel: function(evt) {
        var href, id, model, path, _ref1;
        evt.preventDefault();
        href = jQuery(evt.target).parents('li').first().children('span').attr('data-id');
        _ref1 = href.split('#'), path = _ref1[0], id = _ref1[1];
        model = this.model.manifest.get(path);
        return Controller.editModel(model, id);
      },
      onRender: function() {
        var _this = this;
        return Aloha.ready(function() {
          var model;
          model = _this.model;
          _this.$el.find('.editor-node').draggable({
            revert: 'invalid',
            helper: function(evt) {
              var $clone;
              $clone = jQuery(evt.target).clone(true);
              $clone.children('ol').remove();
              return $clone;
            }
          });
          return _this.$el.find('.editor-drop-zone').droppable({
            accept: '.editor-node',
            activeClass: 'editor-drop-zone-active',
            hoverClass: 'editor-drop-zone-hover',
            drop: function(evt, ui) {
              var $drag, $drop, $li, $root, delay;
              $drag = ui.draggable;
              $drop = jQuery(evt.target);
              $root = $drop.parents('nav[data-type="toc"]');
              $li = $drop.parent();
              delay = function() {
                var $ol;
                if ($drag.parent().children().length === 1) {
                  $drag.parent().remove();
                }
                if ($drop.hasClass('editor-drop-zone-before')) {
                  $drag.insertBefore($li);
                }
                if ($drop.hasClass('editor-drop-zone-after')) {
                  $drag.insertAfter($li);
                }
                if ($drop.hasClass('editor-drop-zone-in')) {
                  if (!$li.children('ol')[0]) {
                    $li.append('<ol></ol>');
                  }
                  $ol = $li.children('ol');
                  $ol.append($drag);
                }
                $root.find('.ui-draggable-dragging').remove();
                $root.find('*').removeClass('editor-drop-zone-in ui-droppable ui-draggable');
                return _this.model.set('navTreeStr', JSON.stringify(_this.model.parseNavTree($root).children));
              };
              return setTimeout(delay, 10);
            }
          });
        });
      }
    });
    return exports;
  });

}).call(this);
