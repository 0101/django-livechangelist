Djnago Live Changelist
======================

Automatically updated changelist page in the django admin via JavaScript polling.


Installation
------------

::

    pip install -e git+git://github.com/0101/django-livechangelist#egg=django-livechangelist

or just put the ``django_livechangelist`` directory on your ``PYTHONPATH``.


Configuration
-------------

1. Add ``'django_livechangelist'`` to your ``INSTALLED_APPS``

2. Run ``manage.py collectstatic`` to copy/link the required JavaScript file to your ``STATIC_ROOT``.


Usage
-----

In ``yourapp/admin.py``::

    from django_livechangelist import LiveChangelistAdmin

    class YourModelAdmin(LiveChangelistAdmin):
        ...

        # optionally, you can override these methods:

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


That should be it.


Notes
-----

* Only the rows you see when you load the page will be updated. If some objects
  are created or deleted that will not be visible.

* Editable fields are not updated.

* Tested with Django 1.4

