// "use client";
// import React, { useState, useEffect } from 'react';
// import Box from '@mui/material/Box';
// import Card from '@mui/material/Card';
// import Button from '@mui/material/Button';
// import Modal from '@mui/material/Modal';
// import TextField from '@mui/material/TextField';
// import Snackbar from '@mui/material/Snackbar';
// import MuiAlert from '@mui/material/Alert';
// import Grid from '@mui/material/Grid';
// import { useTheme } from '@mui/material/styles';
// import useMediaQuery from '@mui/material/useMediaQuery';
// import { useUser } from '@/context/UserContext';

// interface Shop {
//   id: string;
//   name: string;
//   description: string;
//   email: string;
//   imageUrl?: string;
// }

// const ShopsPage: React.FC = () => {
//   const [shops, setShops] = useState<Shop[]>([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(3);
//   const [dataLoaded, setDataLoaded] = useState(false);

//   const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [editedShopName, setEditedShopName] = useState('');
//   const [editedShopDescription, setEditedShopDescription] = useState('');
//   const [editedShopEmail, setEditedShopEmail] = useState('');

//   const [isSuccessMessageOpen, setIsSuccessMessageOpen] = useState(false);
//   const [isEditSuccessMessageOpen, setIsEditSuccessMessageOpen] = useState(false);

//   const theme = useTheme();
//   const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;

//   const currentItems = Array.isArray(shops) ? shops.slice(indexOfFirstItem, indexOfLastItem) : [];

//   const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

//   const { user } = useUser();

//   useEffect(() => {
//     const fetchShops = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         if (!token) throw new Error('Token not found');

//         if (!user) throw new Error('User not found');

//         const response = await fetch(`http://localhost:8000/users/${user.id}`, {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//           },
//         });

//         if (!response.ok) throw new Error(`Failed to fetch shops: ${response.status} ${response.statusText}`);

//         const userData = await response.json();
//         const fetchedShops = Array.isArray(userData.user.shops) ? userData.user.shops : [];
//         setShops(fetchedShops);
//         setDataLoaded(true);
//       } catch (error) {
//         console.error('Error fetching shops:', error);
//       }
//     };

//     fetchShops();
//   }, [user]);

//   if (!dataLoaded) {
//     return <div>Loading...</div>;
//   }

//   const handleDeleteSuccessMessageClose = () => {
//     setIsSuccessMessageOpen(false);
//   };

//   const deleteShop = async (shopId: string) => {
//     try {
//       const token = localStorage.getItem('token');
//       if (!token) throw new Error('Token not found');

//       const response = await fetch(`http://localhost:8000/shops/${shopId}`, {
//         method: 'DELETE',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//         },
//       });

//       if (!response.ok) throw new Error(`Failed to delete shop: ${response.status} ${response.statusText}`);

//       setShops(prevShops => prevShops.filter(shop => shop.id !== shopId));

//       setIsSuccessMessageOpen(true);
//     } catch (error) {
//       console.error('Error deleting shop:', error);
//     }
//   };

//   const openEditModal = (shop: Shop) => {
//     setSelectedShop(shop);
//     setEditedShopName(shop.name);
//     setEditedShopDescription(shop.description);
//     setEditedShopEmail(shop.email);
//     setIsEditModalOpen(true);
//   };

//   const closeEditModal = () => {
//     setIsEditModalOpen(false);
//     setSelectedShop(null);
//   };

//   const handleEditSubmit = async () => {
//     if (!selectedShop) return;

//     try {
//       const token = localStorage.getItem('token');
//       if (!token) throw new Error('Token not found');

//       const response = await fetch(`http://localhost:8000/shops/${selectedShop.id}`, {
//         method: 'PUT',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           name: editedShopName,
//           description: editedShopDescription,
//           email: editedShopEmail
//         })
//       });

//       if (!response.ok) throw new Error(`Failed to edit shop: ${response.status} ${response.statusText}`);

//       setShops(prevShops =>
//         prevShops.map(shop => (shop.id === selectedShop.id ? { ...shop, name: editedShopName, description: editedShopDescription, email: editedShopEmail } : shop))
//       );

//       closeEditModal();
//       setIsEditSuccessMessageOpen(true);
//     } catch (error) {
//       console.error('Error editing shop:', error);
//     }
//   };

//   const handleEditSuccessMessageClose = () => {
//     setIsEditSuccessMessageOpen(false);
//   };

//   if (!Array.isArray(shops) || !shops.length) {
//     return <div>No shops found.</div>;
//   }

//   return (
//     <div>
//       <Grid container spacing={2} justifyContent="center">
//         {currentItems.map((shop, index) => (
//           <Grid item xs={12} sm={6} md={4} key={index}>
//             <Card style={{ marginBottom: '1rem' }}>
//               <Box 
//                 style={{ 
//                   display: 'flex', 
//                   flexDirection: isSmallScreen ? 'column' : 'row', 
//                   justifyContent: 'space-between', 
//                   alignItems: isSmallScreen ? 'flex-start' : 'center', 
//                   padding: '1rem' 
//                 }}
//               >
//                 <div style={{ marginLeft: '1rem', width: '100%' }}>
//                   <div style={{ marginBottom: '0.5rem' }}><strong>Shop Name:</strong> {shop.name}</div>
//                   <div style={{ marginBottom: '0.5rem' }}><strong>Description:</strong> {shop.description}</div>
//                   <div style={{ marginBottom: '0.5rem' }}><strong>Email:</strong> {shop.email}</div>
//                 </div>
//                 <div>
//                   <Button variant="outlined" size="small" style={{ marginRight: '0.5rem', marginBottom: isSmallScreen ? '0.5rem' : '0' }} onClick={() => openEditModal(shop)}>Edit</Button>
//                   <Button variant="outlined" size="small" onClick={() => deleteShop(shop.id)}>Delete</Button>
//                 </div>
//               </Box>
//             </Card>
//           </Grid>
//         ))}
//       </Grid>
//       <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
//         {Array.from({ length: Math.ceil(shops.length / itemsPerPage) }, (_, i) => (
//           <Button key={i} onClick={() => paginate(i + 1)}>{i + 1}</Button>
//         ))}
//       </div>

//       <Modal open={isEditModalOpen} onClose={closeEditModal}>
//         <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', boxShadow: 24, p: 4, maxWidth: isSmallScreen ? '90%' : 400 }}>
//           <TextField label="Shop Name" value={editedShopName} onChange={e => setEditedShopName(e.target.value)} fullWidth sx={{ mb: 2 }} />
//           <TextField label="Description" value={editedShopDescription} onChange={e => setEditedShopDescription(e.target.value)} fullWidth sx={{ mb: 2 }} />
//           <TextField label="Email" value={editedShopEmail} onChange={e => setEditedShopEmail(e.target.value)} fullWidth sx={{ mb: 2 }} />
//           <Button variant="contained" onClick={handleEditSubmit}>Submit</Button>
//         </Box>
//       </Modal>

//       <Snackbar open={isEditSuccessMessageOpen} autoHideDuration={6000} onClose={handleEditSuccessMessageClose}>
//         <MuiAlert elevation={6} variant="filled" onClose={handleEditSuccessMessageClose} severity="success">
//           Shop edited successfully!
//         </MuiAlert>
//       </Snackbar>

//       <Snackbar open={isSuccessMessageOpen} autoHideDuration={6000} onClose={handleDeleteSuccessMessageClose}>
//         <MuiAlert elevation={6} variant="filled" onClose={handleDeleteSuccessMessageClose} severity="success">
//           Shop deleted successfully!
//         </MuiAlert>
//       </Snackbar>
//     </div>
//   );
// };

// export default ShopsPage;


"use client";
import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useUser } from '@/context/UserContext';

interface Shop {
  id: string;
  name: string;
  description: string;
  email: string;
  imageUrl?: string;
}

const ShopsPage: React.FC = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3);
  const [dataLoaded, setDataLoaded] = useState(false);

  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedShopName, setEditedShopName] = useState('');
  const [editedShopDescription, setEditedShopDescription] = useState('');
  const [editedShopEmail, setEditedShopEmail] = useState('');

  const [isSuccessMessageOpen, setIsSuccessMessageOpen] = useState(false);
  const [isEditSuccessMessageOpen, setIsEditSuccessMessageOpen] = useState(false);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentItems = Array.isArray(shops) ? shops.slice(indexOfFirstItem, indexOfLastItem) : [];

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const { user } = useUser();

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token not found');

        if (!user) throw new Error('User not found');

        const response = await fetch(`http://localhost:8000/users/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error(`Failed to fetch shops: ${response.status} ${response.statusText}`);

        const userData = await response.json();
        const fetchedShops = Array.isArray(userData.user.shops) ? userData.user.shops : [];
        setShops(fetchedShops);
        setDataLoaded(true);
      } catch (error) {
        console.error('Error fetching shops:', error);
      }
    };

    fetchShops();
  }, [user]);

  if (!dataLoaded) {
    return <div>Loading...</div>;
  }

  const handleDeleteSuccessMessageClose = () => {
    setIsSuccessMessageOpen(false);
  };

  const deleteShop = async (shopId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token not found');

      const response = await fetch(`http://localhost:8000/shops/${shopId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`Failed to delete shop: ${response.status} ${response.statusText}`);

      setShops(prevShops => prevShops.filter(shop => shop.id !== shopId));

      setIsSuccessMessageOpen(true);
    } catch (error) {
      console.error('Error deleting shop:', error);
    }
  };

  const openEditModal = (shop: Shop) => {
    setSelectedShop(shop);
    setEditedShopName(shop.name);
    setEditedShopDescription(shop.description);
    setEditedShopEmail(shop.email);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedShop(null);
  };

  const handleEditSubmit = async () => {
    if (!selectedShop) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token not found');

      const response = await fetch(`http://localhost:8000/shops/${selectedShop.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editedShopName,
          description: editedShopDescription,
          email: editedShopEmail
        })
      });

      if (!response.ok) throw new Error(`Failed to edit shop: ${response.status} ${response.statusText}`);

      setShops(prevShops =>
        prevShops.map(shop => (shop.id === selectedShop.id ? { ...shop, name: editedShopName, description: editedShopDescription, email: editedShopEmail } : shop))
      );

      closeEditModal();
      setIsEditSuccessMessageOpen(true);
    } catch (error) {
      console.error('Error editing shop:', error);
    }
  };

  const handleEditSuccessMessageClose = () => {
    setIsEditSuccessMessageOpen(false);
  };

  if (!Array.isArray(shops) || !shops.length) {
    return <div>No shops found.</div>;
  }

  return (
    <div>
      <Grid container spacing={2} justifyContent="center">
        {currentItems.map((shop, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card style={{ marginBottom: '1rem' }}>
              <Box 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '1rem' 
                }}
              >
                <div style={{ marginBottom: '1rem', width: '100%' }}>
                  <div style={{ marginBottom: '0.5rem' }}><strong>Shop Name:</strong> {shop.name}</div>
                  <div style={{ marginBottom: '0.5rem' }}><strong>Description:</strong> {shop.description}</div>
                  <div style={{ marginBottom: '0.5rem' }}><strong>Email:</strong> {shop.email}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
                  <Button variant="outlined" size="small" onClick={() => openEditModal(shop)}>Edit</Button>
                  <Button variant="outlined" size="small" onClick={() => deleteShop(shop.id)}>Delete</Button>
                </div>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
        {Array.from({ length: Math.ceil(shops.length / itemsPerPage) }, (_, i) => (
          <Button key={i} onClick={() => paginate(i + 1)}>{i + 1}</Button>
        ))}
      </div>

      <Modal open={isEditModalOpen} onClose={closeEditModal}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', boxShadow: 24, p: 4, width: '80%', maxWidth: 400 }}>
          <TextField label="Shop Name" value={editedShopName} onChange={e => setEditedShopName(e.target.value)} fullWidth sx={{ mb: 2 }} />
          <TextField label="Description" value={editedShopDescription} onChange={e => setEditedShopDescription(e.target.value)} fullWidth sx={{ mb: 2 }} />
          <TextField label="Email" value={editedShopEmail} onChange={e => setEditedShopEmail(e.target.value)} fullWidth sx={{ mb: 2 }} />
          <Button variant="contained" onClick={handleEditSubmit}>Submit</Button>
        </Box>
      </Modal>

      <Snackbar open={isEditSuccessMessageOpen} autoHideDuration={6000} onClose={handleEditSuccessMessageClose}>
        <MuiAlert elevation={6} variant="filled" onClose={handleEditSuccessMessageClose} severity="success">
          Shop edited successfully!
        </MuiAlert>
      </Snackbar>

      <Snackbar open={isSuccessMessageOpen} autoHideDuration={6000} onClose={handleDeleteSuccessMessageClose}>
        <MuiAlert elevation={6} variant="filled" onClose={handleDeleteSuccessMessageClose} severity="success">
          Shop deleted successfully!
        </MuiAlert>
      </Snackbar>
    </div>
  );
};

export default ShopsPage;

