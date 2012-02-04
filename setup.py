from setuptools import setup

setup(
    name='django-livechangelist',
    version='0.1',
    url='https://github.com/0101/django-livechangelist',
    description=('Automatically updated changelist page in the django '
                 'admin via JavaScript polling.'),
    license='MIT',
    packages=['django_livechangelist'],
    include_package_data=True,
    zip_safe=False,
)
