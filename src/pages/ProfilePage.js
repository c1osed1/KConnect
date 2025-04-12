import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  CircularProgress, 
  Container, 
  Grid, 
  Avatar, 
  Paper, 
  Tabs, 
  Tab, 
  Card, 
  CardContent, 
  CardMedia, 
  IconButton, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Snackbar, 
  Alert, 
  TextField, 
  Tooltip, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Link as MuiLink,
  ImageList,
  ImageListItem,
  Chip,
  InputBase,
  Badge,
  Skeleton,
  useTheme,
  Popover,
  ButtonBase,
  Collapse
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import PostService from '../services/PostService';
import ReactMarkdown from 'react-markdown';
import 'react-medium-image-zoom/dist/styles.css';
import { ThemeSettingsContext } from '../App';
import ImageGrid from '../components/ImageGrid';
import { formatTimeAgo, getRussianWordForm, formatDate } from '../utils/dateUtils';
import Post from '../components/Post/Post'; // Import Post component
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RepostItem from '../components/RepostItem';
import PostSkeleton from '../components/Post/PostSkeleton';
import ContentLoader from '../components/UI/ContentLoader';
import TabContentLoader from '../components/UI/TabContentLoader';

// Material UI Icons
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import FeedIcon from '@mui/icons-material/Feed';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ShareIcon from '@mui/icons-material/Share';
import ImageIcon from '@mui/icons-material/Image';
import VideoCameraBackIcon from '@mui/icons-material/VideoCameraBack';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import ReplyIcon from '@mui/icons-material/Reply';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CommentIcon from '@mui/icons-material/Comment';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LinkIcon from '@mui/icons-material/Link';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import MusicSelectDialog from '../components/Music/MusicSelectDialog';
import InfoIcon from '@mui/icons-material/Info';
import CakeIcon from '@mui/icons-material/Cake';
import TodayIcon from '@mui/icons-material/Today';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';

// Styled components for profile
const ProfileHeader = styled(Box)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  borderRadius: '16px',
  marginBottom: theme.spacing(2)
}));

const CoverPhoto = styled(Box)(({ theme }) => ({
  width: '100%',
  height: 200,
  position: 'relative',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundColor: '#1A1A1A',
  [theme.breakpoints.up('sm')]: {
    height: 250,
  },
  [theme.breakpoints.up('md')]: {
    height: 300,
  },
}));

const ProfileContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(1),
  [theme.breakpoints.up('md')]: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing(3),
    padding: theme.spacing(3),
  },
}));

const AvatarWrap = styled(Box)(({ theme }) => ({
  position: 'relative',
  marginTop: -60,
  marginBottom: theme.spacing(2),
  display: 'flex',
  justifyContent: 'center',
  [theme.breakpoints.up('md')]: {
    marginTop: -80,
    marginBottom: 0,
    justifyContent: 'flex-start',
  },
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  border: '4px solid rgba(26, 26, 26, 0.9)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
  [theme.breakpoints.up('md')]: {
    width: 160,
    height: 160,
  },
}));

const ProfileInfo = styled(Box)(({ theme }) => ({
  flex: 1,
  [theme.breakpoints.up('md')]: {
    flex: 1,
    maxWidth: '100%',
    marginLeft: 0,
  },
}));

const ProfileName = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  marginBottom: theme.spacing(0.5),
  fontSize: '1.5rem',
  textAlign: 'center',
  [theme.breakpoints.up('md')]: {
    fontSize: '2rem',
    textAlign: 'left',
  },
}));

const ProfileUsername = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1.5),
  textAlign: 'center',
  [theme.breakpoints.up('md')]: {
    textAlign: 'left',
  },
}));

const ProfileBio = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  whiteSpace: 'pre-wrap',
  textAlign: 'center',
  [theme.breakpoints.up('md')]: {
    textAlign: 'left',
  },
}));

const ProfileStats = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  gap: theme.spacing(3),
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1.5, 0),
  borderTop: `1px solid ${theme.palette.divider}`,
  borderBottom: `1px solid ${theme.palette.divider}`,
  [theme.breakpoints.up('md')]: {
    justifyContent: 'flex-start',
  },
}));

const StatItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  [theme.breakpoints.up('md')]: {
    alignItems: 'flex-start',
  },
}));

const SocialLinks = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: theme.spacing(1.5),
  marginBottom: theme.spacing(2),
  [theme.breakpoints.up('md')]: {
    justifyContent: 'flex-start',
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
  borderRadius: '20px',
  zIndex: 1,
  fontWeight: 'bold',
  textTransform: 'none',
  boxShadow: '0 2px 8px rgba(208, 188, 255, 0.25)',
  padding: theme.spacing(0.5, 2),
}));

const PostCard = styled(Card)(({ theme }) => ({
  marginBottom: 10,
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  background: '#1A1A1A',
  cursor: 'pointer'
}));

// UpdateCreatePostCard style
const CreatePostCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  background: 'linear-gradient(145deg, rgba(30, 30, 30, 0.8) 0%, rgba(20, 20, 20, 0.9) 100%)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
  borderRadius: '16px',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  marginBottom: theme.spacing(3),
  '&:hover': {
    boxShadow: '0 6px 25px rgba(0, 0, 0, 0.3)',
    transform: 'translateY(-2px)'
  }
}));

// Update PostInput style
const PostInput = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    background: 'rgba(0, 0, 0, 0.2)',
    backdropFilter: 'blur(5px)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    fontSize: '0.95rem',
    padding: theme.spacing(1, 1.5),
    color: theme.palette.text.primary,
    transition: 'all 0.3s ease',
    '&:hover': {
      borderColor: 'rgba(208, 188, 255, 0.3)',
      background: 'rgba(0, 0, 0, 0.25)',
    },
    '&.Mui-focused': {
      borderColor: 'rgba(208, 188, 255, 0.5)',
      boxShadow: '0 0 0 2px rgba(208, 188, 255, 0.1)'
    }
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none'
  },
  width: '100%'
}));

// Update PostActions style
const PostActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(1.5, 0, 0),
  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
  marginTop: theme.spacing(1.5)
}));

const MediaPreviewContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  marginTop: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  backgroundColor: 'rgba(0, 0, 0, 0.2)',
}));

const RemoveMediaButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: 8,
  right: 8,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  color: theme.palette.common.white,
  padding: theme.spacing(0.5),
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
}));

const MarkdownContent = styled(Box)(({ theme }) => ({
  '& p': {
    margin: theme.spacing(1, 0),
    lineHeight: 1.6,
  },
  '& h1, & h2, & h3, & h4, & h5, & h6': {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
    fontWeight: 600,
  },
  '& a': {
    color: theme.palette.primary.main,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  '& ul, & ol': {
    marginLeft: theme.spacing(2),
  },
  '& code': {
    fontFamily: 'monospace',
    backgroundColor: theme.palette.action.hover,
    padding: theme.spacing(0.3, 0.6),
    borderRadius: 3,
  },
  '& pre': {
    backgroundColor: theme.palette.grey[900],
    color: theme.palette.common.white,
    padding: theme.spacing(1.5),
    borderRadius: theme.shape.borderRadius,
    overflowX: 'auto',
    '& code': {
      backgroundColor: 'transparent',
      padding: 0,
    },
  },
}));

// Update PublishButton style
const PublishButton = styled(Button)(({ theme }) => ({
  borderRadius: '24px',
  textTransform: 'none',
  fontSize: '0.875rem',
  fontWeight: 600,
  boxShadow: '0 2px 8px rgba(124, 77, 255, 0.25)',
  padding: theme.spacing(0.6, 2),
  background: 'linear-gradient(90deg, #7c4dff 0%, #8f6aff 100%)',
  '&:hover': {
    background: 'linear-gradient(90deg, #8f6aff 0%, #a485ff 100%)',
    boxShadow: '0 4px 12px rgba(124, 77, 255, 0.35)',
  },
  '&.Mui-disabled': {
    background: 'rgba(255, 255, 255, 0.05)',
    color: 'rgba(255, 255, 255, 0.3)'
  }
}));

// Определение компонента значка верификации
const VerificationBadge = ({ status, size }) => {
  if (!status) return null;
  
  const getColorAndTitle = (status) => {
    // Проверяем, является ли status числом или строкой 'verified'
    if (status === 'verified') {
      return { color: '#D0BCFF', title: 'Верифицирован' };
    }
    
    // Обработка числовых статусов
    switch(Number(status)) {
      case 1:
        return { color: '#9e9e9e', title: 'Верифицирован' };
      case 2:
        return { color: '#d67270', title: 'Официальный аккаунт' };
      case 3:
        return { color: '#b39ddb', title: 'VIP аккаунт' };
      case 4:
        return { color: '#ff9800', title: 'Модератор' };
      case 5:
        return { color: '#4caf50', title: 'Поддержка' };
      default:
        return { color: '#D0BCFF', title: 'Верифицирован' };
    }
  };
  
  const { color, title } = getColorAndTitle(status);
  
  return (
    <Tooltip title={title} placement="top">
      <CheckCircleIcon 
        sx={{ 
          fontSize: size === 'small' ? 23 : 20,
          ml: 0.5,
          color
        }} 
      />
    </Tooltip>
  );
};

// Create Post Component
const CreatePost = ({ onPostCreated }) => {
  const { user } = useContext(AuthContext);
  const { themeSettings } = useContext(ThemeSettingsContext);
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState('');
  const [mediaPreview, setMediaPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const fileInputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Music selection state
  const [musicSelectOpen, setMusicSelectOpen] = useState(false);
  const [selectedTracks, setSelectedTracks] = useState([]);

  // Обработчики для drag-and-drop
  const dragCounter = useRef(0);
  
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (dragCounter.current === 1) {
      setIsDragging(true);
    }
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Не обновляем состояние здесь, чтобы избежать повторного рендеринга
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFiles(files);
    }
  };
  
  // Общая функция для обработки файлов
  const processFiles = (files) => {
    if (files.length > 0) {
      // Reset previous files and previews
      setSelectedFiles([]);
      setPreviewUrls([]);
      setMediaFile(null);
      setMediaPreview('');
      
      // Store all selected files
      setSelectedFiles(files);
      
      // Check if it's a single file - keep compatibility with old code
      if (files.length === 1) {
        setMediaFile(files[0]);
        setMediaType(files[0].type.startsWith('image/') ? 'image' : 'video');
        
        // Create a preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setMediaPreview(reader.result);
        };
        reader.readAsDataURL(files[0]);
      }
      
      // Create previews for all files
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrls(prev => [...prev, reader.result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
  };
  
  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreview('');
    setMediaType('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Handle music selection from dialog
  const handleMusicSelect = (tracks) => {
    setSelectedTracks(tracks);
  };
  
  // Handle removing a music track
  const handleRemoveTrack = (trackId) => {
    setSelectedTracks(prev => prev.filter(track => track.id !== trackId));
  };
  
  const handleSubmit = async () => {
    // Check if we have either content or files or music
    if (!content.trim() && selectedFiles.length === 0 && selectedTracks.length === 0) return;
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('content', content.trim());
      
      // Handle multiple images if available
      if (selectedFiles.length > 1) {
        console.log(`Adding ${selectedFiles.length} images to form data`);
        selectedFiles.forEach((file, index) => {
          formData.append(`images[${index}]`, file);
        });
      } 
      // Otherwise fall back to single file method
      else if (selectedFiles.length === 1) {
        console.log('Adding single file to form data');
        if (mediaType) {
          formData.append(mediaType, selectedFiles[0]);
        } else {
          // Auto-detect type
          const fileType = selectedFiles[0].type.startsWith('image/') ? 'image' : 'video';
          formData.append(fileType, selectedFiles[0]);
        }
      }
      
      // Add music tracks if selected
      if (selectedTracks.length > 0) {
        console.log(`Adding ${selectedTracks.length} music tracks to post`);
        // Convert tracks to JSON string and append to form data
        const trackData = selectedTracks.map(track => ({
          id: track.id,
          title: track.title,
          artist: track.artist,
          duration: track.duration,
          file_path: track.file_path,
          cover_path: track.cover_path
        }));
        formData.append('music', JSON.stringify(trackData));
      }
      
      // Debug form data
      console.log('Creating post with form data:');
      for (const pair of Array.from(formData.entries())) {
        if (pair[1] instanceof File) {
          console.log(`${pair[0]}: File ${pair[1].name} (${pair[1].size} bytes)`);
        } else {
          console.log(`${pair[0]}: ${pair[1]}`);
        }
      }
      
      const response = await PostService.createPost(formData);
      console.log('Post created:', response);
      
      if (response && response.success) {
        // Reset form
        setContent('');
        setMediaFile(null);
        setMediaPreview('');
        setMediaType('');
        setSelectedFiles([]);
        setPreviewUrls([]);
        setSelectedTracks([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // Update the feed with the new post
        if (onPostCreated && response.post) {
          onPostCreated(response.post);
        }
        
        // Show success message
        console.log('Post created successfully');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      console.error('Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!user) return null;
  
  return (
    <CreatePostCard 
      sx={{ 
        background: `linear-gradient(145deg, rgba(30, 30, 30, 0.9) 0%, rgba(20, 20, 20, 0.95) 100%)`,
        position: 'relative',
        borderRadius: '16px',
        border: isDragging ? '2px dashed #D0BCFF' : 'none',
        p: isDragging ? 3 : 2,
        mb: 1
      }}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <Box 
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            backgroundColor: 'rgba(26, 26, 26, 0.8)',
            borderRadius: '16px',
            zIndex: 10,
            opacity: isDragging ? 1 : 0,
            transition: 'opacity 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
          }}
        >
          <ImageOutlinedIcon sx={{ fontSize: 40, color: '#D0BCFF', mb: 1, filter: 'drop-shadow(0 0 8px rgba(208, 188, 255, 0.6))' }} />
          <Typography variant="body1" color="primary" sx={{ fontWeight: 'medium', textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
            Перетащите файлы сюда
          </Typography>
        </Box>
      )}

      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
        <Avatar 
          src={user.photo ? `/static/uploads/avatar/${user.id}/${user.photo}` : undefined}
          alt={user.name}
          sx={{ 
            mr: 1.5, 
            width: 40, 
            height: 40, 
            border: '2px solid rgba(208, 188, 255, 0.6)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: '0 3px 10px rgba(0, 0, 0, 0.3)'
            }
          }}
        />
        <PostInput 
          placeholder="Что у вас нового?"
          multiline
          minRows={1}
          maxRows={isFocused ? 6 : 1}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          sx={{
            width: '100%',
            '& .MuiInputBase-root': {
              transition: 'all 0.3s ease',
              minHeight: '40px !important',
              maxHeight: isFocused ? '200px' : '40px',
              fontSize: '0.95rem'
            },
            '& textarea': {
              lineHeight: '1.4 !important',
              paddingTop: '8px !important',
              paddingBottom: '8px !important',
            }
          }}
        />
      </Box>
      
      {/* Preview box - support both old and new methods */}
      {mediaPreview ? (
        <Box sx={{ position: 'relative', mt: 1 }}>
          <img
            src={mediaPreview}
            alt="Preview"
            style={{
              width: '100%',
              maxHeight: '300px',
              objectFit: 'contain',
              borderRadius: '8px'
            }}
          />
          <IconButton
            sx={{
              position: 'absolute',
              top: 5,
              right: 5,
              bgcolor: 'rgba(0,0,0,0.5)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
            }}
            onClick={() => {
              setMediaPreview('');
              setMediaFile(null);
              setMediaType('');
              setSelectedFiles([]);
              setPreviewUrls([]);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
          >
            <CloseIcon sx={{ color: 'white' }} />
          </IconButton>
        </Box>
      ) : previewUrls.length > 1 ? (
        <Box sx={{ position: 'relative', mt: 2 }}>
          <ImageList 
            sx={{ width: '100%', maxHeight: 300, borderRadius: '8px', overflow: 'hidden' }}
            cols={previewUrls.length > 3 ? 3 : previewUrls.length}
            rowHeight={previewUrls.length > 3 ? 120 : 200}
          >
            {previewUrls.map((preview, index) => (
              <ImageListItem key={index}>
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </ImageListItem>
            ))}
          </ImageList>
          <IconButton
            sx={{
              position: 'absolute',
              top: 5,
              right: 5,
              bgcolor: 'rgba(0,0,0,0.5)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
            }}
            onClick={() => {
              setPreviewUrls([]);
              setSelectedFiles([]);
              setMediaPreview('');
              setMediaFile(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
          >
            <CloseIcon sx={{ color: 'white' }} />
          </IconButton>
        </Box>
      ) : null}
      
      {/* Display selected music tracks */}
      {selectedTracks.length > 0 && (
        <Box sx={{ mt: 2, mb: 1 }}>
          {selectedTracks.map(track => (
            <Box 
              key={track.id}
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                py: 1, 
                px: 2, 
                mb: 1, 
                borderRadius: '8px',
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <Box 
                sx={{ 
                  width: 36, 
                  height: 36, 
                  borderRadius: '4px', 
                  overflow: 'hidden',
                  mr: 1.5,
                  position: 'relative',
                  bgcolor: 'rgba(0, 0, 0, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <img 
                  src={track.cover_path.startsWith('/static/') ? track.cover_path : `/static/uploads/music/covers/${track.cover_path}`} 
                  alt={track.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.src = '/uploads/system/album_placeholder.jpg';
                  }}
                />
                <MusicNoteIcon 
                  sx={{ 
                    position: 'absolute', 
                    fontSize: 16, 
                    color: 'rgba(255, 255, 255, 0.7)'
                  }} 
                />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" noWrap>
                  {track.title}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {track.artist}
                </Typography>
              </Box>
              <IconButton 
                size="small" 
                onClick={() => handleRemoveTrack(track.id)}
                sx={{ ml: 1 }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
      
      <PostActions>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleMediaChange}
            multiple
            style={{ display: 'none' }}
            id="media-upload-profile"
          />
          <label htmlFor="media-upload-profile">
            <Button
              component="span"
              startIcon={<ImageOutlinedIcon />}
              sx={{
                color: selectedFiles.length > 0 ? 'primary.main' : 'text.secondary',
                borderRadius: '24px',
                textTransform: 'none',
                fontSize: '0.875rem',
                fontWeight: 500,
                border: selectedFiles.length > 0 
                  ? '1px solid rgba(208, 188, 255, 0.5)'
                  : '1px solid rgba(255, 255, 255, 0.12)',
                padding: '6px 12px',
                '&:hover': {
                  backgroundColor: 'rgba(208, 188, 255, 0.08)',
                  borderColor: 'rgba(208, 188, 255, 0.4)'
                }
              }}
              size="small"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
            >
              {selectedFiles.length ? `Файлы (${selectedFiles.length})` : 'Фото/видео'}
            </Button>
          </label>
          
          {/* Music selection button */}
          <Button
            onClick={() => setMusicSelectOpen(true)}
            startIcon={<MusicNoteIcon />}
            sx={{
              color: selectedTracks.length > 0 ? 'primary.main' : 'text.secondary',
              borderRadius: '24px',
              textTransform: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
              padding: '6px 12px',
              border: selectedTracks.length > 0 
                ? '1px solid rgba(208, 188, 255, 0.5)' 
                : '1px solid rgba(255, 255, 255, 0.12)',
              '&:hover': {
                backgroundColor: 'rgba(208, 188, 255, 0.08)',
                borderColor: 'rgba(208, 188, 255, 0.4)'
              }
            }}
            size="small"
          >
            {selectedTracks.length ? `Музыка (${selectedTracks.length})` : 'Музыка'}
          </Button>
        </Box>
        
        <PublishButton 
          variant="contained" 
          onClick={handleSubmit}
          disabled={isSubmitting || (!content.trim() && !mediaFile && selectedFiles.length === 0 && selectedTracks.length === 0)}
          endIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
        >
          Опубликовать
        </PublishButton>
      </PostActions>
      
      {/* Music selection dialog */}
      <MusicSelectDialog
        open={musicSelectOpen}
        onClose={() => setMusicSelectOpen(false)}
        onSelectTracks={handleMusicSelect}
        maxTracks={3}
      />
    </CreatePostCard>
  );
};

// Определение TabPanel
const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <TabContentLoader tabIndex={index}>
          <Box sx={{ pt: 0 }}>
            {children}
          </Box>
        </TabContentLoader>
      )}
    </div>
  );
};

// ProfilePage Component
const ProfilePage = () => {
  const { username } = useParams();
  const { user: currentUser } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [ownedUsernames, setOwnedUsernames] = useState([]);
  const [posts, setPosts] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [postsCount, setPostsCount] = useState(0);
  const [followers, setFollowers] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [loadingFollowers, setLoadingFollowers] = useState(true);
  const [loadingFollowing, setLoadingFollowing] = useState(true);
  const [socials, setSocials] = useState([]);
  const [page, setPage] = useState(1);
  const [photoPage, setPhotoPage] = useState(1);
  const [videoPage, setVideoPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [hasMorePhotos, setHasMorePhotos] = useState(true);
  const [hasMoreVideos, setHasMoreVideos] = useState(true);
  const [loadingMorePosts, setLoadingMorePosts] = useState(false);
  const [loadingMorePhotos, setLoadingMorePhotos] = useState(false);
  const [loadingMoreVideos, setLoadingMoreVideos] = useState(false);
  const [lightboxIsOpen, setLightboxIsOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const navigate = useNavigate();
  const { themeSettings } = useContext(ThemeSettingsContext);
  const [notifications, setNotifications] = useState([]);
  const [notificationMenuAnchor, setNotificationMenuAnchor] = useState(null);
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [statsExpanded, setStatsExpanded] = useState(false);
  const [totalLikes, setTotalLikes] = useState(0);
  // Добавляем состояния для онлайн-статуса
  const [isOnline, setIsOnline] = useState(false);
  const [lastActive, setLastActive] = useState(null);
  
  // Функция для открытия лайтбокса
  const openLightbox = (imageUrl) => {
    console.log("Opening lightbox for image:", imageUrl);
    if (typeof imageUrl === 'string') {
      setCurrentImage(imageUrl);
      setLightboxIsOpen(true);
    } else {
      console.error("Invalid image URL provided to lightbox:", imageUrl);
    }
  };
  
  // Функция для закрытия лайтбокса
  const closeLightbox = () => {
    setLightboxIsOpen(false);
  };
  
  // Функция отображения уведомлений
  const showNotification = (severity, message) => {
    setSnackbar({
      open: true,
      severity,
      message
    });
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Обновлено для работы с новым переключателем
  const handleTabClick = (index) => {
    setTabValue(index);
  };
  
  const handleFollow = async () => {
    try {
      const response = await axios.post('/api/profile/follow', {
        followed_id: user.id
      });
      
      if (response.data.success) {
        setFollowing(response.data.is_following);
        setFollowersCount(prev => response.data.is_following ? prev + 1 : prev - 1);
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    }
  };
  
  const handlePostCreated = (newPost) => {
    if (newPost && newPost.id) {
      // Проверяем, принадлежит ли пост текущему пользователю
      if (newPost.user_id === user.id || 
          (newPost.user && newPost.user.id === user.id)) {
        
        // Проверяем, есть ли уже этот пост в списке (избегаем дублирования)
        const existingPostIndex = posts.findIndex(p => p && p.id === newPost.id);
        
        if (existingPostIndex !== -1) {
          // Если пост уже существует, обновляем его
          setPosts(current => {
            const newPosts = [...current];
            newPosts[existingPostIndex] = newPost;
            return newPosts;
          });
        } else {
          // Иначе добавляем новый пост в начало списка
          setPosts(current => [newPost, ...current.filter(p => p && p.id)]);
          
          // Обновляем счетчик постов
          setPostsCount(prev => prev + 1);
        }
      }
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      console.log('Deleting post/repost with ID:', postId);
      let response;
      
      // Проверяем, является ли это репостом (ID с префиксом repost-)
      const isRepost = postId.toString().startsWith('repost-');
      
      if (isRepost) {
        // Удаляем префикс repost- для получения фактического ID репоста
        const repostId = postId.substring(7);
        console.log('Deleting repost with ID:', repostId);
        response = await axios.delete(`/api/reposts/${repostId}`);
      } else {
        console.log('Deleting regular post with ID:', postId);
        response = await axios.delete(`/api/posts/${postId}`);
      }
      
      if (response.data && response.data.success) {
        // Обновляем состояние после успешного удаления поста или репоста
        setPosts(prevPosts => prevPosts.filter(post => {
          if (isRepost) {
            // Для репостов проверяем id с префиксом repost-
            return `repost-${post.id}` !== postId;
          }
          // Для обычных постов просто сравниваем id
          return post.id.toString() !== postId.toString();
        }));
        
        // Показываем уведомление об успехе
        showNotification('success', isRepost ? 'Репост успешно удален' : 'Пост успешно удален');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      showNotification('error', 'Не удалось удалить пост. Попробуйте позже');
    }
  };
  
  // Функция загрузки постов по скроллу - определяем до использования в useEffect
  const loadMorePosts = async () => {
    if (loadingPosts || !hasMorePosts) return;
    
    try {
      setLoadingPosts(true);
      
      // Ensure posts is an array before accessing its elements
      const currentPosts = Array.isArray(posts) ? posts : [];
      const lastPost = currentPosts.length > 0 ? currentPosts[currentPosts.length - 1] : null;
      
      const response = await axios.get(`/api/profile/${username}/posts`, {
        params: {
          cursor: lastPost ? lastPost.id : null,
          limit: 10
        }
      });
      
      if (response.data.success && Array.isArray(response.data.posts)) {
        const newPosts = response.data.posts;
        setPosts(prev => {
          // Make sure prev is an array
          const prevArray = Array.isArray(prev) ? prev : [];
          return [...prevArray, ...newPosts];
        });
        setHasMorePosts(newPosts.length === 10);
      } else {
        setHasMorePosts(false);
      }
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  };
  
  const loadMorePhotos = async () => {
    if (loadingPhotos || !hasMorePhotos) return;
    
    try {
      setLoadingPhotos(true);
      
      // Ensure photos is an array before accessing its elements
      const currentPhotos = Array.isArray(photos) ? photos : [];
      const lastPhoto = currentPhotos.length > 0 ? currentPhotos[currentPhotos.length - 1] : null;
      
      const response = await axios.get(`/api/profile/${username}/photos`, {
        params: {
          cursor: lastPhoto ? lastPhoto.id : null,
          limit: 12
        }
      });
      
      if (response.data.success && Array.isArray(response.data.photos)) {
        const newPhotos = response.data.photos;
        setPhotos(prev => {
          // Make sure prev is an array
          const prevArray = Array.isArray(prev) ? prev : [];
          return [...prevArray, ...newPhotos];
        });
        setHasMorePhotos(newPhotos.length === 12);
      } else {
        setHasMorePhotos(false);
      }
    } catch (error) {
      console.error('Error loading more photos:', error);
    } finally {
      setLoadingPhotos(false);
    }
  };
  
  const loadMoreVideos = async () => {
    if (loadingVideos || !hasMoreVideos) return;
    
    try {
      setLoadingVideos(true);
      
      // Ensure videos is an array before accessing its elements
      const currentVideos = Array.isArray(videos) ? videos : [];
      const lastVideo = currentVideos.length > 0 ? currentVideos[currentVideos.length - 1] : null;
      
      const response = await axios.get(`/api/profile/${username}/videos`, {
        params: {
          cursor: lastVideo ? lastVideo.id : null,
          limit: 8
        }
      });
      
      if (response.data.success && Array.isArray(response.data.videos)) {
        const newVideos = response.data.videos;
        setVideos(prev => {
          // Make sure prev is an array
          const prevArray = Array.isArray(prev) ? prev : [];
          return [...prevArray, ...newVideos];
        });
        setHasMoreVideos(newVideos.length === 8);
      } else {
        setHasMoreVideos(false);
      }
    } catch (error) {
      console.error('Error loading more videos:', error);
    } finally {
      setLoadingVideos(false);
    }
  };
  
  // Load user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        console.log(`Fetching profile for username: ${username}`);
        
        const response = await axios.get(`/api/profile/${username}`);
        console.log("Profile API response:", response.data);
        
        // Debug achievement data
        console.log("Profile achievement data:", {
          rootAchievement: response.data.achievement_data,
          userAchievement: response.data.user?.achievement
        });
        
        // Check if we received a user object directly
        if (response.data.user) {
          // Copy verification from the root to the user object if not present
          if (response.data.user.verification_status === undefined && response.data.verification) {
            response.data.user.verification_status = response.data.verification.status || null;
          }
          
          // Copy achievement data from the root to the user object
          // The API returns achievement data at the root level, not in the user object
          if (response.data.achievement) {
            response.data.user.achievement = response.data.achievement;
            console.log('Copied achievement data from root to user object:', response.data.achievement);
          }
          
          setUser(response.data.user);
          
          // Set total likes directly from API
          if (response.data.user.total_likes !== undefined) {
            setTotalLikes(response.data.user.total_likes);
          }
          
          if (response.data.user.posts) {
            // Ensure posts is an array
            const postsData = Array.isArray(response.data.user.posts) ? response.data.user.posts : [];
            setPosts(postsData);
            setHasMorePosts(postsData.length >= 10);
          } else {
            setPosts([]);
          }
          
          if (response.data.user.photos) {
            // Ensure photos is an array
            const photosData = Array.isArray(response.data.user.photos) ? response.data.user.photos : [];
            setPhotos(photosData);
            setHasMorePhotos(photosData.length >= 12);
          } else {
            setPhotos([]);
          }
          
          if (response.data.user.videos) {
            // Ensure videos is an array
            const videosData = Array.isArray(response.data.user.videos) ? response.data.user.videos : [];
            setVideos(videosData);
            setHasMoreVideos(videosData.length >= 8);
          } else {
            setVideos([]);
          }
          
          // Set followers and following counts
          if (response.data.user.followers_count !== undefined) {
            setFollowersCount(response.data.user.followers_count);
          }
          
          if (response.data.user.following_count !== undefined) {
            setFollowingCount(response.data.user.following_count);
          }
          
          // Handle is_following from different places in the API response
          if (response.data.user.is_following !== undefined) {
            setFollowing(response.data.user.is_following);
          } else if (response.data.is_following !== undefined) {
            setFollowing(response.data.is_following);
          }
          
          if (response.data.user.posts_count !== undefined) {
            setPostsCount(response.data.user.posts_count);
          } else if (response.data.posts_count !== undefined) {
            setPostsCount(response.data.posts_count);
          }
          
          // Set socials if available
          if (response.data.socials) {
            setSocials(response.data.socials);
          }
          
          // Fetch owned usernames for any user
          try {
            const usernamesResponse = await axios.get(`/api/username/purchased/${response.data.user.id}`);
            if (usernamesResponse.data.success) {
              const otherUsernames = usernamesResponse.data.usernames
                .filter(item => !item.is_active && item.username !== response.data.user.username)
                .map(item => item.username);
              
              setOwnedUsernames(otherUsernames);
            }
          } catch (error) {
            console.error('Error fetching owned usernames:', error);
            setOwnedUsernames([]);
          }
        } else {
          console.error('User data not found in response', response.data);
          setUser(null); // Explicitly set user to null if not found
        }
      } catch (error) {
        console.error('Error fetching profile', error);
        if (error.response && error.response.status === 404) {
          // User not found - set user to null
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };
    
    // Запускаем загрузку профиля
    fetchUserProfile();
  }, [username, setLoading, setUser, setPosts, setHasMorePosts, setPhotos, setHasMorePhotos, setVideos, setHasMoreVideos, setFollowersCount, setFollowingCount, setFollowing, setPostsCount, setSocials, setTotalLikes]);
  
  // Load user posts
  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!user) return;
      
      try {
        setLoadingPosts(true);
        const profileUsername = username || (user && user.username);
        if (!profileUsername) return;
        
        // Сбрасываем состояние пагинации при первой загрузке
        setPage(1);
        
        const response = await axios.get(`/api/profile/${profileUsername}/posts?page=1`);
        setPosts(response.data.posts);
        setHasMorePosts(response.data.has_next);
      } catch (error) {
        console.error('Error fetching user posts:', error);
      } finally {
        setLoadingPosts(false);
      }
    };
    
    if (tabValue === 0) {
      fetchUserPosts();
    }
  }, [username, user, tabValue]);
  
  // Загрузка фото пользователя
  useEffect(() => {
    const fetchUserPhotos = async () => {
      if (!user) return;
      
      try {
        setLoadingPhotos(true);
        const profileUsername = username || (user && user.username);
        if (!profileUsername) return;
        
        // Сбрасываем состояние пагинации
        setPhotoPage(1);
        
        const response = await axios.get(`/api/profile/${profileUsername}/photos?page=1`);
        
        if (response.data.media) {
          setPhotos(response.data.media);
          setHasMorePhotos(response.data.has_next);
        }
      } catch (error) {
        console.error('Error fetching user photos:', error);
      } finally {
        setLoadingPhotos(false);
      }
    };
    
    if (tabValue === 1) {
      fetchUserPhotos();
    }
  }, [username, user, tabValue]);
  
  // Загрузка видео пользователя
  useEffect(() => {
    const fetchUserVideos = async () => {
      if (!user) return;
      
      try {
        setLoadingVideos(true);
        const profileUsername = username || (user && user.username);
        if (!profileUsername) return;
        
        // Сбрасываем состояние пагинации
        setVideoPage(1);
        
        const response = await axios.get(`/api/profile/${profileUsername}/videos?page=1`);
        
        if (response.data.media) {
          setVideos(response.data.media);
          setHasMoreVideos(response.data.has_next);
        }
      } catch (error) {
        console.error('Error fetching user videos:', error);
      } finally {
        setLoadingVideos(false);
      }
    };
    
    if (tabValue === 2) {
      fetchUserVideos();
    }
  }, [username, user, tabValue]);

  // Obtain follower and following lists
  useEffect(() => {
    // Always fetch followers and following when user is loaded
    if (user && user.id) {
      setLoadingFollowers(true);
      setLoadingFollowing(true);
      
      console.log(`Загрузка подписчиков для пользователя ${user.id}`);
      // Загрузка подписчиков
      axios.get(`/api/profile/${user.id}/followers`)
        .then(response => {
          console.log('Ответ API подписчиков:', response.data);
          if (response.data && response.data.followers) {
            // Ensure we only set valid data
            const followersData = Array.isArray(response.data.followers) 
              ? response.data.followers.filter(f => f && typeof f === 'object') 
              : [];
            console.log(`Получено ${followersData.length} подписчиков`);
            setFollowers(followersData);
          } else {
            // If no valid data, set empty array
            console.warn('Нет данных о подписчиках в ответе API');
            setFollowers([]);
          }
        })
        .catch(error => {
          console.error('Ошибка загрузки подписчиков:', error);
          setFollowers([]); // Set empty array on error
        })
        .finally(() => {
          setLoadingFollowers(false);
        });
      
      console.log(`Загрузка подписок для пользователя ${user.id}`);
      // Загрузка подписок
      axios.get(`/api/profile/${user.id}/following`)
        .then(response => {
          console.log('Ответ API подписок:', response.data);
          if (response.data && response.data.following) {
            // Ensure we only set valid data
            const followingData = Array.isArray(response.data.following) 
              ? response.data.following.filter(f => f && typeof f === 'object') 
              : [];
            console.log(`Получено ${followingData.length} подписок`);
            setFollowingList(followingData);
          } else {
            // If no valid data, set empty array
            console.warn('Нет данных о подписках в ответе API');
            setFollowingList([]);
          }
        })
        .catch(error => {
          console.error('Ошибка загрузки подписок:', error);
          setFollowingList([]); // Set empty array on error
        })
        .finally(() => {
          setLoadingFollowing(false);
        });
    }
  }, [user]);

  // Добавляем обработчик скролла для бесконечной загрузки
  useEffect(() => {
    const handleScroll = () => {
      // Проверяем, что мы на вкладке постов
      if (tabValue !== 0) return;
      
      // Проверяем, находимся ли мы близко к концу страницы
      if (
        window.innerHeight + document.documentElement.scrollTop + 200 >= 
        document.documentElement.offsetHeight
      ) {
        loadMorePosts();
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [tabValue, loadMorePosts]);

  // Добавляем обработчик скролла для бесконечной загрузки фото и видео
  useEffect(() => {
    const handleScroll = () => {
      // Проверяем, что мы на соответствующей вкладке
      if (tabValue === 1) { // Фото
        if (
          window.innerHeight + document.documentElement.scrollTop + 200 >= 
          document.documentElement.offsetHeight
        ) {
          loadMorePhotos();
        }
      } else if (tabValue === 2) { // Видео
        if (
          window.innerHeight + document.documentElement.scrollTop + 200 >= 
          document.documentElement.offsetHeight
        ) {
          loadMoreVideos();
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [tabValue, loadMorePhotos, loadMoreVideos]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('/api/notifications');
        setNotifications(response.data.notifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
    // Set up polling for new notifications
    const interval = setInterval(fetchNotifications, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = async (notification) => {
    try {
      await axios.post(`/api/notifications/${notification.id}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
      );
      if (notification.link) {
        navigate(notification.link);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Добавляем эффект для подсчета общего количества лайков
  useEffect(() => {
    if (posts && posts.length > 0) {
      // Count all likes on user's posts
      let likesCount = 0;
      posts.forEach(post => {
        if (post && post.likes_count) {
          likesCount += parseInt(post.likes_count) || 0;
        }
      });
      
      // Query the backend for more accurate likes count
      const fetchTotalLikes = async () => {
        try {
          if (user && user.id) {
            const response = await axios.get(`/api/profile/${user.id}/stats`);
            if (response.data && response.data.total_likes !== undefined) {
              setTotalLikes(response.data.total_likes);
            } else {
              setTotalLikes(likesCount);
            }
          }
        } catch (error) {
          console.error('Error fetching total likes:', error);
          setTotalLikes(likesCount);
        }
      };
      
      fetchTotalLikes();
    }
  }, [posts, user]);

  // Функция для получения онлайн-статуса пользователя
  const fetchOnlineStatus = async () => {
    try {
      if (!username) return;
      
      const response = await axios.get(`/api/profile/${username}/online_status`);
      
      if (response.data.success) {
        setIsOnline(response.data.is_online);
        setLastActive(response.data.last_active);
      }
    } catch (error) {
      console.error('Error fetching online status:', error);
    }
  };
  
  // useEffect для получения и обновления онлайн-статуса
  useEffect(() => {
    if (username) {
      fetchOnlineStatus();
      
      // Обновляем статус каждые 30 секунд
      const interval = setInterval(fetchOnlineStatus, 30000);
      
      return () => clearInterval(interval);
    }
  }, [username]);

  // Debug user state after it's set
  useEffect(() => {
    if (user) {
      console.log('User state after setting:', {
        name: user.name,
        achievement: user.achievement,
        verification_status: user.verification_status
      });
    }
  }, [user]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!user) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mt: 5 }}>
          <Typography variant="h5">Пользователь не найден</Typography>
        <Button 
            component={Link} 
            to="/" 
          variant="contained" 
          color="primary" 
            sx={{ mt: 2, borderRadius: 20, textTransform: 'none' }}
        >
          Вернуться на главную
        </Button>
        </Box>
      </Container>
    );
  }
  
  const isCurrentUser = currentUser && currentUser.username === user.username;

  // Компонент для отображения фотографий
  const PhotosGrid = () => {
    return (
      <ContentLoader loading={loadingPhotos} skeletonCount={1} height="300px">
        {photos.length > 0 ? (
          <Box sx={{ mt: 0.5 }}>
            <Grid container spacing={0.5}>
              {photos.map((photo, index) => {
                // Skip invalid photos
                if (!photo || typeof photo !== 'object' || !photo.url) {
                  return null;
                }
                
                // Get safe URL
                const imageUrl = photo.url || '';
                
                // Render photo card
                return (
                  <Grid item xs={12} sm={6} md={4} key={`photo-${index}`}>
                    <Box
                      sx={{
                        position: 'relative',
                        width: '100%',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        paddingTop: '100%', // 1:1 Aspect ratio
                        backgroundColor: 'rgba(0,0,0,0.05)',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 12px 20px rgba(0,0,0,0.15)',
                        },
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onClick={() => openLightbox(imageUrl)}
                    >
                      <Box
                        component="img"
                        src={imageUrl}
                        alt={photo.content || `Фото ${index + 1}`}
                        onError={(e) => {
                          // If image fails to load, show placeholder
                          console.error(`Failed to load image: ${imageUrl}`);
                          e.currentTarget.src = '/static/uploads/system/image_placeholder.jpg';
                        }}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
            
            {loadingMorePhotos && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 0.5 }}>
                <CircularProgress size={30} />
              </Box>
            )}
          </Box>
        ) : (
          <Box sx={{ 
            textAlign: 'center', 
            py: 0.5
          }}>
            <Typography color="text.secondary">
              Нет фотографий для отображения
            </Typography>
          </Box>
        )}
      </ContentLoader>
    );
  };
  
  // Компонент для отображения видео
  const VideosGrid = () => {
    return (
      <ContentLoader loading={loadingVideos} skeletonCount={1} height="300px">
        {videos.length > 0 ? (
          <Box sx={{ mt: 0.5 }}>
            <Grid container spacing={0.5}>
              {videos.map((video, index) => (
                <Grid item xs={12} sm={6} md={4} key={`video-${index}`}>
                  <Box sx={{ 
                    borderRadius: '10px', 
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                    height: '100%',
                    bgcolor: 'background.paper',
                    position: 'relative'
                  }}>
                    <video 
                      src={video.url} 
                      controls
                      style={{ 
                        width: '100%',
                        borderRadius: '10px 10px 0 0',
                        backgroundColor: '#111',
                      }} 
                      onError={(e) => {
                        console.error("Failed to load video");
                        const videoId = video.id || video.url.split('/').pop().split('.')[0];
                        if (videoId) {
                          e.currentTarget.src = `/static/uploads/post/${videoId}/${video.url.split('/').pop()}`;
                        }
                      }}
                    />
                    
                    {video.content && (
                      <Box sx={{ p: 0.5, backgroundColor: 'rgba(26, 26, 26, 0.9)' }}>
                        <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                          {video.content}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>
            
            {loadingMoreVideos && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 0.5 }}>
                <CircularProgress size={30} />
              </Box>
            )}
          </Box>
        ) : (
          <Box sx={{ 
            textAlign: 'center', 
            py: 0.5
          }}>
            <Typography color="text.secondary">
              Нет видео для отображения
            </Typography>
          </Box>
        )}
      </ContentLoader>
    );
  };

  // PostsTab component - отвечает за отображение постов в профиле
  const PostsTab = () => {
    return (
      <ContentLoader loading={loadingPosts} skeletonCount={3} height="120px">
        {posts.length > 0 ? (
          <Box sx={{ mt: 0.5 }}>
            {posts.map(post => (
              post.is_repost ? (
                <RepostItem key={post.id} post={post} onDelete={handleDeletePost} />
              ) : (
                <Post key={post.id} post={post} onDelete={handleDeletePost} showActions />
              )
            ))}
            
            {/* Load more posts button with smooth transition */}
            <Box sx={{ textAlign: 'center', mt: 0.5, mb: 0.5 }}>
              {hasMorePosts ? (
                <Button 
                  variant="outlined" 
                  onClick={loadMorePosts}
                  disabled={loadingMorePosts}
                  startIcon={loadingMorePosts ? <CircularProgress size={16} /> : null}
                  sx={{ 
                    py: 1,
                    px: 3, 
                    borderRadius: 2,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  {loadingMorePosts ? 'Загрузка...' : 'Загрузить еще'}
                </Button>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Больше постов нет
                </Typography>
              )}
            </Box>
          </Box>
        ) : (
          <Box sx={{ 
            textAlign: 'center', 
            py: 6,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '16px',
            border: '1px dashed rgba(255, 255, 255, 0.1)',
            padding: 4,
            mt: 2
          }}>
            <Box 
              sx={{ 
                width: 80, 
                height: 80, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                borderRadius: '50%',
                backgroundColor: 'rgba(208, 188, 255, 0.1)',
                mb: 2
              }}
            >
              <ArticleOutlinedIcon sx={{ fontSize: 40, color: 'rgba(208, 188, 255, 0.6)' }} />
            </Box>
            <Typography variant="h6" color="text.primary" sx={{ fontWeight: 'medium' }}>
              Нет публикаций
            </Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 400 }}>
              Пользователь еще не опубликовал ни одного поста. Публикации будут отображаться здесь, когда они появятся.
            </Typography>
          </Box>
        )}
      </ContentLoader>
    );
  };

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        pt: 0, 
        pb: 4, 
        px: { xs: 0.5, sm: 1 },
        width: '100%',
        marginRight: 'auto',
        marginLeft: '0!important',
        paddingTop: '24px',
        paddingBottom: '40px',
        paddingLeft: '0',
        paddingRight: '0',
        minHeight: 'calc(100vh - 64px)',
      }}
    >
      <Grid 
        container 
        spacing={0.5}
        sx={{
          flexDirection: { xs: 'column', md: 'row' },
          flexWrap: { xs: 'nowrap', md: 'nowrap' }
        }}
      >
        {/* Left column - Profile info */}
        <Grid item xs={12} md={5}>
          {/* User card */}
          <Paper sx={{ 
            p: 0, 
            borderRadius: '16px', 
            background: 'linear-gradient(135deg, #232526 0%, #121212 100%)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
            mb: { xs: 1, md: 0 },
            overflow: 'hidden',
            position: { xs: 'relative', md: 'sticky' },
            top: { md: '80px' },
            zIndex: 1,
            transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
            '&:hover': {
              boxShadow: '0 14px 35px rgba(0, 0, 0, 0.35)',
              transform: 'translateY(-2px)'
            }
          }}>
            {/* Banner */}
            {user?.banner_url ? (
              <Box sx={{ 
                width: '100%',
                height: { xs: 150, sm: 200 },
                backgroundImage: `url(${user.banner_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                transition: 'transform 0.5s ease',
                '&:hover': {
                  transform: 'scale(1.02)'
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(18,18,18,0.95) 100%)'
                }
              }} />
            ) : (
              <Box sx={{ 
                width: '100%',
                height: { xs: 100, sm: 120 },
                background: 'linear-gradient(135deg, #4568dc 0%, #b06ab3 100%)',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23ffffff\' fill-opacity=\'0.05\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
                  opacity: 0.4
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(18,18,18,0.9) 100%)'
                }
              }} />
            )}
            
            {/* Content container */}
            <Box sx={{ px: 3, pb: 3, pt: 0, mt: -7 }}>
              {/* Top section with avatar and actions */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}>
                {/* Avatar with online indicator */}
                <Box sx={{ position: 'relative' }}>
                  <Avatar 
                    src={user?.avatar_url} 
                    alt={user?.name}
                    sx={{ 
                      width: { xs: 110, sm: 130 }, 
                      height: { xs: 110, sm: 130 }, 
                      border: '4px solid #121212',
                      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.25)',
                      bgcolor: 'primary.dark',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.03)',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.35)',
                        border: '4px solid rgba(208, 188, 255, 0.4)'
                      }
                    }}
                    onError={(e) => {
                      if (user?.id) {
                        e.currentTarget.src = `/static/uploads/avatar/${user.id}/${user.photo || 'default.png'}`;
                      }
                    }}
                  />
                  
                  {/* Online status indicator on avatar */}
                  {isOnline && (
                    <Box
                      sx={{
                        position: 'absolute',
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        bgcolor: '#4caf50',
                        border: '2px solid #121212',
                        bottom: 5,
                        right: 15,
                        boxShadow: '0 0 8px rgba(76, 175, 80, 0.9)',
                        zIndex: 2,
                        animation: 'pulse 2s infinite',
                        '@keyframes pulse': {
                          '0%': {
                            boxShadow: '0 0 0 0 rgba(76, 175, 80, 0.7)'
                          },
                          '70%': {
                            boxShadow: '0 0 0 6px rgba(76, 175, 80, 0)'
                          },
                          '100%': {
                            boxShadow: '0 0 0 0 rgba(76, 175, 80, 0)'
                          }
                        }
                      }}
                    />
                  )}
                </Box>
                
                {/* Follow/message buttons for non-current users */}
                {!isCurrentUser && (
                  <Box sx={{ mt: 8, display: 'flex', gap: 1 }}>
                    <Button 
                      variant="contained" 
                      color="primary"
                      startIcon={following ? <PersonRemoveIcon /> : <PersonAddIcon />}
                      onClick={handleFollow}
                      sx={{ 
                        borderRadius: 6,
                        py: 0.7,
                        px: 2,
                        fontWeight: 'bold',
                        textTransform: 'none',
                        boxShadow: '0 2px 8px rgba(208, 188, 255, 0.25)',
                        backgroundColor: following ? 'rgba(255, 255, 255, 0.1)' : 'primary.main',
                        color: following ? 'text.primary' : '#fff',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: following ? 'rgba(255, 255, 255, 0.15)' : 'primary.dark',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(208, 188, 255, 0.4)'
                        },
                        '&:active': {
                          transform: 'translateY(0)'
                        }
                      }}
                    >
                      {following ? 'Отписаться' : 'Подписаться'}
                    </Button>
                  </Box>
                )}
              </Box>
              
              {/* User info */}
              <Box sx={{ mt: 2, whiteSpace: 'nowrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 700,
                      background: 'linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.8) 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                    {user?.name || 'Пользователь'}
                  </Typography>
                  <VerificationBadge status={user?.verification_status} size="small" />
                  {user?.achievement && (
                    <Box 
                      component="img" 
                      sx={{ 
                        width: 'auto', 
                        height: 25, 
                        ml: 0.5
                      }} 
                      src={`/static/images/bages/${user.achievement.image_path}`} 
                      alt={user.achievement.bage}
                      onError={(e) => {
                        console.error("Achievement badge failed to load:", e);
                        if (e.target && e.target instanceof HTMLImageElement) {
                          e.target.style.display = 'none';
                        }
                      }}
                    />
                  )}
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 500,
                      color: 'rgba(255,255,255,0.7)',
                      display: 'flex',
                      alignItems: 'center',
                      background: 'rgba(255,255,255,0.03)',
                      px: 1.2,
                      py: 0.4,
                      borderRadius: 4,
                      border: '1px solid rgba(255,255,255,0.05)'
                    }}
                  >
                    @{user?.username || 'username'}
                  </Typography>
                  

                  {isOnline ? (
                    <Typography 
                      variant="caption" 
                      sx={{
                        display: 'flex', 
                        alignItems: 'center',
                        color: 'success.light',
                        fontWeight: 500,
                        background: 'rgba(46, 125, 50, 0.1)',
                        px: 1,
                        py: 0.3,
                        borderRadius: 4,
                        border: '1px solid rgba(46, 125, 50, 0.2)'
                      }}
                    >
                      <Box 
                        sx={{ 
                          width: '8px', 
                          height: '8px', 
                          bgcolor: 'success.main', 
                          borderRadius: '50%',
                          mr: 0.5,
                          boxShadow: '0 0 4px rgba(76, 175, 80, 0.6)'
                        }} 
                      />
                      онлайн
                    </Typography>
                  ) : (
                    <Typography 
                      variant="caption" 
                      sx={{
                        display: 'flex', 
                        alignItems: 'center',
                        color: 'text.secondary',
                        fontWeight: 500,
                        background: 'rgba(255,255,255,0.03)',
                        px: 1,
                        py: 0.3,
                        borderRadius: 4,
                        border: '1px solid rgba(255,255,255,0.05)'
                      }}
                    >
                      <AccessTimeIcon sx={{ fontSize: 12, mr: 0.5, opacity: 0.7 }} />
                      {lastActive ? `${lastActive}` : "не в сети"}
                    </Typography>
                  )}
                </Box>
                  
                {/* Дополнительные юзернеймы на отдельной строке */}
                {ownedUsernames.length > 0 && (
                  <Box sx={{ 
                    display: 'flex',
                    mt: 1,
                    width: '100%'
                  }}>
                    <Box 
                      sx={{ 
                        color: 'rgba(255,255,255,0.6)',
                        backgroundColor: 'rgba(208, 188, 255, 0.1)',
                        px: 1.2,
                        py: 0.4,
                        borderRadius: 4,
                        border: '1px solid rgba(208, 188, 255, 0.2)',
                        fontSize: '0.75rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        maxWidth: '100%',
                        flexWrap: 'wrap'
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', mr: 0.5 }}>
                        А также:
                      </Typography>
                      {ownedUsernames.slice(0, 3).map((username, idx) => (
                        <React.Fragment key={idx}>
                          <Typography 
                            variant="caption" 
                            component="span" 
                            sx={{ 
                              color: '#d0bcff', 
                              fontWeight: 500
                            }}
                          >
                            @{username}
                          </Typography>
                          {idx < Math.min(ownedUsernames.length, 3) - 1 && (
                            <Typography variant="caption" component="span" sx={{ mx: 0.5, color: 'rgba(255,255,255,0.4)' }}>
                              ,
                            </Typography>
                          )}
                        </React.Fragment>
                      ))}
                      {ownedUsernames.length > 3 && (
                        <Typography variant="caption" component="span" sx={{ ml: 0.5, color: 'rgba(255,255,255,0.4)' }}>
                          и ещё {ownedUsernames.length - 3}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                )}
                
                {/* Bio */}
                {user?.about && (
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mt: 1, // Уменьшено с 2 до 1
                      lineHeight: 1.5,
                      color: 'rgba(255,255,255,0.8)',
                      p: 1.5,
                      borderRadius: 2,
                      background: 'rgba(255,255,255,0.03)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.05)'
                    }}
                  >
                    {user.about}
                  </Typography>
                )}
                
                
                {/* Stats cards */}
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)', 
                  gap: 1, // Уменьшено с 1.5 до 1
                  mt: 1 // Уменьшено с 2.5 до 1
                }}>
                  {/* Posts count */}
                  <Paper sx={{ 
                    p: 1.5, 
                    borderRadius: 2, 
                    textAlign: 'center',
                    background: 'rgba(255,255,255,0.04)',
                    backdropFilter: 'blur(5px)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.07)',
                      transform: 'translateY(-2px)'
                    }
                  }}>
                    <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                      {postsCount || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      публикаций
                    </Typography>
                  </Paper>
                  
                  {/* Followers */}
                  <Paper 
                    component={Link}
                    to={`/profile/${user?.username}/followers`}
                    sx={{ 
                      p: 1.5, 
                      borderRadius: 2, 
                      textAlign: 'center',
                      background: 'rgba(255,255,255,0.04)',
                      backdropFilter: 'blur(5px)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.07)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                      {followersCount || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      подписчиков
                    </Typography>
                  </Paper>
                  
                  {/* Following */}
                  <Paper 
                    component={Link}
                    to={`/profile/${user?.username}/following`}
                    sx={{ 
                      p: 1.5, 
                      borderRadius: 2, 
                      textAlign: 'center',
                      background: 'rgba(255,255,255,0.04)',
                      backdropFilter: 'blur(5px)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.07)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                      {followingCount || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      подписок
                    </Typography>
                  </Paper>
                </Box>
                
                {/* Followers and following section with avatars */}
                <Grid container spacing={1} sx={{ mt: 1 }}> {/* Уменьшено spacing с 2 до 1 и mt с 2 до 1 */}
                  {/* Подписчики */}
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                        Подписчики
                      </Typography>
                      
                      {/* Аватары подписчиков */}
                      {loadingFollowers ? (
                        <CircularProgress size={20} />
                      ) : followers.length > 0 ? (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {followers.slice(0, 3).map(follower => (
                            <Tooltip key={follower.id} title={follower.name} arrow>
                              <Avatar 
                                src={follower.photo} 
                                alt={follower.name}
                                component={Link}
                                to={`/profile/${follower.username}`}
                                sx={{ width: 32, height: 32, border: '1px solid #D0BCFF', flexShrink: 0 }}
                                onError={(e) => {
                                  console.error(`Failed to load follower avatar for ${follower.username}`);
                                  if (follower.id) {
                                    e.target.src = `/static/uploads/avatar/${follower.id}/${follower.photo || 'avatar.png'}`;
                                  }
                                }}
                              />
                            </Tooltip>
                          ))}
                          {followersCount > 3 && (
                            <Tooltip title="Показать всех" arrow>
                              <Avatar 
                                component={Link}
                                to={`/profile/${user?.username}/followers`}
                                sx={{ 
                                  width: 32, 
                                  height: 32, 
                                  bgcolor: 'rgba(208, 188, 255, 0.15)', 
                                  fontSize: '0.75rem',
                                  color: '#D0BCFF',
                                  flexShrink: 0 
                                }}
                              >
                                +{followersCount - 3}
                              </Avatar>
                            </Tooltip>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Нет подписчиков
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                  
                  {/* Подписки */}
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                        Подписки
                      </Typography>
                      
                      {/* Аватары подписок */}
                      {loadingFollowing ? (
                        <CircularProgress size={20} />
                      ) : followingList.length > 0 ? (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {followingList.slice(0, 3).map(following => (
                            <Tooltip key={following.id} title={following.name} arrow>
                              <Avatar 
                                src={following.photo} 
                                alt={following.name}
                                component={Link}
                                to={`/profile/${following.username}`}
                                sx={{ width: 32, height: 32, border: '1px solid #D0BCFF', flexShrink: 0 }}
                                onError={(e) => {
                                  console.error(`Failed to load following avatar for ${following.username}`);
                                  if (following.id) {
                                    e.target.src = `/static/uploads/avatar/${following.id}/${following.photo || 'avatar.png'}`;
                                  }
                                }}
                              />
                            </Tooltip>
                          ))}
                          {followingCount > 3 && (
                            <Tooltip title="Показать всех" arrow>
                              <Avatar 
                                component={Link}
                                to={`/profile/${user?.username}/following`}
                                sx={{ 
                                  width: 32, 
                                  height: 32, 
                                  bgcolor: 'rgba(208, 188, 255, 0.15)', 
                                  fontSize: '0.75rem',
                                  color: '#D0BCFF',
                                  flexShrink: 0
                                }}
                              >
                                +{followingCount - 3}
                              </Avatar>
                            </Tooltip>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Нет подписок
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                </Grid>
                
                {/* Social links */}
                {socials && socials.length > 0 && (
                  <Box sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 1, 
                    mt: 3,
                    pt: 2,
                    borderTop: '1px solid rgba(255,255,255,0.08)'
                  }}>
                    {socials.map((social, index) => (
                      <Tooltip key={index} title={social.title || social.name} arrow>
                        <IconButton 
                          component="a" 
                          href={social.url || social.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          size="small"
                          sx={{ 
                            color: social.color || 'primary.main',
                            padding: 1,
                            bgcolor: 'rgba(255, 255, 255, 0.07)',
                            '&:hover': {
                              bgcolor: 'rgba(255, 255, 255, 0.12)',
                              transform: 'translateY(-2px)',
                              transition: 'transform 0.2s'
                            }
                          }}
                        >
                          {social.icon ? (
                            <Box component="img" src={social.icon} alt={social.title || social.name} sx={{ width: 20, height: 20 }} />
                          ) : (
                            <Box component="div" sx={{ width: 20, height: 20, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {social.name?.toLowerCase().includes('instagram') ? 
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                              : social.name?.toLowerCase().includes('facebook') ?
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5 1.583-5 4.615v3.385z"/></svg>
                              : social.name?.toLowerCase().includes('twitter') || social.name?.toLowerCase().includes('x') ?
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                              : social.name?.toLowerCase().includes('vk') ?
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M13.162 18.994c.609 0 .858-.406.851-.915-.031-1.917.714-2.949 2.059-1.604 1.488 1.488 1.796 2.519 3.603 2.519h3.2c.808 0 1.126-.26 1.126-.668 0-.863-1.421-2.386-2.625-3.504-1.686-1.565-1.765-1.602-.313-3.486 1.801-2.339 4.157-5.336 2.073-5.336h-3.981c-.772 0-.828.435-1.103 1.083-.995 2.347-2.886 5.387-3.604 4.922-.751-.485-.407-2.406-.35-5.261.015-.754.011-1.271-1.141-1.539-.629-.145-1.241-.205-1.809-.205-2.273 0-3.841.953-2.95 1.119 1.571.293 1.42 3.692 1.054 5.16-.638 2.556-3.036-2.024-4.035-4.305-.241-.548-.315-.974-1.175-.974h-3.255c-.492 0-.787.16-.787.516 0 .602 2.96 6.72 5.786 9.77 2.756 2.975 5.48 2.708 7.376 2.708z"/></svg>
                              : social.name?.toLowerCase().includes('youtube') ?
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                              : social.name?.toLowerCase().includes('telegram') ?
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19l-9.5 5.97-4.1-1.34c-.88-.28-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71l-4.14-3.05-1.99 1.93c-.23.23-.42.42-.83.42z"/></svg>
                              : social.name?.toLowerCase().includes('element') ?
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 12.7 12.7" fill="currentColor">
                                  <path d="M 4.9717204,2.3834823 A 5.0230292,5.0230292 0 0 0 0.59994682,7.3615548 5.0230292,5.0230292 0 0 0 5.6228197,12.384429 5.0230292,5.0230292 0 0 0 10.645693,7.3615548 5.0230292,5.0230292 0 0 0 10.630013,6.9628311 3.8648402,3.8648402 0 0 1 8.6139939,7.532543 3.8648402,3.8648402 0 0 1 4.7492118,3.6677608 3.8648402,3.8648402 0 0 1 4.9717204,2.3834823 Z" />
                                  <circle cx="8.6142359" cy="3.6677198" r="3.5209935" />
                                </svg>
                              : 
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6.188 8.719c.439-.439.926-.801 1.444-1.087 2.887-1.591 6.589-.745 8.445 2.069l-2.246 2.245c-.644-1.469-2.243-2.305-3.834-1.949-.599.134-1.168.433-1.633.898l-4.304 4.306c-1.307 1.307-1.307 3.433 0 4.74 1.307 1.307 3.433 1.307 4.74 0l1.327-1.327c1.207.479 2.501.67 3.779.575l-2.929 2.929c-2.511 2.511-6.582 2.511-9.093 0s-2.511-6.582 0-9.093l4.304-4.306zm6.836-6.836l-2.929 2.929c1.277-.096 2.572.096 3.779.574l1.326-1.326c1.307-1.307 3.433-1.307 4.74 0 1.307 1.307 1.307 3.433 0 4.74l-4.305 4.305c-1.311 1.311-3.44 1.3-4.74 0-.303-.303-.564-.68-.727-1.051l-2.246 2.245c.236.358.481.667.796.982.812.812 1.846 1.417 3.036 1.704 1.542.371 3.194.166 4.613-.617.518-.286 1.005-.648 1.444-1.087l4.304-4.305c2.512-2.511 2.512-6.582.001-9.093-2.511-2.51-6.581-2.51-9.092 0z"/></svg>
                              }
                            </Box>
                          )}
                        </IconButton>
                      </Tooltip>
                    ))}
                  </Box>
                )}
                
                {/* Mobile follow button */}
                {!isCurrentUser && (
                  <Box sx={{ display: { xs: 'block', sm: 'none' }, mt: 3 }}>
                    <Button 
                      variant="contained" 
                      color="primary"
                      fullWidth
                      startIcon={following ? <PersonRemoveIcon /> : <PersonAddIcon />}
                      onClick={handleFollow}
                      sx={{ 
                        borderRadius: 6,
                        py: 0.8,
                        fontWeight: 'bold',
                        textTransform: 'none',
                        boxShadow: '0 2px 8px rgba(208, 188, 255, 0.25)',
                        backgroundColor: following ? 'rgba(255, 255, 255, 0.1)' : 'primary.main',
                        color: following ? 'text.primary' : '#fff',
                        '&:hover': {
                          backgroundColor: following ? 'rgba(255, 255, 255, 0.15)' : 'primary.dark',
                        }
                      }}
                    >
                      {following ? 'Отписаться' : 'Подписаться'}
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        {/* Right column - Content */}
        <Grid item xs={12} md={7} sx={{ pt: 0, ml: { xs: 0, md: '5px' }, mb: '100px' }}>
        {/* Tabs for profile content */}
          <Paper sx={{ 
            borderRadius: '16px', 
            background: 'linear-gradient(135deg, #232526 0%, #121212 100%)',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden',
            mb: 1
          }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                '& .MuiTabs-indicator': {
                  backgroundColor: 'primary.main',
                  height: 3
                },
                '& .MuiTab-root': {
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  py: 1.5,
                  textTransform: 'none',
                  '&.Mui-selected': {
                    color: 'primary.main',
                    fontWeight: 700
                  }
                }
              }}
            >
              <Tab label="Публикации" />
              <Tab label="Фото" />
              <Tab label="Видео" />
              <Tab label="Информация" />
            </Tabs>
          </Paper>
          
          {/* Tab Panels */}
          <TabPanel value={tabValue} index={0} sx={{ p: 0, mt: 1 }}>
            {isCurrentUser && (
              <CreatePost onPostCreated={handlePostCreated} />
            )}
            
            <PostsTab />
          </TabPanel>
          
          <TabPanel value={tabValue} index={1} sx={{ p: 0, mt: 1 }}>
            <PhotosGrid />
          </TabPanel>
          
          <TabPanel value={tabValue} index={2} sx={{ p: 0, mt: 1 }}>
            <VideosGrid />
          </TabPanel>
          
          <TabPanel value={tabValue} index={3} sx={{ p: 0, mt: 1 }}>
            <Paper sx={{ 
              p: 3, 
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #232526 0%, #121212 100%)',
              boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)'
            }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Информация о пользователе
              </Typography>
              
              <Grid container spacing={3}>
                {user?.about && (
                  <Grid item xs={12}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: 1.5,
                      pb: 2,
                      borderBottom: '1px solid rgba(255,255,255,0.07)'
                    }}>
                      <InfoIcon color="primary" sx={{ mt: 0.5 }} />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Обо мне
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          whiteSpace: 'pre-line',
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word'
                        }}>
                          {user.about}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
                
                {user?.location && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                      <LocationOnIcon color="primary" sx={{ mt: 0.5 }} />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Местоположение
                        </Typography>
                        <Typography variant="body2">
                          {user.location}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
                
                {user?.website && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                      <LinkIcon color="primary" sx={{ mt: 0.5 }} />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Веб-сайт
                        </Typography>
                        <Typography variant="body2">
                          <Link href={user.website} target="_blank" rel="noopener noreferrer" sx={{ color: 'primary.main' }}>
                            {user.website.replace(/^https?:\/\//, '')}
                          </Link>
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
                
                {user?.birthday && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                      <CakeIcon color="primary" sx={{ mt: 0.5 }} />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Дата рождения
                        </Typography>
                        <Typography variant="body2">
                          {formatDate(user.birthday)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <TodayIcon color="primary" sx={{ mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Дата регистрации
                      </Typography>
                      <Typography variant="body2">
                        {user?.created_at ? formatDate(user.created_at) : 'Недоступно'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                {user?.purchased_usernames && user.purchased_usernames.length > 0 && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                      <AlternateEmailIcon color="primary" sx={{ mt: 0.5 }} />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Юзернеймы
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {/* Показываем все юзернеймы вместо только первых 3 */}
                          {user.purchased_usernames.map((username, idx) => (
                            <Chip 
                              key={idx}
                              label={username.username}
                              size="small"
                              sx={{ 
                                bgcolor: username.is_active ? 'primary.dark' : 'background.paper',
                                border: '1px solid',
                                borderColor: username.is_active ? 'primary.main' : 'divider',
                                '&:hover': {
                                  bgcolor: username.is_active ? 'primary.main' : 'rgba(208, 188, 255, 0.1)',
                                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                                },
                                transition: 'all 0.2s'
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </TabPanel>
        </Grid>
      </Grid>
      {loadingMorePosts && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress size={30} />
          </Box>
        )}
      
      {/* Лайтбокс для просмотра изображений */}
      {lightboxIsOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
          onClick={closeLightbox}
        >
          <img 
            src={currentImage} 
            alt="Full size" 
            style={{ 
              maxWidth: '90%', 
              maxHeight: '90%', 
              objectFit: 'contain' 
            }} 
            onClick={(e) => e.stopPropagation()}
          />
          <IconButton
            sx={{
              position: 'absolute',
              top: 20,
              right: 20,
              color: 'white',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              }
            }}
            onClick={closeLightbox}
          >
            <CloseIcon />
          </IconButton>
        </div>
      )}
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      <Menu
        anchorEl={notificationMenuAnchor}
        open={Boolean(notificationMenuAnchor)}
        onClose={() => setNotificationMenuAnchor(null)}
        PaperProps={{
          sx: {
            bgcolor: '#1E1E1E',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
            mt: 1,
            maxHeight: 400,
            width: 360
          }
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Typography variant="h6">Уведомления</Typography>
        </Box>
        
        {notifications.length > 0 ? (
          notifications.map(notification => (
            <MenuItem
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2,
                p: 2,
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.05)'
                }
              }}
            >
              <Avatar
                src={notification.sender_user?.avatar_url}
                alt={notification.sender_user?.name}
                sx={{ width: 40, height: 40 }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  {notification.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatTimeAgo(notification.created_at)}
                </Typography>
              </Box>
            </MenuItem>
          ))
        ) : (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="text.secondary">Нет новых уведомлений</Typography>
          </Box>
        )}
      </Menu>
    </Container>
  );
};

export default ProfilePage; 