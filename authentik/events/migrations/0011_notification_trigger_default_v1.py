# Generated by Django 3.1.4 on 2021-01-10 18:57

from django.apps.registry import Apps
from django.db import migrations
from django.db.backends.base.schema import BaseDatabaseSchemaEditor

from authentik.events.models import EventAction, TransportMode


def notify_configuration_error(apps: Apps, schema_editor: BaseDatabaseSchemaEditor):
    db_alias = schema_editor.connection.alias
    Group = apps.get_model("authentik_core", "Group")
    PolicyBinding = apps.get_model("authentik_policies", "PolicyBinding")
    EventMatcherPolicy = apps.get_model(
        "authentik_policies_event_matcher", "EventMatcherPolicy"
    )
    NotificationTrigger = apps.get_model("authentik_events", "NotificationTrigger")

    admin_group = Group.objects.using(db_alias).filter(
        name="authentik Admins", is_superuser=True
    ).first()

    policy, _ = EventMatcherPolicy.objects.using(db_alias).update_or_create(
        name="default-match-configuration-error",
        defaults={"action": EventAction.CONFIGURATION_ERROR},
    )
    trigger, _ = NotificationTrigger.objects.using(db_alias).update_or_create(
        name="default-notify-configuration-error", defaults={"group": admin_group}
    )
    PolicyBinding.objects.using(db_alias).update_or_create(
        target=trigger,
        policy=policy,
        defaults={
            "order": 0,
        },
    )


def notify_update(apps: Apps, schema_editor: BaseDatabaseSchemaEditor):
    db_alias = schema_editor.connection.alias
    Group = apps.get_model("authentik_core", "Group")
    PolicyBinding = apps.get_model("authentik_policies", "PolicyBinding")
    EventMatcherPolicy = apps.get_model(
        "authentik_policies_event_matcher", "EventMatcherPolicy"
    )
    NotificationTrigger = apps.get_model("authentik_events", "NotificationTrigger")

    admin_group = Group.objects.using(db_alias).filter(
        name="authentik Admins", is_superuser=True
    ).first()

    policy, _ = EventMatcherPolicy.objects.using(db_alias).update_or_create(
        name="default-match-update",
        defaults={"action": EventAction.UPDATE_AVAILABLE},
    )
    trigger, _ = NotificationTrigger.objects.using(db_alias).update_or_create(
        name="default-notify-update", defaults={"group": admin_group}
    )
    PolicyBinding.objects.using(db_alias).update_or_create(
        target=trigger,
        policy=policy,
        defaults={
            "order": 0,
        },
    )


def notify_exception(apps: Apps, schema_editor: BaseDatabaseSchemaEditor):
    db_alias = schema_editor.connection.alias
    Group = apps.get_model("authentik_core", "Group")
    PolicyBinding = apps.get_model("authentik_policies", "PolicyBinding")
    EventMatcherPolicy = apps.get_model(
        "authentik_policies_event_matcher", "EventMatcherPolicy"
    )
    NotificationTrigger = apps.get_model("authentik_events", "NotificationTrigger")

    admin_group = Group.objects.using(db_alias).filter(
        name="authentik Admins", is_superuser=True
    ).first()

    policy_policy_exc, _ = EventMatcherPolicy.objects.using(db_alias).update_or_create(
        name="default-match-policy-exception",
        defaults={"action": EventAction.POLICY_EXCEPTION},
    )
    policy_pm_exc, _ = EventMatcherPolicy.objects.using(db_alias).update_or_create(
        name="default-match-property-mapping-exception",
        defaults={"action": EventAction.PROPERTY_MAPPING_EXCEPTION},
    )
    trigger, _ = NotificationTrigger.objects.using(db_alias).update_or_create(
        name="default-notify-exception", defaults={"group": admin_group}
    )
    PolicyBinding.objects.using(db_alias).update_or_create(
        target=trigger,
        policy=policy_policy_exc,
        defaults={
            "order": 0,
        },
    )
    PolicyBinding.objects.using(db_alias).update_or_create(
        target=trigger,
        policy=policy_pm_exc,
        defaults={
            "order": 1,
        },
    )


def transport_email_global(apps: Apps, schema_editor: BaseDatabaseSchemaEditor):
    db_alias = schema_editor.connection.alias
    NotificationTransport = apps.get_model("authentik_events", "NotificationTransport")

    NotificationTransport.objects.using(db_alias).update_or_create(
        name="default-email-transport",
        defaults={"mode": TransportMode.EMAIL},
    )


class Migration(migrations.Migration):

    dependencies = [
        (
            "authentik_events",
            "0010_notification_notificationtransport_notificationtrigger",
        ),
        ("authentik_core", "0016_auto_20201202_2234"),
        ("authentik_policies_event_matcher", "0003_auto_20210110_1907"),
        ("authentik_policies", "0004_policy_execution_logging"),
    ]

    operations = [
        migrations.RunPython(notify_configuration_error),
        migrations.RunPython(notify_update),
        migrations.RunPython(notify_exception),
        migrations.RunPython(transport_email_global),
    ]
