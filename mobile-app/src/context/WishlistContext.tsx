import React from 'react';
import { WishlistProvider as BaseWishlistProvider, useWishlist } from '@logic/context/WishlistContext';

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <BaseWishlistProvider>{children}</BaseWishlistProvider>;
};

export { useWishlist };
