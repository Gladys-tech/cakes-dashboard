"use client";
import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import { useUser } from '@/context/UserContext';

// Define the interface for store data
interface Shop {
  id: string;
  name: string;
  description: string;
  email: string;
  imageUrl?: string;
  // Add other properties as needed
}


const CreateShopPage = () => {
  const [open, setOpen] = useState(false);
  const [shops, setShops] = useState<Shop[]>([]);
  const { user } = useUser()
  const [shopData, setShopData] = useState({
    name: '',
    description: '',
    ownerName: '',
    email: '',
    type: 'online', // Add default value for type
    userId: 'user.id',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      telephone: '', // Change type to string
    },
    products: [],
  });
  const [successMessageOpen, setSuccessMessageOpen] = useState(false);


  useEffect(() => {
    // Update userId when user changes
    if (user) {

      setShopData(prevData => ({ ...prevData, userId: user.id }));
    }
  }, [user]);


  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSuccessMessageClose = () => {
    setSuccessMessageOpen(false);
  };

  const handleInputChange = (event: { target: { name: any; value: any; }; }) => {
    const { name, value } = event.target;
    // setShopData({ ...shopData, [name]: value });
    if (name === "name") {
      // Update the name field directly
      setShopData({ ...shopData, name: value });
    } else {
      // Update other fields
      setShopData({ ...shopData, [name]: value });
    }
  };


  const handleAddShop = async () => {
    try {
      const token = localStorage.getItem('token'); // Retrieve token from localStorage
      if (!token) {
        throw new Error('Token not found');
      }
      // Retrieve user  from localStorage
      if (!user) {
        throw new Error('User not found');
      }

      // Log shopData before sending the request
      console.log('Data being sent to backend:', shopData);
      const response = await fetch('http://localhost:8000/shops', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`, // Include token in Authorization header
          'Content-Type': 'application/json' //specfiying the data type
        },
        body: JSON.stringify(shopData),
      });


      const responseData = await response.json(); // Parse response JSON
    
      if (response.ok) {
      
        setSuccessMessageOpen(true);

        const addedShop = { ...shopData };
        // Update the shops state with the addedShop
        setShops(prevShops => [...prevShops, responseData.shop]);
        console.log('Added Shop:', addedShop);
        handleClose();

      } else {
        console.error('Failed to add shop:', responseData); // Log response data
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <Card>
        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <CardHeader title="Shops" titleTypographyProps={{ variant: 'h5' }} />
          <Stack direction="row" style={{ marginRight: '1rem' }}>
            <Button variant="contained" size="medium" onClick={handleOpen}>
              Add Shop
            </Button>
          </Stack>
        </Box>
       
      </Card>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Shop</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ width: '120px' }}>Shop Name:</Typography>
              <TextField
                fullWidth
                label="Shop Name"
                name="name"
                value={shopData.name}
                onChange={handleInputChange}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ width: '120px' }}>Description:</Typography>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={shopData.description}
                onChange={handleInputChange}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ width: '120px' }}>Owner Name:</Typography>
              <TextField
                fullWidth
                label="Owner Name"
                name="ownerName"
                value={shopData.ownerName}
                onChange={handleInputChange}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ width: '120px' }}>Email:</Typography>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={shopData.email}
                onChange={handleInputChange}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ width: '120px' }}>Street:</Typography>
              <TextField
                fullWidth
                label="Street"
                name="street"
                value={shopData.address.street}
                onChange={(event) =>
                  setShopData({
                    ...shopData,
                    address: { ...shopData.address, street: event.target.value },
                  })
                }
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ width: '120px' }}>City:</Typography>
              <TextField
                fullWidth
                label="city"
                name="city"
                value={shopData.address.city}
                onChange={(event) =>
                  setShopData({
                    ...shopData,
                    address: { ...shopData.address, city: event.target.value },
                  })
                }
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ width: '120px' }}>State:</Typography>
              <TextField
                fullWidth
                label="State"
                name="state"
                value={shopData.address.state}
                onChange={(event) =>
                  setShopData({
                    ...shopData,
                    address: { ...shopData.address, state: event.target.value },
                  })
                }
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ width: '120px' }}>Country:</Typography>
              <TextField
                fullWidth
                label="country"
                name="country"
                value={shopData.address.country}
                onChange={(event) =>
                  setShopData({
                    ...shopData,
                    address: { ...shopData.address, country: event.target.value },
                  })
                }
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ width: '120px' }}>Telephone:</Typography>
              <TextField
                fullWidth
                label="telephone"
                name="telephone"
                value={shopData.address.telephone}
                onChange={(event) =>
                  setShopData({
                    ...shopData,
                    address: { ...shopData.address, telephone: event.target.value },
                  })
                }
              />
            </Box>

          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Discard</Button>
          <Button onClick={handleAddShop} variant="contained" color="primary">
            Add Shop
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={successMessageOpen}
        autoHideDuration={6000}
        onClose={handleSuccessMessageClose}
        message="Shop added successfully"
        action={
          <Button color="inherit" size="small" onClick={handleSuccessMessageClose}>
            Close
          </Button>
        }
      />
    </div>
  );
};

export default CreateShopPage;


// function setShops(arg0: (prevShops: any) => any[]) {
//   throw new Error('Function not implemented.');
// }

