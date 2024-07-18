
// // chart with total earnings and total views.
// "use client";

// import React, { useState, useEffect } from 'react';
// import ReactApexChart from 'react-apexcharts';
// import { ApexOptions } from 'apexcharts';
// import { useUser } from '@/context/UserContext';

// const Chart = () => {
//   const [series, setSeries] = useState([
//     {
//       name: 'Total Earn',
//       data: []
//     },
//     {
//       name: 'Total Views',
//       data: [23, 12, 54, 61, 32, 56, 71, 89, 100]  // Keep this or replace with real data if needed
//     }
//   ]);
//   const { user } = useUser();

//   useEffect(() => {
//     const fetchTotalEarnings = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         if (!token) {
//           throw new Error('Token not found');
//         }

//         if (!user) {
//           throw new Error('User not found');
//         }

//         const response = await fetch(`http://localhost:8000/users/${user.id}`, {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           },
//         });

//         if (!response.ok) {
//           throw new Error(`Failed to fetch user data: ${response.status} ${response.statusText}`);
//         }

//         const userData = await response.json();
//         const fetchedShops = userData.user ? userData.user.shops : [];
//         const allProducts = [];
//         let totalEarnings = [];

//         for (const shop of fetchedShops) {
//           const responseShop = await fetch(`http://localhost:8000/shops/${shop.id}`, {
//             method: 'GET',
//             headers: {
//               'Authorization': `Bearer ${token}`,
//               'Content-Type': 'application/json'
//             },
//           });

//           if (!responseShop.ok) {
//             throw new Error(`Failed to fetch shop data for shop ID ${shop.id}`);
//           }

//           const shopData = await responseShop.json();
//           if (shopData.status === 'OK') {
//             const products = shopData.shop.products;
//             allProducts.push(...products);
//           }
//         }

//         for (const product of allProducts) {
//           const response = await fetch(`http://localhost:8000/products/${product.id}`, {
//             headers: {
//               'Content-Type': 'application/json'
//             }
//           });

//           if (!response.ok) {
//             throw new Error(`Failed to fetch orders for product ${product.id}`);
//           }

//           const data = await response.json();
//           if (data.status === 'OK') {
//             const orders = data.product.orders;
//             if (orders) {
//               let earnings = 0;
//               orders.forEach((order: { status: string; orderValue: number; }) => {
//                 if (order.status === 'delivered' && typeof order.orderValue === 'number') {
//                   earnings += order.orderValue;
//                 }
//               });
//               totalEarnings.push(earnings);
//             }
//           }
//         }

//         setSeries([
//           {
//             name: 'Total Earn',
//             data: totalEarnings
//           },
//           {
//             name: 'Total Views',
//             data: [23, 12, 54, 61, 32, 56, 71, 89, 100]  // Keep this or replace with real data if needed
//           }
//         ]);
//       } catch (error) {
//         console.error('Error fetching total earnings:', error);
//       }
//     };

//     if (user) {
//       fetchTotalEarnings();
//     }
//   }, [user]);

//   const options: ApexOptions = {
//     chart: {
//       type: 'line',
//       height: 350
//     },
//     xaxis: {
//       categories: ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']
//     },
//     colors: ['#FF1654', '#247BA0']
//   };

//   return (
//     <ReactApexChart options={options} series={series} type="line" height={350} />
//   );
// };

// export default Chart;




"use client";

import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { useUser } from '@/context/UserContext';

interface SeriesData {
  name: string;
  data: number[];
}

const Chart = () => {
  const [series, setSeries] = useState<SeriesData[]>([
    {
      name: 'Orders Delivered',
      data: []
    },
    {
      name: 'Orders Made',
      data: []
    }
  ]);
  const { user } = useUser();

  useEffect(() => {
    const fetchOrdersData = async () => {
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
        const allProducts = [];
        const deliveredOrdersData: number[] = [];
        const totalOrdersData: number[] = [];

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
            const products = shopData.shop.products;
            allProducts.push(...products);
          }
        }

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
              let deliveredCount = 0;
              orders.forEach((order: { status: string }) => {
                if (order.status === 'delivered') {
                  deliveredCount += 1;
                }
              });
              deliveredOrdersData.push(deliveredCount);
              totalOrdersData.push(orders.length);
            }
          }
        }

        setSeries([
          {
            name: 'Orders Delivered',
            data: deliveredOrdersData
          },
          {
            name: 'Orders Made',
            data: totalOrdersData
          }
        ]);
      } catch (error) {
        console.error('Error fetching orders data:', error);
      }
    };

    if (user) {
      fetchOrdersData();
    }
  }, [user]);

  const options: ApexOptions = {
    chart: {
      type: 'line',
      height: 350
    },
    xaxis: {
      categories: ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    },
    colors: ['#FF1654', '#247BA0']
  };

  return (
    <ReactApexChart options={options} series={series} type="line" height={350} />
  );
};

export default Chart;


