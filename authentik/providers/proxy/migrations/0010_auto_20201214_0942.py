# Generated by Django 3.1.4 on 2020-12-14 09:42
from django.apps.registry import Apps
from django.db import migrations
from django.db.backends.base.schema import BaseDatabaseSchemaEditor

SCOPE_AK_PROXY_EXPRESSION = """return {
    "ak_proxy": {
        "user_attributes": user.group_attributes()
    }
}"""


def create_proxy_scope(apps: Apps, schema_editor: BaseDatabaseSchemaEditor):
    from authentik.providers.proxy.models import SCOPE_AK_PROXY, ProxyProvider

    ScopeMapping = apps.get_model("authentik_providers_oauth2", "ScopeMapping")

    ScopeMapping.objects.filter(scope_name="pb_proxy").delete()

    ScopeMapping.objects.update_or_create(
        scope_name=SCOPE_AK_PROXY,
        defaults={
            "name": "Autogenerated OAuth2 Mapping: authentik Proxy",
            "scope_name": SCOPE_AK_PROXY,
            "description": "",
            "expression": SCOPE_AK_PROXY_EXPRESSION,
        },
    )

    for provider in ProxyProvider.objects.all():
        provider.set_oauth_defaults()
        provider.save()


class Migration(migrations.Migration):

    dependencies = [
        ("authentik_providers_proxy", "0009_auto_20201007_1721"),
    ]

    operations = [migrations.RunPython(create_proxy_scope)]
