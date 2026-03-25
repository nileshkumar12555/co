from decimal import Decimal

from django.core.paginator import Paginator
from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import ContactMessage, LoginActivity, Order, OrderRefund, OrderTimelineEvent, Project, VisitorLog
from .serializers import (
    AdminContactMessageSerializer,
    AdminOrderDetailSerializer,
    AdminOrderListSerializer,
    AdminOrderRefundCreateSerializer,
    AdminOrderRefundUpdateSerializer,
    AdminOrderUpdateSerializer,
    AdminUserSerializer,
    ContactMessageCreateSerializer,
    LoginActivitySerializer,
    OrderRefundSerializer,
    ProjectSerializer,
    UserLoginSerializer,
    UserRegistrationSerializer,
    VisitorActivitySerializer,
)

User = get_user_model()


def _user_payload(user):
    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'name': user.get_full_name() or user.username,
        'is_admin': user.is_staff,
    }


def _tokens_for(user):
    refresh = RefreshToken.for_user(user)
    return str(refresh.access_token), str(refresh)


def _client_ip(request):
    forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
    if forwarded:
        return forwarded.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


def _record_login_activity(request, identifier, login_type, success, user=None):
    LoginActivity.objects.create(
        user=user,
        username_attempted=identifier,
        is_admin_login=(login_type == 'admin'),
        status='success' if success else 'failed',
        ip_address=_client_ip(request),
        user_agent=request.META.get('HTTP_USER_AGENT', ''),
    )


def _paginated_response(request, queryset, serializer_class):
    page = max(int(request.GET.get('page', 1)), 1)
    page_size = min(max(int(request.GET.get('page_size', 10)), 1), 100)

    paginator = Paginator(queryset, page_size)
    page_obj = paginator.get_page(page)
    serializer = serializer_class(page_obj.object_list, many=True)

    return {
        'results': serializer.data,
        'pagination': {
            'page': page_obj.number,
            'page_size': page_size,
            'total_pages': paginator.num_pages,
            'total_items': paginator.count,
            'has_next': page_obj.has_next(),
            'has_previous': page_obj.has_previous(),
        },
    }


def _add_order_timeline(order, title, description=''):
    OrderTimelineEvent.objects.create(order=order, title=title, description=description)


def _invoice_response_payload(order, overrides=None):
    overrides = overrides or {}
    recipient_name = (overrides.get('recipient_name') or order.customer_name).strip()
    recipient_email = (overrides.get('recipient_email') or order.customer_email).strip()
    company_name = (overrides.get('company_name') or 'ZenCode Digital').strip()
    extra_note = (overrides.get('extra_note') or '').strip()

    items = order.items or []
    items_lines = []
    for idx, item in enumerate(items, start=1):
        name = item.get('name', 'Item')
        qty = item.get('qty', 1)
        price = item.get('price', 0)
        items_lines.append(f"{idx}. {name}  x{qty}  -  {order.currency} {price}")

    invoice_text = (
        f"INVOICE\n"
        f"Company: {company_name}\n"
        f"Order: {order.order_number}\n"
        f"Customer: {recipient_name} ({recipient_email})\n"
        f"Date: {order.created_at.strftime('%Y-%m-%d %H:%M')}\n"
        f"Status: {order.status}\n"
        f"Payment: {order.payment_status}\n\n"
        f"Items:\n"
        f"{'\n'.join(items_lines) if items_lines else 'No items listed'}\n\n"
        f"Total: {order.currency} {order.total_amount}\n"
        f"Note: {extra_note if extra_note else 'Thank you for your business.'}\n"
    )

    share_text = (
        f"Invoice {order.order_number}\n"
        f"Customer: {recipient_name}\n"
        f"Amount: {order.currency} {order.total_amount}\n"
        f"Status: {order.status} / Payment: {order.payment_status}\n"
        f"{extra_note if extra_note else 'Thank you.'}"
    )

    return {
        'order_id': order.id,
        'order_number': order.order_number,
        'filename': f'invoice-{order.order_number}.txt',
        'invoice_text': invoice_text,
        'share_text': share_text,
        'meta': {
            'recipient_name': recipient_name,
            'recipient_email': recipient_email,
            'company_name': company_name,
            'extra_note': extra_note,
        },
    }


def _seed_orders_if_empty():
    if Order.objects.exists():
        return

    demo_orders = [
        {
            'order_number': 'ORD-2026-001',
            'customer_name': 'Rohit Sharma',
            'customer_email': 'rohit@example.com',
            'items': [
                {'name': 'Premium Website Package', 'qty': 1, 'price': 24999},
                {'name': 'SEO Starter', 'qty': 1, 'price': 4999},
            ],
            'total_amount': Decimal('29998.00'),
            'currency': 'INR',
            'status': Order.STATUS_PENDING,
            'payment_status': Order.PAYMENT_PAID,
        },
        {
            'order_number': 'ORD-2026-002',
            'customer_name': 'Priya Verma',
            'customer_email': 'priya@example.com',
            'items': [
                {'name': 'Admin Dashboard Build', 'qty': 1, 'price': 17999},
            ],
            'total_amount': Decimal('17999.00'),
            'currency': 'INR',
            'status': Order.STATUS_SHIPPED,
            'payment_status': Order.PAYMENT_PAID,
        },
    ]

    for payload in demo_orders:
        order = Order.objects.create(**payload)
        _add_order_timeline(order, 'Order Created', 'Order entry created in admin panel.')
        if order.payment_status == Order.PAYMENT_PAID:
            _add_order_timeline(order, 'Payment Received', 'Payment has been marked as paid.')
        if order.status == Order.STATUS_SHIPPED:
            order.shipped_at = timezone.now()
            order.save(update_fields=['shipped_at'])
            _add_order_timeline(order, 'Order Shipped', 'Shipment is in transit.')


class RegisterAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {'message': 'Account created successfully.', 'user': _user_payload(user)},
            status=status.HTTP_201_CREATED,
        )


class LoginAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        identifier = request.data.get('identifier', '')
        serializer = UserLoginSerializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception:
            _record_login_activity(request, identifier, 'user', False, None)
            raise

        user = serializer.validated_data['user']
        _record_login_activity(request, identifier, 'user', True, user)
        access, refresh = _tokens_for(user)
        return Response({'access': access, 'refresh': refresh, 'user': _user_payload(user)})


class AdminLoginAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        identifier = request.data.get('identifier', '')
        serializer = UserLoginSerializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception:
            _record_login_activity(request, identifier, 'admin', False, None)
            raise

        user = serializer.validated_data['user']
        if not user.is_staff:
            _record_login_activity(request, identifier, 'admin', False, user)
            return Response(
                {'error': 'You do not have admin privileges.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        _record_login_activity(request, identifier, 'admin', True, user)
        access, refresh = _tokens_for(user)
        return Response({'access': access, 'refresh': refresh, 'user': _user_payload(user)})


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password', '')
        new_password = request.data.get('new_password', '')
        confirm_password = request.data.get('confirm_password', '')

        if not user.check_password(old_password):
            return Response({'error': 'Current password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)
        if len(new_password) < 8:
            return Response({'error': 'New password must be at least 8 characters.'}, status=status.HTTP_400_BAD_REQUEST)
        if new_password != confirm_password:
            return Response({'error': 'New passwords do not match.'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(new_password)
        user.save()
        return Response({'message': 'Password changed successfully.'})


class ProjectListAPIView(generics.ListAPIView):
	serializer_class = ProjectSerializer
	permission_classes = [permissions.AllowAny]

	def get_queryset(self):
		return Project.objects.filter(is_active=True)


class ContactMessageCreateAPIView(generics.CreateAPIView):
	serializer_class = ContactMessageCreateSerializer
	permission_classes = [permissions.AllowAny]
	queryset = ContactMessage.objects.all()


class AdminContactMessageListAPIView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        q = request.GET.get('q', '').strip()
        status_filter = request.GET.get('status', 'all').strip().lower()

        messages = ContactMessage.objects.all().order_by('-created_at')

        if status_filter == 'read':
            messages = messages.filter(is_read=True)
        elif status_filter == 'unread':
            messages = messages.filter(is_read=False)

        if q:
            messages = messages.filter(
                Q(name__icontains=q)
                | Q(email__icontains=q)
                | Q(message__icontains=q)
            )

        return Response(_paginated_response(request, messages, AdminContactMessageSerializer))


class AdminContactMessageUpdateAPIView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, message_id):
        try:
            msg = ContactMessage.objects.get(pk=message_id)
        except ContactMessage.DoesNotExist:
            return Response({'error': 'Message not found.'}, status=status.HTTP_404_NOT_FOUND)

        if 'is_read' in request.data:
            msg.is_read = bool(request.data.get('is_read'))
            msg.save(update_fields=['is_read'])

        return Response(AdminContactMessageSerializer(msg).data)


class VisitorTrackAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        referrer = request.data.get('referrer', '')
        if referrer and not referrer.startswith('http'):
            referrer = ''

        VisitorLog.objects.create(
            page=request.data.get('path', '/'),
            referrer=referrer,
            ip_address=_client_ip(request) or '0.0.0.0',
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
        )
        return Response({'message': 'Visitor tracked.'}, status=status.HTTP_201_CREATED)


class AdminDashboardSummaryAPIView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        today = timezone.now().date()

        summary = {
            'total_users': User.objects.count(),
            'active_users': User.objects.filter(is_active=True).count(),
            'admin_users': User.objects.filter(is_staff=True).count(),
            'unread_contacts': ContactMessage.objects.filter(is_read=False).count(),
            'today_visitors': VisitorLog.objects.filter(timestamp__date=today).count(),
            'today_logins': LoginActivity.objects.filter(status='success', timestamp__date=today).count(),
            'total_visits': VisitorLog.objects.count(),
            'successful_logins': LoginActivity.objects.filter(status='success').count(),
            'failed_logins': LoginActivity.objects.filter(status='failed').count(),
        }

        return Response(summary)


class AdminUserListAPIView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        q = request.GET.get('q', '').strip()
        users = User.objects.all().order_by('-date_joined')

        if q:
            users = users.filter(
                Q(username__icontains=q)
                | Q(email__icontains=q)
                | Q(first_name__icontains=q)
                | Q(last_name__icontains=q)
            )

        return Response(_paginated_response(request, users, AdminUserSerializer))


class AdminUserUpdateAPIView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, user_id):
        try:
            target = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        if 'is_active' in request.data:
            target.is_active = bool(request.data.get('is_active'))

        if 'is_staff' in request.data:
            requested_staff = bool(request.data.get('is_staff'))
            if target == request.user and not requested_staff:
                return Response({'error': 'You cannot remove your own admin access.'}, status=status.HTTP_400_BAD_REQUEST)
            target.is_staff = requested_staff

        target.save()
        return Response(AdminUserSerializer(target).data)


class LoginActivityListAPIView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        activities = LoginActivity.objects.all().order_by('-timestamp')
        return Response(_paginated_response(request, activities, LoginActivitySerializer))


class VisitorActivityListAPIView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        visits = VisitorLog.objects.all().order_by('-timestamp')
        return Response(_paginated_response(request, visits, VisitorActivitySerializer))


class AnalyticsChartAPIView(APIView):
    """Returns daily visitor + login counts for the last N days (default 30)."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        days = min(max(int(request.GET.get('days', 30)), 1), 90)
        today = timezone.now().date()
        start = today - timezone.timedelta(days=days - 1)

        # Build zero-filled date skeleton
        date_range = [start + timezone.timedelta(days=i) for i in range(days)]
        visitors_qs = (
            VisitorLog.objects
            .filter(timestamp__date__gte=start)
            .values('timestamp__date')
            .annotate(count=Count('id'))
        )
        logins_qs = (
            LoginActivity.objects
            .filter(timestamp__date__gte=start, status='success')
            .values('timestamp__date')
            .annotate(count=Count('id'))
        )
        failed_qs = (
            LoginActivity.objects
            .filter(timestamp__date__gte=start, status='failed')
            .values('timestamp__date')
            .annotate(count=Count('id'))
        )

        v_map = {row['timestamp__date']: row['count'] for row in visitors_qs}
        l_map = {row['timestamp__date']: row['count'] for row in logins_qs}
        f_map = {row['timestamp__date']: row['count'] for row in failed_qs}

        series = [
            {
                'date': d.strftime('%d %b'),
                'visitors': v_map.get(d, 0),
                'logins': l_map.get(d, 0),
                'failed': f_map.get(d, 0),
            }
            for d in date_range
        ]

        return Response({'days': days, 'series': series})


class AdminOrderListAPIView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        _seed_orders_if_empty()

        q = request.GET.get('q', '').strip()
        status_filter = request.GET.get('status', 'all').strip().lower()
        payment_filter = request.GET.get('payment', 'all').strip().lower()

        orders = Order.objects.all().order_by('-created_at')

        if status_filter in {Order.STATUS_PENDING, Order.STATUS_SHIPPED, Order.STATUS_DELIVERED}:
            orders = orders.filter(status=status_filter)

        if payment_filter in {
            Order.PAYMENT_PENDING,
            Order.PAYMENT_PAID,
            Order.PAYMENT_FAILED,
            Order.PAYMENT_REFUNDED,
        }:
            orders = orders.filter(payment_status=payment_filter)

        if q:
            orders = orders.filter(
                Q(order_number__icontains=q)
                | Q(customer_name__icontains=q)
                | Q(customer_email__icontains=q)
            )

        return Response(_paginated_response(request, orders, AdminOrderListSerializer))


class AdminOrderDetailAPIView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, order_id):
        try:
            order = Order.objects.get(pk=order_id)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        return Response(AdminOrderDetailSerializer(order).data)


class AdminOrderUpdateAPIView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, order_id):
        try:
            order = Order.objects.get(pk=order_id)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        old_status = order.status
        old_payment_status = order.payment_status

        serializer = AdminOrderUpdateSerializer(order, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        if old_status != order.status:
            if order.status == Order.STATUS_SHIPPED and not order.shipped_at:
                order.shipped_at = timezone.now()
                order.save(update_fields=['shipped_at'])
            if order.status == Order.STATUS_DELIVERED and not order.delivered_at:
                order.delivered_at = timezone.now()
                order.save(update_fields=['delivered_at'])
            _add_order_timeline(order, 'Order Status Updated', f'Status changed from {old_status} to {order.status}.')

        if old_payment_status != order.payment_status:
            _add_order_timeline(
                order,
                'Payment Status Updated',
                f'Payment status changed from {old_payment_status} to {order.payment_status}.',
            )

        if request.data.get('notes'):
            _add_order_timeline(order, 'Admin Note Added', request.data.get('notes', '').strip())

        return Response(AdminOrderDetailSerializer(order).data)


class AdminOrderInvoiceAPIView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, order_id):
        try:
            order = Order.objects.get(pk=order_id)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        return Response(_invoice_response_payload(order))

    def post(self, request, order_id):
        try:
            order = Order.objects.get(pk=order_id)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        payload = _invoice_response_payload(order, overrides=request.data or {})
        _add_order_timeline(order, 'Invoice Generated', 'Custom invoice was generated from admin panel.')
        return Response(payload)


class AdminOrderRefundListCreateAPIView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get_order(self, order_id):
        try:
            return Order.objects.get(pk=order_id)
        except Order.DoesNotExist:
            return None

    def get(self, request, order_id):
        order = self.get_order(order_id)
        if not order:
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(OrderRefundSerializer(order.refunds.all(), many=True).data)

    def post(self, request, order_id):
        order = self.get_order(order_id)
        if not order:
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = AdminOrderRefundCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        refund = serializer.save(order=order)
        _add_order_timeline(order, 'Refund Requested', f'Refund request created for amount {order.currency} {refund.amount}.')

        return Response(OrderRefundSerializer(refund).data, status=status.HTTP_201_CREATED)


class AdminOrderRefundUpdateAPIView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, order_id, refund_id):
        try:
            refund = OrderRefund.objects.select_related('order').get(pk=refund_id, order_id=order_id)
        except OrderRefund.DoesNotExist:
            return Response({'error': 'Refund not found.'}, status=status.HTTP_404_NOT_FOUND)

        old_status = refund.status
        serializer = AdminOrderRefundUpdateSerializer(refund, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        order = refund.order
        if old_status != refund.status:
            _add_order_timeline(
                order,
                'Refund Status Updated',
                f'Refund #{refund.id} status changed from {old_status} to {refund.status}.',
            )

            if refund.status == OrderRefund.STATUS_PROCESSED:
                order.payment_status = Order.PAYMENT_REFUNDED
                order.save(update_fields=['payment_status', 'updated_at'])
                _add_order_timeline(order, 'Payment Refunded', f'Payment marked refunded for refund #{refund.id}.')

        return Response(OrderRefundSerializer(refund).data)
