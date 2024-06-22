"use client";
import { useEffect, useState } from 'react';
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import CircularProgress from '@mui/material/CircularProgress'
import { Box, Button } from '@mui/material';
import { useUser } from '@/context/UserContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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


// Define the type for imageUrl as an array of strings
interface ProductData {
    name: string;
    description: string;
    price: string;
    inventoryQuantity: string;
    productStatus: string;
    shops: { shopId: string }[];
    imageUrl: string[]; // Change imageUrl type to string[]
    category: string;
    ingredients: string;
}

// Define the interface for store data
interface Shop {
    id: string;
    name: string;
    description: string;
    email: string;
    imageUrl?: string;
    // Add other properties as needed
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
    ingredients: string;
    createdAt: string;
    updatedAt: string;
}


const CreateProductPage = () => {
    // const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalProducts, setTotalProducts] = useState(0); // State to hold the total number of products
    const [totalCategories, setTotalCategories] = useState(0);
    const [products, setProducts] = useState<Product[]>([]);
    const { user } = useUser()
    const [dataLoaded, setDataLoaded] = useState(false); // New state to track data loading
    // State to hold the fetched shops
    const [fetchedShops, setFetchedShops] = useState<Shop[]>([]);
    const [selectedShopId, setSelectedShopId] = useState('');



    // Effect to fetch shops related to the user
    useEffect(() => {
        const fetchShops = async () => {
            try {
                const token = localStorage.getItem('token'); // Retrieve token from localStorage
                if (!token) {
                    throw new Error('Token not found');
                }

                // Retrieve user from localStorage
                if (!user) {
                    throw new Error('User not found');
                }

                const response = await fetch(`http://localhost:8000/users/${user.id}`, { // Modify the endpoint to include the user ID
                    headers: {
                        'Authorization': `Bearer ${token}`, // Include token in Authorization header
                    },
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch shops: ${response.status} ${response.statusText}`);
                }

                const userData = await response.json();
                console.log(userData);
                const fetchedShops = userData.user ? userData.user.shops : []; // Access the shops array from the user data
                console.log('shops fetched in the products', fetchedShops);
                setFetchedShops(fetchedShops); // Update fetchedShops state
                setDataLoaded(true);
            } catch (error) {
                console.error('Error fetching shops:', error);
            }
        };

        fetchShops(); // Call fetchShops function
    }, [user]); // Run effect whenever user changes



    // getting the products and categories in real time.
    useEffect(() => {
        const computeTotals = () => {
            const categories = new Set(products.map(product => product.category));
            setTotalProducts(products.length);
            setTotalCategories(categories.size);
        };
        computeTotals();
    }, [products]);



    const [productData, setProductData] = useState<ProductData>({
        name: '',
        description: '',
        price: '',
        inventoryQuantity: '',
        productStatus: '',
        shops: [
            { shopId: '' },
        ],
        imageUrl: [], // Change imageUrl to an array
        category: '',
        ingredients: '',
    });

    const [successMessageOpen, setSuccessMessageOpen] = useState(false);
    const [uploading, setUploading] = useState(false);



    const handleInputChange = (event: { target: { name: any; value: any; }; }) => {
        const { name, value } = event.target;
        setProductData({ ...productData, [name]: value });
    };



    // Updated handleImageUpload function to handle multiple file uploads
    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            const files = Array.from(event.target.files || []);
            if (files.length === 0) return;

            // Ensure that the total number of files does not exceed 6
            const totalFiles = productData.imageUrl.length + files.length;
            if (totalFiles > 6) {
                console.error('Maximum 6 files allowed');
                setUploading(false); // Reset uploading state
                // Display error message to the user
                alert('Maximum 6 files allowed. Please remove some files and try again.');
                return;
            }

            // Array to store promises for all uploads
            const uploadPromises: Promise<string>[] = [];

            // Iterate through each file and upload it
            files.forEach((file: File) => {
                const storageRef = ref(storage, file.name); // Obtain reference to the file in storage
                const uploadPromise = uploadBytes(storageRef, file) // Upload the file
                    .then(() => getDownloadURL(storageRef)); // Get the download URL of the uploaded file
                uploadPromises.push(uploadPromise);
            });

            // Wait for all uploads to complete
            const urls = await Promise.all(uploadPromises);

            // Combine existing and new file URLs, limiting the total to 6
            const newUrls = [...productData.imageUrl, ...urls.slice(0, 6 - productData.imageUrl.length)];

            // Update imageUrl with the combined array
            setProductData({ ...productData, imageUrl: newUrls });

            // Disable upload button if 6 images are uploaded
            if (newUrls.length === 6) {
                document.getElementById('imageUploadInput')?.setAttribute('disabled', 'true');
            }

            setUploading(false);
        } catch (error) {
            console.error('Error uploading image:', error);
            setUploading(false);
        }
    };



    // Function to remove an image
    const removeImage = (index: number) => {
        const updatedImages = [...productData.imageUrl];
        updatedImages.splice(index, 1);
        setProductData({ ...productData, imageUrl: updatedImages });
    };



    // Function to add a product to the products
    const handleAddProduct = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token'); // Retrieve token from localStorage
            if (!token) {
                throw new Error('Token not found');
            }

            const shopId = selectedShopId; // Access the selected shopId

            // Ensure that a shop is selected
            if (!shopId) {
                console.error('No shop selected');
                return;
            }

            // Find the primary image URL
            const primaryImageUrl = productData.imageUrl.length > 0 ? productData.imageUrl[0] : null;

            // Construct product data with shop details
            const productWithShop = {
                name: productData.name,
                description: productData.description,
                price: productData.price,
                inventoryQuantity: parseInt(productData.inventoryQuantity),
                category: productData.category,
                ingredients: productData.ingredients,
                productStatus: productData.productStatus,
                imageUrls: productData.imageUrl,
                primaryImageUrl: primaryImageUrl,
                shops: [{ shopId }], // Include shop details as an array
            };

            // Make the POST request to create the product with shop details
            const response = await fetch('http://localhost:8000/products', {
                method: 'POST',
                headers: {
                    // 'Authorization': `Bearer ${token}`, // Include token in Authorization header
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...productWithShop, imageUrls: productData.imageUrl }), // Send product data in the request body
            });

            const responseData = await response.json(); // Parse response JSON
            console.log('product added successfully', responseData);
            if (response.ok) {
                setProducts(prevProducts => [...prevProducts, responseData.product]);
                setSuccessMessageOpen(true);
                toast.success('Product added successfully!');
                // setTimeout(() => {
                //     router.push('/products'); // Redirect to the products page
                // }, 2000);
                window.location.href = '/products';

            } else {
                console.error('Failed to add product');
                toast.error('Failed to add product. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="max-w-4xl mx-auto mt-8 px-4">
            <div className="bg-white shadow-md rounded-md p-6">
                <h4 className="text-2xl text-blue-500 font-semibold mb-4">Create Product</h4>

                <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={productData.name}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={productData.description}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        rows={4}
                    ></textarea>
                </div>
                <div className="mb-4">
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                        Price
                    </label>
                    <input
                        type="text"
                        id="price"
                        name="price"
                        value={productData.price}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="inventoryQuantity" className="block text-sm font-medium text-gray-700">
                        Inventory Quantity
                    </label>
                    <input
                        type="text"
                        id="inventoryQuantity"
                        name="inventoryQuantity"
                        value={productData.inventoryQuantity}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                        Category
                    </label>
                    <input
                        type="text"
                        id="category"
                        name="category"
                        value={productData.category}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                        ingredients
                    </label>
                    <input
                        type="text"
                        id="ingredients"
                        name="ingredients"
                        value={productData.ingredients}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="shop" className="block text-sm font-medium text-gray-700">
                        Shop
                    </label>
                    <select
                        id="shop"
                        value={selectedShopId}
                        onChange={(e) => setSelectedShopId(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                        <option value="">-- Select Shop --</option>
                        {fetchedShops.map((shop) => (
                            <option key={shop.id} value={shop.id}>
                                {shop.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-4">
                    <label htmlFor="imageUploadInput" className="block text-sm font-medium text-gray-700">
                        Image Upload
                    </label>
                    <input
                        id="imageUploadInput" // Add an id to the input for targeting
                        type="file"
                        accept="image/*"
                        onChange={(event) => handleImageUpload(event)}
                        disabled={productData.imageUrl.length === 6} // Disable input if 6 images are uploaded
                    />
                    {uploading && <CircularProgress size={24} />}

                    {/* Display image previews if imageUrl exists */}
                    {productData.imageUrl.length > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                            {productData.imageUrl.map((url: string, index: number) => (
                                <div key={index} style={{ position: 'relative' }}>
                                    <img src={url} alt={`Product ${index}`} style={{ maxWidth: '100%', maxHeight: '100px' }} />
                                    <button
                                        onClick={() => removeImage(index)}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            right: 0,
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: '18px',
                                            color: 'red',
                                            padding: '2px 6px',
                                            borderRadius: '50%',
                                            zIndex: 1,
                                        }}
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </Box>
                    )}
                </div>
                <button
                    onClick={handleAddProduct}
                    disabled={loading}
                    className={`bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 focus:outline-none focus:bg-indigo-600 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {/* {loading ? 'Creating...' : 'Save Product'} */}
                    Save Product
                </button>
            </div>
        </div>
    );
};

export default CreateProductPage;
