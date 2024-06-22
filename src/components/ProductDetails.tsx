"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { CircularProgress, Typography, Container, Grid, Button, Card, CardMedia } from '@mui/material';
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
    ingredients: string;
    createdAt: string;
    updatedAt: string;
    images: { id: string, imageUrl: string }[];
}

const ProductDetailsPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const { user } = useUser(); // Fetch user from context
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [product, setProduct] = useState<Product | null>(null);

    useEffect(() => {
        const fetchProduct = async () => {
            if (id && typeof id === 'string') {
                try {
                    setLoading(true);
                    const response = await fetch(`http://localhost:8000/products/${id}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch product');
                    }
                    const data = await response.json();
                    console.log('product data got', data);
                    if (data.status === "OK" && data.product) {
                        setProduct(data.product);
                    } else {
                        throw new Error('Product not found');
                    }
                } catch (error) {
                    console.error('Error fetching product details:', error);
                    setProduct(null); // Handle error state
                    setError('Failed to fetch product details. Please try again.');
                } finally {
                    setLoading(false);
                }
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id]);

    if (loading) {
        return (
            <Container maxWidth="lg">
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg">
                <Typography color="error">{error}</Typography>
            </Container>
        );
    }

    if (!product) {
        return (
            <Container maxWidth="lg">
                <Typography variant="h6" color="textSecondary">
                    Product not found
                </Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg">
            <Grid container spacing={4}>
                <Grid item xs={12} sm={6} md={4}>
                    <Card>
                        <CardMedia
                            component="img"
                            image={product.primaryImageUrl}
                            alt={product.name}
                        />
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={8}>
                    <Typography variant="h4" gutterBottom>
                        {product.name}
                    </Typography>
                    <Typography variant="body1" component="div" gutterBottom>
                        Description: {product.description}
                    </Typography>
                    <Typography variant="body1" component="div" gutterBottom>
                        Price: {product.price}
                    </Typography>
                    <Typography variant="body1" component="div" gutterBottom>
                        Inventory Quantity: {product.inventoryQuantity}
                    </Typography>
                    <Typography variant="body1" component="div" gutterBottom>
                        Ingredients: {product.ingredients}
                    </Typography>
                    <Button variant="contained" color="primary" style={{ marginRight: '10px' }}>
                        Edit
                    </Button>
                    <Button variant="contained" color="secondary">
                        Delete
                    </Button>
                </Grid>
                {product.images && product.images.length > 0 && (
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                            More Images
                        </Typography>
                        <Grid container spacing={2}>
                            {product.images.map((imageObj, index) => (
                                <Grid item xs={6} sm={4} md={3} key={imageObj.id}>
                                    <Card style={{ width: '100px', height: '100px' }}>
                                        <CardMedia
                                            component="img"
                                            image={imageObj.imageUrl}
                                            alt={` image ${index + 1}`}
                                            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                        />
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                )}
            </Grid>
        </Container>
    );
};

export default ProductDetailsPage;
