import React, { createContext, useState, useEffect, useContext } from 'react';
import { showToast } from '../utils/toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const local = localStorage.getItem('cart');
    return local ? JSON.parse(local) : [];
  });

  const [wishlist, setWishlist] = useState(() => {
    const local = localStorage.getItem('wishlist');
    return local ? JSON.parse(local) : [];
  });

  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    const local = localStorage.getItem('recentlyViewed');
    return local ? JSON.parse(local) : [];
  });

  // Sync states to local storage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  /**
   * Add Item to Cart
   */
  const addToCart = (product, quantity = 1) => {
    if (product.stock === 0) {
      showToast.error('Sorry, this product is out of stock!');
      return;
    }

    setCartItems((prev) => {
      const exists = prev.find((item) => item.product._id === product._id);
      if (exists) {
        const newQty = exists.quantity + quantity;
        if (newQty > product.stock) {
          showToast.warning(`Only ${product.stock} units available in stock.`);
          return prev.map((item) =>
            item.product._id === product._id
              ? { ...item, quantity: product.stock }
              : item
          );
        }
        showToast.success('Cart updated successfully!');
        return prev.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: newQty }
            : item
        );
      }
      showToast.success('Added to Cart!');
      return [...prev, { product, quantity }];
    });
  };

  /**
   * Remove Item from Cart
   */
  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.product._id !== productId));
    showToast.success('Item removed from cart');
  };

  /**
   * Update quantity of cart item
   */
  const updateQuantity = (productId, qty) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.product._id === productId) {
          if (qty > item.product.stock) {
            showToast.warning(`Only ${item.product.stock} units available.`);
            return { ...item, quantity: item.product.stock };
          }
          return { ...item, quantity: Math.max(1, qty) };
        }
        return item;
      })
    );
  };

  /**
   * Clear Cart
   */
  const clearCart = () => {
    setCartItems([]);
  };

  /**
   * Toggle product in wishlist
   */
  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.find((p) => p._id === product._id);
      if (exists) {
        showToast.info('Removed from Wishlist');
        return prev.filter((p) => p._id !== product._id);
      } else {
        showToast.success('Added to Wishlist!');
        return [...prev, product];
      }
    });
  };

  /**
   * Log product in recently viewed history
   */
  const addRecentlyViewed = (product) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((p) => p._id !== product._id);
      // Keep only last 5 products
      return [product, ...filtered].slice(0, 5);
    });
  };

  // Calculations
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        wishlist,
        recentlyViewed,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        addRecentlyViewed,
        cartCount,
        cartSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
export default CartContext;
