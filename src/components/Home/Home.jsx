import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';
import Card from '../UI/Card/Card';
import Button from '../UI/Button/Button';
import Input from '../UI/Input/Input';
import Modal from '../UI/Modal/Modal';
import ConcertDetails from '../Concerts/ConcertDetails';
import RankingComparison from '../Concerts/RankingComparison';
import FirstConcertRating from '../Concerts/FirstConcertRating';
import Autocomplete from '../UI/Autocomplete/Autocomplete';
import { useConcerts } from '../../contexts/ConcertContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { searchService } from '../../services/search';
import { getRatingColor, getRatingBackgroundColor } from '../../utils/ratingColors';
import ArtistImage from '../UI/ArtistImage/ArtistImage';
import Carousel from '../UI/Carousel/Carousel';

const FREE_CONCERT_LIMIT = 10;

const Home = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const { showToast } = useToast();
  const {
    personalConcerts,
    globalRankings,
    isLoading: concertsLoading,
    error,
    createConcert,
    updateConcert,
    updateRating,
    deleteConcert,
  } = useConcerts();

  const [showAddConcert, setShowAddConcert] = useState(false);
  const [showLimitPrompt, setShowLimitPrompt] = useState(false);
  const [showRankingComparison, setShowRankingComparison] = useState(false);
  const [showFirstConcertRating, setShowFirstConcertRating] = useState(false);
  const [showOpenerRating, setShowOpenerRating] = useState(false);
  const [showOpenerRanking, setShowOpenerRanking] = useState(false);
  const [showOpenerPrompt, setShowOpenerPrompt] = useState(false);
  const [selectedConcert, setSelectedConcert] = useState(null);
  const [showEditConcert, setShowEditConcert] = useState(false);
  const [editingConcert, setEditingConcert] = useState(null);
  const [showFirstConcertPrompt, setShowFirstConcertPrompt] = useState(false);
  const [openerToRate, setOpenerToRate] = useState(null);
  const [viewMode, setViewMode] = useState('personal');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [newConcertData, setNewConcertData] = useState({
    artist: '',
    venue: '',
    location: '',
    date: '',
    notes: '',
    images: []
  });

  // Multiple artists state
  const [artists, setArtists] = useState(['']);
  const [artistQueries, setArtistQueries] = useState(['']);
  const [artistOptionsList, setArtistOptionsList] = useState([[]]);
  const [isSearchingArtistsList, setIsSearchingArtistsList] = useState([false]);

  // Edit form multiple artists state
  const [editingArtists, setEditingArtists] = useState(['']);
  const [editingArtistQueries, setEditingArtistQueries] = useState(['']);
  const [editingArtistOptionsList, setEditingArtistOptionsList] = useState([[]]);
  const [isSearchingEditingArtistsList, setIsSearchingEditingArtistsList] = useState([false]);
  const [editingArtistSearchTimeout, setEditingArtistSearchTimeout] = useState(null);

  const [selectedImages, setSelectedImages] = useState([]);
  const [editingImages, setEditingImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  
  // Autocomplete states
  const [artistQuery, setArtistQuery] = useState('');
  const [venueQuery, setVenueQuery] = useState('');
  const [artistOptions, setArtistOptions] = useState([]);
  const [venueOptions, setVenueOptions] = useState([]);
  const [isSearchingArtists, setIsSearchingArtists] = useState(false);
  const [isSearchingVenues, setIsSearchingVenues] = useState(false);
  const [isSettingFromSelection, setIsSettingFromSelection] = useState(false);

  // Move useMemo to the top, before any conditional logic
  const availableYears = useMemo(() => {
    const concerts = viewMode === 'personal' ? personalConcerts : globalRankings;
    const years = concerts.map(concert => 
      new Date(concert.date).getFullYear()
    );
    return ['all', ...new Set(years)].sort((a, b) => 
      a === 'all' ? -1 : b - a
    );
  }, [viewMode, personalConcerts, globalRankings]);

  // Redirect to landing if not authenticated (but only after auth state is determined)
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/landing');
    }
  }, [user, isLoading, navigate]);

  // Clean up any existing unrated concerts
  useEffect(() => {
    if (user && personalConcerts.length > 0) {
      const unratedConcerts = personalConcerts.filter(concert => !concert.rating);
      if (unratedConcerts.length > 0) {
        // Delete unrated concerts
        unratedConcerts.forEach(async (concert) => {
          try {
            await deleteConcert(concert.id);
          } catch (err) {
            console.error('Failed to delete unrated concert:', err);
          }
        });
      }
    }
  }, [user, personalConcerts, deleteConcert]);

  // Show first concert prompt for new users
  useEffect(() => {
    if (user && !concertsLoading && personalConcerts.filter(concert => concert.rating).length === 0) {
      setShowFirstConcertPrompt(true);
    } else {
      setShowFirstConcertPrompt(false);
    }
  }, [user, concertsLoading, personalConcerts]);

  // Artist search with debouncing
  useEffect(() => {
    if (isSettingFromSelection) {
      setIsSettingFromSelection(false);
      return;
    }

    if (artistQuery.length < 2) {
      setArtistOptions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearchingArtists(true);
      try {
        const results = await searchService.searchArtists(artistQuery);
        setArtistOptions(results);
      } catch (error) {
        console.error('Error searching artists:', error);
        setArtistOptions([]);
      } finally {
        setIsSearchingArtists(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [artistQuery, isSettingFromSelection]);

  // Additional artists search with debouncing
  useEffect(() => {
    artistQueries.forEach((query, index) => {
      if (index === 0) return; // Skip main artist
      
      if (query.length < 2) {
        setArtistOptionsList(prev => {
          const newList = [...prev];
          newList[index] = [];
          return newList;
        });
        return;
      }

      const timeoutId = setTimeout(async () => {
        setIsSearchingArtistsList(prev => {
          const newList = [...prev];
          newList[index] = true;
          return newList;
        });

        try {
          const results = await searchService.searchArtists(query);
          setArtistOptionsList(prev => {
            const newList = [...prev];
            newList[index] = results;
            return newList;
          });
        } catch (error) {
          console.error('Error searching artists:', error);
          setArtistOptionsList(prev => {
            const newList = [...prev];
            newList[index] = [];
            return newList;
          });
        } finally {
          setIsSearchingArtistsList(prev => {
            const newList = [...prev];
            newList[index] = false;
            return newList;
          });
        }
      }, 300); // 300ms debounce

      return () => clearTimeout(timeoutId);
    });
  }, [artistQueries]); // Only depend on artistQueries


  // Edit form artist search with debouncing
  useEffect(() => {
    // Clear existing timeout
    if (editingArtistSearchTimeout) {
      clearTimeout(editingArtistSearchTimeout);
    }

    // Find the first additional artist query (index > 0)
    const additionalArtistQuery = editingArtistQueries.find((query, index) => index > 0 && query.length >= 2);
    
    if (!additionalArtistQuery) {
      // Clear all additional artist options if no valid query
      setEditingArtistOptionsList(prev => {
        const newList = [...prev];
        for (let i = 1; i < newList.length; i++) {
          newList[i] = [];
        }
        return newList;
      });
      return;
    }

    // Set loading state for all additional artists
    setIsSearchingEditingArtistsList(prev => {
      const newList = [...prev];
      for (let i = 1; i < newList.length; i++) {
        newList[i] = true;
      }
      return newList;
    });

    const timeoutId = setTimeout(async () => {
      try {
        const results = await searchService.searchArtists(additionalArtistQuery);
        setEditingArtistOptionsList(prev => {
          const newList = [...prev];
          for (let i = 1; i < newList.length; i++) {
            newList[i] = results;
          }
          return newList;
        });
      } catch (error) {
        console.error('Error searching artists:', error);
        setEditingArtistOptionsList(prev => {
          const newList = [...prev];
          for (let i = 1; i < newList.length; i++) {
            newList[i] = [];
          }
          return newList;
        });
      } finally {
        setIsSearchingEditingArtistsList(prev => {
          const newList = [...prev];
          for (let i = 1; i < newList.length; i++) {
            newList[i] = false;
          }
          return newList;
        });
      }
    }, 300);

    setEditingArtistSearchTimeout(timeoutId);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [editingArtistQueries.join(',')]); // Use joined string as dependency

  // Venue search with debouncing
  useEffect(() => {
    if (isSettingFromSelection) {
      setIsSettingFromSelection(false);
      return;
    }

    if (venueQuery.length < 2) {
      setVenueOptions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearchingVenues(true);
      try {
        const results = await searchService.searchVenues(venueQuery);
        setVenueOptions(results);
      } catch (error) {
        console.error('Error searching venues:', error);
        setVenueOptions([]);
      } finally {
        setIsSearchingVenues(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [venueQuery, isSettingFromSelection]);

  // Show loading state while auth is being determined
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>Loading...</div>
      </div>
    );
  }

  // Don't render anything if not authenticated
  if (!user) {
    return null;
  }

  const concertCount = personalConcerts.length;

  const handleAddConcertClick = () => {
    if (!user) {
      // Redirect to login or show login prompt
      return;
    }
    if (concertCount >= FREE_CONCERT_LIMIT) {
      setShowLimitPrompt(true);
    } else {
      setShowAddConcert(true);
    }
  };

  const handleAddConcertClose = () => {
    setShowAddConcert(false);
    // Clear all form data when closing
    setNewConcertData({
      artist: '',
      venue: '',
      location: '',
      date: '',
      notes: '',
      images: []
    });
    setSelectedImages([]);
    setArtistQuery('');
    setVenueQuery('');
    setArtistOptions([]);
    setVenueOptions([]);
    
    // Reset multiple artists state
    setArtists(['']);
    setArtistQueries(['']);
    setArtistOptionsList([[]]);
    setIsSearchingArtistsList([false]);
    
    // Reset opener rating state
    setShowOpenerRating(false);
    setOpenerToRate(null);
  };

  const handleAddConcertSubmit = async (e) => {
    e.preventDefault();
    try {
      setShowAddConcert(false);
      // Don't clear the data here - keep it for the rating process
      setArtistQuery('');
      setVenueQuery('');
      setArtistOptions([]);
      setVenueOptions([]);
      
      // Get additional artists and add them to notes
      const additionalArtists = artists.slice(1).filter(artist => artist.trim());
      let updatedNotes = newConcertData.notes || '';
      
      if (additionalArtists.length > 0) {
        const openersText = `Other Artists: ${additionalArtists.join(', ')}`;
        updatedNotes = updatedNotes ? `${updatedNotes}\n\n${openersText}` : openersText;
      }
      
      // Update the concert data with additional artists in notes
      setNewConcertData(prev => ({ 
        ...prev, 
        artist: newConcertData.artist, // Keep only main artist
        notes: updatedNotes,
        additionalArtists: additionalArtists // Store for later opener ratings
      }));
      
      // Show ranking comparison for existing concerts
      if (personalConcerts.length >= 3) {
        setShowRankingComparison(true);
      } else {
        // For first 3 concerts, show rating prompt
        setShowFirstConcertRating(true);
      }
    } catch (err) {
      console.error('Failed to submit concert:', err);
      showToast('Failed to add concert. Please try again.', 'error');
    }
  };

  const handleFirstConcertRatingComplete = async (rating) => {
    try {
      // Now create the concert with the rating and images
      const concert = await createConcert({
        ...newConcertData,
        rating: rating,
        images: selectedImages // Include selected images
      });
      
      showToast('Concert added successfully!', 'success');
      setShowFirstConcertRating(false);
      
      // Check if there are additional artists to rate
      if (newConcertData.additionalArtists && newConcertData.additionalArtists.length > 0) {
        setOpenerToRate(newConcertData.additionalArtists[0]);
        setShowOpenerPrompt(true);
      } else {
        // Clear form data if no additional artists
        setNewConcertData({
          artist: '',
          venue: '',
          date: '',
          notes: '',
          images: []
        });
        setSelectedImages([]); // Clear selected images
        setArtists(['']);
        setArtistQueries(['']);
        setArtistOptionsList([[]]);
        setIsSearchingArtistsList([false]);
      }
    } catch (err) {
      console.error('Failed to create concert with rating:', err);
      showToast('Failed to create concert. Please try again.', 'error');
    }
  };

  const handleFirstConcertRatingCancel = async () => {
    try {
      // No concert was created, just close the modal
      setShowFirstConcertRating(false);
      setNewConcertData({
        artist: '',
        venue: '',
        location: '',
        date: '',
        notes: '',
        images: []
      });
      setSelectedImages([]); // Clear selected images
    } catch (err) {
      console.error('Failed to cancel concert creation:', err);
    }
  };

  const handleRankingComplete = async (rating) => {
    try {
      // Now create the concert with the rating and images
      const concert = await createConcert({
        ...newConcertData,
        rating: rating,
        images: selectedImages // Include selected images
      });
      
      showToast('Concert added successfully!', 'success');
      setShowRankingComparison(false);
      
      // Check if there are additional artists to rate
      if (newConcertData.additionalArtists && newConcertData.additionalArtists.length > 0) {
        setOpenerToRate(newConcertData.additionalArtists[0]);
        setShowOpenerPrompt(true);
      } else {
        // Clear form data if no additional artists
        setNewConcertData({
          artist: '',
          venue: '',
          date: '',
          notes: '',
          images: []
        });
        setSelectedImages([]); // Clear selected images
        setArtists(['']);
        setArtistQueries(['']);
        setArtistOptionsList([[]]);
        setIsSearchingArtistsList([false]);
      }
    } catch (err) {
      console.error('Failed to create concert with rating:', err);
      showToast('Failed to create concert. Please try again.', 'error');
    }
  };

  const handleRankingCancel = async () => {
    try {
      // No concert was created, just close the modal
      setShowRankingComparison(false);
      setNewConcertData({
        artist: '',
        venue: '',
        location: '',
        date: '',
        notes: '',
        images: []
      });
      setSelectedImages([]); // Clear selected images
      setArtists(['']);
      setArtistQueries(['']);
      setArtistOptionsList([[]]);
      setIsSearchingArtistsList([false]);
    } catch (err) {
      console.error('Failed to cancel concert creation:', err);
    }
  };

  const handleOpenerRatingComplete = async (rating) => {
    try {
      // Create a separate concert entry for the opener
      const openerConcert = await createConcert({
        artist: openerToRate,
        venue: newConcertData.venue,
        date: newConcertData.date,
        notes: `Opener for ${newConcertData.artist} at ${newConcertData.venue}`,
        rating: rating,
        images: [] // Openers typically don't have separate photos
      });
      
      showToast(`${openerToRate} rated successfully!`, 'success');
      
      // Check if there are more additional artists to rate
      const remainingOpeners = newConcertData.additionalArtists.slice(1);
      if (remainingOpeners.length > 0) {
        setOpenerToRate(remainingOpeners[0]);
        // Keep the modal open for the next additional artist
      } else {
        // All additional artists rated, close and clear form
        setShowOpenerRating(false);
        setOpenerToRate(null);
        setNewConcertData({
          artist: '',
          venue: '',
          date: '',
          notes: '',
          images: []
        });
        setSelectedImages([]);
        setArtists(['']);
        setArtistQueries(['']);
        setArtistOptionsList([[]]);
        setIsSearchingArtistsList([false]);
      }
    } catch (err) {
      console.error('Failed to create opener concert:', err);
      showToast('Failed to rate opener. Please try again.', 'error');
    }
  };

  const handleOpenerPromptYes = () => {
    setShowOpenerPrompt(false);
    
    // Check if this should be a first concert rating or ranking comparison
    const currentConcertCount = personalConcerts.filter(concert => concert.rating).length;
    
    if (currentConcertCount < 3) {
      // For first 3 concerts, show rating prompt
      setShowOpenerRating(true);
    } else {
      // For subsequent concerts, show ranking comparison
      setShowOpenerRanking(true);
    }
  };

  const handleOpenerPromptNo = () => {
    setShowOpenerPrompt(false);
    setOpenerToRate(null);
    // Clear form data
    setNewConcertData({
      artist: '',
      venue: '',
      date: '',
      notes: '',
      images: []
    });
    setSelectedImages([]);
    setArtists(['']);
    setArtistQueries(['']);
    setArtistOptionsList([[]]);
    setIsSearchingArtistsList([false]);
  };

  const handleOpenerRankingComplete = async (rating) => {
    try {
      // Create a separate concert entry for the opener
      const openerConcert = await createConcert({
        artist: openerToRate,
        venue: newConcertData.venue,
        location: newConcertData.location, // Include the location data
        date: newConcertData.date,
        notes: `Opener for ${newConcertData.artist} at ${newConcertData.venue}`,
        rating: rating,
        images: [] // Openers typically don't have separate photos
      });
      
      showToast(`${openerToRate} rated successfully!`, 'success');
      setShowOpenerRanking(false);
      
      // Check if there are more additional artists to rate
      const remainingOpeners = newConcertData.additionalArtists.slice(1);
      if (remainingOpeners.length > 0) {
        setOpenerToRate(remainingOpeners[0]);
        // Show prompt for next additional artist
        setShowOpenerPrompt(true);
      } else {
        // All additional artists rated, close and clear form
        setOpenerToRate(null);
        setNewConcertData({
          artist: '',
          venue: '',
          date: '',
          notes: '',
          images: []
        });
        setSelectedImages([]);
        setArtists(['']);
        setArtistQueries(['']);
        setArtistOptionsList([[]]);
        setIsSearchingArtistsList([false]);
      }
    } catch (err) {
      console.error('Failed to create opener concert:', err);
      showToast('Failed to rate opener. Please try again.', 'error');
    }
  };

  const handleOpenerRankingCancel = async () => {
    try {
      // Skip this additional artist and check for more
      const remainingOpeners = newConcertData.additionalArtists.slice(1);
      if (remainingOpeners.length > 0) {
        setOpenerToRate(remainingOpeners[0]);
        setShowOpenerRanking(false);
        // Show prompt for next additional artist
        setShowOpenerPrompt(true);
      } else {
        // All additional artists skipped, close and clear form
        setShowOpenerRanking(false);
        setOpenerToRate(null);
        setNewConcertData({
          artist: '',
          venue: '',
          date: '',
          notes: '',
          images: []
        });
        setSelectedImages([]);
        setArtists(['']);
        setArtistQueries(['']);
        setArtistOptionsList([[]]);
        setIsSearchingArtistsList([false]);
      }
    } catch (err) {
      console.error('Failed to skip opener rating:', err);
    }
  };

  const handleOpenerRatingCancel = async () => {
    try {
      // Skip this additional artist and check for more
      const remainingOpeners = newConcertData.additionalArtists.slice(1);
      if (remainingOpeners.length > 0) {
        setOpenerToRate(remainingOpeners[0]);
        // Keep the modal open for the next additional artist
      } else {
        // All additional artists skipped, close and clear form
        setShowOpenerRating(false);
        setOpenerToRate(null);
        setNewConcertData({
          artist: '',
          venue: '',
          date: '',
          notes: '',
          images: []
        });
        setSelectedImages([]);
        setArtists(['']);
        setArtistQueries(['']);
        setArtistOptionsList([[]]);
        setIsSearchingArtistsList([false]);
      }
    } catch (err) {
      console.error('Failed to skip opener rating:', err);
    }
  };

  const handleInputChange = (field, value) => {
    setNewConcertData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event, isEditing = false) => {
    console.log('File upload triggered:', event.target.files);
    
    const files = Array.from(event.target.files);
    console.log('Files selected:', files);
    
    const mediaFiles = files.filter(file => 
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );
    console.log('Media files filtered:', mediaFiles);
    
    if (isEditing) {
      setEditingImages(prev => {
        const newImages = [...prev, ...mediaFiles];
        console.log('Updated editing images:', newImages);
        return newImages;
      });
    } else {
      setSelectedImages(prev => {
        const newImages = [...prev, ...mediaFiles];
        console.log('Updated selected images:', newImages);
        return newImages;
      });
    }
    
    // Reset the file input so the same file can be selected again
    event.target.value = '';
  };

  const handleArtistSelect = (artist, index = 0) => {
    if (index === 0) {
      // Handle main artist (backward compatibility)
      setNewConcertData(prev => ({ ...prev, artist: artist.name }));
      setArtistOptions([]); // Clear options to stop suggestions
      setIsSearchingArtists(false); // Stop loading state
    } else {
      // Handle additional artists
      const newArtists = [...artists];
      newArtists[index] = artist.name;
      setArtists(newArtists);
      
      const newArtistOptionsList = [...artistOptionsList];
      newArtistOptionsList[index] = [];
      setArtistOptionsList(newArtistOptionsList);
      
      const newIsSearchingArtistsList = [...isSearchingArtistsList];
      newIsSearchingArtistsList[index] = false;
      setIsSearchingArtistsList(newIsSearchingArtistsList);
    }
  };

  const addArtist = () => {
    setArtists([...artists, '']);
    setArtistQueries([...artistQueries, '']);
    setArtistOptionsList([...artistOptionsList, []]);
    setIsSearchingArtistsList([...isSearchingArtistsList, false]);
  };

  const removeArtist = (index) => {
    if (artists.length > 1) {
      const newArtists = artists.filter((_, i) => i !== index);
      const newArtistQueries = artistQueries.filter((_, i) => i !== index);
      const newArtistOptionsList = artistOptionsList.filter((_, i) => i !== index);
      const newIsSearchingArtistsList = isSearchingArtistsList.filter((_, i) => i !== index);
      
      setArtists(newArtists);
      setArtistQueries(newArtistQueries);
      setArtistOptionsList(newArtistOptionsList);
      setIsSearchingArtistsList(newIsSearchingArtistsList);
    }
  };

  const updateArtistQuery = (index, query) => {
    const newArtistQueries = [...artistQueries];
    newArtistQueries[index] = query;
    setArtistQueries(newArtistQueries);
  };

  // Edit form multiple artists functions
  const addEditingArtist = () => {
    setEditingArtists([...editingArtists, '']);
    setEditingArtistQueries([...editingArtistQueries, '']);
    setEditingArtistOptionsList([...editingArtistOptionsList, []]);
    setIsSearchingEditingArtistsList([...isSearchingEditingArtistsList, false]);
  };

  const removeEditingArtist = (index) => {
    if (editingArtists.length > 1) {
      const newArtists = editingArtists.filter((_, i) => i !== index);
      const newArtistQueries = editingArtistQueries.filter((_, i) => i !== index);
      const newArtistOptionsList = editingArtistOptionsList.filter((_, i) => i !== index);
      const newIsSearchingArtistsList = isSearchingEditingArtistsList.filter((_, i) => i !== index);
      
      setEditingArtists(newArtists);
      setEditingArtistQueries(newArtistQueries);
      setEditingArtistOptionsList(newArtistOptionsList);
      setIsSearchingEditingArtistsList(newIsSearchingArtistsList);
    }
  };

  const updateEditingArtistQuery = (index, query) => {
    const newArtistQueries = [...editingArtistQueries];
    newArtistQueries[index] = query;
    setEditingArtistQueries(newArtistQueries);
  };

  const handleVenueSelect = (venue) => {
    setNewConcertData(prev => ({ 
      ...prev, 
      venue: venue.name,
      location: venue.subtitle || venue.city || 'Unknown City'
    }));
    setVenueOptions([]); // Clear options to stop suggestions
    setIsSearchingVenues(false); // Stop loading state
    // Don't update venueQuery when selecting - this prevents the search from triggering
  };

  const handleEditArtistSelect = (artist, index = 0) => {
    if (index === 0) {
      // Handle main artist
      setEditingConcert(prev => ({ ...prev, artist: artist.name }));
      setArtistOptions([]); // Clear options to stop suggestions
      setIsSearchingArtists(false); // Stop loading state
    } else {
      // Handle additional artists
      const newEditingArtists = [...editingArtists];
      newEditingArtists[index] = artist.name;
      setEditingArtists(newEditingArtists);
      
      const newEditingArtistOptionsList = [...editingArtistOptionsList];
      newEditingArtistOptionsList[index] = [];
      setEditingArtistOptionsList(newEditingArtistOptionsList);
      
      const newIsSearchingEditingArtistsList = [...isSearchingEditingArtistsList];
      newIsSearchingEditingArtistsList[index] = false;
      setIsSearchingEditingArtistsList(newIsSearchingEditingArtistsList);
    }
  };

  const handleEditVenueSelect = (venue) => {
    setEditingConcert(prev => ({ 
      ...prev, 
      venue: venue.name,
      location: venue.subtitle || venue.city || 'Unknown City'
    }));
    setVenueOptions([]); // Clear options to stop suggestions
    setIsSearchingVenues(false); // Stop loading state
    // Don't update venueQuery when selecting - this prevents the search from triggering
  };

  const handleRemoveImage = (index, isEditing = false) => {
    if (isEditing) {
      setEditingImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setSelectedImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleDeleteExistingImage = (index) => {
    if (!editingConcert) return;
    
    const updatedImages = editingConcert.images.filter((_, i) => i !== index);
    setEditingConcert(prev => ({ ...prev, images: updatedImages }));
  };

  const renderImagePreview = (images, onRemove, isEditing = false) => (
    <div className={styles.imagePreviewContainer}>
      {images.length > 0 && (
        <Carousel 
          items={convertFilesToMediaItems(images)}
          className={styles.previewCarousel}
        />
      )}
      <div className={styles.previewThumbnails}>
        {images.map((image, index) => (
          <div key={index} className={styles.imagePreview}>
            <img 
              src={typeof image === 'string' ? image : URL.createObjectURL(image)} 
              alt={`Preview ${index + 1}`} 
              className={styles.previewImage}
            />
            <button
              type="button"
              className={styles.removeImage}
              onClick={() => onRemove(index, isEditing)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderExistingImages = (images) => (
    <div className={styles.imagePreviewContainer}>
      {images.map((image, index) => (
        <div key={index} className={styles.imagePreview}>
          <img 
            src={typeof image === 'string' ? image : URL.createObjectURL(image)} 
            alt={`Existing photo ${index + 1}`} 
            className={styles.previewImage}
          />
          <button
            type="button"
            className={styles.removeImage}
            onClick={() => handleDeleteExistingImage(index)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );

  const handleConcertClick = (concert) => {
    setSelectedConcert(concert);
  };

  const handleImageClick = (image, event) => {
    event.preventDefault();
    event.stopPropagation(); // Prevent concert card click
    setSelectedImage(image);
    setShowImageModal(true);
  };

  // Helper function to convert files to media items for carousel
  const convertFilesToMediaItems = (files) => {
    if (!files || files.length === 0) return [];
    
    return files.map(file => {
      // Handle both File objects and string URLs
      if (typeof file === 'string') {
        // It's a URL string (existing image)
        return {
          url: file,
          type: 'image'
        };
      } else if (file instanceof File) {
        // It's a File object (new upload)
        return {
          file,
          type: file.type.startsWith('video/') ? 'video' : 'image'
        };
      } else {
        // Fallback for other types
        console.warn('Unknown file type:', file);
        return {
          url: file,
          type: 'image'
        };
      }
    });
  };

  // Quick venue edit function
  const handleQuickVenueEdit = async (concert) => {
    const newVenue = prompt('Enter the correct venue name:', concert.venue);
    if (newVenue && newVenue.trim() !== concert.venue) {
      try {
        await updateConcert(concert.id, {
          venue: newVenue.trim(),
          location: '' // Clear the old location
        });
        
        // Refresh the concerts data
        if (user) {
          const updatedConcerts = await firebaseConcertService.getUserConcerts(user.id);
          setPersonalConcerts(updatedConcerts);
        }
        
        showToast('Venue updated successfully!', 'success');
      } catch (error) {
        console.error('Error updating venue:', error);
        showToast('Failed to update venue', 'error');
      }
    }
  };

  const handleEditConcert = (concert) => {
    setEditingConcert(concert);
    setEditingImages([]);
    // Don't set venue query immediately to prevent auto-search
    setShowEditConcert(true);
    
    // Initialize editing artists state
    setEditingArtists([concert.artist || '']);
    setEditingArtistQueries([concert.artist || '']);
    setEditingArtistOptionsList([[]]);
    setIsSearchingEditingArtistsList([false]);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!editingConcert) return;

      setIsUploading(true);
      showToast('Saving changes...', 'info', 2000);

      // Combine existing images with new uploaded images
      const existingImages = editingConcert.images || [];
      const allImages = [...existingImages, ...editingImages];

      // Get additional artists and add them to notes
      const additionalArtists = editingArtists.slice(1).filter(artist => artist.trim());
      let updatedNotes = editingConcert.notes || '';
      
      if (additionalArtists.length > 0) {
        const openersText = `Other Artists: ${additionalArtists.join(', ')}`;
        updatedNotes = updatedNotes ? `${updatedNotes}\n\n${openersText}` : openersText;
      }

      // Update the concert in the database
      await updateConcert(editingConcert.id, {
        artist: editingConcert.artist,
        venue: editingConcert.venue,
        date: editingConcert.date,
        notes: updatedNotes,
        rating: editingConcert.rating,
        images: allImages
      });

      console.log('Concert updated:', editingConcert);
      showToast('Concert updated successfully!', 'success');
      setShowEditConcert(false);
      setEditingConcert(null);
      setEditingImages([]);
      setArtistQuery('');
      setVenueQuery('');
      setArtistOptions([]);
      setVenueOptions([]);
      
      // Reset editing artists state
      setEditingArtists(['']);
      setEditingArtistQueries(['']);
      setEditingArtistOptionsList([[]]);
      setIsSearchingEditingArtistsList([false]);
      
      // Close the concert details modal to return to rankings
      setSelectedConcert(null);
    } catch (err) {
      console.error('Failed to update concert:', err);
      showToast('Failed to update concert. Please try again.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteConcert = async () => {
    if (!editingConcert) return;
    
    try {
      await deleteConcert(editingConcert.id);
      showToast('Concert deleted successfully!', 'success');
      
      // Clear all edit-related states
      setShowEditConcert(false);
      setEditingConcert(null);
      setEditingImages([]);
      setArtistQuery('');
      setVenueQuery('');
      setArtistOptions([]);
      setVenueOptions([]);
      
      // Also clear the selected concert if it's the same one
      if (selectedConcert && selectedConcert.id === editingConcert.id) {
        setSelectedConcert(null);
      }
    } catch (err) {
      console.error('Failed to delete concert:', err);
      showToast('Failed to delete concert. Please try again.', 'error');
    }
  };

  const handleRatingChange = (newRating) => {
    setEditingConcert(prev => ({ ...prev, rating: newRating }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const handleYearFilter = (year) => {
    setSelectedYear(year);
  };

  // Generate year range from 1950 to 2025
  const generateYearRange = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 1950; year--) {
      years.push(year);
    }
    return years;
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    setSelectedYear('all'); // Reset year filter when switching views
  };

  // Debug function to check current concert data




  const renderPersonalConcerts = () => (
    <div className={styles.concertList}>
      {personalConcerts
        .filter(concert => concert.rating) // Only show concerts with ratings
        .sort((a, b) => (b.rating || 0) - (a.rating || 0)) // Sort by rating descending
        .map((concert) => (
        <Card 
          key={concert.id} 
          className={styles.concertCard}
          clickable
          onClick={() => handleConcertClick(concert)}
        >
          <div className={styles.cardHeader}>
            <div className={styles.concertInfo}>
              <div className={styles.artistRow}>
                <ArtistImage artistName={concert.artist} size="medium" className={styles.artistImageContainer} />
                <div className={styles.artistDetails}>
                  <h3>{concert.artist}</h3>
                  {concert.notes && (concert.notes.includes('Other Artists:') || concert.notes.includes('Openers:')) && (
                    <p className={styles.openers}>
                      <strong>Other Artists:</strong> {concert.notes.includes('Other Artists:') ? concert.notes.split('Other Artists:')[1] : concert.notes.split('Openers:')[1]}
                    </p>
                  )}
                  <p className={styles.venue}>
                    {concert.location && concert.location !== 'Unknown City' ? 
                      (() => {
                        // Extract city, state, and country from location
                        const locationParts = concert.location.split(',');
                        console.log('Location parts:', locationParts); // Debug
                        
                        // Find the city, state, and country parts
                        let city = '';
                        let state = '';
                        let country = '';
                        
                        // Check if it's a US venue (contains "United States" or "USA")
                        const isUS = locationParts.some(part => 
                          part.trim().toLowerCase().includes('united states') || 
                          part.trim().toLowerCase().includes('usa')
                        );
                        
                        // Look for state pattern in the last few parts
                        for (let i = locationParts.length - 1; i >= 0; i--) {
                          const part = locationParts[i]?.trim();
                          if (!part) continue;
                          
                          // Check if this part contains a state (2-3 letters, possibly with zip)
                          const stateMatch = part.match(/^([A-Z]{2,3})/);
                          if (stateMatch) {
                            state = stateMatch[1];
                            // City is usually the part before the state
                            if (i > 0) {
                              city = locationParts[i - 1]?.trim();
                            }
                            break;
                          }
                        }
                        
                        // For non-US venues, try to find country
                        if (!isUS) {
                          const lastPart = locationParts[locationParts.length - 1]?.trim();
                          if (lastPart && !state) {
                            country = lastPart;
                          }
                        }
                        
                        if (city && state) {
                          return `${concert.venue}, ${city}, ${state}`;
                        } else if (city && country) {
                          return `${concert.venue}, ${city}, ${country}`;
                        }
                        
                        // Fallback: just show venue if we can't parse
                        return concert.venue;
                      })() : 
                      concert.venue
                    }
                  </p>
                  <p className={styles.date}>{formatDate(concert.date)}</p>
                </div>
              </div>
            </div>
            <div 
              className={styles.rating}
              style={{
                backgroundColor: concert.rating ? getRatingBackgroundColor(concert.rating) : 'var(--color-border)',
                color: concert.rating ? getRatingColor(concert.rating) : 'var(--color-text-light)'
              }}
            >
              <span className={styles.ratingValue}>
                {concert.rating ? concert.rating.toFixed(1) : 'No rating'}
              </span>
            </div>
          </div>

          {concert.images && concert.images.length > 0 && (
            <Carousel 
              items={convertFilesToMediaItems(concert.images)}
              onItemClick={(item, index) => {
                try {
                  handleImageClick(item.file || item.url, { stopPropagation: () => {} });
                } catch (error) {
                  console.error('Error handling image click:', error);
                }
              }}
              className={styles.concertCarousel}
            />
          )}

          {concert.notes && (
            <div className={styles.notesSection}>
              {(concert.notes.includes('Other Artists:') || concert.notes.includes('Openers:')) ? (
                <p className={styles.notes}>
                  {concert.notes.includes('Other Artists:') ? concert.notes.split('\n\nOther Artists:')[0] : concert.notes.split('\n\nOpeners:')[0]}
                </p>
              ) : (
                <p className={styles.notes}>{concert.notes}</p>
              )}
            </div>
          )}
        </Card>
      ))}
    </div>
  );

  const renderGlobalConcerts = () => {
    // Filter concerts by selected year
    const filteredConcerts = globalRankings
      .filter(concert => concert.rating) // Only show concerts with ratings
      .filter(concert => {
        if (selectedYear === 'all') return true;
        const concertYear = new Date(concert.date).getFullYear();
        return concertYear === parseInt(selectedYear);
      })
      .sort((a, b) => (b.rating || 0) - (a.rating || 0)); // Sort by rating descending

    return (
      <>
        <div className={styles.globalFilters}>
          <select
            className={styles.yearSelect}
            value={selectedYear}
            onChange={(e) => handleYearFilter(e.target.value)}
          >
            <option value="all">All Years</option>
            {generateYearRange().map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className={styles.concertList}>
          {filteredConcerts.map((concert) => (
            <Card 
              key={concert.id} 
              className={styles.concertCard}
              clickable
              onClick={() => handleConcertClick(concert)}
            >
                            <div className={styles.cardHeader}>
                <div className={styles.concertInfo}>
                  <div className={styles.artistRow}>
                    <ArtistImage artistName={concert.artist} size="medium" className={styles.artistImageContainer} />
                    <div className={styles.artistDetails}>
                      <h3>{concert.artist}</h3>
                      {concert.notes && (concert.notes.includes('Other Artists:') || concert.notes.includes('Openers:')) && (
                        <p className={styles.openers}>
                          <strong>Other Artists:</strong> {concert.notes.includes('Other Artists:') ? concert.notes.split('Other Artists:')[1] : concert.notes.split('Openers:')[1]}
                        </p>
                      )}
                      <p className={styles.venue}>
                        {concert.location && concert.location !== 'Unknown City' ? 
                          (() => {
                            // Extract city, state, and country from location
                            const locationParts = concert.location.split(',');
                            
                            // Find the city, state, and country parts
                            let city = '';
                            let state = '';
                            let country = '';
                            
                            // Check if it's a US venue (contains "United States" or "USA")
                            const isUS = locationParts.some(part => 
                              part.trim().toLowerCase().includes('united states') || 
                              part.trim().toLowerCase().includes('usa')
                            );
                            
                            // Look for state pattern in the last few parts
                            for (let i = locationParts.length - 1; i >= 0; i--) {
                              const part = locationParts[i]?.trim();
                              if (!part) continue;
                              
                              // Check if this part contains a state (2-3 letters, possibly with zip)
                              const stateMatch = part.match(/^([A-Z]{2,3})/);
                              if (stateMatch) {
                                state = stateMatch[1];
                                // City is usually the part before the state
                                if (i > 0) {
                                  city = locationParts[i - 1]?.trim();
                                }
                                break;
                              }
                            }
                            
                            // For non-US venues, try to find country
                            if (!isUS) {
                              const lastPart = locationParts[locationParts.length - 1]?.trim();
                              if (lastPart && !state) {
                                country = lastPart;
                              }
                            }
                            
                            if (city && state) {
                              return `${concert.venue}, ${city}, ${state}`;
                            } else if (city && country) {
                              return `${concert.venue}, ${city}, ${country}`;
                            }
                            
                            // Fallback: just show venue if we can't parse
                            return concert.venue;
                          })() : 
                          concert.venue
                        }
                      </p>
                      <p className={styles.date}>{formatDate(concert.date)}</p>
                    </div>
                  </div>
                </div>
                <div className={styles.globalRating}>
                  <div 
                    className={styles.averageRating}
                    style={{
                      backgroundColor: concert.rating ? getRatingBackgroundColor(concert.rating) : 'var(--color-border)',
                      color: concert.rating ? getRatingColor(concert.rating) : 'var(--color-text-light)'
                    }}
                  >
                    <span className={styles.ratingValue}>
                      {concert.rating ? concert.rating.toFixed(1) : 'No rating'}
                    </span>
                    <span className={styles.ratingLabel}>avg</span>
                  </div>
                  <div className={styles.totalRatings}>
                    {concert.totalRatings || 0} ratings
                  </div>
                </div>
              </div>

              {concert.images && concert.images.length > 0 && (
                <Carousel 
                  items={convertFilesToMediaItems(concert.images)}
                  onItemClick={(item, index) => {
                    try {
                      handleImageClick(item.file || item.url, { stopPropagation: () => {} });
                    } catch (error) {
                      console.error('Error handling image click:', error);
                    }
                  }}
                  className={styles.concertCarousel}
                />
              )}

              {concert.notes && (
                <div className={styles.notesSection}>
                  {(concert.notes.includes('Other Artists:') || concert.notes.includes('Openers:')) ? (
                    <p className={styles.notes}>
                      {concert.notes.includes('Other Artists:') ? concert.notes.split('\n\nOther Artists:')[0] : concert.notes.split('\n\nOpeners:')[0]}
                    </p>
                  ) : (
                    <p className={styles.notes}>{concert.notes}</p>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      </>
    );
  };

  if (concertsLoading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner}></div>
        <p>Loading concerts...</p>
      </div>
    );
  }

  return (
    <div className={styles.home}>
      <section className={styles.header}>
        <div className={styles.stats}>
          <div className={styles.viewToggle}>
            <button 
              className={`${styles.toggleButton} ${viewMode === 'personal' ? styles.active : ''}`}
              onClick={() => handleViewModeChange('personal')}
            >
              My Rankings
            </button>
            <button 
              className={`${styles.toggleButton} ${viewMode === 'global' ? styles.active : ''}`}
              onClick={() => handleViewModeChange('global')}
            >
              Global Rankings
            </button>
          </div>
          <p className={styles.concertCount}>
            {viewMode === 'personal' ? `${concertCount} concerts ranked` : 'Top rated concerts of all time'}
          </p>
        </div>
                    {viewMode === 'personal' && (
              <Button onClick={handleAddConcertClick}>
                Add Concert
              </Button>
            )}
      </section>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {viewMode === 'personal' ? renderPersonalConcerts() : renderGlobalConcerts()}

      <Modal
        isOpen={showLimitPrompt}
        onClose={() => setShowLimitPrompt(false)}
        title="You've reached the free limit!"
      >
        <div className={styles.limitPromptContent}>
          <p>You've ranked {FREE_CONCERT_LIMIT} amazing concerts. Ready to unlock more memories?</p>
          
          <div className={styles.promptOptions}>
            <div className={styles.promptOption}>
              <h4>Invite Friends</h4>
              <p>Get 3 more concert slots for each friend who joins!</p>
              <Button onClick={() => setShowLimitPrompt(false)}>
                Invite Friends
              </Button>
            </div>
            
            <div className={styles.divider}>
              <span>or</span>
            </div>

            <div className={styles.promptOption}>
              <h4>Go Unlimited</h4>
              <p>Subscribe to rank unlimited concerts and unlock premium features!</p>
              <Button onClick={() => setShowLimitPrompt(false)}>
                Upgrade to Pro
              </Button>
            </div>
          </div>

          <button 
            className={styles.closePrompt}
            onClick={() => setShowLimitPrompt(false)}
          >
            Maybe Later
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={showAddConcert}
        onClose={handleAddConcertClose}
        title="Add New Concert"
      >
        <form onSubmit={handleAddConcertSubmit} className={styles.form}>
          <div className={styles.artistsSection}>
            <label className={styles.artistsLabel}>Artists</label>
            {artists.map((artist, index) => (
              <div key={index} className={styles.artistRow}>
                <Autocomplete
                  value={index === 0 ? newConcertData.artist : artist}
                  onChange={(value) => {
                    if (index === 0) {
                      setNewConcertData(prev => ({ ...prev, artist: value }));
                      setArtistQuery(value);
                    } else {
                      // Update both the artists array and the queries array
                      const newArtists = [...artists];
                      newArtists[index] = value;
                      setArtists(newArtists);
                      
                      updateArtistQuery(index, value);
                    }
                  }}
                  onSelect={(selectedArtist) => handleArtistSelect(selectedArtist, index)}
                  placeholder={index === 0 ? "Main artist..." : "Opener/additional artist..."}
                  label={index === 0 ? "Main Artist" : `Artist ${index + 1}`}
                  options={index === 0 ? artistOptions : artistOptionsList[index]}
                  isLoading={index === 0 ? isSearchingArtists : isSearchingArtistsList[index]}
                  minChars={2}
                />
                {index > 0 && (
                  <button
                    type="button"
                    className={styles.removeArtistButton}
                    onClick={() => removeArtist(index)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className={styles.addArtistButton}
              onClick={addArtist}
            >
              + Add Opener/Additional Artist
            </button>
          </div>

          <Autocomplete
            value={newConcertData.venue}
            onChange={(value) => {
              setNewConcertData(prev => ({ ...prev, venue: value }));
              setVenueQuery(value);
            }}
            onSelect={handleVenueSelect}
            placeholder="Start typing venue name..."
            label="Venue"
            options={venueOptions}
            isLoading={isSearchingVenues}
            minChars={2}
          />

          <Input
            label="Date"
            type="date"
            value={newConcertData.date}
            onChange={(e) => setNewConcertData(prev => ({ ...prev, date: e.target.value }))}
            required
          />

          <Input
            label="Notes"
            type="textarea"
            value={newConcertData.notes}
            onChange={(e) => setNewConcertData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Any memories or notes about this concert..."
          />

          <div className={styles.photoUploadSection}>
            <label className={styles.photoUploadLabel}>Photos</label>
            <div className={styles.photoUploadArea}>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => handleImageUpload(e, false)}
                className={styles.photoInput}
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className={styles.photoUploadButton}>
                <span className={styles.uploadIcon}>📷</span>
                <span>Add Photos</span>
                <small>Tap to select from camera roll or take a photo</small>
              </label>
            </div>
            {selectedImages.length > 0 && renderImagePreview(selectedImages, handleRemoveImage, false)}
          </div>

          <div className={styles.formActions}>
            <Button type="submit">Continue to Ranking</Button>
            <Button 
              type="button" 
              secondary 
              onClick={handleAddConcertClose}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showRankingComparison}
        onClose={handleRankingCancel}
      >
        <RankingComparison
          newConcert={newConcertData}
          existingConcerts={personalConcerts}
          onComplete={handleRankingComplete}
          onCancel={handleRankingCancel}
          isEarlyConcert={concertCount < 3}
        />
      </Modal>

      <Modal
        isOpen={showFirstConcertRating}
        onClose={handleFirstConcertRatingCancel}
      >
        <FirstConcertRating
          newConcert={newConcertData}
          onComplete={handleFirstConcertRatingComplete}
          onCancel={handleFirstConcertRatingCancel}
          concertNumber={concertCount + 1}
        />
      </Modal>

      <Modal
        isOpen={showOpenerPrompt}
        onClose={handleOpenerPromptNo}
        title="Rate the Opener?"
      >
        <div className={styles.openerPrompt}>
          <div className={styles.promptContent}>
            <div className={styles.promptIcon}>🎤</div>
            <h3>Would you like to rate {openerToRate} separately?</h3>
            <p>
              You added {openerToRate} as an additional artist for {newConcertData.artist}. 
              Would you like to create a separate rating for this artist?
            </p>
            <p className={styles.promptSubtext}>
              This will create a separate concert entry for the additional artist with its own rating.
            </p>
          </div>
          <div className={styles.promptActions}>
            <Button 
              onClick={handleOpenerPromptYes}
              fullWidth
            >
              Yes, Rate Separately
            </Button>
            <Button 
              secondary 
              onClick={handleOpenerPromptNo}
              fullWidth
            >
              No, Just Add to Notes
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showOpenerRating}
        onClose={handleOpenerRatingCancel}
      >
        <FirstConcertRating
          newConcert={{
            artist: openerToRate,
            venue: newConcertData.venue,
            date: newConcertData.date,
            notes: `Opener for ${newConcertData.artist}`,
            images: []
          }}
          onComplete={handleOpenerRatingComplete}
          onCancel={handleOpenerRatingCancel}
          concertNumber={personalConcerts.filter(concert => concert.rating).length + 1}
        />
      </Modal>

      <Modal
        isOpen={showOpenerRanking}
        onClose={handleOpenerRankingCancel}
      >
        <RankingComparison
          newConcert={{
            artist: openerToRate,
            venue: newConcertData.venue,
            date: newConcertData.date,
            notes: `Opener for ${newConcertData.artist}`,
            images: []
          }}
          existingConcerts={personalConcerts}
          onComplete={handleOpenerRankingComplete}
          onCancel={handleOpenerRankingCancel}
          isEarlyConcert={false}
        />
      </Modal>

      {selectedConcert && (
        <ConcertDetails
          concert={selectedConcert}
          onClose={() => setSelectedConcert(null)}
          onEdit={handleEditConcert}
        />
      )}

      <Modal
        isOpen={showEditConcert && editingConcert !== null}
        onClose={() => {
          setShowEditConcert(false);
          setEditingConcert(null);
          setEditingImages([]);
          setArtistQuery('');
          setVenueQuery('');
          setArtistOptions([]);
          setVenueOptions([]);
          
          // Reset editing artists state
          setEditingArtists(['']);
          setEditingArtistQueries(['']);
          setEditingArtistOptionsList([[]]);
          setIsSearchingEditingArtistsList([false]);
        }}
        title="Edit Concert"
      >
        {editingConcert && (
          <>
            <form onSubmit={handleEditSubmit} className={styles.form}>
              <div className={styles.artistsSection}>
                <label className={styles.artistsLabel}>Artists</label>
                {editingArtists.map((artist, index) => (
                  <div key={index} className={styles.artistRow}>
                    <Autocomplete
                      value={index === 0 ? editingConcert?.artist || '' : artist}
                      onChange={(value) => {
                        if (index === 0) {
                          setEditingConcert(prev => ({ ...prev, artist: value }));
                          // Trigger artist search for main artist
                          const timeoutId = setTimeout(async () => {
                            if (value.length >= 2) {
                              try {
                                const results = await searchService.searchArtists(value);
                                setEditingArtistOptionsList(prev => {
                                  const newList = [...prev];
                                  newList[0] = results;
                                  return newList;
                                });
                              } catch (error) {
                                console.error('Error searching artists:', error);
                                setEditingArtistOptionsList(prev => {
                                  const newList = [...prev];
                                  newList[0] = [];
                                  return newList;
                                });
                              }
                            } else {
                              setEditingArtistOptionsList(prev => {
                                const newList = [...prev];
                                newList[0] = [];
                                return newList;
                              });
                            }
                          }, 300);
                        } else {
                          // Update both the artists array and the queries array
                          const newEditingArtists = [...editingArtists];
                          newEditingArtists[index] = value;
                          setEditingArtists(newEditingArtists);
                          
                          updateEditingArtistQuery(index, value);
                        }
                      }}
                      onSelect={(selectedArtist) => handleEditArtistSelect(selectedArtist, index)}
                      placeholder={index === 0 ? "Main artist..." : "Opener/additional artist..."}
                      label={index === 0 ? "Main Artist" : `Artist ${index + 1}`}
                      options={editingArtistOptionsList[index] || []}
                      isLoading={isSearchingEditingArtistsList[index] || false}
                      minChars={2}
                    />
                    {index > 0 && (
                      <button
                        type="button"
                        className={styles.removeArtistButton}
                        onClick={() => removeEditingArtist(index)}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <Autocomplete
                value={editingConcert?.venue || ''}
                onChange={(value) => {
                  setEditingConcert(prev => ({ ...prev, venue: value }));
                  setVenueQuery(value);
                }}
                onSelect={handleEditVenueSelect}
                placeholder="Start typing venue name..."
                label="Venue"
                options={venueOptions}
                isLoading={isSearchingVenues}
                minChars={2}
              />

              <Input
                label="Date"
                type="date"
                value={editingConcert?.date || ''}
                onChange={(e) => setEditingConcert(prev => ({ ...prev, date: e.target.value }))}
                required
              />

              <button
                type="button"
                className={styles.addArtistButton}
                onClick={addEditingArtist}
              >
                + Add Opener/Additional Artist
              </button>

              <Input
                label="Notes"
                type="textarea"
                value={editingConcert?.notes || ''}
                onChange={(e) => setEditingConcert(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any memories or notes about this concert..."
              />

              <div className={styles.ratingAdjustmentSection}>
                <label className={styles.ratingAdjustmentLabel}>Rating</label>
                <div className={styles.ratingAdjustmentArea}>
                  <div className={styles.ratingDisplay}>
                    <span 
                      className={styles.ratingValue}
                      style={{ color: editingConcert?.rating ? getRatingColor(editingConcert.rating) : 'var(--color-text-light)' }}
                    >
                      {editingConcert?.rating?.toFixed(1) || '0.0'}
                    </span>
                    <span className={styles.ratingLabel}>/ 10.0</span>
                  </div>
                  <div className={styles.sliderContainer}>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.1"
                      value={editingConcert?.rating || 0}
                      onChange={(e) => handleRatingChange(parseFloat(e.target.value))}
                      className={styles.ratingSlider}
                    />
                    <div className={styles.sliderMarks}>
                      <span>0</span>
                      <span>2</span>
                      <span>4</span>
                      <span>6</span>
                      <span>8</span>
                      <span>10</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.photoUploadSection}>
                <label className={styles.photoUploadLabel}>Photos</label>
                
                {/* Show existing images */}
                {editingConcert?.images && editingConcert.images.length > 0 && (
                  <div className={styles.existingImagesSection}>
                    <h4>Existing Photos</h4>
                    {renderExistingImages(editingConcert.images)}
                  </div>
                )}
                
                {/* Upload new images */}
                <div className={styles.photoUploadArea}>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={(e) => handleImageUpload(e, true)}
                    className={styles.photoInput}
                    id="photo-upload-edit"
                  />
                  <label 
                    htmlFor="photo-upload-edit" 
                    className={styles.photoUploadButton}
                  >
                    <span className={styles.uploadIcon}>📷</span>
                    <span>Add Photos</span>
                    <small>Tap to select from camera roll or take a photo</small>
                  </label>
                </div>
                
                {/* Show new uploaded images */}
                {editingImages.length > 0 && (
                  <div className={styles.newImagesSection}>
                    <h4>New Photos</h4>
                    {renderImagePreview(editingImages, handleRemoveImage, true)}
                  </div>
                )}
              </div>

              <div className={styles.formActions}>
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button 
                  type="button" 
                  secondary 
                  onClick={() => {
                    setShowEditConcert(false);
                    setEditingConcert(null);
                    setEditingImages([]);
                    setArtistQuery('');
                    setVenueQuery('');
                    setArtistOptions([]);
                    setVenueOptions([]);
                    
                    // Reset editing artists state
                    setEditingArtists(['']);
                    setEditingArtistQueries(['']);
                    setEditingArtistOptionsList([[]]);
                    setIsSearchingEditingArtistsList([false]);
                  }}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
              </div>
            </form>

            <div className={styles.deleteSection}>
              <div className={styles.deleteDivider}></div>
              <Button 
                type="button" 
                danger 
                onClick={handleDeleteConcert}
                fullWidth
              >
                Delete Concert
              </Button>
            </div>
          </>
        )}
      </Modal>

      <Modal
        isOpen={showFirstConcertPrompt}
        onClose={() => setShowFirstConcertPrompt(false)}
        title="Welcome to Encore!"
      >
        <div className={styles.firstConcertPrompt}>
          <div className={styles.promptContent}>
            <div className={styles.promptIcon}>🎵</div>
            <h3>Start Your Concert Collection</h3>
            <p>
              You haven't added any concerts yet. Add your first concert to start building your personal concert memory collection!
            </p>
            <p className={styles.promptSubtext}>
              Rate your concerts on a 10.0 scale and see how they stack up against each other.
            </p>
          </div>
          <div className={styles.promptActions}>
            <Button 
              onClick={() => {
                setShowFirstConcertPrompt(false);
                setShowAddConcert(true);
              }}
              fullWidth
            >
              Add Your First Concert
            </Button>
            <Button 
              secondary 
              onClick={() => setShowFirstConcertPrompt(false)}
              fullWidth
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </Modal>

                  {/* Media Modal */}
            <Modal
              isOpen={showImageModal}
              onClose={() => setShowImageModal(false)}
            >
              <div className={styles.imageModalContent}>
                {selectedImage && (
                  selectedImage.type && selectedImage.type.startsWith('video/') ? (
                    <video
                      src={typeof selectedImage === 'string' ? selectedImage : URL.createObjectURL(selectedImage)}
                      controls
                      autoPlay
                      className={styles.fullSizeImage}
                      onError={(e) => console.error('Modal video error:', e)}
                      playsInline
                      webkit-playsinline="true"
                    />
                  ) : (
                    <img
                      src={typeof selectedImage === 'string' ? selectedImage : URL.createObjectURL(selectedImage)}
                      alt="Full size concert image"
                      className={styles.fullSizeImage}
                      onError={(e) => console.error('Modal image error:', e)}
                    />
                  )
                )}
              </div>
            </Modal>
    </div>
  );
};

export default Home; 