$ ->
  class Dashboard
    constructor: () ->
      $grid = $('#dashboard-container');
      window.grid = $grid
      $grid.shuffle
        speed: 0

      @categories = {}
      @notificationTemplate = Handlebars.compile(@notificationHTML())
      @panelTemplate = Handlebars.compile(@panelHTML())
      @dashboard_container = $("#dashboard-container")

      @category_names =
        topic: "Topics"
        pm: "Private Messages"
        mention: "Mentioned"
        topic_reply: "Topic Replies"
        blog: "Blogs"
        blogcomments: "Blog Comments"
        boop: "Boops"
        mod: "Moderation"
        status: "Status Updates"
        new_member: "New Members"
        announcement: "Announcements"
        profile_comment: "Profile Comments"
        rules_updated: "Rule Update"
        faqs: "FAQs Updated"
        user_activity: "Followed User Activity"
        streaming: "Streaming"
        friend: "Friend Requests"
        followed: "Following"
        other: "Other"

      do @buildDashboard

      _panel=this

      if $(".io-class").data("path") != "/"
        socket = io.connect($(".io-class").data("config"), {path: $(".io-class").data("path")+"/socket.io"})
      else
        socket = io.connect($(".io-class").data("config"))

      socket.on "notify", (data) ->
        if data.count_update?
          return

        if window.woe_is_me in data.users
          $(".nothing-new").parent().remove()
          _panel.addToPanel(data, true)
          do _panel.setPanelDates

      $("#dashboard-container").on 'removed.shuffle', (e) =>
        do @isPanelEmpty

      $("#dashboard-container").delegate ".ack_all", "click", (e) ->
        e.preventDefault()
        panel = $("#"+$(this).data("panel"))
        $.post "/dashboard/ack_category", JSON.stringify({category: panel.attr("id")}), (data) =>
          if data.success?
            $(".dashboard-counter").text(data.count)
            $("#dashboard-container").shuffle("remove", panel)

      $("#dashboard-container").delegate ".ack_single_href", "click", (e) ->
        e.preventDefault()
        $.post "/dashboard/ack_notification", JSON.stringify({notification: $(this).data("notification")}), (data) =>
          window.location = $(this).attr("href")

      $("#dashboard-container").delegate ".ack_single", "click", (e) ->
        e.preventDefault()
        notification = $("#"+$(this).data("notification"))
        panel_notifs = $("#notifs-"+$(this).data("panel"))
        panel = $("#"+$(this).data("panel"))
        $.post "/dashboard/ack_notification", JSON.stringify({notification: notification.attr("id")}), (data) =>
          if data.success?
            $(".dashboard-counter").text(data.count)
            if panel_notifs.children().length < 2
              $("#dashboard-container").shuffle("remove", panel)
            else
              notification.remove()

    isPanelEmpty: () ->
      if $(".dashboard-panel").length == 0
        $("#dashboard-container").before """
        <ul class="list-group">
          <li class="list-group-item">
            <p class="nothing-new">No new notifications, yet.</p>
          </li>
        </ul>
        """
      else
        $(".nothing-new").parent().remove()

    setPanelDates: () ->
      $(".dashboard-panel").children(".panel").children("ul").each () ->
        element = $(this)
        first_timestamp = element.children("li").first().data("stamp")
        element.parent().parent().data("stamp", first_timestamp )
      setTimeout () ->
        $("#dashboard-container").shuffle('appended', $(".dashboard-panel"))
        $("#dashboard-container").shuffle("update")
        sort_opts =
          reverse: true
          by: (el) ->
            return el.data("stamp")
        $("#dashboard-container").shuffle("sort", sort_opts)
      , 100

    addToPanel: (notification, live=false) ->
      category_element = $("#notifs-"+notification.category)
      if category_element.length == 0
        panel =
          panel_id: notification.category
          panel_title: @category_names[notification.category]
        @dashboard_container.append(@panelTemplate(panel))
        category_element = $("#notifs-"+notification.category)

      notification._member_name = notification.member_pk
      existing_notification = $(".ref-#{notification.ref}-#{notification.category}")
      if existing_notification.length > 0 and notification.ref != ""
        count = parseInt(existing_notification.data("count"))
        count = count + 1
        if not existing_notification.children("media-left").is(":visible")
          existing_notification.children(".media-left").show()
        existing_notification.data("count", count)
        existing_notification.data("stamp", notification.stamp)
        existing_notification.children(".media-left").children(".badge").text(count)
        mname = $(existing_notification.find(".m-name"))
        if count == 2
          mname.html(mname.html() + " and " + "<a href=\"/member/#{notification.member_url}\" class=\"hover_user\">#{notification.member_disp_name}</a>")
        if count == 3
          mname.html(mname.html().replace(" and ", ", "))
          mname.append(""", and <span class="m-count">#{count - 2}</span> more""")
        if count > 3
          mname.find(".m-count").html(count - 2)
          
        existing_notification.find(".m-time").text(notification.time)
        existing_notification.find(".m-title").text(notification.text)
        existing_notification.find(".m-title").attr("href", notification.url)
        if live
          if existing_notification[0] != category_element.children().first()[0]
            category_element.prepend(existing_notification)
      else
        category_element.prepend(@notificationTemplate(notification))

    buildDashboard: () ->
      $.post "/dashboard/notifications", {}, (response) =>
        for notification in response.notifications
          @addToPanel notification
        do @isPanelEmpty
        do @setPanelDates

    notificationHTML: () ->
      return """
      <li class="list-group-item ref-{{ref}}-{{category}}" id="{{id}}" data-stamp="{{stamp}}" data-count="1">
        <div class="media-left" style="display: none;"><span class="badge"></span></div>
        <div class="media-body">
          <button class="close ack_single" data-notification="{{_id}}" data-panel="{{category}}">&times;</button>
          <div class="text-muted"><span class="m-name"><a href="/member/{{member_url}}" class="hover_user">{{member_disp_name}}</a></span>
          <a href="{{url}}" data-notification="{{id}}" class="m-title ack_single_href">{{text}}</a>
          - <span class="m-time" style="white-space: nowrap;">{{time}}</span></div>
        </div>
      </li>
      """

    panelHTML: () ->
      return """
      <div class="col-sm-6 col-md-6 dashboard-panel" id="{{panel_id}}"  style="margin-bottom: 10px;">
          <div class="list-group-item section-header dashboard-panel-header">
            <span>{{panel_title}}</span>
            <button class="close ack_all" data-panel="{{panel_id}}">&times;</button>
          </div>
          <div class="" id="notifs-{{panel_id}}">
          </div>
      </div>
      """

  window.woeDashboard = new Dashboard
