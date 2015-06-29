$ ->
  $("#member-table").delegate ".toggle-show-roles-button", "click", (e) ->
    $(this).parent().children(".roles-div").toggle()  

  $('#member-table').dataTable
    responsive: true
    processing: true
    serverSide: true
    order: [[ 1, "desc" ]]
    columnDefs: [
      {
        targets: [1]
        iDataSort: 4
      },
      {
        targets: [2]
        iDataSort: 5
      },
      {
        targets: [4]
        visible: false
      },
      {
        targets: [5]
        visible: false
      }
    ]
    ajax: 
      url: "/member-list-api"