
"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { CircularProgress, Typography, Container, Grid, Button, Card, CardMedia, Modal, Box, TextField, Snackbar, Alert } from '@mui/material';
import { useUser } from '@/context/UserContext';
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBJaZqdti73p6_W5VLhL4cImtIP3yLPJho",
    authDomain: "fir-todo-19dea.firebaseapp.com",
    projectId: "fir-todo-19dea",
    storageBucket: "fir-todo-19dea.appspot.com",
    messagingSenderId: "546043032199",
    appId: "1:546043032199:web:382ef00bd32eef2a4a7e22",
    measurementId: "G-27XG6KV0ZC"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

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

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editedProductName, setEditedProductName] = useState('');
    const [editedProductDescription, setEditedProductDescription] = useState('');
    const [editedProductPrice, setEditedProductPrice] = useState('');
    const [editedProductInventoryQuantity, setEditedProductInventoryQuantity] = useState(0);

    const [isSuccessMessageOpen, setIsSuccessMessageOpen] = useState(false);
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);

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


    const openEditModal = () => {
        if (product) {
            setEditedProductName(product.name);
            setEditedProductDescription(product.description);
            setEditedProductPrice(product.price);
            setEditedProductInventoryQuantity(product.inventoryQuantity);
            setIsEditModalOpen(true);
        }
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
    };

    const handleEditSubmit = async () => {
        try {
            const token = localStorage.getItem('token'); // Retrieve token from localStorage
            if (!token) {
                throw new Error('Token not found');
            }

            if (!id || typeof id !== 'string') {
                throw new Error('Product ID not found');
            }

            console.log('Uploaded Images ARRAY:', uploadedImages);

            const response = await fetch(`http://localhost:8000/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: editedProductName,
                    description: editedProductDescription,
                    price: editedProductPrice,
                    inventoryQuantity: editedProductInventoryQuantity,
                    imageUrls: uploadedImages,
                }),
            });
            if (!response.ok) {
                throw new Error('Failed to update product');
            }

            // Update the product state with the edited details
            setProduct((prevProduct) => ({
                ...prevProduct!,
                name: editedProductName,
                description: editedProductDescription,
                price: editedProductPrice,
                inventoryQuantity: editedProductInventoryQuantity,
            }));

            closeEditModal();
            setIsSuccessMessageOpen(true);
        } catch (error) {
            console.error('Error editing product:', error);
        }
    };

    const handleSuccessMessageClose = () => {
        setIsSuccessMessageOpen(false);
    };

    const handleDeleteProduct = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Token not found');
            }
            if (!id || typeof id !== 'string') {
                throw new Error('Product ID not found');
            }
            const response = await fetch(`http://localhost:8000/products/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete product');
            }
            router.push('/products');
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            const files = Array.from(event.target.files || []);
            if (files.length === 0) return;

            if (!product || !product.images) return;

            const totalFiles = product.images.length + files.length;
            if (totalFiles > 6) {
                console.error('Maximum 6 files allowed');
                setUploading(false); // Reset uploading state
                alert('Maximum 6 files allowed. Please remove some files and try again.');
                return;
            }

            const uploadPromises: Promise<string>[] = [];

            for (const file of files) {
                const storageRef = ref(storage, file.name);
                const uploadPromise = uploadBytes(storageRef, file).then(async () => {
                    const downloadURL = await getDownloadURL(storageRef);
                    console.log('Uploaded image URL:', downloadURL);
                    return downloadURL.toString();
                });
                uploadPromises.push(uploadPromise);
            }

            const urls = await Promise.all(uploadPromises);

            setUploadedImages(prevImages => [...prevImages, ...urls]);

            setUploading(false);
        } catch (error) {
            console.error('Error uploading image:', error);
            setUploading(false);
        }
    };

    const removeUploadedImage = (index: number) => {
        setUploadedImages(prevImages => prevImages.filter((_, i) => i !== index));
    };

    const removeImage = async (index: number) => {
        if (!product || !product.images) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Token not found');
            }
            if (!id || typeof id !== 'string') {
                throw new Error('Product ID not found');
            }

            const response = await fetch(`http://localhost:8000/products/${id}/images/${index}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            if (!response.ok) {
                throw new Error('Failed to remove image');
            }

            const updatedProduct = { ...product };
            updatedProduct.images.splice(index, 1);

            if (index === 0) {
                updatedProduct.primaryImageUrl = updatedProduct.images.length > 0 ? updatedProduct.images[0].imageUrl : '';
            }

            setProduct(updatedProduct);
        } catch (error) {
            console.error('Error removing image:', error);
        }
    };

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
                    <Typography variant="h4">{product.name}</Typography>
                    <Typography variant="body1">{product.description}</Typography>
                    <Typography variant="h6">${product.price}</Typography>
                    <Typography variant="body1">Inventory: {product.inventoryQuantity}</Typography>
                    <Typography variant="body1">Ingredients: {product.ingredients}</Typography>
                    <Typography variant="body1">Status: {product.productStatus}</Typography>
                    <Button variant="contained" color="primary" onClick={openEditModal}>
                        Edit
                    </Button>
                    <Button variant="contained" color="secondary" onClick={handleDeleteProduct} style={{ marginLeft: 10 }}>
                        Delete
                    </Button>
                </Grid>
            </Grid>

            <Grid container spacing={2} style={{ marginTop: 20 }}>
                {product.images.map((image, index) => (
                    <Grid item xs={12} sm={6} md={4} key={image.id}>
                        <Card style={{ maxWidth: 100 }}>
                            <CardMedia component="img" image={image.imageUrl} alt={`Product Image ${index + 1}`} />
                            <Button variant="contained" color="secondary" onClick={() => removeImage(index)}>
                                Remove Image
                            </Button>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Modal open={isEditModalOpen} onClose={closeEditModal}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '80%',
                        maxHeight: '90%',
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        overflow: 'auto', // Make the modal scrollable
                    }}
                >
                    <Box
                        sx={{
                            p: 4,
                        }}
                    >
                        <Typography variant="h6" gutterBottom>
                            Edit Product
                        </Typography>
                        <TextField
                            label="Name"
                            value={editedProductName}
                            onChange={(e) => setEditedProductName(e.target.value)}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Description"
                            value={editedProductDescription}
                            onChange={(e) => setEditedProductDescription(e.target.value)}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Price"
                            value={editedProductPrice}
                            onChange={(e) => setEditedProductPrice(e.target.value)}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Inventory Quantity"
                            type="number"
                            value={editedProductInventoryQuantity}
                            onChange={(e) => setEditedProductInventoryQuantity(parseInt(e.target.value))}
                            fullWidth
                            margin="normal"
                        />


                        {/* Upload Images */}
                        <Button
                            variant="contained"
                            component="label"
                            color="primary"
                            disabled={uploading || (product.images.length + uploadedImages.length >= 6)}
                        >
                            Upload Images
                            <input
                                type="file"
                                hidden
                                multiple
                                onChange={handleImageUpload}
                            />
                        </Button>
                        {uploading && <CircularProgress size={24} />}
                        <Grid container spacing={2} sx={{ mt: 2 }}>
                            {uploadedImages.map((imageUrl, index) => (
                                <Grid item xs={6} sm={4} md={3} key={index}>
                                    <Card>
                                        <CardMedia
                                            component="img"
                                            image={imageUrl}
                                            alt={`Uploaded image ${index + 1}`}
                                        />
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            onClick={() => removeUploadedImage(index)}
                                        >
                                            Remove
                                        </Button>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>

                        <Grid container spacing={2} sx={{ mt: 2 }}>
                            {product.images.map((image, index) => (
                                <Grid item xs={6} sm={4} md={3} key={image.id}>
                                    <Card>
                                        <CardMedia
                                            component="img"
                                            image={image.imageUrl}
                                            alt={`Image ${index + 1}`}
                                        />
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            onClick={() => removeImage(index)}
                                        >
                                            Remove
                                        </Button>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>

                        <Button variant="contained" color="primary" onClick={handleEditSubmit} style={{ marginTop: 10 , marginRight:5}}>
                            Save
                        </Button>
                        <Button variant="contained" color="secondary" onClick={closeEditModal} style={{ marginTop: 10 }}>
                            Cancel
                        </Button>
                    </Box>
                </Box>
            </Modal>

            <Snackbar
                open={isSuccessMessageOpen}
                autoHideDuration={6000}
                onClose={handleSuccessMessageClose}
            >
                <Alert onClose={handleSuccessMessageClose} severity="success">
                    Product updated successfully!
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default ProductDetailsPage;



