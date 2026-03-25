from django.contrib.auth import authenticate, get_user_model
from rest_framework import serializers

from .models import ContactMessage, LoginActivity, Order, OrderRefund, OrderTimelineEvent, Project, VisitorLog

User = get_user_model()


class UserRegistrationSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(min_length=8, write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Email is already registered.')
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Username is already taken.')
        return value

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        name = validated_data.pop('name')
        first_name, _, last_name = name.partition(' ')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=first_name,
            last_name=last_name,
        )
        return user


class UserLoginSerializer(serializers.Serializer):
    identifier = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        identifier = data['identifier']
        password = data['password']
        user = authenticate(username=identifier, password=password)
        if user is None:
            # try by email
            try:
                u = User.objects.get(email=identifier)
                user = authenticate(username=u.username, password=password)
            except User.DoesNotExist:
                pass
        if user is None or not user.is_active:
            raise serializers.ValidationError({'error': 'Invalid credentials.'})
        data['user'] = user
        return data


class ProjectSerializer(serializers.ModelSerializer):
    stack = serializers.ListField(source='technologies', read_only=True)
    image = serializers.CharField(source='image_url', read_only=True)
    github = serializers.CharField(source='github_url', read_only=True)
    demo = serializers.CharField(source='live_demo_url', read_only=True)

    class Meta:
        model = Project
        fields = (
            'id',
            'title',
            'description',
            'stack',
            'image',
            'github',
            'demo',
            'display_order',
        )


class ContactMessageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ('id', 'name', 'email', 'message', 'created_at')
        read_only_fields = ('id', 'created_at')


class AdminContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ('id', 'name', 'email', 'message', 'is_read', 'created_at')


class AdminUserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'full_name',
            'is_active',
            'is_staff',
            'date_joined',
            'last_login',
        )

    def get_full_name(self, obj):
        return obj.get_full_name().strip() or obj.username


class LoginActivitySerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    identifier = serializers.CharField(source='username_attempted', read_only=True)
    login_type = serializers.SerializerMethodField()
    success = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(source='timestamp', read_only=True)

    def get_login_type(self, obj):
        return 'admin' if obj.is_admin_login else 'user'

    def get_success(self, obj):
        return obj.status == 'success'

    class Meta:
        model = LoginActivity
        fields = (
            'id',
            'identifier',
            'login_type',
            'success',
            'ip_address',
            'user_agent',
            'user_username',
            'created_at',
        )


class VisitorActivitySerializer(serializers.ModelSerializer):
    path = serializers.CharField(source='page', read_only=True)
    device_type = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(source='timestamp', read_only=True)

    def get_device_type(self, obj):
        agent = (obj.user_agent or '').lower()
        if 'mobile' in agent or 'android' in agent or 'iphone' in agent or 'ipad' in agent:
            return 'mobile'
        return 'desktop'

    class Meta:
        model = VisitorLog
        fields = (
            'id',
            'path',
            'referrer',
            'device_type',
            'ip_address',
            'user_agent',
            'created_at',
        )


class OrderTimelineEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderTimelineEvent
        fields = ('id', 'title', 'description', 'created_at')


class OrderRefundSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderRefund
        fields = (
            'id',
            'amount',
            'reason',
            'status',
            'admin_note',
            'created_at',
            'updated_at',
        )


class AdminOrderListSerializer(serializers.ModelSerializer):
    timeline_count = serializers.SerializerMethodField()
    refunds_count = serializers.SerializerMethodField()

    def get_timeline_count(self, obj):
        return obj.timeline_events.count()

    def get_refunds_count(self, obj):
        return obj.refunds.count()

    class Meta:
        model = Order
        fields = (
            'id',
            'order_number',
            'customer_name',
            'customer_email',
            'total_amount',
            'currency',
            'status',
            'payment_status',
            'created_at',
            'updated_at',
            'timeline_count',
            'refunds_count',
        )


class AdminOrderDetailSerializer(serializers.ModelSerializer):
    timeline = OrderTimelineEventSerializer(source='timeline_events', many=True, read_only=True)
    refunds = OrderRefundSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = (
            'id',
            'order_number',
            'customer_name',
            'customer_email',
            'items',
            'total_amount',
            'currency',
            'status',
            'payment_status',
            'notes',
            'shipped_at',
            'delivered_at',
            'created_at',
            'updated_at',
            'timeline',
            'refunds',
        )


class AdminOrderUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ('status', 'payment_status', 'notes')


class AdminOrderRefundCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderRefund
        fields = ('amount', 'reason')


class AdminOrderRefundUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderRefund
        fields = ('status', 'admin_note')
