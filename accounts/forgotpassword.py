import secrets """token generálás"""
import requests """API behívás HTTP kéréssel"""
from accounts.models import UserResetToken """adatbazis modell beimportalasa"""
from datetime import datetime,timedelta """ídőkezeles"""
from rest_framework import serializers,views """API endpointok és serializer-ek használata"""


