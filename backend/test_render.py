import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.emails.core.builder import EmailBuilder

content = EmailBuilder.build_content('comeback', {'user_name': 'TestUser', 'logo_url': 'http://localhost/logo.png', 'app_url': 'http://localhost'})

if "You didn't quit" in content['html']:
    print("SUCCESS_RENDER")
else:
    print("FAIL_RENDER")
