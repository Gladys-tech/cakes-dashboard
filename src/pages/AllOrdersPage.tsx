"use client";
import { useState, ChangeEvent, useEffect } from 'react'

// ** MUI Imports
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TablePagination from '@mui/material/TablePagination'
import { useUser } from '@/context/UserContext'


interface Column {
    id: 'orderValue' | 'quantity' | 'client' | 'expectedDeliveryDate' | 'status' | 'email' | 'telphone' | 'location';
    label: string
    minWidth?: number
    align?: 'left'
    format?: (value: number) => string
}

const columns: readonly Column[] = [
    { id: 'orderValue', label: 'Order Value', minWidth: 100 },
    { id: 'quantity', label: 'Total Items', minWidth: 120, align: 'left', },
    { id: 'client', label: 'Client', minWidth: 170, align: 'left', },
    { id: 'expectedDeliveryDate', label: 'Expected Delivery', minWidth: 170, align: 'left', },
    { id: 'status', label: 'Status', minWidth: 170, align: 'left', },
    { id: 'email', label: 'Customer Email', minWidth: 170, align: 'left' },
    { id: 'telphone', label: 'Customer Telephone', minWidth: 170, align: 'left' },
    { id: 'location', label: 'Customer Location', minWidth: 170, align: 'left' }
]

// Define the structure of an order
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

type Product = {
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
};

// interface OrderTableProps {
//     setStatistics: React.Dispatch<React.SetStateAction<{
//         totalOrders: number;
//         ordersInTransit: number;
//         totalCostTransitOrders: number;
//         deliveredOrdersCount: number;
//         deliveredOrdersTotalAmount: number;
//         cancelledOrdersCount: number;
//         cancelledOrdersTotalAmount: number;
//         daysSinceFirstOrder: number;
//     }>>;
// }


// const OrdersPage: React.FC<OrderTableProps> = ({ setStatistics }) => {
const OrdersPage = () => {
    // ** States
    const [page, setPage] = useState<number>(0)
    const [rowsPerPage, setRowsPerPage] = useState<number>(10)
    const [orders, setOrders] = useState<Order[]>([])



    const { user } = useUser()

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage)
    }

    const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(+event.target.value)
        setPage(0)
    }

    // fetching the orders data
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
            console.log('userdata got to get the shops.', userData);
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
                console.log("got shop data", shopData);
                if (shopData.status === 'OK') {
                    allProducts.push(...shopData.shop.products);
                }
            }

            const allOrders: Order[] = [];
            // Iterate through products to fetch orders for each product
            for (const product of allProducts) {
                const response = await fetch(`http://localhost:8000/products/${product.id}`, {
                    headers: {
                        // 'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) {
                    throw new Error(`Failed to fetch orders for product ${product.id}`);
                }
                const data = await response.json();
                console.log("products data", data.product);
                console.log("order data", data.product.orders);
                if (data.status === 'OK') {
                    const order = data.product.orders;
                    // Check if order data exists
                    if (order) {
                        // Append orders to allorders array
                        allOrders.push(...order);
                    }
                }
            }

            //   // Calculate order statistics
            //   const totalOrders = allOrders.length;
            //   const ordersInTransit = allOrders.filter(order => order.status === 'transit').length;
            //   const totalCostTransitOrders = allOrders
            //     .filter(order => order.status === 'transit')
            //     .reduce((total, order) => total + order.orderValue, 0);
            //   const deliveredOrdersCount = allOrders.filter(order => order.status === 'delivered').length;
            //   const deliveredOrdersTotalAmount = allOrders
            //     .filter(order => order.status === 'delivered')
            //     .reduce((total, order) => total + order.orderValue, 0);
            //   const cancelledOrdersCount = allOrders.filter(order => order.status === 'cancelled').length;
            //   const cancelledOrdersTotalAmount = allOrders
            //     .filter(order => order.status === 'cancelled')
            //     .reduce((total, order) => total + order.orderValue, 0);

            // Update state with orders and statistics
            setOrders(allOrders);

            // Calculate the days since the earliest order date
            //   const orderDates = allOrders.map(order => new Date(order.createdAt).getTime()); // Convert Date objects to timestamps
            //   const earliestDate = new Date(Math.min(...orderDates));
            //   const today = new Date();
            //   const differenceInTime = today.getTime() - earliestDate.getTime();
            //   const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));

            //   const daysSinceFirstOrder = differenceInDays

            //   setStatistics({
            //     totalOrders,
            //     ordersInTransit,
            //     totalCostTransitOrders,
            //     deliveredOrdersCount,
            //     deliveredOrdersTotalAmount,
            //     cancelledOrdersCount,
            //     cancelledOrdersTotalAmount,
            //     daysSinceFirstOrder
            //   });

        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user]);

    // State variable to track the selected order for status update
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    // State variable to track the selected status
    const [selectedStatus, setSelectedStatus] = useState<string>('');

    // Function to handle the selection of a new status from the dropdown
    const handleStatusChange = async (newStatus: string) => {
        try {
            // Check if an order is selected
            if (!selectedOrderId) return;

            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Token not found');
            }

            // Call the updateOrder API with the selected order ID and the new status
            const response = await fetch(`http://localhost:8000/orders/${selectedOrderId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                throw new Error(`Failed to update status for order ${selectedOrderId}: ${response.status} ${response.statusText}`);
            }

            // Fetch orders again after updating the status
            fetchOrders();
            // Close the dropdown after status update
            setSelectedOrderId(null);
            setSelectedStatus('');
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    // Function to handle the opening of the status dropdown
    const handleStatusDropdownOpen = (orderId: string) => {
        setSelectedOrderId(orderId);
    };

    // Define a function to determine the background color for each status
    const getStatusBackgroundColor = (status: string): string => {
        switch (status) {
            case 'order made':
                return '#F6C90E';
            case 'confirmed':
                return '#57BB6C';
            case 'transit':
                return '#277DA1';
            case 'delivered':
                return '#007BFF';
            case 'cancelled':
                return '#DC3545';
            case 'delayed':
                return '#6C757D';
            default:
                return 'transparent'; // Default color
        }
    };

    // Find the length of the longest status
    const longestStatusLength = Math.max(...columns.filter(column => column.id === 'status').map(column => column.label.length));

    // Render the status column with a clickable element that opens the dropdown
    const renderStatusCell = (row: Order) => (
        <TableCell key="status" align="left">
            <div onClick={() => handleStatusDropdownOpen(row.id)}
                style={{
                    backgroundColor: getStatusBackgroundColor(row.status),
                    padding: '8px',
                    borderRadius: '4px',
                    width: `${longestStatusLength * 20}px`, // Set width based on the length of the longest status
                    textAlign: 'center',
                    display: 'inline-block',
                    cursor: 'pointer',
                }}>
                {row.status}
            </div>
            {selectedOrderId === row.id && (
                <div>
                    <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                        {['order made', 'confirmed', 'transit', 'delivered', 'cancelled', 'delayed'].map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                    <button onClick={() => handleStatusChange(selectedStatus)}>Update</button>
                </div>
            )}
        </TableCell>
    );

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader aria-label='Orders'>
                    <TableHead>
                        <TableRow>
                            {columns.map(column => (
                                <TableCell key={column.id} align={column.align} sx={{ minWidth: column.minWidth }}>
                                    {column.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {orders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
                            return (
                                <TableRow hover role='checkbox' tabIndex={-1} key={index}>
                                    {columns.map(column => (
                                        // Render the status column using the renderStatusCell function
                                        column.id === 'status' ? renderStatusCell(row) : (
                                            <TableCell key={column.id} align={column.align}>
                                                {column.id === 'email' ? row.customer.email :
                                                    column.id === 'telphone' ? row.customer.telphone :
                                                        column.id === 'location' ? row.customer.location :
                                                            column.format && typeof row[column.id] === 'number' ? column.format(Number(row[column.id])) : row[column.id]}
                                            </TableCell>
                                        )
                                    ))}
                                </TableRow>
                            )
                        })}
                    </TableBody>

                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[10, 25, 100]}
                component='div'
                count={orders.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />

        </Paper>
    )
}

export default OrdersPage;
