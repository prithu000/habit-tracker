"""
FORGE — Subscriptions App Permissions
Re-exports authoritative HasPremiumAccessPermission for clean imports across the application.
"""
from apps.core.permissions import HasPremiumAccessPermission

__all__ = ["HasPremiumAccessPermission"]
