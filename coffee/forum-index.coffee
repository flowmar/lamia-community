$ ->
  $("#status-new").keypress (e) ->
    if e.keyCode == 13 and !e.shiftKey
      e.preventDefault()
      $("#new-status").click()
  
  $.get "/users.json", (response) =>
    parsed_user_list = response
    
    $("#status-new").atwho
        at: "@"
        displayTpl: """<li>${name}</li>"""
        insertTpl: "[@${login}]"
        data: parsed_user_list 
        limit: 30
  
  $.get "/local_emoticons.json", (response) =>
    parsed_emoji_list = response
        
    $("#status-new").atwho
        at: ":"
        displayTpl: """<li><img src="/static/smilies/${filename}">${name}</li>"""
        insertTpl: ":${name}:"
        data: parsed_emoji_list
        limit: 30
        
  $.get "/static/local/emoji.js", (response) =>
    parsed_emoji_list = JSON.parse response
    
    $("#status-new").atwho
        at: "::"
        displayTpl: """<li>${unicode} ${name}</li>"""
        insertTpl: "${unicode}"
        data: parsed_emoji_list
        limit: 30