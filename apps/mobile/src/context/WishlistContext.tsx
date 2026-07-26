import React from 'react';
import { WishlistProvider as BaseWishlistProvider, useWishlist } from '@aroham/shared-state';

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <BaseWishlistProvider>{children}</BaseWishlistProvider>;
};

export { useWishlist };
