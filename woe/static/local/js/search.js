// Generated by CoffeeScript 1.9.3
(function() {
  $(function() {
    $("#start-date").datepicker({
      format: "m/d/yy",
      clearBtn: true
    });
    $("#end-date").datepicker({
      format: "m/d/yy",
      clearBtn: true
    });
    $("#content-search").change(function(e) {
      var content_type;
      content_type = $(this).val();
      if (content_type === "posts") {
        $(".variable-option").hide();
        return $(".posts-option").show();
      } else if (content_type === "topics") {
        $(".variable-option").hide();
        return $(".topics-option").show();
      } else if (content_type === "status") {
        return $(".variable-option").hide();
      } else if (content_type === "messages") {
        return $(".variable-option").hide();
      }
    });
    return $("#author-select").select2({
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
    }, $("#topic-select").select2({
      ajax: {
        url: "/topic-list-api",
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
    }), $("#category-select").select2({
      ajax: {
        url: "/topic-list-api",
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
    }));
  });

}).call(this);