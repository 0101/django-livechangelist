update_url = 'live_changelist_update'

pk_href_re = /([^\/]+)\/$/


django.jQuery ($) ->

  deal_with_csrf_protection()

  pk_row_mapping = (->
    "A mapping of primary keys to corresponding table-rows"
    mapping = {}
    for tr in $('#result_list tbody tr')
      for a in $(tr).find('a')
        pk = pk_href_re.exec($(a).attr('href'))?[1]
        if pk
          mapping[pk] = $(tr)
          break
    return mapping
  )()

  query = pk_list: JSON.stringify (pk for pk of pk_row_mapping)

  should_update = (td) ->
    "Should a table cell be updated? Not if it's editable."
    $(td).find('input', 'select').length is 0

  update_table = (data) ->
    for pk, cells of data
      tr = pk_row_mapping[pk]
      for td, i in tr.find('td, th') when should_update td
        $(td).html $(cells[i]).html()

  handle_response = (data) ->
    interval = data.__interval__
    delete data.__interval__
    update_table data
    setTimeout poll, interval

  (poll = -> $.post update_url, query, handle_response, 'json')()


deal_with_csrf_protection = ->
  `django.jQuery(document).ajaxSend(function(event, xhr, settings) {
      function getCookie(name) {
          var cookieValue = null;
          if (document.cookie && document.cookie != '') {
              var cookies = document.cookie.split(';');
              for (var i = 0; i < cookies.length; i++) {
                  var cookie = jQuery.trim(cookies[i]);
                  // Does this cookie string begin with the name we want?
                  if (cookie.substring(0, name.length + 1) == (name + '=')) {
                      cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                      break;
                  }
              }
          }
          return cookieValue;
      }
      function sameOrigin(url) {
          // url could be relative or scheme relative or absolute
          var host = document.location.host; // host + port
          var protocol = document.location.protocol;
          var sr_origin = '//' + host;
          var origin = protocol + sr_origin;
          // Allow absolute or scheme relative URLs to same origin
          return (url == origin || url.slice(0, origin.length + 1) == origin + '/') ||
              (url == sr_origin || url.slice(0, sr_origin.length + 1) == sr_origin + '/') ||
              // or any other URL that isn't scheme relative or absolute i.e relative.
              !(/^(\/\/|http:|https:).*/.test(url));
      }
      function safeMethod(method) {
          return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
      }

      if (!safeMethod(settings.type) && sameOrigin(settings.url)) {
          xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
      }
  });`


