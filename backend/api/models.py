from django.db import models
from django.contrib.auth.models import User

# Wrapper class to distinguish customers from users with no orders
class Customer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    billing_address = models.TextField(blank=True, null=True)
    shipping_address = models.TextField(blank=True, null=True)
    credit_card_info = models.CharField(max_length=255, blank=True, null=True)
    
    def __str__(self):
        return self.user.username

class Product(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=255)
    image = models.ImageField(upload_to='product_images/')
    inventory_quantity = models.PositiveIntegerField()

    def __str__(self):
        return self.name

class Order(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_address = models.TextField()
    billing_address = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=50)

    def __str__(self):
        return f'Order {self.id} by {self.customer.user.username}'

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()

    def __str__(self):
        return f'{self.quantity} of {self.product.name}'
    
class CartItem(models.Model):
    customer = models.ForeignKey(Customer, related_name='cart_items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()

    def __str__(self):
        return f'{self.quantity} of {self.product.name} in {self.customer.user.username}\'s cart'