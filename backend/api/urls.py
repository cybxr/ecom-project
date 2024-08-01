from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('products/', views.list_products, name='list_products'),
    path('products/<int:pk>/', views.product_detail, name='product_detail'),
    path('cart/', views.get_cart, name='get_cart'),
    path('cart/add/', views.add_to_cart, name='add_to_cart'),
    path('checkout/', views.checkout, name='checkout'),
    path('orders/', views.order_history, name='order_history'),
    path('process_payment/', views.process_payment, name='process_payment'),
]
