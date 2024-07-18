
"use client";
import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar } from '@mui/material';
import { useUser } from '@/context/UserContext';

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

const TopSellingProducts = () => {
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const { user } = useUser();

  const fetchTopSellingProducts = async () => {
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

      // Aggregate orders and calculate product sales
      const productSalesMap = new Map<string, number>(); // Map to store product id -> total sales

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
            // Calculate total quantity sold for this product
            const totalQuantitySold = orders.reduce((acc: any, order: { quantity: any; }) => acc + order.quantity, 0);
            if (totalQuantitySold > 2) { // Filter products with quantity sold more than 2
              const totalSales = totalQuantitySold * parseFloat(product.price); // Assuming price is a string and needs conversion
              productSalesMap.set(product.id, totalSales);
            }
          }
        }
      }

      // Sort products by sales in descending order
      // Change to use Array.from to convert the Map entries to array
      const sortedProducts = Array.from(productSalesMap.entries())
        .sort((a, b) => b[1] - a[1]) // Sort by total sales
        .map(([productId]) => allProducts.find(product => product.id === productId)) // Map to Product objects
        .filter(product => !!product); // Filter out undefined products


      // Set the top selling products state
      setTopProducts(sortedProducts.slice(0, 4)); // Limit to top 4 products

    } catch (error) {
      console.error('Error fetching top selling products:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTopSellingProducts();
    }
  }, [user]);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">Top Selling Products</Typography>
        <List>
          {topProducts.map((product, index) => (
            <ListItem key={index}>
              <ListItemAvatar>
                <Avatar src={product.primaryImageUrl} />
              </ListItemAvatar>
              <ListItemText primary={product.name} secondary={`$${product.price}`} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default TopSellingProducts;
