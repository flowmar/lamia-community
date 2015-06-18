// Generated by CoffeeScript 1.9.3
(function() {
  var indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  $(function() {
    var Topic;
    Topic = (function() {
      function Topic(slug) {
        var initialURL, popped, socket, topic;
        this.first_load = true;
        this.slug = slug;
        topic = this;
        this.page = window._initial_page;
        this.max_pages = 1;
        this.pagination = window._pagination;
        this.postHTML = Handlebars.compile(this.postHTMLTemplate());
        this.paginationHTML = Handlebars.compile(this.paginationHTMLTemplate());
        this.is_mod = window._is_topic_mod;
        this.is_logged_in = window._is_logged_in;
        socket = io.connect('http://' + document.domain + ':3000' + '');
        socket.on("connect", (function(_this) {
          return function() {
            return socket.emit('join', "topic--" + _this.slug);
          };
        })(this));
        socket.on("console", function(data) {
          return console.log(data);
        });
        socket.on("event", function(data) {
          if (data.post != null) {
            if (topic.page === topic.max_pages) {
              data.post._is_topic_mod = topic.is_mod;
              data.post._is_logged_in = topic.is_logged_in;
              $("#post-container").append(topic.postHTML(data.post));
              return window.addExtraHTML($("#post-" + data.post._id));
            } else {
              topic.max_pages = Math.ceil(data.count / topic.pagination);
              return topic.page = topic.max_pages;
            }
          }
        });
        window.socket = socket;
        this.refreshPosts();
        if (window._can_edit != null) {
          this.inline_editor = new InlineEditor("#new-post-box", "", false);
          this.inline_editor.onSave(function(html, text) {
            return $.post("/t/" + topic.slug + "/new-post", JSON.stringify({
              post: html,
              text: text
            }), (function(_this) {
              return function(data) {
                if (data.closed_topic != null) {
                  topic.inline_editor.flashError("Topic Closed: " + data.closed_message);
                }
                if (data.no_content != null) {
                  topic.inline_editor.flashError("Your post has no text.");
                }
                if (data.error != null) {
                  topic.inline_editor.flashError(data.error);
                }
                data.newest_post.author_online = true;
                if (data.success != null) {
                  topic.inline_editor.clearEditor();
                  socket.emit("event", {
                    room: "topic--" + topic.slug,
                    post: data.newest_post,
                    count: data.count
                  });
                  if (topic.page === topic.max_pages) {
                    $("#post-container").append(topic.postHTML(data.newest_post));
                    return window.addExtraHTML($("#post-" + data.newest_post._id));
                  } else {
                    topic.max_pages = Math.ceil(data.count / topic.pagination);
                    topic.page = topic.max_pages;
                    return topic.refreshPosts();
                  }
                }
              };
            })(this));
          });
        }
        $("#post-container").delegate(".post-edit", "click", function(e) {
          var element, inline_editor, post_buttons, post_content;
          e.preventDefault();
          element = $(this);
          post_content = $("#post-" + element.data("pk"));
          post_buttons = $("#post-buttons-" + element.data("pk"));
          post_buttons.hide();
          inline_editor = new InlineEditor("#post-" + element.data("pk"), "/t/" + topic.slug + "/edit-post/" + (element.data("pk")), true, true);
          inline_editor.onSave(function(html, text, edit_reason) {
            console.log(edit_reason);
            return $.post("/t/" + topic.slug + "/edit-post", JSON.stringify({
              pk: element.data("pk"),
              post: html,
              text: text,
              edit_reason: edit_reason
            }), (function(_this) {
              return function(data) {
                if (data.error != null) {
                  inline_editor.flashError(data.error);
                }
                if (data.success != null) {
                  inline_editor.destroyEditor();
                  post_content.html(data.html);
                  window.addExtraHTML(post_content);
                  return post_buttons.show();
                }
              };
            })(this));
          });
          return inline_editor.onCancel(function(html, text) {
            inline_editor.destroyEditor();
            inline_editor.resetElementHtml();
            window.addExtraHTML($("#post-" + element.data("pk")));
            return post_buttons.show();
          });
        });
        $("nav.pagination-listing").delegate("#previous-page", "click", function(e) {
          var element;
          e.preventDefault();
          element = $(this);
          if (topic.page !== 1) {
            $(".change-page").parent().removeClass("active");
            topic.page--;
            return topic.refreshPosts();
          }
        });
        $("nav.pagination-listing").delegate("#next-page", "click", function(e) {
          var element;
          e.preventDefault();
          element = $(this);
          if (topic.page !== topic.max_pages) {
            $(".change-page").parent().removeClass("active");
            topic.page++;
            return topic.refreshPosts();
          }
        });
        $("nav.pagination-listing").delegate(".change-page", "click", function(e) {
          var element;
          e.preventDefault();
          element = $(this);
          topic.page = parseInt(element.text());
          return topic.refreshPosts();
        });
        $("nav.pagination-listing").delegate("#go-to-end", "click", function(e) {
          var element;
          e.preventDefault();
          element = $(this);
          topic.page = parseInt(topic.max_pages);
          return topic.refreshPosts();
        });
        $("nav.pagination-listing").delegate("#go-to-start", "click", function(e) {
          var element;
          e.preventDefault();
          element = $(this);
          topic.page = 1;
          return topic.refreshPosts();
        });
        popped = (indexOf.call(window.history, 'state') >= 0);
        initialURL = location.href;
        $(window).on("popstate", function(e) {
          var initialPop;
          initialPop = !popped && location.href === initialURL;
          popped = true;
          if (initialPop) {
            return;
          }
          return setTimeout(function() {
            return window.location = window.location;
          }, 200);
        });
        window.RegisterAttachmentContainer("#post-container");
      }

      Topic.prototype.paginationHTMLTemplate = function() {
        return "<ul class=\"pagination\">\n  <li>\n    <a href=\"\" aria-label=\"Start\" id=\"go-to-start\">\n      <span aria-hidden=\"true\">Go to Start</span>\n    </a>\n  </li>\n  <li>\n    <a href=\"\" aria-label=\"Previous\" id=\"previous-page\">\n      <span aria-hidden=\"true\">&laquo;</span>\n    </a>\n  </li>\n  {{#each pages}}\n  <li><a href=\"\" class=\"change-page page-link-{{this}}\">{{this}}</a></li>\n  {{/each}}\n  <li>\n    <a href=\"\" aria-label=\"Next\" id=\"next-page\">\n      <span aria-hidden=\"true\">&raquo;</span>\n    </a>\n  </li>\n  <li>\n    <a href=\"\" aria-label=\"End\" id=\"go-to-end\">\n      <span aria-hidden=\"true\">Go to End</span>\n    </a>\n  </li>\n</ul>";
      };

      Topic.prototype.postHTMLTemplate = function() {
        return "<li class=\"list-group-item post-listing-info\">\n  <div class=\"row\">\n    <div class=\"col-xs-4 hidden-md hidden-lg\">\n      <a href=\"/member/{{author_login_name}}\"><img src=\"{{user_avatar_60}}\" width=\"{{user_avatar_x_60}}\" height=\"{{user_avatar_y_60}}\" class=\"avatar-mini\"></a>\n    </div>\n    <div class=\"col-md-3 col-xs-8\">\n      {{#if author_online}}\n      <b><span class=\"glyphicon glyphicon-ok-sign\" aria-hidden=\"true\"></span> <a href=\"/member/{{author_login_name}}\">{{author_name}}</a></b>\n      {{else}}\n      <b><span class=\"glyphicon glyphicon-minus-sign\" aria-hidden=\"true\"></span> <a href=\"/member/{{author_login_name}}\" class=\"inherit_colors\">{{author_name}}</a></b>\n      {{/if}}\n      {{#unless author_group_name}}\n      <span style=\"color:#F88379;\"><strong>Members</strong></span><br>\n      {{else}}\n      {{group_pre_html}}{{author_group_name}}{{group_post_html}}\n      {{/unless}}\n      <span class=\"hidden-md hidden-lg\">Posted {{created}}</span>\n    </div>\n    <div class=\"col-md-9 hidden-xs hidden-sm\">\n      <span id=\"post-number-1\" class=\"post-number\" style=\"vertical-align: top;\"><a href=\"{{direct_url}}\" id=\"postlink-{{_id}}\">\#{{count}}</a></span>\n      Posted {{created}}\n    </div>\n  </div>\n</li>\n<li class=\"list-group-item post-listing-post\">\n  <div class=\"row\">\n    <div class=\"col-md-3\" style=\"text-align: center;\">\n      <a href=\"/member/{{author_login_name}}\"><img src=\"{{user_avatar}}\" width=\"{{user_avatar_x}}\" height=\"{{user_avatar_y}}\" class=\"post-member-avatar hidden-xs hidden-sm\"></a>\n      <span class=\"hidden-xs hidden-sm\"><br><br>\n      <div class=\"post-member-self-title\">{{user_title}}</div>\n        <hr></span>\n      <div class=\"post-meta\">\n      </div>\n    </div>\n    <div class=\"col-md-9 post-right\">\n      <div class=\".post-content\" id=\"post-{{_id}}\">\n        {{{html}}}\n      </div>\n      <br>\n      <div class=\"row post-edit-likes-info\" id=\"post-buttons-{{_id}}\">\n          <div class=\"col-md-8\">\n            {{#if _is_logged_in}}\n            <div class=\"btn-group\" role=\"group\" aria-label=\"...\">\n              <button type=\"button\" class=\"btn btn-default\">Report</button>\n              <div class=\"btn-group\">\n                <button type=\"button\" class=\"btn btn-default\">Quote</button>\n                <!-- <button type=\"button\" class=\"btn btn-default dropdown-toggle\" data-toggle=\"dropdown\" aria-expanded=\"false\">\n                  <span class=\"caret\"></span>\n                  <span class=\"sr-only\">Toggle Dropdown</span>\n                </button>\n                <ul class=\"dropdown-menu\" role=\"menu\">\n                  <li><a href=\"\">Quote</a></li>\n                  <li><a href=\"\">Multiquote</a></li>\n                </ul> -->\n              </div>\n            {{/if}}\n              <div class=\"btn-group\" style=\"\">\n                {{#if _is_topic_mod}}\n                <button type=\"button\" class=\"btn btn-default\">Options</button>\n                <button type=\"button\" class=\"btn btn-default dropdown-toggle\" data-toggle=\"dropdown\" aria-expanded=\"false\">\n                  <span class=\"caret\"></span>\n                  <span class=\"sr-only\">Toggle Dropdown</span>\n                </button>\n                <ul class=\"dropdown-menu\" role=\"menu\">\n                  <li><a href=\"\" class=\"post-edit\" data-pk=\"{{_id}}\">Edit</a></li>\n                  <li><a href=\"\">Hide</a></li>\n                </ul>\n                {{else}}\n                  {{#if is_author}}\n                    <button type=\"button\" class=\"btn btn-default\">Options</button>\n                    <button type=\"button\" class=\"btn btn-default dropdown-toggle\" data-toggle=\"dropdown\" aria-expanded=\"false\">\n                      <span class=\"caret\"></span>\n                      <span class=\"sr-only\">Toggle Dropdown</span>\n                    </button>\n                    <ul class=\"dropdown-menu\" role=\"menu\">\n                      <li><a href=\"\" class=\"post-edit\" data-pk=\"{{_id}}\">Edit</a></li>\n                    </ul>\n                  {{/if}}\n                {{/if}}\n              </div>\n            </div>\n        </div>\n        <div class=\"col-md-4 post-likes\">\n        </div>\n      </div>\n      <hr>\n      <div class=\"post-signature\">\n      </div>\n    </div>";
      };

      Topic.prototype.refreshPosts = function() {
        var new_post_html;
        new_post_html = "";
        return $.post("/t/" + this.slug + "/posts", JSON.stringify({
          page: this.page,
          pagination: this.pagination
        }), (function(_this) {
          return function(data) {
            var first_post, i, j, k, l, len, m, n, pages, pagination_html, post, ref, ref1, ref2, ref3, ref4, ref5, ref6, results, results1, results2, results3;
            if (!_this.first_load) {
              history.pushState({
                id: "topic-page-" + _this.page
              }, '', "/t/" + _this.slug + "/page/" + _this.page);
            } else {
              _this.first_load = false;
            }
            first_post = ((_this.page - 1) * _this.pagination) + 1;
            ref = data.posts;
            for (i = j = 0, len = ref.length; j < len; i = ++j) {
              post = ref[i];
              post.count = first_post + i;
              post._is_topic_mod = _this.is_mod;
              post._is_logged_in = _this.is_logged_in;
              post.direct_url = "/t/" + _this.slug + "/page/" + _this.page + "/post/" + post._id;
              new_post_html = new_post_html + _this.postHTML(post);
            }
            pages = [];
            _this.max_pages = Math.ceil(data.count / _this.pagination);
            if (_this.max_pages > 5) {
              if (_this.page > 3 && _this.page < _this.max_pages - 5) {
                pages = (function() {
                  results = [];
                  for (var k = ref1 = _this.page - 2, ref2 = _this.page + 5; ref1 <= ref2 ? k <= ref2 : k >= ref2; ref1 <= ref2 ? k++ : k--){ results.push(k); }
                  return results;
                }).apply(this);
              } else if (_this.page > 3) {
                pages = (function() {
                  results1 = [];
                  for (var l = ref3 = _this.page - 2, ref4 = _this.max_pages; ref3 <= ref4 ? l <= ref4 : l >= ref4; ref3 <= ref4 ? l++ : l--){ results1.push(l); }
                  return results1;
                }).apply(this);
              } else if (_this.page <= 3) {
                pages = (function() {
                  results2 = [];
                  for (var m = 1, ref5 = _this.page + 5; 1 <= ref5 ? m <= ref5 : m >= ref5; 1 <= ref5 ? m++ : m--){ results2.push(m); }
                  return results2;
                }).apply(this);
              }
            } else {
              pages = (function() {
                results3 = [];
                for (var n = 1, ref6 = Math.ceil(data.count / _this.pagination); 1 <= ref6 ? n <= ref6 : n >= ref6; 1 <= ref6 ? n++ : n--){ results3.push(n); }
                return results3;
              }).apply(this);
            }
            pagination_html = _this.paginationHTML({
              pages: pages
            });
            $(".pagination-listing").html(pagination_html);
            $("#post-container").html(new_post_html);
            $(".page-link-" + _this.page).parent().addClass("active");
            if (window._initial_post !== "") {
              setTimeout(function() {
                $("#postlink-" + window._initial_post)[0].scrollIntoView();
                return window._initial_post = "";
              }, 100);
            } else {
              setTimeout(function() {
                return $("#topic-breadcrumb")[0].scrollIntoView();
              }, 100);
            }
            return window.setupContent();
          };
        })(this));
      };

      return Topic;

    })();
    return window.topic = new Topic($("#post-container").data("slug"));
  });

}).call(this);
