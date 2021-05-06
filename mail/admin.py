from django.contrib import admin
from .models import Email,User

# Register your models here.

class EmailAdmin(admin.ModelAdmin):
    list_display=[
        "sender",
        "archived",
    ]

admin.site.register(Email,EmailAdmin)

admin.site.register(User)