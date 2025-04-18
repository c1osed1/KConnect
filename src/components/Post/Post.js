import React, { useState, useContext, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Card,
  CardContent,
  styled,
  AvatarGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Paper,
  Skeleton,
  Alert,
  FormControlLabel,
  Checkbox,
  List,
  ListItem,
  CardActions,
  CardHeader,
  Chip,
  Divider,
  Badge,
  Tooltip,
  Collapse,
  Zoom
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { MusicContext } from '../../context/MusicContext';
import ReactMarkdown from 'react-markdown';
import { formatTimeAgo, getRussianWordForm } from '../../utils/dateUtils';
import LightBox from '../LightBox';
import VideoPlayer from '../VideoPlayer';
import { optimizeImage } from '../../utils/imageUtils';
import { linkRenderers, URL_REGEX, USERNAME_MENTION_REGEX, processTextWithLinks } from '../../utils/LinkUtils';
import { Icon } from '@iconify/react';


import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import RepeatIcon from '@mui/icons-material/Repeat';
import ShareIcon from '@mui/icons-material/Share';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import ThumbUpRoundedIcon from '@mui/icons-material/ThumbUpRounded';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import CommentRoundedIcon from '@mui/icons-material/CommentRounded';
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';
import ImageGrid from './ImageGrid';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import LinkIcon from '@mui/icons-material/Link';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FlagIcon from '@mui/icons-material/Flag';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import EditIcon from '@mui/icons-material/Edit';
import PhotoIcon from '@mui/icons-material/Photo';
import VideocamIcon from '@mui/icons-material/Videocam';


const PostCard = styled(Card)(({ theme }) => ({
  marginBottom: 10,
  borderRadius: '10px',
  overflow: 'hidden',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  background: '#1A1A1A',
  [theme.breakpoints.down('sm')]: {
    boxShadow: 'none',
    marginBottom: 2,
    width: '100%'
  }
}));


const MarkdownContent = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isExpanded'
})(({ theme, isExpanded }) => ({
  '& p': {
    margin: theme.spacing(0.5, 0),
    lineHeight: 1.2,
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
    padding: theme.spacing(0, 0.6),
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
  maxHeight: isExpanded ? 'none' : '450px',
  overflow: isExpanded ? 'visible' : 'hidden',
  position: 'relative',
  transition: 'max-height 0.3s ease',
}));


const BlurredMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    background: 'linear-gradient(135deg, rgb(49 49 49 / 50%) 0%, rgb(62 62 62 / 60%) 100%)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 4px 20px rgba(97, 76, 147, 0.3)',
    borderRadius: '12px',
    '& .MuiMenuItem-root': {
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
      },
    }
  }
}));


const ShowMoreButton = styled(Button)(({ theme }) => ({
  margin: '8px auto 0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(180deg, rgba(26,26,26,0) 0%, rgba(26,26,26,0.8) 30%, rgba(26,26,26,1) 100%)',
  color: theme.palette.primary.main,
  borderRadius: '0 0 10px 10px',
  textTransform: 'none',
  fontWeight: 'normal',
  padding: '8px',
  width: '100%',
  position: 'absolute',
  bottom: 0,
  left: 0,
  '&:hover': {
    background: 'linear-gradient(180deg, rgba(26,26,26,0) 0%, rgba(26,26,26,0.9) 30%, rgba(26,26,26,1) 100%)',
  }
}));


const ActionButton = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'active'
})(({ theme, active, position }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '6px 12px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  backgroundColor: active ? 'rgba(140, 82, 255, 0.08)' : 'transparent',
  position: 'relative',
  zIndex: 2,
  '&:hover': {
    backgroundColor: active ? 'rgba(140, 82, 255, 0.12)' : 'rgba(255, 255, 255, 0.04)',
  },
  borderRadius: position === 'left' ? '20px 0 0 20px' : position === 'right' ? '0 20px 20px 0' : '20px',
  borderRight: position === 'left' ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
}));


const ActionButtonContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  borderRadius: '20px',
  overflow: 'hidden',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  marginRight: theme.spacing(1),
  backgroundColor: 'rgba(40, 40, 50, 0.4)',
  position: 'relative',
  transition: 'all 0.25s ease',
  '&:hover': {
    backgroundColor: 'rgba(50, 50, 60, 0.5)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    '&:after': {
      opacity: 1,
      transform: 'translateX(100%)'
    }
  },
  '&:after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
    opacity: 0,
    transition: 'all 0.5s ease',
    zIndex: 1
  }
}));


const MusicTrack = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1, 1.5),
  borderRadius: '12px',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  marginBottom: theme.spacing(0.3),
  border: '1px solid rgba(255, 255, 255, 0.07)',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)'
  }
}));




const SharePill = styled(motion.div)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '6px 14px',
  backgroundColor: 'rgba(40, 40, 50, 0.4)',
  borderRadius: '20px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  cursor: 'pointer',
  marginLeft: theme.spacing(1),
  transition: 'all 0.25s ease',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    backgroundColor: 'rgba(50, 50, 60, 0.5)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    '&:after': {
      opacity: 1,
      transform: 'translateX(100%)'
    }
  },
  '&:after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
    opacity: 0,
    transition: 'all 0.5s ease',
    zIndex: 1
  }
}));


const CommentPill = styled(motion.div)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '6px 14px',
  backgroundColor: 'rgba(40, 40, 50, 0.4)',
  borderRadius: '20px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  cursor: 'pointer',
  marginLeft: theme.spacing(1),
  transition: 'all 0.25s ease',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    backgroundColor: 'rgba(50, 50, 60, 0.5)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    '&:after': {
      opacity: 1,
      transform: 'translateX(100%)'
    }
  },
  '&:after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
    opacity: 0,
    transition: 'all 0.5s ease',
    zIndex: 1
  }
}));


const LikePill = styled(motion.div)(({ theme, active }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '6px 14px',
  backgroundColor: active ? 'rgba(140, 82, 255, 0.08)' : 'rgba(40, 40, 50, 0.4)',
  borderRadius: '20px',
  border: active ? '1px solid rgba(140, 82, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)',
  cursor: 'pointer',
  marginRight: theme.spacing(1),
  transition: 'all 0.25s ease',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    backgroundColor: active ? 'rgba(140, 82, 255, 0.12)' : 'rgba(50, 50, 60, 0.5)',
    transform: 'translateY(-2px)',
    boxShadow: active ? '0 4px 12px rgba(140, 82, 255, 0.2)' : '0 4px 12px rgba(0, 0, 0, 0.2)',
    '&:after': {
      opacity: 1,
      transform: 'translateX(100%)'
    }
  },
  '&:after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
    opacity: 0,
    transition: 'all 0.5s ease',
    zIndex: 1
  }
}));


const ActionsPill = styled(motion.div)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  borderRadius: '20px',
  overflow: 'hidden',
  backgroundColor: 'rgba(40, 40, 50, 0.4)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  marginRight: theme.spacing(1),
  position: 'relative',
  transition: 'all 0.25s ease',
  '&:hover': {
    backgroundColor: 'rgba(50, 50, 60, 0.5)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    '&:after': {
      opacity: 1,
      transform: 'translateX(100%)'
    }
  },
  '&:after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
    opacity: 0,
    transition: 'all 0.5s ease',
    zIndex: 1
  }
}));


const ActionItem = styled(Box)(({ theme, active, isLike }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '6px 14px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  backgroundColor: active && isLike ? 'rgba(140, 82, 255, 0.08)' : 'transparent',
  position: 'relative',
  zIndex: 2,
  '&:hover': {
    backgroundColor: active && isLike ? 'rgba(140, 82, 255, 0.12)' : 'rgba(255, 255, 255, 0.04)',
  },
  borderRight: isLike ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
}));

const Post = ({ post, onDelete, onOpenLightbox }) => {
  
  if (!post || typeof post !== 'object') {
    console.error('Post component received invalid post data:', post);
    return null;
  }
  
  const navigate = useNavigate();
  const [liked, setLiked] = useState(post?.user_liked || post?.is_liked || false);
  const [likesCount, setLikesCount] = useState(post?.likes_count || 0);
  const [viewsCount, setViewsCount] = useState(post?.views_count || 0);
  const { user: currentUser } = useContext(AuthContext);
  const { playTrack, currentTrack, isPlaying, togglePlay } = useContext(MusicContext);
  const isCurrentUserPost = currentUser && post?.user && currentUser.id === post.user.id;
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const menuOpen = Boolean(menuAnchorEl);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("Ссылка скопирована в буфер обмена");
  const [lastLikedUsers, setLastLikedUsers] = useState([]);
  
  
  const [musicTracks, setMusicTracks] = useState([]);
  
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsExpandButton, setNeedsExpandButton] = useState(false);
  const contentRef = useRef(null);
  
  
  const [repostModalOpen, setRepostModalOpen] = useState(false);
  const [repostText, setRepostText] = useState('');
  const [isReposting, setIsReposting] = useState(false);
  
  
  const [processedContent, setProcessedContent] = useState('');
  
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error'
  });
  
  
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    deleting: false,
    deleted: false
  });
  
  
  const [reportDialog, setReportDialog] = useState({
    open: false,
    reason: '',
    submitting: false,
    submitted: false,
    error: null
  });
  
  
  const [editDialog, setEditDialog] = useState({
    open: false,
    content: post?.content || '',
    submitting: false,
    deleteImages: false,
    deleteVideo: false,
    deleteMusic: false,
    newImages: [],
    newVideo: null,
    previews: [],
    error: null
  });
  
  
  const reportReasons = [
    "Спам",
    "Оскорбления",
    "Неприемлемый контент",
    "Нарушение правил",
    "Дезинформация",
    "Вредоносный контент",
    "Другое"
  ];
  
  
  useEffect(() => {
    if (post) {
      setLiked(post.user_liked || post.is_liked || false);
      setLikesCount(post.likes_count || 0);
      setViewsCount(post.views_count || 0);
      
      
      setIsExpanded(false);
      
      
      setEditDialog(prev => ({
        ...prev,
        content: post.content || ''
      }));
      
      
      if (post.content) {
        
        let content = post.content;
        
        USERNAME_MENTION_REGEX.lastIndex = 0;
        
        
        content = content.replace(USERNAME_MENTION_REGEX, (match, username) => {
          return `[${match}](/profile/${username})`;
        });
        
        setProcessedContent(content);
      } else {
        setProcessedContent('');
      }
      
      
      if (post.id && post.likes_count > 0) {
        
        const postLikesCache = window._postLikesCache || {};
        const cachedData = postLikesCache[post.id];
        const now = Date.now();
        
        if (cachedData && cachedData.timestamp && (now - cachedData.timestamp < 5 * 60 * 1000)) {
          
          console.log(`Using cached likes data for post ${post.id} (from useEffect)`);
          setLastLikedUsers(cachedData.users);
        } else {
          
          fetchLastLikedUsers(post.id);
        }
      }
      
      
      try {
        if (post.music) {
          console.log('Processing music data:', post.music);
          let parsedTracks;
          
          if (typeof post.music === 'string') {
            try {
              parsedTracks = JSON.parse(post.music);
            } catch (parseError) {
              console.error('Failed to parse music JSON:', parseError);
              parsedTracks = [];
            }
          } else if (Array.isArray(post.music)) {
            parsedTracks = post.music;
          } else {
            parsedTracks = [];
          }
          
          console.log('Parsed music tracks:', parsedTracks);
          setMusicTracks(Array.isArray(parsedTracks) ? parsedTracks : []);
        } else {
          setMusicTracks([]);
        }
      } catch (musicError) {
        console.error('Error processing music data:', musicError);
        setMusicTracks([]);
      }
    }
  }, [post]);
  
  
  const getCoverPath = (track) => {
    if (!track || !track.cover_path) {
      return '/uploads/system/album_placeholder.jpg';
    }
    
    
    if (track.cover_path.startsWith('/static/')) {
      return track.cover_path;
    }
    
    
    if (track.cover_path.startsWith('static/')) {
      return `/${track.cover_path}`;
    }
    
    
    if (track.cover_path.startsWith('http')) {
      return track.cover_path;
    }
    
    
    return `/static/music/${track.cover_path}`;
  };
  
  
  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  
  const handleTrackPlay = (track, event) => {
    if (event) event.stopPropagation(); 
    
    
    const isCurrentlyPlaying = currentTrack && currentTrack.id === track.id;
    
    if (isCurrentlyPlaying) {
      
      togglePlay();
    } else {
      
      playTrack(track, 'post');
    }
  };
  
  
  useEffect(() => {
    
    const checkHeight = () => {
      if (contentRef.current) {
        const contentHeight = contentRef.current.scrollHeight;
        setNeedsExpandButton(contentHeight > 450);
      }
    };
    
    
    const timeoutId = setTimeout(() => {
      checkHeight();
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [post?.content]);

  
  const fetchLastLikedUsers = async (postId) => {
    try {
      
      if (window._globalLastLikesFetch && Date.now() - window._globalLastLikesFetch < 3000) {
        console.log(`Global likes fetch rate limit in effect, skipping fetch for post ${postId}`);
        return;
      }
      
      
      if (!window._postLikesCache) {
        window._postLikesCache = {};
      }
      
      
      const now = Date.now();
      if (
        window._postLikesCache[postId] && 
        window._postLikesCache[postId].timestamp &&
        now - window._postLikesCache[postId].timestamp < 5 * 60 * 1000
      ) {
        console.log(`Using cached likes data for post ${postId}`);
        setLastLikedUsers(window._postLikesCache[postId].users);
        return;
      }
      
      
      if (window._postLikesFetching && window._postLikesFetching[postId]) {
        console.log(`Likes fetch already in progress for post ${postId}`);
        return;
      }
      
      
      if (!window._postLikesFetching) {
        window._postLikesFetching = {};
      }
      window._postLikesFetching[postId] = true;
      window._globalLastLikesFetch = now; 
      
      const response = await axios.get(`/api/posts/${postId}/likes?limit=3`);
      if (response.data && Array.isArray(response.data.users)) {
        console.log(`Received like data for post ${postId}:`, response.data.users);
        
        
        window._postLikesCache[postId] = {
          users: response.data.users,
          timestamp: now
        };
        
        setLastLikedUsers(response.data.users);
      }
    } catch (error) {
      console.error('Error fetching liked users:', error);
    } finally {
      
      if (window._postLikesFetching) {
        window._postLikesFetching[postId] = false;
      }
    }
  };

  
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  
  const processImages = () => {
    
    if (post?.images && Array.isArray(post.images) && post.images.length > 0) {
      return post.images;
    }
    
    
    if (post?.image && typeof post.image === 'string') {
      if (post.image.includes('||') || post.image.includes(',')) {
        
        return post.image.split(/[||,]/).map(url => url.trim()).filter(Boolean);
      }
      
      return [post.image];
    }
    
    return [];
  };
  
  
  const hasVideo = () => {
    return post?.video && typeof post.video === 'string' && post.video.trim() !== '';
  };
  
  
  const formatVideoUrl = (url) => {
    if (!url) return '';
    
    
    if (url.startsWith('http') || url.startsWith('
      return url;
    }
    
    
    if (url.startsWith('/static/uploads/post/')) {
      return url;
    }
    
    
    return `/static/uploads/post/${post.id}/${url}`;
  };
  
  const images = processImages();
  const videoUrl = hasVideo() ? formatVideoUrl(post.video) : null;
  
  
  const handleOpenImage = async (index) => {
    const allImages = processImages();
    if (allImages.length > 0) {
      try {
        
        const currentImageUrl = allImages[index];
        const optimizedImage = await optimizeImage(currentImageUrl, {
          quality: 0.9, 
          maxWidth: 1920 
        });
        
        setCurrentImageIndex(index);
        
        setLightboxOpen(true);
      } catch (error) {
        console.error('Error optimizing image for lightbox:', error);
        
        setCurrentImageIndex(index);
        setLightboxOpen(true);
      }
    }
  };
  
  
  const handleCloseLightbox = () => {
    setLightboxOpen(false);
  };
  
  
  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };
  
  
  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };
  
  const handleLike = async (e) => {
    e.stopPropagation();
    
    
    const wasLiked = liked;
    const prevCount = likesCount;
    
    try {
      
      setLiked(!wasLiked);
      setLikesCount(wasLiked ? Math.max(0, prevCount - 1) : prevCount + 1);
      
      
      const response = await axios.post(`/api/posts/${post.id}/like`);
      if (response.data) {
        
        setLiked(response.data.liked);
        setLikesCount(response.data.likes_count);
      }
    } catch (error) {
      console.error('Error liking post:', error);
      
      setLiked(wasLiked);
      setLikesCount(prevCount);
      
      
      if (error.response && error.response.status === 429) {
        const rateLimit = error.response.data.rate_limit;
        let errorMessage = error.response.data.error || "Слишком много лайков. ";
        
        if (rateLimit && rateLimit.reset) {
          
          const resetTime = new Date(rateLimit.reset * 1000);
          const now = new Date();
          const diffSeconds = Math.round((resetTime - now) / 1000);
          
          if (!errorMessage.includes("подождите")) {
            if (diffSeconds > 60) {
              const minutes = Math.floor(diffSeconds / 60);
              const seconds = diffSeconds % 60;
              errorMessage += ` Пожалуйста, подождите ${minutes} мин. ${seconds} сек.`;
            } else {
              errorMessage += ` Пожалуйста, подождите ${diffSeconds} сек.`;
            }
          }
        }
        
        
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'warning'
        });
      }
    }
  };

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  
  const handleDelete = () => {
    handleMenuClose();
    setDeleteDialog({ ...deleteDialog, open: true });
  };

  
  const handleEdit = () => {
    handleMenuClose();
    
    if (!isPostEditable()) {
      setSnackbar({
        open: true,
        message: "Редактирование доступно только в течение 3 часов после публикации",
        severity: 'warning'
      });
      return;
    }
    
    setEditDialog({
      ...editDialog,
      open: true,
      content: post.content || '',
      deleteImages: false,
      deleteVideo: false,
      deleteMusic: false,
      newImages: [],
      newVideo: null,
      previews: [],
      error: null
    });
  };

  
  const handleCloseEditDialog = () => {
    setEditDialog({
      ...editDialog,
      open: false,
      error: null,
      previews: []
    });
  };

  
  const handleEditContentChange = (e) => {
    setEditDialog({
      ...editDialog,
      content: e.target.value
    });
  };

  
  const handleEditImageSelect = (e) => {
    const files = Array.from(e.target.files);
    
    
    const fileObjects = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setEditDialog({
      ...editDialog,
      newImages: [...editDialog.newImages, ...files],
      previews: [...editDialog.previews, ...fileObjects.map(fo => fo.preview)]
    });
  };

  
  const handleEditVideoSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      setEditDialog({
        ...editDialog,
        newVideo: file
      });
    }
  };

  
  const handleToggleDeleteImages = () => {
    setEditDialog({
      ...editDialog,
      deleteImages: !editDialog.deleteImages
    });
  };

  
  const handleToggleDeleteVideo = () => {
    setEditDialog({
      ...editDialog,
      deleteVideo: !editDialog.deleteVideo
    });
  };

  
  const handleToggleDeleteMusic = () => {
    setEditDialog({
      ...editDialog,
      deleteMusic: !editDialog.deleteMusic
    });
  };

  
  const handleSubmitEdit = async () => {
    try {
      
      if (!isPostEditable()) {
        setEditDialog({ 
          ...editDialog, 
          error: "Время редактирования истекло. Посты можно редактировать только в течение 3 часов после публикации." 
        });
        return;
      }

      setEditDialog({ ...editDialog, submitting: true, error: null });
      
      
      const formData = new FormData();
      formData.append('content', editDialog.content);
      
      
      formData.append('delete_images', editDialog.deleteImages);
      formData.append('delete_video', editDialog.deleteVideo);
      formData.append('delete_music', editDialog.deleteMusic);
      
      
      editDialog.newImages.forEach((image, index) => {
        formData.append(`images[${index}]`, image);
      });
      
      
      if (editDialog.newVideo) {
        formData.append('video', editDialog.newVideo);
      }
      
      
      const response = await axios.post(`/api/posts/${post.id}/edit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        
        const updatedPost = response.data.post;
        
        
        if (onDelete) {
          
          onDelete(post.id, updatedPost);
        } else {
          
          window.location.reload();
        }
        
        
        setEditDialog({
          open: false,
          content: '',
          submitting: false,
          deleteImages: false,
          deleteVideo: false,
          deleteMusic: false,
          newImages: [],
          newVideo: null,
          previews: [],
          error: null
        });
        
        
        setSnackbar({
          open: true,
          message: "Пост успешно обновлен",
          severity: 'success'
        });
      } else {
        throw new Error(response.data.error || 'Ошибка при обновлении поста');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      setEditDialog({
        ...editDialog,
        submitting: false,
        error: error.response?.data?.error || error.message || 'Ошибка при обновлении поста'
      });
    }
  };

  
  const confirmDelete = async () => {
    try {
      
      setDeleteDialog({ ...deleteDialog, deleting: true });
      
      
      if (onDelete) {
        onDelete(post.id);
      }
      
      
      setDeleteDialog({ open: true, deleting: false, deleted: true });
      
      
      const response = await axios.delete(`/api/posts/${post.id}`);
      
      
      setTimeout(() => {
        setDeleteDialog({ open: false, deleting: false, deleted: true });
      }, 1500);
      
    } catch (error) {
      console.error('Error deleting post:', error);
      
      setDeleteDialog({ open: true, deleting: false, deleted: false });
      
      
      setSnackbar({
        open: true,
        message: "Не удалось удалить пост. Попробуйте позже.",
        severity: 'error'
      });
    }
  };
  
  const handleRepostClick = (e) => {
    e.stopPropagation();
    if (!currentUser) {
      
      navigate('/login');
      return;
    }
    
    setRepostText('');
    setRepostModalOpen(true);
  };
  
  
  const handleOpenRepostModal = (e) => {
    e.stopPropagation();
    setRepostModalOpen(true);
  };
  
  const handleCloseRepostModal = () => {
    setRepostModalOpen(false);
  };
  
  
  const renderRepostInputWithMentions = () => {
    
    if (!repostText) return null;
    
    
    const parts = [];
    let lastIndex = 0;
    
    
    USERNAME_MENTION_REGEX.lastIndex = 0;
    
    
    let match;
    while ((match = USERNAME_MENTION_REGEX.exec(repostText)) !== null) {
      
      if (match.index > lastIndex) {
        parts.push(<span key={`text-${lastIndex}`}>{repostText.substring(lastIndex, match.index)}</span>);
      }
      
      
      parts.push(
        <span 
          key={`mention-${match.index}`}
          style={{ 
            color: '#7B68EE', 
            fontWeight: 'bold',
            background: 'rgba(123, 104, 238, 0.08)',
            padding: '0 4px',
            borderRadius: '4px'
          }}
        >
          {match[0]}
        </span>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    
    if (lastIndex < repostText.length) {
      parts.push(<span key={`text-end`}>{repostText.substring(lastIndex)}</span>);
    }
    
    return (
      <Box sx={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        padding: '16.5px 14px',
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: '0.95rem',
        pointerEvents: 'none', 
        overflow: 'hidden',
        display: 'flex',
        flexWrap: 'wrap',
        alignContent: 'flex-start'
      }}>
        {parts}
      </Box>
    );
  };
  
  
  const handleCreateRepost = async () => {
    
    if (isReposting) return;
    
    try {
      setIsReposting(true);
      
      const response = await axios.post(`/api/posts/${post.id}/repost`, {
        text: repostText
      });
      
      
      if (response.data.success) {
        
        setSnackbarMessage('Пост успешно добавлен в вашу ленту');
        setSnackbarOpen(true);
        
        
        setRepostModalOpen(false);
        setRepostText('');
      } else {
        
        setSnackbarMessage(response.data.error || 'Произошла ошибка при репосте');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error creating repost:', error);
      
      setSnackbarMessage(
        error.response?.data?.error || 'Произошла ошибка при репосте'
      );
      setSnackbarOpen(true);
    } finally {
      setIsReposting(false);
    }}

  
  const handleCommentClick = (e) => {
    e.stopPropagation();
    navigate(`/post/${post.id}`);
  };
  
  
  const handleShare = (e) => {
    e.stopPropagation();
    const postUrl = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(postUrl)
      .then(() => {
        setSnackbarMessage("Ссылка скопирована в буфер обмена");
        setSnackbarOpen(true);
      })
      .catch(err => {
        console.error('Не удалось скопировать ссылку:', err);
        setSnackbarMessage("Не удалось скопировать ссылку");
        setSnackbarOpen(true);
      });
  };

  
  const toggleExpanded = (e) => {
    e.stopPropagation(); 
    setIsExpanded(!isExpanded);
  };

  
  useEffect(() => {
    if (post && post.id) {
      console.log(`Post ${post.id} music data:`, post.music);
    }
  }, [post]);
  
  
  useEffect(() => {
    if (musicTracks.length > 0) {
      console.log(`Rendering post ${post.id} with ${musicTracks.length} music tracks:`, musicTracks);
    }
  }, [musicTracks, post.id]);

  
  const getOptimizedImageUrl = (url) => {
    if (!url) return '/static/uploads/avatar/system/avatar.png';
    
    
    if (url.includes('format=webp')) {
      return url;
    }
    
    
    const supportsWebP = 'imageRendering' in document.documentElement.style;
    
    
    if (supportsWebP && (url.startsWith('/static/') || url.startsWith('/uploads/'))) {
      return `${url}${url.includes('?') ? '&' : '?'}format=webp`;
    }
    
    return url;
  };

  
  const isPostEditable = () => {
    if (!post?.timestamp) return false;
    
    const postTime = new Date(post.timestamp);
    const currentTime = new Date();
    const timeDifference = (currentTime - postTime) / (1000 * 60 * 60); 
    
    return timeDifference <= 3;
  };

  
  const incrementViewCount = async () => {
    
    if (post && post.id) {
      try {
        
        const viewKey = `post_viewed_${post.id}`;
        if (sessionStorage.getItem(viewKey)) {
          return;
        }

        
        sessionStorage.setItem(viewKey, 'true');

        
        const attemptViewCount = async (retries = 3) => {
          try {
            
            const response = await axios.post(`/api/posts/${post.id}/view`);
            if (response.data && response.data.success) {
              
              setViewsCount(response.data.views_count);
            }
          } catch (error) {
            console.error(`Error incrementing view count (attempt ${4-retries}/3):`, error);
            
            if (retries > 1) {
              setTimeout(() => attemptViewCount(retries - 1), 1000); 
            }
          }
        };

        
        attemptViewCount();
      } catch (error) {
        console.error('Error incrementing view count:', error);
      }
    }
  };

  
  const postRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          
          incrementViewCount();
          
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.5 } 
    );

    
    if (postRef.current) {
      observer.observe(postRef.current);
    }

    return () => {
      
      if (postRef.current) {
        observer.unobserve(postRef.current);
      }
    };
  }, [post?.id]); 

  
  const handleReportSubmit = async () => {
    if (!reportDialog.reason) {
      setReportDialog({...reportDialog, error: "Пожалуйста, выберите причину жалобы"});
      return;
    }
    
    setReportDialog({...reportDialog, submitting: true, error: null});
    
    try {
      
      
      const reportMessage = `🚨 *ЖАЛОБА НА ПОСТ*\n\n` +
        `📝 *ID поста*: ${post.id}\n` +
        `👤 *Автор*: ${post.user?.name} (@${post.user?.username})\n` +
        `🚩 *Причина*: ${reportDialog.reason}\n` +
        `👮 *Отправитель*: ${currentUser?.name} (@${currentUser?.username})\n` +
        `⏰ *Время*: ${new Date().toLocaleString()}` +
        (post.content ? `\n\n📄 *Текст поста*:\n${post.content?.substring(0, 300)}${post.content?.length > 300 ? '...' : ''}` : `\n\n📄 *Пост содержит медиа-контент без текста*`);
      
      
      const response = await axios.post('/api/report/send-to-telegram', {
        message: reportMessage,
        post_id: post.id,
        reason: reportDialog.reason,
        post_author: post.user?.username,
        reporter: currentUser?.username
      });
      
      if (response.data && response.data.success) {
        setReportDialog({...reportDialog, submitting: false, submitted: true});
        
        setTimeout(() => {
          setReportDialog({open: false, reason: '', submitting: false, submitted: false, error: null});
        }, 2000);
      } else {
        throw new Error(response.data?.error || "Ошибка при отправке жалобы");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      setReportDialog({
        ...reportDialog, 
        submitting: false, 
        error: error.response?.data?.error || "Не удалось отправить жалобу. Попробуйте позже."
      });
    }
  };
  
  
  const handleReportClick = () => {
    handleMenuClose();
    setReportDialog({...reportDialog, open: true});
  };

  
  return (
    <React.Fragment>
      <PostCard 
        ref={postRef}
        sx={{ mb: 0.5 }}
      >
        <CardContent sx={{ p: { xs: 1.5, sm: 3 } }}>
          {}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar 
              src={post.user ? getOptimizedImageUrl(post.user?.avatar_url || `/static/uploads/avatar/${post.user?.id}/${post.user?.photo}`) : '/static/uploads/avatar/system/avatar.png'} 
              alt={post.user?.name || 'User'}
              component={Link}
              to={`/profile/${post.user?.username || 'unknown'}`}
              onClick={(e) => e.stopPropagation()}
              sx={{ 
                width: 40, 
                height: 40,
                mr: 1.5,
                border: '2px solid #D0BCFF'
              }}
            />
            <Box sx={{ flex: 1 , whiteSpace: 'nowrap' }}>
              <Typography 
                variant="subtitle1"
                component={Link}
                to={`/profile/${post.user?.username}`}
                onClick={(e) => e.stopPropagation()}
                sx={{ 
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  color: 'text.primary',
                  '&:hover': {
                    color: 'primary.main'
                  },
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {post.user?.name}
                {post.user?.verification && post.user?.verification.status > 0 && (
                  <CheckCircleIcon 
                    sx={{ 
                      color: post.user.verification.status === 1 ? '#9e9e9e' : 
                             post.user.verification.status === 2 ? '#d67270' : 
                             post.user.verification.status === 3 ? '#b39ddb' :
                             post.user.verification.status === 4 ? '#ff9800' : 
                             post.user.verification.status === 5 ? '#4caf50' :
                             'primary.main',
                      ml: 0.5,
                      width: 20,
                      height: 20
                    }} 
                  />
                )}
                {post.user?.achievement && (
                  <Box 
                    component="img" 
                    sx={{ 
                      width: 'auto', 
                      height: 20,  
                      ml: 0.5
                    }} 
                    src={`/static/images/bages/${post.user.achievement.image_path}`} 
                    alt={post.user.achievement.bage}
                    onError={(e) => {
                      console.error("Achievement badge failed to load:", e);
                      if (e.target && e.target instanceof HTMLImageElement) {
                        e.target.style.display = 'none';
                      }
                    }}
                  />
                )}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.75rem' }}>
                {formatTimeAgo(post.timestamp)}
              </Typography>
            </Box>
            
            {}
            <IconButton 
              size="small"
              aria-label="Действия с постом"
              onClick={handleMenuOpen}
              sx={{ 
                p: 0.5, 
                bgcolor: 'rgba(255, 255, 255, 0.05)', 
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <Icon icon="solar:menu-dots-bold" width="20" height="20" />
            </IconButton>
            <BlurredMenu
              anchorEl={menuAnchorEl}
              open={menuOpen}
              onClose={handleMenuClose}
              onClick={(e) => e.stopPropagation()}
              PaperProps={{
                sx: {
                  bgcolor: '#1E1E1E',
                  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
                  mt: 1
                }
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              {}
              {isCurrentUserPost && (
                <MenuItem onClick={handleDelete} sx={{ color: '#f44336' }}>
                  <ListItemIcon>
                    <DeleteIcon fontSize="small" sx={{ color: '#f44336' }} />
                  </ListItemIcon>
                  <ListItemText primary="Удалить" />
                </MenuItem>
              )}
              
              {}
              {isCurrentUserPost && (
                <MenuItem onClick={handleEdit} sx={{ color: '#2196f3' }}>
                  <ListItemIcon>
                    <EditIcon fontSize="small" sx={{ color: '#2196f3' }} />
                  </ListItemIcon>
                  <ListItemText primary="Изменить" />
                </MenuItem>
              )}
              
              {}
              {!isCurrentUserPost && (
                <MenuItem onClick={handleReportClick} sx={{ color: '#ff9800' }}>
                  <ListItemIcon>
                    <FlagIcon fontSize="small" sx={{ color: '#ff9800' }} />
                  </ListItemIcon>
                  <ListItemText primary="Пожаловаться" />
                </MenuItem>
              )}
            </BlurredMenu>
          </Box>

          <Box sx={{ position: 'relative' }}>
            <MarkdownContent 
              ref={contentRef}
              isExpanded={isExpanded}
              sx={{ 
                mb: 2, 
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
              }}
            >
              {}
              {processedContent && (
                <ReactMarkdown 
                  components={linkRenderers}
                  skipHtml={false}
                  transformLinkUri={null} 
                  remarkPlugins={[]}
                  rehypePlugins={[]}
                >
                  {processedContent}
                </ReactMarkdown>
              )}
            </MarkdownContent>
            
            {needsExpandButton && !isExpanded && (
              <ShowMoreButton onClick={toggleExpanded}>
                <Typography variant="body2" sx={{ mr: 1 }}>
                  Показать полностью
                </Typography>
                <Icon icon="solar:alt-arrow-down-bold" width="20" height="20" />
              </ShowMoreButton>
            )}
            
            {isExpanded && (
              <Button
                variant="text"
                size="small"
                onClick={toggleExpanded}
                startIcon={<Icon icon="solar:alt-arrow-up-bold" width="20" height="20" />}
                sx={{ 
                  display: 'flex',
                  mt: 1,
                  color: 'primary.main',
                  textTransform: 'none'
                }}
              >
                Свернуть
              </Button>
            )}
          </Box>
          
          {}
          {videoUrl && (
            <Box sx={{ mb: 2 }}>
              <VideoPlayer 
                videoUrl={videoUrl} 
                poster={images.length > 0 ? formatVideoUrl(images[0]) : undefined}
              />
            </Box>
          )}
          
          {}
          {images.length > 0 && (
            <Box sx={{ px: { xs: 1.5, sm: 2 }, mb: 2 }}>
              <ImageGrid 
                images={images} 
                onImageClick={(index) => handleOpenImage(index)}
              />
            </Box>
          )}
          
          {}
          {musicTracks.length > 0 && (
            <Box sx={{ mt: 0, mb: 0 }}>
              {musicTracks.map((track, index) => (
                <MusicTrack key={`track-${index}`} onClick={(e) => handleTrackPlay(track, e)}>
                  <Box 
                    sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '8px', 
                      overflow: 'hidden', 
                      position: 'relative',
                      mr: 2,
                      flexShrink: 0,
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.15)',
                      bgcolor: 'rgba(0, 0, 0, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <img 
                      src={getCoverPath(track)} 
                      alt={track.title} 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover' 
                      }}
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
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {currentTrack && currentTrack.id === track.id && isPlaying ? (
                        <PauseIcon sx={{ color: 'white', fontSize: 18, filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))' }} />
                      ) : (
                        <PlayArrowIcon sx={{ color: 'white', fontSize: 18, filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))' }} />
                      )}
                    </Box>
                  </Box>
                  
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" noWrap sx={{ 
                      fontWeight: currentTrack && currentTrack.id === track.id ? 'medium' : 'normal',
                      color: currentTrack && currentTrack.id === track.id ? 'primary.main' : 'text.primary',
                      fontSize: '0.85rem'
                    }}>
                      {track.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {track.artist}
                    </Typography>
                  </Box>
                  
                  <Typography variant="caption" color="text.secondary" sx={{ 
                    py: 0.4,
                    px: 1,
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    fontSize: '0.7rem',
                    ml: 1
                  }}>
                    {formatDuration(track.duration)}
                  </Typography>
                </MusicTrack>
              ))}
            </Box>
          )}
          
          {}
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, px: 1, justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {}
              <ActionsPill whileTap={{ scale: 0.98 }}>
                {}
                <ActionItem 
                  onClick={handleLike} 
                  active={liked}
                  isLike={true}
                >
                  {liked ? (
                    <FavoriteIcon 
                      sx={{ 
                        color: 'primary.main',
                        position: 'relative', 
                        zIndex: 2,
                        fontSize: { xs: 16, sm: 19 }
                      }}
                    />
                  ) : (
                    <FavoriteBorderIcon 
                      sx={{ 
                        color: 'text.secondary',
                        position: 'relative',
                        zIndex: 2,
                        fontSize: { xs: 16, sm: 19 }
                      }}
                    />
                  )}
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', ml: 0.5, position: 'relative', zIndex: 2 }}>
                    {lastLikedUsers.length > 0 && (
                      <AvatarGroup 
                        max={3}
                        sx={{ 
                          mr: 0.5,
                          '& .MuiAvatar-root': { 
                            width: 18, 
                            height: 18, 
                            fontSize: '0.65rem',
                            border: '1px solid #1A1A1A'
                          } 
                        }}
                      >
                        {lastLikedUsers.map(user => {
                          
                          let avatarUrl = user.avatar || user.photo || '';
                          
                          
                          if (avatarUrl && !avatarUrl.startsWith('/') && !avatarUrl.startsWith('http')) {
                            avatarUrl = `/static/uploads/avatar/${user.id}/${avatarUrl}`;
                          }
                          
                          
                          if (avatarUrl && !avatarUrl.includes('format=webp') && 'imageRendering' in document.documentElement.style) {
                            
                            if (avatarUrl.startsWith('/static/')) {
                              avatarUrl = `${avatarUrl}${avatarUrl.includes('?') ? '&' : '?'}format=webp`;
                            }
                          }
                          
                          return (
                            <Avatar 
                              key={user.id} 
                              src={avatarUrl}
                              alt={user.name}
                              sx={{ width: 18, height: 18 }}
                              onError={(e) => {
                                console.log(`Error loading avatar for user ${user.id}`);
                                e.target.onerror = null; 
                                e.target.src = `/static/uploads/avatar/system/avatar.png`;
                              }}
                            >
                              {user.name ? user.name[0] : '?'}
                            </Avatar>
                          );
                        })}
                      </AvatarGroup>
                    )}
                    {likesCount > 0 && (
                      <Typography 
                        variant="body2" 
                        color={liked ? 'primary' : 'text.secondary'}
                      >
                        {likesCount}
                      </Typography>
                    )}
                  </Box>
                </ActionItem>
                
                {}
                <ActionItem
                  onClick={handleCommentClick}
                  isLike={false}
                >
                  {post?.total_comments_count > 0 || post?.comments_count > 0 ? (
                    <ChatBubbleIcon 
                      sx={{ 
                        color: 'text.secondary',
                        position: 'relative', 
                        zIndex: 2,
                        fontSize: { xs: 16, sm: 19 }
                      }}
                    />
                  ) : (
                    <ChatBubbleOutlineIcon 
                      sx={{ 
                        color: 'text.secondary',
                        position: 'relative',
                        zIndex: 2,
                        fontSize: { xs: 16, sm: 19 }
                      }}
                    />
                  )}
                  {(post?.total_comments_count > 0 || post?.comments_count > 0) && (
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        ml: 0.5,
                        position: 'relative',
                        zIndex: 2
                      }}
                    >
                      {post?.total_comments_count || post?.comments_count}
                    </Typography>
                  )}
                </ActionItem>
              </ActionsPill>
              
              {}
              <SharePill 
                onClick={handleShare}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ShareRoundedIcon sx={{ 
                  fontSize: { xs: 16, sm: 19 },
                  color: 'text.secondary',
                  position: 'relative',
                  zIndex: 2
                }} />
              </SharePill>
            </Box>
            
            {}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                ml: 'auto',
                color: 'text.secondary',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '16px',
                padding: '3px 8px',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}
              title="Количество просмотров"
            >
              <VisibilityIcon sx={{ fontSize: '0.9rem', mr: 0.5, opacity: 0.7 }} />
              <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                {viewsCount}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </PostCard>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
      
      {}
      <Dialog
        open={repostModalOpen}
        onClose={handleCloseRepostModal}
        onClick={(e) => e.stopPropagation()}
        PaperProps={{
          sx: {
            bgcolor: 'rgba(32, 32, 36, 0.8)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
            width: '100%',
            maxWidth: '500px',
            borderRadius: '16px',
            border: '1px solid rgba(100, 90, 140, 0.1)',
            '&:before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: '16px',
              background: 'linear-gradient(145deg, rgba(30, 30, 30, 0.6), rgba(20, 20, 20, 0.75))',
              backdropFilter: 'blur(30px)',
              zIndex: -1
            }
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid rgba(100, 90, 140, 0.1)',
          px: 3,
          py: 2,
          color: 'white',
          fontWeight: 500,
          fontSize: '1.1rem',
          display: 'flex',
          alignItems: 'center',
          '&:before': {
            content: '""',
            display: 'inline-block',
            width: '18px',
            height: '18px',
            marginRight: '10px',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http:
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat'
          }
        }}>
          Поделиться постом
        </DialogTitle>
        <DialogContent sx={{ pt: 3, px: 3 }}>
          <Box sx={{ position: 'relative' }}>
            <TextField
              autoFocus
              multiline
              rows={3}
              fullWidth
              placeholder="Добавьте комментарий к репосту (необязательно)"
              value={repostText}
              onChange={(e) => setRepostText(e.target.value)}
              variant="outlined"
              helperText="Вы можете упомянуть пользователей с помощью @username"
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.09)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(100, 90, 140, 0.3)'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#7B68EE',
                    borderWidth: '1px'
                  },
                  '& .MuiOutlinedInput-input': {
                    fontSize: '0.95rem',
                    color: 'transparent',  
                    caretColor: 'rgba(255, 255, 255, 0.9)'  
                  }
                },
                '& .MuiFormHelperText-root': {
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: '0.75rem',
                  marginTop: '4px'
                }
              }}
            />
            {renderRepostInputWithMentions()}
          </Box>
          
          {}
          <Box 
            sx={{ 
              p: 2.5, 
              border: '1px solid rgba(255, 255, 255, 0.09)', 
              borderRadius: '12px',
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(5px)',
              boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.05)',
              position: 'relative',
              overflow: 'hidden',
              '&:before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: 'rgba(100, 90, 140, 0.02)',
                backdropFilter: 'blur(5px)',
                borderRadius: '12px',
                zIndex: 0
              }
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 1.5,
              position: 'relative',
              zIndex: 1
            }}>
              <Avatar 
                src={post?.user?.avatar_url} 
                alt={post?.user?.name}
                sx={{ 
                  width: 35, 
                  height: 35, 
                  mr: 1.5,
                  border: '2px solid rgba(100, 90, 140, 0.4)'
                }}
              >
                {post?.user?.name ? post?.user?.name[0] : '?'}
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight="medium" sx={{ 
                  color: 'rgba(255, 255, 255, 0.95)',
                  lineHeight: 1.2
                }}>
                  {post?.user?.name}
                </Typography>
                <Typography variant="caption" sx={{ 
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '0.7rem',
                  display: 'block'
                }}>
                  {formatTimeAgo(post?.timestamp)}
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" sx={{ 
              mb: 1, 
              display: '-webkit-box', 
              WebkitLineClamp: 3, 
              WebkitBoxOrient: 'vertical', 
              overflow: 'hidden',
              color: 'rgba(255, 255, 255, 0.85)',
              position: 'relative',
              zIndex: 1,
              fontSize: '0.9rem',
              lineHeight: 1.5 
            }}>
              {post?.content}
            </Typography>
            {post?.image && (
              <Box 
                component="img" 
                src={post.image} 
                alt="Изображение поста"
                sx={{
                  width: '100%',
                  height: '120px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  mt: 1,
                  opacity: 0.9,
                  position: 'relative',
                  zIndex: 1
                }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 1.5, justifyContent: 'space-between' }}>
          <Button 
            onClick={handleCloseRepostModal} 
            sx={{ 
              borderRadius: '10px', 
              color: 'rgba(255, 255, 255, 0.7)',
              px: 2,
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.08)',
                color: 'rgba(255, 255, 255, 0.9)'
              }
            }}
          >
            Отмена
          </Button>
          <Button 
            onClick={handleCreateRepost} 
            variant="contained" 
            disabled={isReposting}
            sx={{ 
              borderRadius: '10px',
              bgcolor: '#7B68EE',
              boxShadow: 'none',
              px: 3,
              '&:hover': {
                bgcolor: '#8778F0',
                boxShadow: 'none'
              },
              '&.Mui-disabled': {
                bgcolor: 'rgba(100, 90, 140, 0.3)',
                color: 'rgba(255, 255, 255, 0.5)'
              }
            }}
            endIcon={isReposting ? <CircularProgress size={16} color="inherit" /> : null}
          >
            Репостнуть
          </Button>
        </DialogActions>
      </Dialog>
      
      {}
      {lightboxOpen && (
        <LightBox
          isOpen={lightboxOpen}
          onClose={handleCloseLightbox}
          imageSrc={images[currentImageIndex]}
          caption={post?.content}
          title={post?.user?.name}
          liked={liked}
          likesCount={likesCount}
          onLike={handleLike}
          onComment={handleCommentClick}
          onShare={handleRepostClick}
          onNext={images.length > 1 ? handleNextImage : undefined}
          onPrev={images.length > 1 ? handlePrevImage : undefined}
          totalImages={images.length}
          currentIndex={currentImageIndex}
        />
      )}
      
      {}
      <Dialog
        open={deleteDialog.open}
        onClose={() => !deleteDialog.deleting && !deleteDialog.deleted && setDeleteDialog({ ...deleteDialog, open: false })}
        PaperProps={{
          sx: {
            bgcolor: 'rgba(32, 32, 36, 0.8)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
            width: '100%',
            maxWidth: '400px',
            borderRadius: '16px',
            border: '1px solid rgba(100, 90, 140, 0.1)',
            '&:before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: '16px',
              background: 'linear-gradient(145deg, rgba(30, 30, 30, 0.6), rgba(20, 20, 20, 0.75))',
              backdropFilter: 'blur(30px)',
              zIndex: -1
            }
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          {deleteDialog.deleted ? (
            <>
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <CheckCircleIcon sx={{ fontSize: 56, color: '#4CAF50', mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 1, color: 'white' }}>
                  Пост удален
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Пост был успешно удален
                </Typography>
              </Box>
            </>
          ) : (
            <>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 2, 
                  color: '#f44336',
                  fontWeight: 'medium',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <DeleteIcon sx={{ mr: 1 }} /> Удаление поста
              </Typography>
              <Typography sx={{ mb: 3, color: 'rgba(255, 255, 255, 0.7)' }}>
                Вы уверены, что хотите удалить этот пост? Это действие нельзя отменить.
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button 
                  onClick={() => setDeleteDialog({ ...deleteDialog, open: false })}
                  disabled={deleteDialog.deleting}
                  sx={{ 
                    borderRadius: '10px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    px: 2,
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.08)',
                      color: 'rgba(255, 255, 255, 0.9)'
                    }
                  }}
                >
                  Отмена
                </Button>
                <Button 
                  onClick={confirmDelete}
                  disabled={deleteDialog.deleting}
                  variant="contained" 
                  color="error"
                  sx={{ 
                    borderRadius: '10px',
                    boxShadow: 'none',
                    px: 2
                  }}
                  endIcon={deleteDialog.deleting ? <CircularProgress size={16} color="inherit" /> : null}
                >
                  {deleteDialog.deleting ? 'Удаление...' : 'Удалить'}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Dialog>
      
      {}
      <Dialog
        open={reportDialog.open}
        onClose={() => !reportDialog.submitting && !reportDialog.submitted && setReportDialog({...reportDialog, open: false})}
        PaperProps={{
          sx: {
            bgcolor: 'rgba(32, 32, 36, 0.8)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
            width: '100%',
            maxWidth: '450px',
            borderRadius: '16px',
            border: '1px solid rgba(100, 90, 140, 0.1)',
            '&:before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: '16px',
              background: 'linear-gradient(145deg, rgba(30, 30, 30, 0.6), rgba(20, 20, 20, 0.75))',
              backdropFilter: 'blur(30px)',
              zIndex: -1
            }
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid rgba(100, 90, 140, 0.1)',
          px: 3,
          py: 2,
          color: 'white',
          fontWeight: 500,
          fontSize: '1.1rem',
          display: 'flex',
          alignItems: 'center',
          '&:before': {
            content: '""',
            display: 'inline-block',
            width: '18px',
            height: '18px',
            marginRight: '10px',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http:
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat'
          }
        }}>
          Пожаловаться на пост
        </DialogTitle>
        
        {reportDialog.submitted ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <CheckCircleIcon sx={{ fontSize: 56, color: '#4CAF50', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1, color: 'white' }}>
              Жалоба отправлена
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Спасибо за вашу бдительность! Модераторы рассмотрят вашу жалобу.
            </Typography>
          </Box>
        ) : (
          <>
            <DialogContent sx={{ pt: 3, px: 3 }}>
              <Typography variant="body2" sx={{ mb: 3, color: 'rgba(255, 255, 255, 0.7)' }}>
                Выберите причину жалобы, и наши модераторы рассмотрят этот пост. Спасибо за помощь в поддержании порядка!
              </Typography>
              
              {reportDialog.error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {reportDialog.error}
                </Alert>
              )}
              
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 1.5,
                  mb: 2
                }}
              >
                {reportReasons.map(reason => (
                  <Button
                    key={reason}
                    variant={reportDialog.reason === reason ? "contained" : "outlined"}
                    color={reportDialog.reason === reason ? "warning" : "inherit"}
                    onClick={() => setReportDialog({...reportDialog, reason, error: null})}
                    sx={{
                      borderRadius: '10px',
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      py: 1,
                      backgroundColor: reportDialog.reason === reason ? 'rgba(255, 152, 0, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                      borderColor: reportDialog.reason === reason ? 'rgba(255, 152, 0, 0.5)' : 'rgba(255, 255, 255, 0.1)',
                      '&:hover': {
                        backgroundColor: reportDialog.reason === reason ? 'rgba(255, 152, 0, 0.15)' : 'rgba(255, 255, 255, 0.1)',
                        borderColor: reportDialog.reason === reason ? 'rgba(255, 152, 0, 0.6)' : 'rgba(255, 255, 255, 0.2)',
                      }
                    }}
                  >
                    {reason}
                  </Button>
                ))}
              </Box>
              
              {reportDialog.reason === "Другое" && (
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Укажите причину жалобы"
                  variant="outlined"
                  value={reportDialog.customReason || ''}
                  onChange={(e) => setReportDialog({...reportDialog, customReason: e.target.value})}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '10px',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 152, 0, 0.5)'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#ff9800',
                        borderWidth: '1px'
                      }
                    }
                  }}
                />
              )}
              
              {}
              <Box 
                sx={{ 
                  p: 2, 
                  border: '1px solid rgba(255, 152, 0, 0.3)', 
                  borderRadius: '10px',
                  bgcolor: 'rgba(255, 152, 0, 0.05)',
                }}
              >
                <Typography variant="caption" sx={{ display: 'block', color: 'rgba(255, 255, 255, 0.5)', mb: 1 }}>
                  Пост пользователя {post?.user?.name}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.7)',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    fontSize: '0.8rem'
                  }}
                >
                  {post?.content}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
              <Button 
                onClick={() => setReportDialog({...reportDialog, open: false})}
                disabled={reportDialog.submitting}
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.05)'
                  }
                }}
              >
                Отмена
              </Button>
              <Button 
                onClick={handleReportSubmit}
                disabled={reportDialog.submitting || !reportDialog.reason}
                variant="contained" 
                color="warning"
                startIcon={reportDialog.submitting ? <CircularProgress size={16} color="inherit" /> : <ReportProblemIcon />}
                sx={{ 
                  bgcolor: '#ff9800',
                  '&:hover': {
                    bgcolor: '#f57c00'
                  }
                }}
              >
                {reportDialog.submitting ? 'Отправка...' : 'Отправить жалобу'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
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
        open={editDialog.open}
        onClose={() => !editDialog.submitting && handleCloseEditDialog()}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            bgcolor: 'rgba(32, 32, 36, 0.8)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
            width: '95%',
            maxWidth: '600px',
            border: '1px solid rgba(100, 90, 140, 0.1)',
            '&:before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: '16px',
              background: 'linear-gradient(145deg, rgba(30, 30, 30, 0.6), rgba(20, 20, 20, 0.75))',
              backdropFilter: 'blur(30px)',
              zIndex: -1
            }
          }
        }}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid rgba(100, 90, 140, 0.1)',
          px: 3,
          py: 2,
          color: 'white',
          fontWeight: 500,
          fontSize: '1.1rem',
          display: 'flex',
          alignItems: 'center',
          '&:before': {
            content: '""',
            display: 'inline-block',
            width: '18px',
            height: '18px',
            marginRight: '10px',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http:
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat'
          }
        }}>
          Редактировать пост
        </DialogTitle>
        <DialogContent sx={{ pt: 3, px: 3 }}>
          <Typography variant="caption" sx={{ display: 'block', color: 'rgba(255, 255, 255, 0.6)', mb: 2 }}>
            Редактирование доступно только в течение 3 часов после публикации
          </Typography>
          
          {editDialog.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {editDialog.error}
            </Alert>
          )}
          
          {}
          <TextField
            fullWidth
            multiline
            minRows={3}
            maxRows={8}
            label="Текст поста"
            value={editDialog.content}
            onChange={handleEditContentChange}
            margin="normal"
            disabled={editDialog.submitting}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.09)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(100, 90, 140, 0.3)'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#2196f3',
                  borderWidth: '1px'
                }
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)'
              },
              '& .MuiInputBase-input': {
                color: 'rgba(255, 255, 255, 0.9)'
              }
            }}
          />
          
          {}
          {(post.images?.length > 0 || post.image) && !editDialog.deleteImages && (
            <Box sx={{ mt: 2, mb: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Текущие изображения
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {post.images ? post.images.map((img, idx) => (
                  <Box 
                    key={`current-img-${idx}`}
                    component="img"
                    src={img}
                    alt={`Изображение ${idx + 1}`}
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      objectFit: 'cover',
                      borderRadius: 1
                    }}
                  />
                )) : post.image && (
                  <Box 
                    component="img"
                    src={post.image}
                    alt="Изображение поста"
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      objectFit: 'cover',
                      borderRadius: 1
                    }}
                  />
                )}
              </Box>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={editDialog.deleteImages}
                    onChange={handleToggleDeleteImages}
                    disabled={editDialog.submitting}
                    sx={{
                      color: 'rgba(255, 255, 255, 0.5)',
                      '&.Mui-checked': {
                        color: '#2196f3',
                      }
                    }}
                  />
                }
                label="Удалить существующие изображения"
                sx={{ 
                  mt: 1,
                  color: 'rgba(255, 255, 255, 0.8)',
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.9rem'
                  }
                }}
              />
            </Box>
          )}
          
          {}
          {post.video && !editDialog.deleteVideo && (
            <Box sx={{ mt: 2, mb: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Текущее видео
              </Typography>
              <Box 
                component="video"
                src={post.video}
                controls
                sx={{ 
                  maxWidth: '100%',
                  height: 120,
                  borderRadius: 1
                }}
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={editDialog.deleteVideo}
                    onChange={handleToggleDeleteVideo}
                    disabled={editDialog.submitting}
                    sx={{
                      color: 'rgba(255, 255, 255, 0.5)',
                      '&.Mui-checked': {
                        color: '#2196f3',
                      }
                    }}
                  />
                }
                label="Удалить существующее видео"
                sx={{ 
                  mt: 1, 
                  display: 'block',
                  color: 'rgba(255, 255, 255, 0.8)',
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.9rem'
                  }
                }}
              />
            </Box>
          )}
          
          {}
          {post.music && post.music.length > 0 && !editDialog.deleteMusic && (
            <Box sx={{ mt: 2, mb: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Текущие аудиотреки
              </Typography>
              <List dense>
                {post.music.map((track, idx) => (
                  <ListItem key={`music-${idx}`} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <MusicNoteIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={track.title} 
                      secondary={track.artist}
                      primaryTypographyProps={{ noWrap: true, variant: 'body2' }}
                      secondaryTypographyProps={{ noWrap: true, variant: 'caption' }}
                    />
                  </ListItem>
                ))}
              </List>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={editDialog.deleteMusic}
                    onChange={handleToggleDeleteMusic}
                    disabled={editDialog.submitting}
                    sx={{
                      color: 'rgba(255, 255, 255, 0.5)',
                      '&.Mui-checked': {
                        color: '#2196f3',
                      }
                    }}
                  />
                }
                label="Удалить музыку"
                sx={{ 
                  mt: 0.5,
                  color: 'rgba(255, 255, 255, 0.8)',
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.9rem'
                  }
                }}
              />
            </Box>
          )}
          
          {}
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<PhotoIcon />}
              disabled={editDialog.submitting}
              sx={{ 
                mr: 1, 
                mb: 1,
                borderRadius: '10px',
                backdropFilter: 'blur(5px)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.8)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                }
              }}
            >
              Добавить изображения
              <input
                type="file"
                multiple
                accept="image}
          {editDialog.previews.length > 0 && (
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {editDialog.previews.map((preview, idx) => (
                <Box
                  key={`preview-${idx}`}
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '10px',
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <img
                    src={preview}
                    alt={`Preview ${idx + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </Box>
              ))}
            </Box>
          )}
          
          {}
          {editDialog.newVideo && (
            <Box sx={{ 
              mt: 2,
              p: 1.5,
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <Typography variant="caption" color="rgba(255, 255, 255, 0.7)">
                Новое видео выбрано: {editDialog.newVideo.name}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={handleCloseEditDialog} 
            variant="outlined" 
            color="primary"
            disabled={editDialog.submitting}
            sx={{
              borderRadius: '10px',
              borderColor: 'rgba(33, 150, 243, 0.3)',
              color: 'rgba(255, 255, 255, 0.8)',
              '&:hover': {
                borderColor: 'rgba(33, 150, 243, 0.5)',
                backgroundColor: 'rgba(33, 150, 243, 0.05)'
              }
            }}
          >
            Отмена
          </Button>
          <Button 
            onClick={handleSubmitEdit} 
            variant="contained" 
            color="primary"
            disabled={editDialog.submitting}
            startIcon={editDialog.submitting ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{
              borderRadius: '10px',
              backgroundColor: '#2196f3',
              '&:hover': {
                backgroundColor: '#1976d2'
              }
            }}
          >
            {editDialog.submitting ? 'Сохранение...' : 'Сохранить изменения'}
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default Post; 