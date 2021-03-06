// Generated by CoffeeScript 1.12.7
(function() {
  $(function() {
    var $grid, _option, author, blogHTML, blogHTMLTemplate, j, len, ref, select_options;
    window.addExtraHTML(".list-group-item");
    $grid = $('#blog-container');
    window.grid = $grid;
    $grid.shuffle({
      itemSelector: '.blog-index-panel',
      speed: 0
    });
    blogHTMLTemplate = "<div class=\"col-xs-12 col-sm-6 blog-index-panel\">\n  <div class=\"panel panel-default\">\n    <div class=\"panel-body\">\n      <center>\n        <div class=\"media-left\"><img src=\"{{recent_entry_avatar}}\" class=\"avatar-mini\" width=\"{{recent_entry_avatar_x}}\" height=\"{{recent_entry_avatar_y}}\" /></div>\n        <div class=\"media-body\">\n          <a href=\"/blog/{{slug}}\">{{name}}</a>\n          <br>\n          <a href=\"/blog/{{slug}}/{{recent_entry_slug}}\">{{recent_entry_title}}</a>\n          <br>\n          <span class=\"text-muted\">{{recent_entry_time}}</span>\n        </div>\n        <hr>\n        <br>\n        <p class=\"blog-preview-text\">{{{recent_entry_content}}}</p>\n      </center>\n    </div>\n  </div>\n</div>";
    blogHTML = Handlebars.compile(blogHTMLTemplate);
    if (window.authors.length > 0) {
      ref = window.authors;
      for (j = 0, len = ref.length; j < len; j++) {
        author = ref[j];
        _option = "<option value=\"" + author.id + "\" selected=\"selected\">" + author.text + "</option>";
        $(".by-who").append(_option);
        $(".by-who-two").append(_option);
      }
    }
    $(".search-for").val(window.search);
    $(".how-many").val(window.count);
    select_options = {
      ajax: {
        url: "/user-list-api",
        dataType: 'json',
        delay: 250,
        data: function(params) {
          return {
            q: params.term
          };
        },
        processResults: function(data, page) {
          console.log({
            results: data.results
          });
          return {
            results: data.results
          };
        },
        cache: true
      },
      minimumInputLength: 2
    };
    $(".by-who").select2(select_options);
    $(".by-who-two").select2(select_options);
    $(".how-many").change(function(e) {
      return console.log($(this).val());
    });
    $(".update-blogs").click(function(e) {
      var authors, how_many, search;
      e.preventDefault();
      how_many = $(this).parent().parent().find(".how-many").val();
      authors = $(this).parent().parent().find(".author").val();
      search = $(this).parent().parent().find(".search-for").val();
      return $.post("/blogs", JSON.stringify({
        count: how_many,
        authors: authors,
        search: search
      }), function(data) {
        var blog, i, items, k, len1, ref1;
        $('#msg-container').html("");
        if ($('.blog-index-panel').length > 0) {
          $grid.shuffle("remove", $('.blog-index-panel'));
        }
        if (data.blogs.length === 0) {
          return $('#msg-container').html("<p>No results...</p>");
        } else {
          items = [];
          ref1 = data.blogs;
          for (i = k = 0, len1 = ref1.length; k < len1; i = ++k) {
            blog = ref1[i];
            if (i === 0) {
              items = $(blogHTML(blog));
            } else {
              items = items.add(blogHTML(blog));
            }
          }
          $('#blog-container').append(items);
          $('#blog-container').css({
            height: count * 2 * 200
          });
          $('.blog-index-panel').dotdotdot({
            height: 200,
            after: ".readmore"
          });
          return setTimeout(function() {
            $('#blog-container').shuffle('appended', items);
            return $('#blog-container').shuffle('update');
          }, 0);
        }
      });
    });
    $(".update-blogs-two").click(function(e) {
      var authors, how_many, search;
      e.preventDefault();
      how_many = $(this).parent().parent().find(".how-many").val();
      authors = $(this).parent().parent().find(".author").val();
      search = $(this).parent().parent().find(".search-for").val();
      return $.post("/blogs", JSON.stringify({
        count: how_many,
        authors: authors,
        search: search
      }), function(data) {
        return $('#msg-container').html("");
      });
    });
    return $(".update-blogs").click();
  });

}).call(this);
