from django.contrib import admin
from .models import ContactMessage, LoginActivity, Order, OrderRefund, OrderTimelineEvent, Project, VisitorLog


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
	list_display = ('title', 'is_active', 'display_order', 'updated_at')
	list_filter = ('is_active',)
	search_fields = ('title', 'description')
	ordering = ('display_order', '-updated_at')


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
	list_display = ('name', 'email', 'is_read', 'created_at')
	list_filter = ('is_read', 'created_at')
	search_fields = ('name', 'email', 'message')
	ordering = ('-created_at',)


@admin.register(LoginActivity)
class LoginActivityAdmin(admin.ModelAdmin):
	list_display = ('username_attempted', 'is_admin_login', 'status', 'ip_address', 'timestamp')
	list_filter = ('is_admin_login', 'status', 'timestamp')
	search_fields = ('username_attempted', 'user__username', 'user__email')
	ordering = ('-timestamp',)


@admin.register(VisitorLog)
class VisitorLogAdmin(admin.ModelAdmin):
	list_display = ('page', 'ip_address', 'timestamp')
	list_filter = ('timestamp',)
	search_fields = ('page', 'referrer', 'ip_address')
	ordering = ('-timestamp',)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
	list_display = ('order_number', 'customer_name', 'status', 'payment_status', 'total_amount', 'created_at')
	list_filter = ('status', 'payment_status', 'created_at')
	search_fields = ('order_number', 'customer_name', 'customer_email')
	ordering = ('-created_at',)


@admin.register(OrderTimelineEvent)
class OrderTimelineEventAdmin(admin.ModelAdmin):
	list_display = ('order', 'title', 'created_at')
	list_filter = ('created_at',)
	search_fields = ('order__order_number', 'title', 'description')
	ordering = ('-created_at',)


@admin.register(OrderRefund)
class OrderRefundAdmin(admin.ModelAdmin):
	list_display = ('id', 'order', 'amount', 'status', 'created_at')
	list_filter = ('status', 'created_at')
	search_fields = ('order__order_number', 'reason', 'admin_note')
	ordering = ('-created_at',)
