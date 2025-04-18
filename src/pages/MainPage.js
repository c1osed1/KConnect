import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { 
  Box, 
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  CircularProgress,
  Divider,
  Paper,
  IconButton,
  styled,
  InputBase,
  Tooltip,
  Fade,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Chip,
  useTheme,
  useMediaQuery,
  CardMedia,
  ImageList,
  ImageListItem,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import PostService from '../services/PostService';
import axios from '../services/axiosConfig';
import ImageIcon from '@mui/icons-material/Image';
import VideoCameraBackIcon from '@mui/icons-material/VideoCameraBack';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ShareIcon from '@mui/icons-material/Share';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RefreshIcon from '@mui/icons-material/Refresh';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import ReportIcon from '@mui/icons-material/Report';
import { formatTimeAgo, formatDate } from '../utils/dateUtils';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import LightBox from '../components/LightBox';
import ImageGrid from '../components/Post/ImageGrid';
import { Post } from '../components/Post';
import RepostItem from '../components/RepostItem';
import PostSkeleton from '../components/Post/PostSkeleton';
import MusicSelectDialog from '../components/Music/MusicSelectDialog';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import { MusicContext } from '../context/MusicContext';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import ContentLoader from '../components/UI/ContentLoader';
import TimerIcon from '@mui/icons-material/Timer';


const PostCard = styled(Card)(({ theme }) => ({
  marginBottom: 10,
  borderRadius: '10px',
  overflow: 'hidden',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  background: '#1A1A1A',
  cursor: 'pointer'
}));


const OnlineUsersCard = styled(Card)(({ theme }) => ({
  borderRadius: '10px',
  overflow: 'hidden',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  background: '#1A1A1A',
}));

const RecommendationCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(1.5),
  borderRadius: '12px',
  background: '#1d1d1d',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
  border: '1px solid rgba(255, 255, 255, 0.03)'
}));

const FollowButton = styled(Button)(({ theme, following }) => ({
  borderRadius: '10px',
  textTransform: 'none',
  fontWeight: 'medium',
  minWidth: '80px',
  padding: theme.spacing(0.5, 1.5),
  fontSize: '0.75rem',
  backgroundColor: following ? 'transparent' : theme.palette.primary.main,
  borderColor: following ? theme.palette.divider : theme.palette.primary.main,
  color: following ? theme.palette.text.primary : theme.palette.primary.contrastText,
  '&:hover': {
    backgroundColor: following ? 'rgba(255, 255, 255, 0.05)' : theme.palette.primary.dark,
  }
}));

const SidebarContainer = styled(Box)(({ theme }) => ({
  position: 'sticky',
  top: 80,
  width: '100%',
  [theme.breakpoints.down('md')]: {
    position: 'static',
    marginTop: theme.spacing(2)
  }
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

const CreatePostCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1.5),
  borderRadius: '12px',
  background: '#1d1d1d',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
  border: '1px solid rgba(255, 255, 255, 0.03)',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1), 
  },
}));

const PostInput = styled(InputBase)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(1),
  borderRadius: '10px',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
  },
  '& .MuiInputBase-input': {
    padding: theme.spacing(1),
  },
}));

const PostActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: theme.spacing(1),
  paddingTop: theme.spacing(1),
}));

const MediaPreviewContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  marginTop: theme.spacing(2),
  borderRadius: '10px',
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

const ContentContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  width: '100%',
  [theme.breakpoints.up('md')]: {
    flexDirection: 'row',
  },
  [theme.breakpoints.down('sm')]: {
    gap: theme.spacing(1), 
  },
}));

const LeftColumn = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
  [theme.breakpoints.up('md')]: {
    width: '68%',
  },
  [theme.breakpoints.down('sm')]: {
    gap: theme.spacing(1), 
  },
}));

const RightColumn = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
  [theme.breakpoints.up('md')]: {
    width: '32%',
  },
  [theme.breakpoints.down('sm')]: {
    gap: theme.spacing(1), 
  },
}));


const OnlineUsers = () => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchOnlineUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/users/online');
        
        if (Array.isArray(response.data)) {
          setOnlineUsers(response.data);
        } else if (response.data && Array.isArray(response.data.users)) {
          setOnlineUsers(response.data.users);
        } else {
          setOnlineUsers([]);
        }
      } catch (error) {
        console.error('Error fetching online users:', error);
        setOnlineUsers([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOnlineUsers();
    
    
    const interval = setInterval(fetchOnlineUsers, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleUserClick = (username) => {
    navigate(`/profile/${username}`);
  };
  
  if (loading) {
    return (
      <OnlineUsersCard sx={{ p: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CircularProgress size={20} sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>
            Загрузка...
          </Typography>
        </Box>
      </OnlineUsersCard>
    );
  }
  
  if (onlineUsers.length === 0) {
    return null;
  }
  
  return (
    <OnlineUsersCard sx={{ p: 1.5 }}>
      <Typography variant="h6" sx={{ fontSize: '1.1rem', mb: 1 }}>
        Сейчас онлайн ({onlineUsers.length})
      </Typography>
      
      {}
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'nowrap', 
        gap: 2,
        overflowX: 'auto',
        pb: 1,
        '&::-webkit-scrollbar': {
          height: '6px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '10px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'transparent',
        },
        msOverflowStyle: 'none', 
        scrollbarWidth: 'thin',   
      }}>
        {onlineUsers.map(user => (
          <Box 
            key={user.id} 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer'
            }}
            onClick={() => handleUserClick(user.username)}
          >
            <Box sx={{ position: 'relative' }}>
              <Avatar 
                src={user.photo}
                alt={user.name || user.username}
                sx={{ 
                  width: 42, 
                  height: 42, 
                  border: '2px solid #1E1E1E'
                }}
                onError={(e) => {
                  console.error(`Failed to load avatar for ${user.username}`);
                  const imgElement = e.target;
                  if (imgElement && typeof imgElement.src !== 'undefined') {
                    imgElement.src = `/static/uploads/system/avatar.png`;
                  }
                }}
              />
              <Box 
                sx={{ 
                  position: 'absolute', 
                  bottom: 0, 
                  right: 0,
                  width: 10, 
                  height: 10, 
                  borderRadius: '50%', 
                  backgroundColor: '#4caf50',
                  border: '1px solid #1E1E1E'
                }} 
              />
            </Box>
            <Typography 
              variant="caption" 
              sx={{ 
                mt: 0.5, 
                maxWidth: '60px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                textAlign: 'center'
              }}
            >
              {user.name || user.username}
            </Typography>
          </Box>
        ))}
      </Box>
    </OnlineUsersCard>
  );
};


const UserRecommendation = ({ user }) => {
  const [following, setFollowing] = useState(user.is_following || false);
  const navigate = useNavigate();
  
  const handleFollow = async (e) => {
    e.stopPropagation();
    try {
      
      setFollowing(!following);
      
      const response = await axios.post(`/api/profile/follow`, {
        followed_id: user.id
      });
      
      
      if (response.data && response.data.success) {
        setFollowing(response.data.is_following);
      }
    } catch (error) {
      
      setFollowing(following);
      console.error('Error toggling follow:', error);
    }
  };
  
  const handleCardClick = () => {
    navigate(`/profile/${user.username}`);
  };

  
  const getAvatarSrc = () => {
    if (!user.photo) return '/static/uploads/system/avatar.png';
    
    
    if (user.photo.startsWith('/') || user.photo.startsWith('http')) {
      return user.photo;
    }
    
    
    return `/static/uploads/avatar/${user.id}/${user.photo}`;
  };
  
  return (
    <RecommendationCard onClick={handleCardClick} sx={{ cursor: 'pointer' }}>
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              src={getAvatarSrc()}
              alt={user.name || user.username}
              sx={{ width: 32, height: 32, mr: 1 }}
              onError={(e) => {
                console.error(`Failed to load avatar for ${user.name}`);
                const imgElement = e.target;
                if (imgElement && typeof imgElement.src !== 'undefined') {
                  imgElement.src = `/static/uploads/avatar/system/avatar.png`;
                }
              }}
            />
            <Box>
              <Typography variant="body2" fontWeight="medium" noWrap>
                {user.name || user.username}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                @{user.username}
              </Typography>
            </Box>
          </Box>
          
          <FollowButton
            variant={following ? "outlined" : "contained"}
            size="small"
            following={following}
            onClick={handleFollow}
            startIcon={following ? <PersonRemoveIcon fontSize="small" /> : <PersonAddIcon fontSize="small" />}
          >
            {following ? 'Отписаться' : 'Подписаться'}
          </FollowButton>
        </Box>
      </CardContent>
    </RecommendationCard>
  );
};


const CreatePost = ({ onPostCreated }) => {
  const { user } = useContext(AuthContext);
  const { playTrack, currentTrack, isPlaying, togglePlay } = useContext(MusicContext);
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaType, setMediaType] = useState('');
  const [mediaPreview, setMediaPreview] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  
  
  const [musicSelectOpen, setMusicSelectOpen] = useState(false);
  const [selectedTracks, setSelectedTracks] = useState([]);
  
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error'
  });
  
  
  const [rateLimitDialog, setRateLimitDialog] = useState({
    open: false,
    message: '',
    timeRemaining: 0
  });
  
  
  useEffect(() => {
    if (error) setError('');
  }, [content, mediaFiles, selectedTracks, error]);
  
  
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
  
  const handleMediaChange = (event) => {
    event.preventDefault(); 
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      processFiles(files);
    }
  };
  
  const processFiles = (files) => {
    if (!files.length) return;
    
    
    setMediaFiles([]);
    setMediaPreview([]);
    setMediaType('');
    
    
    if (files.length > 1) {
      
      const allImages = files.every(file => file.type.startsWith('image/'));
      
      if (allImages) {
        setMediaFiles(files);
        setMediaType('images');
        
        
        files.forEach(file => {
          const reader = new FileReader();
          reader.onloadend = () => {
            setMediaPreview(prevPreviews => [...prevPreviews, reader.result]);
          };
          reader.readAsDataURL(file);
        });
        return;
      }
    }
    
    
    const file = files[0];
    
    
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (isImage || isVideo) {
      setMediaFiles([file]);
      setMediaType(isImage ? 'image' : 'video');
      
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview([reader.result]);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleRemoveMedia = () => {
    setMediaFiles([]);
    setMediaPreview([]);
    setMediaType('');
    setSelectedTracks([]);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  
  const handleMusicSelect = (tracks) => {
    setSelectedTracks(tracks);
  };
  
  
  const handleRemoveTrack = (trackId) => {
    setSelectedTracks(prev => prev.filter(track => track.id !== trackId));
  };
  
  const clearForm = () => {
    setContent('');
    setMediaFiles([]);
    setMediaPreview([]);
    setMediaType('');
    setSelectedTracks([]);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  
  const handleTrackPlay = (track, event) => {
    if (event) {
      event.stopPropagation();
    }
    
    if (currentTrack && currentTrack.id === track.id) {
      togglePlay(); 
    } else {
      playTrack(track); 
    }
  };
  
  const handleSubmit = async () => {
    if (!content.trim() && mediaFiles.length === 0 && selectedTracks.length === 0) return;
    
    try {
      setIsSubmitting(true);
      setError('');
      console.log("Starting post submission...");
      
      const formData = new FormData();
      formData.append('content', content.trim());
      
      console.log("Added content to FormData:", content.trim());
      
      
      if (mediaType === 'images') {
        
        console.log(`Adding ${mediaFiles.length} images to FormData`);
        mediaFiles.forEach((file, index) => {
          console.log(`Adding image[${index}]:`, file.name, file.size);
          formData.append(`images[${index}]`, file);
        });
      } else if (mediaType === 'image') {
        
        console.log("Adding single image to FormData:", mediaFiles[0].name, mediaFiles[0].size);
        formData.append('image', mediaFiles[0]);
      } else if (mediaType === 'video') {
        
        console.log("Adding video to FormData:", mediaFiles[0].name, mediaFiles[0].size);
        formData.append('video', mediaFiles[0]);
      }
      
      
      if (selectedTracks.length > 0) {
        console.log(`Adding ${selectedTracks.length} music tracks to post`);
        
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
      
      console.log("Sending post request to server...");
      const response = await axios.post('/api/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log("Post created successfully!", response.data);
      
      
      clearForm();
      
      
      if (onPostCreated) {
        onPostCreated(response.data.post);
      }
    } catch (error) {
      console.error("Error creating post:", error);
      
      
      if (error.response && error.response.status === 429) {
        const rateLimit = error.response.data.rate_limit;
        let errorMessage = "Превышен лимит публикации постов. ";
        let timeRemaining = 0;
        
        if (rateLimit && rateLimit.reset) {
          
          const resetTime = new Date(rateLimit.reset * 1000);
          const now = new Date();
          const diffSeconds = Math.round((resetTime - now) / 1000);
          timeRemaining = diffSeconds;
          
          if (diffSeconds > 60) {
            const minutes = Math.floor(diffSeconds / 60);
            const seconds = diffSeconds % 60;
            errorMessage += `Следующий пост можно опубликовать через ${minutes} мин. ${seconds} сек.`;
          } else {
            errorMessage += `Следующий пост можно опубликовать через ${diffSeconds} сек.`;
          }
        } else {
          errorMessage += "Пожалуйста, повторите попытку позже.";
          timeRemaining = 60; 
        }
        
        setError(errorMessage);
        
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'warning'
        });
        
        
        setRateLimitDialog({
          open: true,
          message: errorMessage,
          timeRemaining: timeRemaining
        });
      } else if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error);
        
        setSnackbar({
          open: true,
          message: error.response.data.error,
          severity: 'error'
        });
      } else {
        setError("Произошла ошибка при создании поста. Пожалуйста, попробуйте еще раз.");
        
        setSnackbar({
          open: true,
          message: "Произошла ошибка при создании поста. Пожалуйста, попробуйте еще раз.",
          severity: 'error'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!user) return null;
  
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 2, 
        borderRadius: 2,
        backgroundColor: (theme) => theme.palette.background.paper,
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}
      
      {}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      {}
      <Dialog
        open={rateLimitDialog.open}
        onClose={() => setRateLimitDialog(prev => ({ ...prev, open: false }))}
        aria-labelledby="rate-limit-dialog-title"
        aria-describedby="rate-limit-dialog-description"
        PaperProps={{
          sx: {
            backgroundColor: '#1A1A1A',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            maxWidth: '400px',
            width: '100%'
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography 
            id="rate-limit-dialog-title" 
            variant="h6" 
            component="h2" 
            sx={{ 
              mb: 2, 
              color: '#D0BCFF',
              fontWeight: 'medium',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <TimerIcon sx={{ mr: 1 }} /> Пожалуйста, подождите
          </Typography>
          <Typography id="rate-limit-dialog-description" sx={{ mb: 3, color: 'text.secondary' }}>
            {rateLimitDialog.message}
          </Typography>
          <Box sx={{ textAlign: 'right' }}>
            <Button 
              onClick={() => setRateLimitDialog(prev => ({ ...prev, open: false }))} 
              variant="contained"
              sx={{
                borderRadius: '24px',
                textTransform: 'none',
                fontWeight: 500,
                padding: '6px 16px'
              }}
            >
              Понятно
            </Button>
          </Box>
        </Box>
      </Dialog>
      
      <Box 
        component="form" 
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        sx={{ 
          position: 'relative',
          zIndex: 1 
        }}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            position: 'relative',
            borderRadius: '12px',
            border: isDragging ? '2px dashed #D0BCFF' : 'none',
            backgroundColor: isDragging ? 'rgba(208, 188, 255, 0.05)' : 'transparent',
            padding: isDragging ? 1 : 0,
            transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
          }}
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
                backgroundColor: 'rgba(26, 26, 26, 0.7)',
                borderRadius: '12px',
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
          
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
            <Avatar 
              src={user.photo ? `/static/uploads/avatar/${user.id}/${user.photo}` : undefined}
              alt={user.name}
              sx={{ mr: 1.5, width: 42, height: 42, border: '2px solid #D0BCFF' }}
            />
            <PostInput 
              placeholder="Что у вас нового?"
              multiline
              maxRows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              fullWidth
            />
          </Box>
          
          {}
          {mediaPreview.length > 0 && (
            <Box sx={{ position: 'relative', mb: 2 }}>
              {mediaType === 'images' && mediaPreview.length > 1 ? (
                <ImageList sx={{ width: '100%', height: 'auto', maxHeight: 500 }} cols={mediaPreview.length > 3 ? 3 : 2} rowHeight={164}>
                  {mediaPreview.map((preview, index) => (
                    <ImageListItem key={index}>
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        style={{ objectFit: 'cover', height: '100%', width: '100%' }}
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              ) : (
                <img
                  src={mediaPreview[0]}
                  alt="Preview"
                  style={{ 
                    width: '100%', 
                    borderRadius: '8px',
                    maxHeight: '300px',
                    objectFit: mediaType === 'image' ? 'contain' : 'cover'
                  }}
                />
              )}
              <IconButton
                onClick={handleRemoveMedia}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
          
          {}
          {selectedTracks.length > 0 && (
            <Box sx={{ mt: 2, mb: 2 }}>
              {selectedTracks.map(track => (
                <Box 
                  key={track.id}
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    py: 1, 
                    px: 1.5, 
                    mb: 1, 
                    borderRadius: '10px',
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={(e) => handleTrackPlay(track, e)}
                >
                  <Box 
                    sx={{ 
                      width: 32, 
                      height: 32, 
                      borderRadius: '6px', 
                      overflow: 'hidden',
                      mr: 1.5,
                      position: 'relative',
                      bgcolor: 'rgba(0, 0, 0, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                    }}
                  >
                    <img 
                      src={
                        !track.cover_path ? '/uploads/system/album_placeholder.jpg' :
                        track.cover_path.startsWith('/static/') ? track.cover_path :
                        track.cover_path.startsWith('static/') ? `/${track.cover_path}` :
                        track.cover_path.startsWith('http') ? track.cover_path :
                        `/static/music/${track.cover_path}`
                      } 
                      alt={track.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = '/uploads/system/album_placeholder.jpg';
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(145deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.3))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {currentTrack && currentTrack.id === track.id && isPlaying ? (
                        <PauseIcon sx={{ color: 'white', fontSize: 16 }} />
                      ) : (
                        <MusicNoteIcon 
                          sx={{ 
                            fontSize: 14, 
                            color: 'rgba(255, 255, 255, 0.9)',
                            filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))'
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                  <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: currentTrack && currentTrack.id === track.id ? 'medium' : 'normal',
                        color: currentTrack && currentTrack.id === track.id ? 'primary.main' : 'text.primary',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontSize: '0.85rem'
                      }}
                    >
                      {track.title}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{
                        display: 'block',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontSize: '0.75rem'
                      }}
                    >
                      {track.artist}
                    </Typography>
                  </Box>
                  {currentTrack && currentTrack.id === track.id ? (
                    isPlaying ? (
                      <PauseIcon color="primary" fontSize="small" sx={{ mr: 1, fontSize: 16 }} />
                    ) : (
                      <PlayArrowIcon color="primary" fontSize="small" sx={{ mr: 1, fontSize: 16 }} />
                    )
                  ) : null}
                  <IconButton 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveTrack(track.id);
                    }}
                    sx={{ 
                      ml: 'auto',
                      bgcolor: 'rgba(0, 0, 0, 0.2)',
                      '&:hover': {
                        bgcolor: 'rgba(0, 0, 0, 0.3)'
                      },
                      padding: '4px'
                    }}
                  >
                    <CloseIcon fontSize="small" sx={{ fontSize: 16 }} />
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
                accept="image}
          <MusicSelectDialog
            open={musicSelectOpen}
            onClose={() => setMusicSelectOpen(false)}
            onSelectTracks={handleMusicSelect}
            maxTracks={3}
          />
        </Box>
      </Box>
    </Paper>
  );
};


const MainPage = React.memo(() => {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [trendingBadges, setTrendingBadges] = useState([]);
  const [loadingTrendingBadges, setLoadingTrendingBadges] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [feedType, setFeedType] = useState('all'); 
  const [requestId, setRequestId] = useState(0); 
  const isFirstRender = useRef(true); 
  const feedTypeChanged = useRef(false); 
  const navigate = useNavigate(); 
  
  
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState([]);
  
  
  useEffect(() => {
    if (!isFirstRender.current) return; 
    
    const initialLoad = async () => {
      console.log("INITIAL MOUNT - ONE TIME LOAD");
      try {
        setLoading(true);
        setPosts([]);
        
        const params = {
          page: 1,
          per_page: 20,
          sort: feedType,
          include_all: feedType === 'all'
        };
        
        
        const currentRequestId = requestId + 1;
        setRequestId(currentRequestId);
        
        const response = await axios.get('/api/posts/feed', { params });
        
        
        if (requestId !== currentRequestId - 1) return;
        
        if (response.data && Array.isArray(response.data.posts)) {
          setPosts(response.data.posts);
          setHasMore(response.data.has_next === true);
          setPage(2);
        } else {
          setPosts([]);
          setHasMore(false);
        }
      } catch (error) {
        console.error('Error loading initial posts:', error);
        setPosts([]);
        setHasMore(false);
      } finally {
        setLoading(false);
        isFirstRender.current = false; 
      }
    };
    
    initialLoad();
    
    
  }, []);
  
  
  useEffect(() => {
    
    if (isFirstRender.current) return;
    
    
    feedTypeChanged.current = true;
    
    const loadFeedPosts = async () => {
      console.log(`FEED TYPE CHANGED TO: ${feedType} - LOADING NEW POSTS`);
      try {
        setLoading(true);
        setPosts([]);
        
        const params = {
          page: 1,
          per_page: 20,
          sort: feedType,
          include_all: feedType === 'all'
        };
        
        
        const currentRequestId = requestId + 1;
        setRequestId(currentRequestId);
        
        
        let response;
        try {
          response = await axios.get('/api/posts/feed', { params });
        } catch (apiError) {
          console.error(`Error in API call for ${feedType} feed:`, apiError);
          
          
          if (feedType === 'recommended') {
            
            setHasMore(false);
            setPosts([]);
            setLoading(false);
            feedTypeChanged.current = false;
            return;
          }
          
          
          throw apiError;
        }
        
        
        if (requestId !== currentRequestId - 1) return;
        
        if (response.data && Array.isArray(response.data.posts)) {
          setPosts(response.data.posts);
          setHasMore(response.data.has_next === true);
          setPage(2);
        } else {
          setPosts([]);
          setHasMore(false);
        }
      } catch (error) {
        console.error(`Error loading ${feedType} posts:`, error);
        setPosts([]);
        setHasMore(false);
      } finally {
        setLoading(false);
        feedTypeChanged.current = false; 
      }
    };
    
    loadFeedPosts();
    
    
  }, [feedType]);
  
  
  useEffect(() => {
    
    if (!isFirstRender.current) return;
    
    const fetchRecommendations = async () => {
      try {
        setLoadingRecommendations(true);
        
        
        if (recommendations.length > 0) {
          setLoadingRecommendations(false);
          return;
        }
        
        
        try {
          const response = await axios.get('/api/users/recommendations', { timeout: 5000 });
          if (Array.isArray(response.data)) {
            setRecommendations(response.data || []);
          } else if (response.data && Array.isArray(response.data.users)) {
            setRecommendations(response.data.users || []);
          } else {
            
            console.log('Unexpected response format:', response.data);
            setRecommendations(getFallbackRecommendations());
          }
        } catch (error) {
          console.error('Error fetching user recommendations:', error);
          
          setRecommendations(getFallbackRecommendations());
        }
      } finally {
        setLoadingRecommendations(false);
      }
    };

    fetchRecommendations();
    
  }, []);

  
  useEffect(() => {
    const fetchTrendingBadges = async () => {
      try {
        setLoadingTrendingBadges(true);
        
        const response = await axios.get('/api/badges/trending');
        if (response.data && Array.isArray(response.data.badges)) {
          setTrendingBadges(response.data.badges);
        } else {
          setTrendingBadges([]);
        }
      } catch (error) {
        console.error('Error fetching trending badges:', error);
        setTrendingBadges([]);
      } finally {
        setLoadingTrendingBadges(false);
      }
    };

    fetchTrendingBadges();
  }, []);

  
  const getFallbackRecommendations = () => {
    return [
      {
        id: 'local1',
        name: 'Анна Смирнова',
        username: 'anna_smirnova',
        photo: '/static/uploads/system/user_placeholder.png',
        about: 'UX/UI дизайнер, люблю путешествия и фотографию'
      },
      {
        id: 'local2',
        name: 'Иван Петров',
        username: 'ivan_petrov',
        photo: '/static/uploads/system/user_placeholder.png',
        about: 'Разработчик, любитель музыки и хороших книг'
      },
      {
        id: 'local3',
        name: 'Маргарита К.',
        username: 'rita_k',
        photo: '/static/uploads/system/user_placeholder.png',
        about: 'Фотограф, путешественник, искатель приключений'
      }
    ];
  };

  
  const loadMorePosts = async () => {
    
    if (loading || !hasMore || feedTypeChanged.current) return;
    
    try {
      setLoading(true);
      
      const params = {
        page: page,
        per_page: 20,
        sort: feedType,
        include_all: feedType === 'all'
      };
      
      
      const currentRequestId = requestId + 1;
      setRequestId(currentRequestId);
      
      const response = await axios.get('/api/posts/feed', { params });
      
      
      if (requestId !== currentRequestId - 1) return;
      
      if (response.data && Array.isArray(response.data.posts)) {
        setPosts(prev => [...prev, ...response.data.posts]);
        setHasMore(response.data.has_next === true);
        setPage(page + 1);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more posts:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };
  
  const handleLoadMore = () => {
    loadMorePosts();
  };
  
  const handlePostCreated = (newPost, deletedPostId = null) => {
    
    if (deletedPostId) {
      setPosts(prevPosts => prevPosts.filter(p => p.id !== deletedPostId));
      return;
    }
    
    
    if (!newPost) {
      
      setPosts([]); 
      setPage(1); 
      loadFeedPosts(); 
      return;
    }
    
    
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };
  
  const handleFollow = async (userId, isFollowing) => {
    try {
      await axios.post('/api/profile/follow', { followed_id: userId });
    } catch (error) {
      console.error("Error following user:", error);
      setRecommendations(recommendations.map(rec => 
        rec.id === userId 
          ? { ...rec, isFollowing: !isFollowing } 
          : rec
      ));
    }
  };
  
  const handleOpenLightbox = (image, allImages, index) => {
    setCurrentImage(image);
    setLightboxImages(Array.isArray(allImages) ? allImages : [image]);
    setCurrentImageIndex(index || 0);
    setLightboxOpen(true);
  };
  
  const handleCloseLightbox = () => {
    setLightboxOpen(false);
  };
  
  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => {
      const nextIndex = (prevIndex + 1) % lightboxImages.length;
      setCurrentImage(lightboxImages[nextIndex]);
      return nextIndex;
    });
  };
  
  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) => {
      const nextIndex = (prevIndex - 1 + lightboxImages.length) % lightboxImages.length;
      setCurrentImage(lightboxImages[nextIndex]);
      return nextIndex;
    });
  };
  
  return (
    <Container maxWidth="lg" sx={{ 
      mt: 2, 
      mb: 0,
      px: { xs: 0, sm: 0 },
      width: '100%',
      pb: { xs: '100px', sm: 0 }
    }}>
      <ContentContainer>
        <LeftColumn>
          {}
          <OnlineUsers />
          
          {}
          <CreatePost onPostCreated={handlePostCreated} />
          
          {}
          <Paper sx={{ 
            p: 1, 
            display: 'flex', 
            justifyContent: 'space-between',
            mb: 0
          }}>
            <Button 
              variant={feedType === 'all' ? 'contained' : 'text'} 
              onClick={() => setFeedType('all')}
              sx={{ flex: 1, mx: 0.5 }}
            >
              Все
            </Button>
            <Button 
              variant={feedType === 'following' ? 'contained' : 'text'} 
              onClick={() => setFeedType('following')}
              sx={{ flex: 1, mx: 0.5 }}
            >
              Подписки
            </Button>
            <Button 
              variant={feedType === 'recommended' ? 'contained' : 'text'} 
              onClick={() => setFeedType('recommended')}
              sx={{ flex: 1, mx: 0.5 }}
            >
              Рекомендации
            </Button>
          </Paper>
          
          {}
          <Box sx={{ mt: 0 }}>
            {loading && posts.length === 0 ? (
              
              <>
                {[...Array(5)].map((_, index) => (
                  <PostSkeleton key={index} />
                ))}
              </>
            ) : posts.length > 0 ? (
              <Box sx={{ mt: 0 }}>
                {posts.map((post) => (
                  post.is_repost ? (
                    <RepostItem key={post.id} post={post} />
                  ) : (
                    <Post 
                      key={post.id} 
                      post={post} 
                      showPostDetails={false}
                    />
                  )
                ))}
                
                <Box sx={{ textAlign: 'center', mt: 4, mb: 4 }}>
                  {hasMore ? (
                    <>
                      <Button 
                        variant="outlined" 
                        onClick={handleLoadMore}
                        disabled={loading}
                        sx={{ py: 1, px: 3, borderRadius: 2 }}
                      >
                        {loading ? 'Загрузка...' : 'Загрузить ещё'}
                      </Button>
                      
                      {}
                      {loading && (
                        <Box sx={{ mt: 3 }}>
                          {[...Array(3)].map((_, index) => (
                            <PostSkeleton key={`more-${index}`} />
                          ))}
                        </Box>
                      )}
                    </>
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
                py: 4,
                mt: 2
              }}>
                <Typography color="text.secondary">
                  Нет постов для отображения. Подпишитесь на пользователей, чтобы видеть их публикации в ленте.
                </Typography>
              </Box>
            )}
          </Box>
        </LeftColumn>
        
        <RightColumn>
          {}
          <Box 
            component={Paper} 
            sx={{ 
              p: 2.5, 
              borderRadius: '12px', 
              mb: 0,
              background: '#1d1d1d',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.03)',
              display: { xs: 'none', sm: 'block' } 
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 2, 
                fontWeight: 'medium',
                fontSize: '1.1rem',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                '&::before': {
                  content: '""',
                  display: 'inline-block',
                  width: '4px',
                  height: '18px',
                  backgroundColor: 'primary.main',
                  borderRadius: '2px',
                  marginRight: '10px'
                }
              }}
            >
              Рекомендации
            </Typography>
            
            {loadingRecommendations ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : recommendations.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                Нет рекомендаций
              </Typography>
            ) : (
              <Box>
                {(() => {
                  
                  const filteredRecommendations = recommendations.filter(user => {
                    
                    const hasCustomAvatar = user.photo && 
                      !user.photo.includes('avatar.png') && 
                      !user.photo.includes('user_placeholder');
                    return hasCustomAvatar;
                  });
                  
                  
                  if (filteredRecommendations.length === 0) {
                    return (
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                        Нет рекомендаций
                      </Typography>
                    );
                  }
                  
                  
                  const limitedRecommendations = filteredRecommendations.slice(0, 3);
                  
                  
                  return limitedRecommendations.map(recommendedUser => (
                    <UserRecommendation 
                      key={recommendedUser.id} 
                      user={recommendedUser} 
                    />
                  ));
                })()}
              </Box>
            )}
          </Box>

          {}
          <Box 
            component={Paper} 
            sx={{ 
              p: 2.5, 
              borderRadius: '12px', 
              mb: 2,
              background: '#1d1d1d',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.03)',
              display: { xs: 'none', sm: 'block' } 
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 2, 
                fontWeight: 'medium',
                fontSize: '1.1rem',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                '&::before': {
                  content: '""',
                  display: 'inline-block',
                  width: '4px',
                  height: '18px',
                  backgroundColor: 'primary.main',
                  borderRadius: '2px',
                  marginRight: '10px'
                }
              }}
            >
              В тренде
            </Typography>
            
            {loadingTrendingBadges ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : trendingBadges.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                Нет популярных бейджей
              </Typography>
            ) : (
              <Box>
                {trendingBadges.map(badge => (
                  <Box 
                    key={badge.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 1.5,
                      mb: 1.5,
                      borderRadius: '10px',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      }
                    }}
                    onClick={() => navigate('/badge-shop')}
                  >
                    <Avatar 
                      src={`/static/images/bages/shop/${badge.image_path}`}
                      alt={badge.name}
                      variant="rounded"
                      sx={{ 
                        width: 48, 
                        height: 48, 
                        mr: 2,
                        bgcolor: 'background.paper',
                        padding: '4px'
                      }}
                    />
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" noWrap>
                        {badge.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {badge.description ? badge.description.slice(0, 15) + (badge.description.length > 15 ? '...' : '') : ''}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            bgcolor: 'rgba(255, 255, 255, 0.06)',
                            borderRadius: '12px',
                            px: 1,
                            py: 0.2
                          }}
                        >
                          <Typography variant="caption" sx={{ fontWeight: 'medium', color: '#D0BCFF' }}>
                            {badge.price} баллов
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          Продано: {badge.copies_sold}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </RightColumn>
      </ContentContainer>
      
      {}
      <LightBox 
        isOpen={lightboxOpen}
        onClose={handleCloseLightbox}
        imageSrc={currentImage}
        onNext={lightboxImages.length > 1 ? handleNextImage : undefined}
        onPrev={lightboxImages.length > 1 ? handlePrevImage : undefined}
        totalImages={lightboxImages.length}
        currentIndex={currentImageIndex}
      />
    </Container>
  );
});

export default MainPage; 