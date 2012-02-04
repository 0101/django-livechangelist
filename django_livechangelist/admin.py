from django.conf.urls.defaults import patterns
from django.contrib import admin
from django.contrib.admin.templatetags.admin_list import items_for_result
from django.http import HttpResponseBadRequest, HttpResponse
from django.utils import simplejson as json


class LiveChangelistAdmin(admin.ModelAdmin):

    class Media:
        js = 'admin/livechangelist/livechangelist.js',

    def live_changelist_update_interval(self, request):
        """
        Delay between change list updates in milliseconds.
        """
        return 1000

    def live_changelist_filter(self, request, qs):
        """
        Override this method to filter which objects you want to live-update.

        E.g. maybe only objects in a specific state can actually change,
        so filtering out the rest can save some server resources.
        """
        return qs

    def live_changelist_update(self, request):
        """
        View that is going to be polled by JavaScript.

        Expects a pk_list POST parameter containing a JSON with a list
        of primary keys of the objects that are displayed on the change list.

        Returns a JSON response with a dict (object) of the primary keys
        with lists of HTML table cells with current data.
        """

        pk_list_json = request.POST.get('pk_list', None)
        if not pk_list_json:
            return HttpResponseBadRequest('Missing pk_list.')

        pk_list = json.loads(pk_list_json, encoding='utf-8')

        qs = self.queryset(request).filter(pk__in=pk_list)
        qs = self.live_changelist_filter(request, qs)

        # A bit of copy-pasta from changelist_view to obtain a ChangeList
        # instance, but what can you do, eh?
        list_display = self.get_list_display(request)
        list_display_links = self.get_list_display_links(request, list_display)

        # Check actions to see if any are available on this changelist
        actions = self.get_actions(request)
        if actions:
            # Add the action checkboxes if there are any actions available.
            list_display = ['action_checkbox'] +  list(list_display)

        ChangeList = self.get_changelist(request)
        cl = ChangeList(request, self.model, list_display,
            list_display_links, self.list_filter, self.date_hierarchy,
            self.search_fields, self.list_select_related,
            self.list_per_page, self.list_max_show_all, self.list_editable,
            self)

        data = dict(
            (obj.pk, tuple(items_for_result(cl, obj, None))) for obj in qs)

        data['__interval__'] = self.live_changelist_update_interval(request)

        return HttpResponse(json.dumps(data, ensure_ascii=False),
                            content_type='application/json')

    def get_urls(self):
        return patterns('',
            (r'^live_changelist_update$',
             self.admin_site.admin_view(self.live_changelist_update)),
        ) + super(LiveChangelistAdmin, self).get_urls()
