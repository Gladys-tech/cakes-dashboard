
"use client";
import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { useUser } from '@/context/UserContext';

interface Order {
  id: string;
  orderValue: number;
  quantity: number;
  totalCommission: number;
  actualMoney: number;
  client: string;
  expectedDeliveryDate: string;
  status: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  customer: {
    email: string;
    telphone: string;
    location: string;
  };
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  inventoryQuantity: number;
  category: string;
  productStatus: string;
  primaryImageUrl: string;
  createdAt: string;
  updatedAt: string;
}

const RecentOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const { user } = useUser();

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token not found');
      }

      if (!user) {
        throw new Error('User not found');
      }

      const response = await fetch(`http://localhost:8000/users/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.status} ${response.statusText}`);
      }

      const userData = await response.json();
      const fetchedShops = userData.user ? userData.user.shops : [];

      const allProducts: Product[] = [];
      for (const shop of fetchedShops) {
        const responseShop = await fetch(`http://localhost:8000/shops/${shop.id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        if (!responseShop.ok) {
          throw new Error(`Failed to fetch shop data for shop ID ${shop.id}`);
        }

        const shopData = await responseShop.json();
        if (shopData.status === 'OK') {
          allProducts.push(...shopData.shop.products);
        }
      }

      const allOrders: Order[] = [];
      for (const product of allProducts) {
        const response = await fetch(`http://localhost:8000/products/${product.id}`, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch orders for product ${product.id}`);
        }

        const data = await response.json();
        if (data.status === 'OK') {
          const orders = data.product.orders;
          if (orders) {
            allOrders.push(...orders);
          }
        }
      }

      // Get the date 3 days ago
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      // Filter orders to get only those made in the last 3 days
      const recentOrders = allOrders.filter(order => new Date(order.createdAt) >= threeDaysAgo);

      setOrders(recentOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">Recent Orders</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order Value</TableCell>
              <TableCell>Total Items</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Expected Delivery</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Customer Email</TableCell>
              <TableCell>Customer Telephone</TableCell>
              <TableCell>Customer Location</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.orderValue}</TableCell>
                <TableCell>{order.quantity}</TableCell>
                <TableCell>{order.client}</TableCell>
                <TableCell>{order.expectedDeliveryDate}</TableCell>
                <TableCell>{order.status}</TableCell>
                <TableCell>{order.customer.email}</TableCell>
                <TableCell>{order.customer.telphone}</TableCell>
                <TableCell>{order.customer.location}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default RecentOrders;
