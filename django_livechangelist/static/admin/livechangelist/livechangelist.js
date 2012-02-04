(function() {
  var deal_with_csrf_protection, pk_href_re, update_url;

  update_url = 'live_changelist_update';

  pk_href_re = /^([^\/]+)\/$/;

  django.jQuery(function($) {
    var handle_response, pk, pk_row_mapping, poll, query, should_update, update_table;
    deal_with_csrf_protection();
    pk_row_mapping = (function() {
      "A mapping of primary keys to corresponding table-rows";
      var a, mapping, pk, tr, _i, _j, _len, _len2, _ref, _ref2, _ref3;
      mapping = {};
      _ref = $('#result_list tbody tr');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        tr = _ref[_i];
        _ref2 = $(tr).find('a');
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          a = _ref2[_j];
          pk = (_ref3 = pk_href_re.exec($(a).attr('href'))) != null ? _ref3[1] : void 0;
          if (pk) {
            mapping[pk] = $(tr);
            break;
          }
        }
      }
      return mapping;
    })();
    query = {
      pk_list: JSON.stringify((function() {
        var _results;
        _results = [];
        for (pk in pk_row_mapping) {
          _results.push(pk);
        }
        return _results;
      })())
    };
    should_update = function(td) {
      "Should a table cell be updated? Not if it's editable.";      return $(td).find('input', 'select').length === 0;
    };
    update_table = function(data) {
      var cells, i, pk, td, tr, _results;
      _results = [];
      for (pk in data) {
        cells = data[pk];
        tr = pk_row_mapping[pk];
        _results.push((function() {
          var _len, _ref, _results2;
          _ref = tr.find('td, th');
          _results2 = [];
          for (i = 0, _len = _ref.length; i < _len; i++) {
            td = _ref[i];
            if (should_update(td)) _results2.push($(td).html($(cells[i]).html()));
          }
          return _results2;
        })());
      }
      return _results;
    };
    handle_response = function(data) {
      var interval;
      interval = data.__interval__;
      delete data.__interval__;
      update_table(data);
      return setTimeout(poll, interval);
    };
    return (poll = function() {
      return $.post(update_url, query, handle_response, 'json');
    })();
  });

  deal_with_csrf_protection = function() {
    return django.jQuery(document).ajaxSend(function(event, xhr, settings) {
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
  });;
  };

}).call(this);
