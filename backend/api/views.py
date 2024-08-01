import random
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
# @permission_classes([IsAuthenticated])
def list_products(request):
    products = Product.objects.all()
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)

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
        cart_item, created = CartItem.objects.get_or_create(customer=customer, product=product)
        if not created:
            cart_item.quantity += data['quantity']
        else:
            cart_item.quantity = data['quantity']
        cart_item.save()
        serializer = CartItemSerializer(cart_item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def checkout(request):
    customer = Customer.objects.get(user=request.user)
    cart_items = CartItem.objects.filter(customer=customer)
    if not cart_items:
        return Response({'detail': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)
    
    total_price = sum(item.product.price * item.quantity for item in cart_items)
    data = request.data
    order = Order.objects.create(
        customer=customer,
        total_price=total_price,
        shipping_address=data['shipping_address'],
        billing_address=data['billing_address'],
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
        return Response({'detail': 'empty'}, status=status.HTTP_204_NO_CONTENT)
    
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
