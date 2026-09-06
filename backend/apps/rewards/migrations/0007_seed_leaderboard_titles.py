from django.db import migrations

def seed_leaderboard_titles(apps, schema_editor):
    LeaderboardTitle = apps.get_model("rewards", "LeaderboardTitle")
    default_titles = [
        (1, "Samrat", "The undisputed emperor of the Arena."),
        (2, "Senapati", "Commanding the leaderboard from the front."),
        (3, "Maharathi", "An elite warrior among thousands."),
        (4, "Veer", "Fearless. Relentless. Rising fast."),
        (5, "Yodha", "A true warrior of discipline."),
    ]
    for rank, name, desc in default_titles:
        LeaderboardTitle.objects.update_or_create(
            rank_position=rank,
            defaults={"title_name": name, "description": desc}
        )

def unseed_leaderboard_titles(apps, schema_editor):
    LeaderboardTitle = apps.get_model("rewards", "LeaderboardTitle")
    LeaderboardTitle.objects.filter(rank_position__in=[1, 2, 3, 4, 5]).delete()

class Migration(migrations.Migration):

    dependencies = [
        ('rewards', '0006_leaderboardtitle'),
    ]

    operations = [
        migrations.RunPython(seed_leaderboard_titles, unseed_leaderboard_titles),
    ]
