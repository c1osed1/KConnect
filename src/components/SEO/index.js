import React from 'react';
import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';


const SEO = ({
  title = 'К-Коннект',
  description = 'К-Коннект - социальная сеть от независимого разработчика',
  image = '/icon-512.png',
  url = window.location.href,
  type = 'website',
  meta = {},
}) => {
  
  const imageUrl = !image ? '/icon-512.png' : 
                  typeof image === 'string' && image.startsWith('http') ? image : 
                  `${window.location.origin}${(typeof image === 'string' && image.startsWith('/')) ? '' : '/'}${image}`;

  return (
    <Helmet>
      {}
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="google" content="notranslate" />
      <meta name="google-site-verification" content={meta.googleVerification || ''} />
      <meta name="yandex-verification" content={meta.yandexVerification || ''} />
      
      {}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="К-Коннект" />
      <meta property="og:locale" content="ru_RU" />
      
      {}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      
      {}
      {meta.author && <meta name="author" content={meta.author} />}
      {meta.canonical && <link rel="canonical" href={meta.canonical} />}
      
      {}
      {type === 'profile' && meta.firstName && (
        <meta property="profile:first_name" content={meta.firstName} />
      )}
      {type === 'profile' && meta.lastName && (
        <meta property="profile:last_name" content={meta.lastName} />
      )}
      {type === 'profile' && meta.username && (
        <meta property="profile:username" content={meta.username} />
      )}
      
      {}
      {type === 'article' && meta.publishedTime && (
        <meta property="article:published_time" content={meta.publishedTime} />
      )}
      {type === 'article' && meta.modifiedTime && (
        <meta property="article:modified_time" content={meta.modifiedTime} />
      )}
      {type === 'article' && meta.author && (
        <meta property="article:author" content={meta.author} />
      )}
      {type === 'article' && meta.section && (
        <meta property="article:section" content={meta.section} />
      )}
      {type === 'article' && meta.tags && (
        <meta property="article:tag" content={meta.tags} />
      )}
      
      {}
      {type === 'music' && meta.song && (
        <meta property="music:song" content={meta.song} />
      )}
      {type === 'music' && meta.artist && (
        <meta property="music:musician" content={meta.artist} />
      )}
      {type === 'music' && meta.album && (
        <meta property="music:album" content={meta.album} />
      )}
      
      {}
      {meta.keywords && <meta name="keywords" content={meta.keywords} />}
      {meta.viewport && <meta name="viewport" content={meta.viewport} />}
    </Helmet>
  );
};

SEO.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  image: PropTypes.string,
  url: PropTypes.string,
  type: PropTypes.string,
  meta: PropTypes.object,
};

export default SEO; 