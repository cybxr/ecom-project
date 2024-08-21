import random
from django.http import JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from .models import Customer, Product, Order, OrderItem, CartItem
from .serializers import (
    UserSerializer, CustomerSerializer, ProductSerializer, 
    OrderSerializer, OrderItemSerializer, CartItemSerializer
)
from rest_framework.permissions import AllowAny
from django.db.models import Q

@api_view(['POST'])
def register(request):
    if request.method == 'POST':
        data = request.data
        user = User.objects.create_user(
            username=data['username'],
            password=data['password'],
            email=data['email']
        )
        customer = Customer.objects.create(user=user)
        serializer = CustomerSerializer(customer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['POST'])
def login(request):
    if request.method == 'POST':
        data = request.data
        user = User.objects.filter(username=data['username']).first()
        if user and user.check_password(data['password']):
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
        return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
def product_detail(request, pk):
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return Response({'detail': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
    serializer = ProductSerializer(product)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    try:
        customer, _ = Customer.objects.get_or_create(user=request.user)
        data = request.data
        product = Product.objects.get(pk=data['product_id'])
        quantity = data.get('quantity', 1)

        try:
            cart_item = CartItem.objects.get(customer=customer, product=product)
            cart_item.quantity += quantity
        except CartItem.DoesNotExist:
            cart_item = CartItem(customer=customer, product=product, quantity=quantity)
        
        cart_item.save()

        serializer = CartItemSerializer(cart_item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Product.DoesNotExist:
        return Response({'detail': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def checkout(request):
    customer = Customer.objects.get(user=request.user)
    cart_items = CartItem.objects.filter(customer=customer)
    if not cart_items:
        return Response({'detail': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)
    
    for item in cart_items:
        if item.quantity > item.product.inventory_quantity:
            return Response({'detail': f'Not enough stock for {item.product.name}'}, status=status.HTTP_400_BAD_REQUEST)
    
    total_price = sum(item.product.price * item.quantity for item in cart_items)
    data = request.data
    order = Order.objects.create(
        customer=customer,
        total_price=total_price,
        shipping_address=data.get('shipping_address', customer.shipping_address),
        billing_address=data.get('billing_address', customer.billing_address),
        status='Pending'
    )
    
    for item in cart_items:
        OrderItem.objects.create(
            order=order,
            product=item.product,
            quantity=item.quantity
        )
        item.product.inventory_quantity -= item.quantity
        item.product.save()
        item.delete()
    
    serializer = OrderSerializer(order)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['POST'])
def register_or_login_and_checkout(request):
    if not request.user.is_authenticated:
        data = request.data
        user = User.objects.create_user(
            username=data['username'],
            password=data['password'],
            email=data['email']
        )
        customer = Customer.objects.create(
            user=user,
            billing_address=data.get('billing_address'),
            shipping_address=data.get('shipping_address'),
            credit_card_info=data.get('credit_card_info')
        )
        refresh = RefreshToken.for_user(user)
        request.user = user
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
    else:
        return checkout(request)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_history(request):
    customer = Customer.objects.get(user=request.user)
    orders = Order.objects.filter(customer=customer)
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_cart(request):
    customer = Customer.objects.get(user=request.user)
    cart_items = CartItem.objects.filter(customer=customer)
    if not cart_items:
        return Response({'detail': 'Cart is empty'}, status=status.HTTP_204_NO_CONTENT)

    serializer = CartItemSerializer(cart_items, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def process_payment(request):
    customer = Customer.objects.get(user=request.user)
    cart_items = CartItem.objects.filter(customer=customer)
    if not cart_items:
        return Response({'detail': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Dummy payment algorithm: deny every 3rd request
    if random.randint(1, 3) == 3:
        return Response({'detail': 'Credit Card Authorization Failed.'}, status=status.HTTP_402_PAYMENT_REQUIRED)

    total_price = sum(item.product.price * item.quantity for item in cart_items)
    data = request.data
    order = Order.objects.create(
        customer=customer,
        total_price=total_price,
        shipping_address=data['shipping_address'],
        billing_address=data['billing_address'],
        status='Approved'
    )
    
    for item in cart_items:
        OrderItem.objects.create(
            order=order,
            product=item.product,
            quantity=item.quantity
        )
        item.product.inventory_quantity -= item.quantity
        item.product.save()
        item.delete()
    
    serializer = OrderSerializer(order)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def account(request):
    customer = Customer.objects.get(user=request.user)
    if request.method == 'GET':
        serializer = CustomerSerializer(customer)
        return Response(serializer.data)
    elif request.method == 'PUT':
        data = request.data
        serializer = CustomerSerializer(customer, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def filter_products(request):
    category = request.query_params.get('category')
    search = request.query_params.get('search')
    sort_by = request.query_params.get('sort_by')

    products = Product.objects.all()

    if category:
        products = products.filter(category=category)
    if search:
        products = products.filter(
            Q(name__icontains=search) |
            Q(description__icontains=search) |
            Q(category__icontains=search)
        )

    if sort_by:
        if sort_by == 'price_asc':
            products = products.order_by('price')
        elif sort_by == 'price_desc':
            products = products.order_by('-price')
        elif sort_by == 'name_asc':
            products = products.order_by('name')
        elif sort_by == 'name_desc':
            products = products.order_by('-name')

    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def list_products(request):
    products = Product.objects.all()
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)

def list_categories(request):
    categories = Product.objects.values_list('category', flat=True).distinct()
    return JsonResponse(list(categories), safe=False)