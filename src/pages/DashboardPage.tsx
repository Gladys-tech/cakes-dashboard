
"use client";

import { useState, useEffect } from 'react';
import { Box, Grid, Container } from '@mui/material';
import StatsCard from '../components/StatsCard';
import RecentOrders from '../components/RecentOrders';
import TopSellingProducts from '../components/TopSellingProducts';
import TopSearchProducts from '../components/TopSearchProducts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import { useUser } from '@/context/UserContext';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('../components/Chart'), { ssr: false });


const Dashboard = () => {
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0.0);
  const [totalProducts, setTotalProducts] = useState(0);
  const { user } = useUser();

  const fetchTotalOrdersEarningsAndProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token not found');
      }

      if (!user) {
        throw new Error('User not found');
      }

      console.log('Fetching data for user:', user.id);

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
      console.log('User data fetched:', userData);

      const fetchedShops = userData.user ? userData.user.shops : [];
      const allProducts = [];
      let productsCount = 0;

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
        console.log('Shop data fetched for shop ID:', shop.id, shopData);

        if (shopData.status === 'OK') {
          const products = shopData.shop.products;
          allProducts.push(...products);
          productsCount += products.length;
        }
      }

      const allOrders = [];
      let earnings = 0.0;

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
        console.log('Orders data fetched for product ID:', product.id, data);

        if (data.status === 'OK') {
          const orders = data.product.orders;
          if (orders) {
            allOrders.push(...orders);

            // total earnings.
            // orders.forEach((order: { orderValue: number }) => {
            //   if (typeof order.orderValue === 'number') {
            //     earnings += order.orderValue;
            //   } else {
            //     console.warn(`Order value is not a number for order:`, order);
            //   }
            // });
             // total earnings from delivered orders.
             orders.forEach((order: { status: string, orderValue: number }) => {
              if (order.status === 'delivered' && typeof order.orderValue === 'number') {
                earnings += order.orderValue;
              } else {
                console.warn(`Order is not delivered or order value is not a number for order:`, order);
              }
            });
          }
        }
      }

      setTotalOrders(allOrders.length);
      setTotalEarnings(earnings);
      setTotalProducts(productsCount);
    } catch (error) {
      console.error('Error fetching total orders, earnings, and products:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTotalOrdersEarningsAndProducts();
    }
  }, [user]);

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 2 }}>
      <Grid container spacing={3}>
        {/* Left Side: Stats Cards and Chart */}
        <Grid item xs={12} md={8} lg={9}>
          {/* Stats Cards */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <StatsCard
                title="Total Earning"
                value={`${totalEarnings.toFixed(2)}`}
                change="+10.24% this month"
                icon={<AttachMoneyIcon />}
                color="green"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StatsCard
                title="Total Products"
                value={totalProducts.toString()}
                change="+10.24% today"
                icon={<TrendingUpIcon />}
                color="blue"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StatsCard
                title="Total Orders"
                value={totalOrders.toString()}
                change="+3.21% this month"
                icon={<ShoppingCartIcon />}
                color="orange"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StatsCard
                title="Visitors Today"
                value="32,104"
                change="+0.94% today"
                icon={<PeopleIcon />}
                color="lightblue"
              />
            </Grid>
          </Grid>

          {/* Chart */}
          <Chart />

          {/* Recent Orders */}
          <RecentOrders />
        </Grid>

        {/* Right Side: Top Selling Products and Top Search Products */}
        <Grid item xs={12} md={4} lg={3}>
          {/* Top Selling Products */}
          <TopSellingProducts />

          {/* Add margin between Top Selling Products and Top Search Products */}
          <Box mt={3} />

          {/* Top Search Products */}
          <TopSearchProducts />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;

