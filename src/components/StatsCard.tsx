"use client";
import { Card, CardContent, Typography, Box } from '@mui/material';

interface StatsCardProps {
  title: string;
  value: string | number;
  change: string;
  icon: JSX.Element;
  color: string;
}

const StatsCard = ({ title, value, change, icon, color }: StatsCardProps) => {
  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center">
          <Box>{icon}</Box>
          <Box ml={2}>
            <Typography variant="h5">{value}</Typography>
            <Typography variant="body2" color="textSecondary">{title}</Typography>
            <Typography variant="caption" color={color}>{change}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
