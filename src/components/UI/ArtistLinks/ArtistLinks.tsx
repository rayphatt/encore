import React, { useState, useEffect } from 'react';
import styles from './ArtistLinks.module.css';
import { spotifyService } from '../../../services/spotify';

interface ArtistLinksProps {
  artistName: string;
  className?: string;
}

const ArtistLinks: React.FC<ArtistLinksProps> = ({ artistName, className }) => {
  const [spotifyUrl, setSpotifyUrl] = useState<string | null>(null);
  const [isLoadingSpotify, setIsLoadingSpotify] = useState(false);

  // Get Spotify artist info when component mounts
  useEffect(() => {
    const getSpotifyInfo = async () => {
      setIsLoadingSpotify(true);
      try {
        const artistInfo = await spotifyService.getArtistInfoCached(artistName);
        if (artistInfo) {
          setSpotifyUrl(artistInfo.spotifyUrl);
        }
      } catch (error) {
        console.error('Error getting Spotify artist info:', error);
      } finally {
        setIsLoadingSpotify(false);
      }
    };

    getSpotifyInfo();
  }, [artistName]);

  const handleSpotifyClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent concert card click
    
    // Use direct artist URL if available, otherwise fall back to search
    const url = spotifyUrl || `https://open.spotify.com/search/${encodeURIComponent(artistName)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleTicketmasterClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent concert card click
    
    // Direct Ticketmaster search URL for best user experience
    const ticketmasterUrl = `https://www.ticketmaster.com/search?q=${encodeURIComponent(artistName)}`;
    
    console.log('🎫 Opening Ticketmaster search:', ticketmasterUrl);
    window.open(ticketmasterUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`${styles.artistLinks} ${className || ''}`}>
      <button
        className={`${styles.linkButton} ${isLoadingSpotify ? styles.loading : ''}`}
        onClick={handleSpotifyClick}
        title={spotifyUrl ? `View ${artistName} on Spotify` : `Search for ${artistName} on Spotify`}
        aria-label={spotifyUrl ? `View ${artistName} on Spotify` : `Search for ${artistName} on Spotify`}
        disabled={isLoadingSpotify}
      >
        {isLoadingSpotify ? (
          <div className={styles.loadingSpinner}></div>
        ) : (
          <svg className={styles.spotifyIcon} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
        )}
      </button>
                   <button
               className={styles.linkButton}
               onClick={handleTicketmasterClick}
               title={`Find ${artistName} tickets on Ticketmaster`}
               aria-label={`Find ${artistName} tickets on Ticketmaster`}
             >
               <svg className={styles.ticketmasterIcon} viewBox="0 0 24 24" fill="currentColor">
                 {/* Ticketmaster logo: blue ticket with white "t" */}
                 <path d="M22 10V6c0-1.11-.9-2-2-2H4c-1.1 0-1.99.89-1.99 2v4c1.1 0 2 .9 2 2s-.9 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2z"/>
                 <text x="12" y="16" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="Arial, sans-serif">t</text>
               </svg>
             </button>
    </div>
  );
};

export default ArtistLinks; 