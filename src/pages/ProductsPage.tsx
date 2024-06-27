"use client";
import { useEffect, useState } from 'react';
import { CircularProgress, Typography, Card, CardContent, CardActions, Button, Grid, Container, CardMedia } from '@mui/material';
import { useUser } from '@/context/UserContext';
import Link from 'next/link';

interface Product {
    id: string;
    name: string;
    description: string;
    price: string;
    inventoryQuantity: number;
    category: string;
    productStatus: string;
    primaryImageUrl: string;
    ingredients: string;
    createdAt: string;
    updatedAt: string;
}

const ProductPage = () => {
    const { user } = useUser(); // Fetch user from context
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [products, setProducts] = useState<Product[]>([]); // State to hold products
    const [totalProducts, setTotalProducts] = useState(0); // State to hold total number of products

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token'); // Retrieve token from localStorage
                if (!token) {
                    throw new Error('Token not found');
                }

                if (!user) {
                    throw new Error('User not found');
                }

                // Fetch user details first
                const userResponse = await fetch(`http://localhost:8000/users/${user.id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!userResponse.ok) {
                    throw new Error(`Failed to fetch user: ${userResponse.status} ${userResponse.statusText}`);
                }

                const userData = await userResponse.json();
                const shops = userData.user ? userData.user.shops : [];

                const allProducts: Product[] = [];

                // Iterate through shops and fetch products from each shop
                for (const shop of shops) {
                    const shopResponse = await fetch(`http://localhost:8000/shops/${shop.id}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });

                    if (!shopResponse.ok) {
                        throw new Error(`Failed to fetch shop data for shop ID ${shop.id}`);
                    }

                    const shopData = await shopResponse.json();
                    if (shopData.status === 'OK') {
                        allProducts.push(...shopData.shop.products);
                    } else {
                        console.error('Failed to fetch shop data:', shopData.error);
                    }
                }

                setProducts(allProducts);
                setTotalProducts(allProducts.length);
            } catch (error) {
                console.error('Error fetching products:', error);
                setError('Failed to fetch products. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchProducts();
        }
    }, [user]); // Fetch products when user changes

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom>
                Products
            </Typography>
            {loading && <CircularProgress />}
            {error && <Typography color="error">{error}</Typography>}
            {!loading && !error && (
                <Grid container spacing={3}>
                    {products.map((product) => (
                        <Grid item key={product.id} xs={12} sm={6} md={4}>
                            <Card>
                                {product.primaryImageUrl ? (
                                    <CardMedia
                                        component="img"
                                        height="215"
                                        image={product.primaryImageUrl}
                                        alt={product.name}
                                    />
                                ) : (
                                    <div
                                        style={{
                                            height: '215px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: '#f0f0f0',
                                            color: '#aaa',
                                            fontStyle: 'italic'
                                        }}
                                    >
                                        No image available
                                    </div>
                                )}
                                <CardContent>
                                    <Typography variant="h6" component="div" gutterBottom>
                                        {product.name}
                                    </Typography>
                                    <Typography color="textSecondary" variant="body2" component="p" gutterBottom>
                                        {product.description}
                                    </Typography>
                                    <Typography variant="body1" component="div" gutterBottom>
                                        Price: {product.price}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" component="div">
                                        Inventory Quantity: {product.inventoryQuantity}
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Link href={`/product-details/${product.id}`} passHref>
                                        <Button size="small" color="primary">
                                            View Details
                                        </Button>
                                    </Link>
                                    {/* Add other actions as needed */}
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
};

export default ProductPage;
