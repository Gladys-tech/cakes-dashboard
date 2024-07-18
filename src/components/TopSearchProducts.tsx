"use client";
import { Card, CardContent, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar } from '@mui/material';

const topSearchProducts = [
  { name: 'Patch fishnet tote bag', image: '/images/patch.jpg', searches: '23,240 times' },
  { name: 'La DoubleJ', image: '/images/ladoublej.jpg', searches: '21,352 times' },
  { name: 'Adidas - Country lace', image: '/images/adidas.jpg', searches: '22,412 times' },
  { name: 'Gucci-Intelocking Jacket', image: '/images/gucci.jpg', searches: '4,351 times' },
];

const TopSearchProducts = () => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">Top Search Products</Typography>
        <List>
          {topSearchProducts.map((product, index) => (
            <ListItem key={index}>
              <ListItemAvatar>
                <Avatar src={product.image} />
              </ListItemAvatar>
              <ListItemText primary={product.name} secondary={product.searches} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default TopSearchProducts;
