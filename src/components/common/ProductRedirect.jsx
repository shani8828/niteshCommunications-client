import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Loader from './Loader';
import api from '../../utils/api';

const ProductRedirect = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const getProductSlugAndRedirect = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        const product = response.data?.product;
        if (product && product.slug) {
          // Perform 301-equivalent client redirect by replacing state
          navigate(`/products/${product.slug}`, { replace: true });
        } else {
          navigate('/shop', { replace: true });
        }
      } catch (err) {
        console.error('Redirect error:', err);
        navigate('/shop', { replace: true });
      }
    };
    getProductSlugAndRedirect();
  }, [id, navigate]);

  return <Loader fullPage />;
};

export default ProductRedirect;
