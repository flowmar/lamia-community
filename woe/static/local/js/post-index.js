// Generated by CoffeeScript 1.9.2
(function() {
  $(function() {
    var Topic;
    Topic = (function() {
      function Topic(slug) {
        var topic;
        this.slug = slug;
        topic = this;
        this.page = 1;
        this.max_pages = 1;
        this.pagination = window._pagination;
        this.postHTML = Handlebars.compile(this.postHTMLTemplate());
        this.paginationHTML = Handlebars.compile(this.paginationHTMLTeplate());
        this.is_mod = window._is_topic_mod;
        this.is_logged_in = window._is_logged_in;
        this.refreshPosts();
      }

      Topic.prototype.paginationHTMLTeplate = function() {
        return "<ul class=\"pagination\">\n  <li>\n    <a href=\"#\" aria-label=\"Previous\" id=\"previous-page\">\n      <span aria-hidden=\"true\">&laquo;</span>\n    </a>\n  </li>\n  {{#each pages}}\n  <li><a href=\"#\" class=\"change-page page-link-{{this}}\">{{this}}</a></li>\n  {{/each}}\n  <li>\n    <a href=\"#\" aria-label=\"Next\" id=\"next-page\">\n      <span aria-hidden=\"true\">&raquo;</span>\n    </a>\n  </li>\n</ul>";
      };

      Topic.prototype.postHTMLTemplate = function() {
        return "<li class=\"list-group-item post-listing-info\">\n  <div class=\"row\">\n    <div class=\"col-xs-4 hidden-md hidden-lg\">\n      <img src=\"{{user_avatar_60}}\" width=\"{{user_avatar_x_60}}\" height=\"{{user_avatar_y_60}}\" class=\"\">\n    </div>\n    <div class=\"col-md-3 col-xs-8\">\n      {{#if author_online}}\n      <b><span class=\"glyphicon glyphicon-ok-sign\" aria-hidden=\"true\"></span> {{author_name}}</b>\n      {{else}}\n      <b><span class=\"glyphicon glyphicon-minus-sign\" aria-hidden=\"true\"></span> {{author_name}}</b>\n      {{/if}}\n      <span style=\"color:#F88379;\"><strong>Members</strong></span><br>\n      <span class=\"hidden-md hidden-lg\">Posted {{created}}</span>\n    </div>\n    <div class=\"col-md-9 hidden-xs hidden-sm\">\n      <span id=\"post-number-1\" class=\"post-number\" style=\"vertical-align: top;\"><a href=\"{{direct_url}}\">\#{{count}}</a></span>\n      Posted {{created}}\n    </div>\n  </div>\n</li>\n<li class=\"list-group-item post-listing-post\">\n  <div class=\"row\">\n    <div class=\"col-md-3\" style=\"text-align: center;\">\n      <img src=\"{{user_avatar}}\" width=\"{{user_avatar_x}}\" height=\"{{user_avatar_y}}\" class=\"post-member-avatar hidden-xs hidden-sm\">\n      <span class=\"hidden-xs hidden-sm\"><br><br>\n      <div class=\"post-member-self-title\">{{user_title}}</div>\n        <hr></span>\n      <div class=\"post-meta\">\n      </div>\n    </div>\n    <div class=\"col-md-9 post-right\">\n      <div class=\".post-content\" id=\"post-{{_id}}\">\n        {{{html}}}\n      </div>\n      <br>\n      <div class=\"row post-edit-likes-info\">\n          <div class=\"col-md-8\">\n            {{#if _is_logged_in}}\n            <div class=\"btn-group\" role=\"group\" aria-label=\"...\">\n              <button type=\"button\" class=\"btn btn-default\">Report</button>\n              <div class=\"btn-group\">\n                <button type=\"button\" class=\"btn btn-default\">Reply</button>\n                <button type=\"button\" class=\"btn btn-default dropdown-toggle\" data-toggle=\"dropdown\" aria-expanded=\"false\">\n                  <span class=\"caret\"></span>\n                  <span class=\"sr-only\">Toggle Dropdown</span>\n                </button>\n                <ul class=\"dropdown-menu\" role=\"menu\">\n                  <li><a href=\"#\">Quote</a></li>\n                  <li><a href=\"#\">Multiquote</a></li>\n                </ul>\n              </div>\n            {{/if}}\n              <div class=\"btn-group\" style=\"\">\n                {{#if _is_topic_mod}}\n                <button type=\"button\" class=\"btn btn-default\">Options</button>\n                <button type=\"button\" class=\"btn btn-default dropdown-toggle\" data-toggle=\"dropdown\" aria-expanded=\"false\">\n                  <span class=\"caret\"></span>\n                  <span class=\"sr-only\">Toggle Dropdown</span>\n                </button>\n                <ul class=\"dropdown-menu\" role=\"menu\">\n                  <li><a href=\"#\">Edit</a></li>\n                  <li><a href=\"#\">Hide</a></li>\n                </ul>\n                {{else}}\n                  {{#if is_author}}\n                    <button type=\"button\" class=\"btn btn-default\">Options</button>\n                    <button type=\"button\" class=\"btn btn-default dropdown-toggle\" data-toggle=\"dropdown\" aria-expanded=\"false\">\n                      <span class=\"caret\"></span>\n                      <span class=\"sr-only\">Toggle Dropdown</span>\n                    </button>\n                    <ul class=\"dropdown-menu\" role=\"menu\">\n                      <li><a href=\"#\">Edit</a></li>\n                    </ul>\n                  {{/if}}\n                {{/if}}\n              </div>\n            </div>\n        </div>\n        <div class=\"col-md-4 post-likes\">\n        </div>\n      </div>\n      <hr>\n      <div class=\"post-signature\">\n      </div>\n    </div>";
      };

      Topic.prototype.refreshPosts = function() {
        var new_post_html;
        new_post_html = "";
        return $.post("/topic/" + this.slug + "/posts", JSON.stringify({
          page: this.page,
          pagination: this.pagination
        }), (function(_this) {
          return function(data) {
            var first_post, i, j, len, post, ref;
            first_post = ((_this.page - 1) * _this.pagination) + 1;
            ref = data.posts;
            for (i = j = 0, len = ref.length; j < len; i = ++j) {
              post = ref[i];
              post.count = first_post + i;
              console.log(post.count);
              post._is_topic_mod = _this.is_mod;
              post._is_logged_in = _this.is_logged_in;
              post.direct_url = "/topic/" + _this.slug + "/page/" + _this.page + "/post/" + post._id;
              new_post_html = new_post_html + _this.postHTML(post);
            }
            return $("#post-container").html(new_post_html);
          };
        })(this));
      };

      return Topic;

    })();
    return window.topic = new Topic($("#post-container").data("slug"));
  });

}).call(this);
