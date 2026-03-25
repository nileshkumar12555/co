from django.db import models


class Project(models.Model):
	title = models.CharField(max_length=200)
	description = models.TextField()
	technologies = models.JSONField(default=list)
	image_url = models.URLField(max_length=500)
	github_url = models.URLField(max_length=500, blank=True)
	live_demo_url = models.URLField(max_length=500, blank=True)
	is_active = models.BooleanField(default=True)
	display_order = models.PositiveIntegerField(default=0)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ['display_order', '-created_at']

	def __str__(self):
		return self.title


class ContactMessage(models.Model):
	name = models.CharField(max_length=120)
	email = models.EmailField()
	message = models.TextField()
	is_read = models.BooleanField(default=False)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ['-created_at']

	def __str__(self):
		return f'{self.name} <{self.email}>'


class LoginActivity(models.Model):
	STATUS_CHOICES = [
		('success', 'Success'),
		('failed', 'Failed'),
	]

	user = models.ForeignKey('auth.User', related_name='login_activities', on_delete=models.SET_NULL, null=True, blank=True)
	username_attempted = models.CharField(max_length=150, blank=True)
	ip_address = models.GenericIPAddressField(null=True, blank=True)
	user_agent = models.TextField(blank=True)
	status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='success')
	is_admin_login = models.BooleanField(default=False)
	timestamp = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ['-timestamp']

	@property
	def identifier(self):
		return self.username_attempted

	@property
	def login_type(self):
		return 'admin' if self.is_admin_login else 'user'

	@property
	def success(self):
		return self.status == 'success'

	@property
	def created_at(self):
		return self.timestamp

	def __str__(self):
		return f'{self.login_type.title()} login {self.status.title()} ({self.username_attempted})'


class VisitorLog(models.Model):
	ip_address = models.GenericIPAddressField()
	page = models.CharField(max_length=200, default='/')
	user_agent = models.TextField(blank=True)
	referrer = models.URLField(max_length=500, blank=True)
	timestamp = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ['-timestamp']

	@property
	def path(self):
		return self.page

	@property
	def created_at(self):
		return self.timestamp

	@property
	def device_type(self):
		agent = (self.user_agent or '').lower()
		if 'mobile' in agent or 'android' in agent or 'iphone' in agent or 'ipad' in agent:
			return 'mobile'
		return 'desktop'

	def __str__(self):
		return f'{self.page} @ {self.timestamp:%Y-%m-%d %H:%M:%S}'


class Order(models.Model):
	STATUS_PENDING = 'pending'
	STATUS_SHIPPED = 'shipped'
	STATUS_DELIVERED = 'delivered'
	STATUS_CHOICES = [
		(STATUS_PENDING, 'Pending'),
		(STATUS_SHIPPED, 'Shipped'),
		(STATUS_DELIVERED, 'Delivered'),
	]

	PAYMENT_PENDING = 'pending'
	PAYMENT_PAID = 'paid'
	PAYMENT_FAILED = 'failed'
	PAYMENT_REFUNDED = 'refunded'
	PAYMENT_STATUS_CHOICES = [
		(PAYMENT_PENDING, 'Pending'),
		(PAYMENT_PAID, 'Paid'),
		(PAYMENT_FAILED, 'Failed'),
		(PAYMENT_REFUNDED, 'Refunded'),
	]

	order_number = models.CharField(max_length=30, unique=True)
	customer_name = models.CharField(max_length=150)
	customer_email = models.EmailField()
	items = models.JSONField(default=list)
	total_amount = models.DecimalField(max_digits=12, decimal_places=2)
	currency = models.CharField(max_length=8, default='INR')
	status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
	payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default=PAYMENT_PENDING)
	notes = models.TextField(blank=True)
	shipped_at = models.DateTimeField(null=True, blank=True)
	delivered_at = models.DateTimeField(null=True, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ['-created_at']

	def __str__(self):
		return f'{self.order_number} - {self.customer_name}'


class OrderTimelineEvent(models.Model):
	order = models.ForeignKey(Order, related_name='timeline_events', on_delete=models.CASCADE)
	title = models.CharField(max_length=140)
	description = models.TextField(blank=True)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ['created_at', 'id']

	def __str__(self):
		return f'{self.order.order_number}: {self.title}'


class OrderRefund(models.Model):
	STATUS_REQUESTED = 'requested'
	STATUS_APPROVED = 'approved'
	STATUS_REJECTED = 'rejected'
	STATUS_PROCESSED = 'processed'
	STATUS_CHOICES = [
		(STATUS_REQUESTED, 'Requested'),
		(STATUS_APPROVED, 'Approved'),
		(STATUS_REJECTED, 'Rejected'),
		(STATUS_PROCESSED, 'Processed'),
	]

	order = models.ForeignKey(Order, related_name='refunds', on_delete=models.CASCADE)
	amount = models.DecimalField(max_digits=12, decimal_places=2)
	reason = models.TextField()
	status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_REQUESTED)
	admin_note = models.TextField(blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ['-created_at']

	def __str__(self):
		return f'Refund {self.id} for {self.order.order_number}'
