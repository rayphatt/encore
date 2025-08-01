import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { auth, db, storage } from '../firebase';

// User interface
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  profilePicture?: string;
}

// Concert interface
export interface Concert {
  id: string;
  userId: string;
  artist: string;
  venue: string;
  location: string;
  date: string;
  rating?: number;
  notes?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
  // Aggregate fields for global rankings
  totalRatings?: number;
  averageRating?: number;
}

// Auth service
export const firebaseAuthService = {
  // Register new user
  async register(email: string, password: string, name: string, phone: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile with display name
      await updateProfile(user, { displayName: name });

      // Save additional user data to Firestore
      const userData: Omit<User, 'id'> = {
        email: user.email!,
        name,
        phone
      };

      await setDoc(doc(db, 'users', user.uid), userData);

      return {
        id: user.uid,
        ...userData
      };
    } catch (error) {
      // Re-throw the error so it can be handled by the AuthContext
      throw error;
    }
  },

  // Login user
  async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get additional user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();

      return {
        id: user.uid,
        email: user.email!,
        name: user.displayName || userData?.name || '',
        phone: userData?.phone || ''
      };
    } catch (error) {
      // Re-throw the error so it can be handled by the AuthContext
      throw error;
    }
  },

  // Logout user
  async logout(): Promise<void> {
    await signOut(auth);
  },

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        unsubscribe();
        
        if (!firebaseUser) {
          resolve(null);
          return;
        }

        try {
          // Get additional user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          const userData = userDoc.data();

          resolve({
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            name: firebaseUser.displayName || userData?.name || '',
            phone: userData?.phone || ''
          });
        } catch (error) {
          console.error('Error getting user data:', error);
          resolve(null);
        }
      });
    });
  },

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        callback(null);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const userData = userDoc.data();

        callback({
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          name: firebaseUser.displayName || userData?.name || '',
          phone: userData?.phone || ''
        });
      } catch (error) {
        console.error('Error getting user data:', error);
        callback(null);
      }
    });
  }
};

// Concert service
export const firebaseConcertService = {
  // Create new concert
  async createConcert(userId: string, concertData: Omit<Concert, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Concert> {
    try {
      const now = new Date().toISOString();
      
      // Validate required fields
      if (!concertData.artist || !concertData.venue || !concertData.date) {
        throw new Error('Artist, venue, and date are required');
      }
      
      // Handle image uploads if present
      let imageUrls: string[] = [];
      if (concertData.images && concertData.images.length > 0) {
        try {
          // Check if images are File objects or already URLs
          const fileImages = concertData.images.filter(img => 
            typeof img === 'object' && img !== null && 'name' in img && 'type' in img
          ) as File[];
          if (fileImages.length > 0) {
            imageUrls = await this.uploadImages(userId, fileImages);
          } else {
            // Images are already URLs
            imageUrls = concertData.images as string[];
          }
        } catch (uploadError) {
          console.error('Error uploading images:', uploadError);
          // Continue without images rather than failing the entire operation
          imageUrls = [];
        }
      }
      
      // Use provided location or derive from venue name as fallback
      const finalLocation = concertData.location || (concertData.venue.includes(',') ? concertData.venue : `${concertData.venue}, Unknown City`);
      
      const concertToSave = {
        ...concertData,
        location: finalLocation,
        userId,
        images: imageUrls,
        createdAt: now,
        updatedAt: now
      };

      const docRef = await addDoc(collection(db, 'concerts'), concertToSave);
      
      return {
        id: docRef.id,
        ...concertToSave
      };
    } catch (error) {
      console.error('Error creating concert:', error);
      throw new Error(`Failed to create concert: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Get user's concerts
  async getUserConcerts(userId: string): Promise<Concert[]> {
    const q = query(collection(db, 'concerts'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const concerts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Concert[];
    // Sort in memory for now to avoid index requirement
    return concerts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  // Get global rankings
  async getGlobalRankings(): Promise<Concert[]> {
    const q = query(collection(db, 'concerts'));
    const querySnapshot = await getDocs(q);
    const concerts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Concert[];
    
    // Group concerts by unique artist, venue, and date combination
    const concertGroups = new Map<string, Concert[]>();
    
    concerts.forEach(concert => {
      if (concert.rating && concert.rating > 0) {
        // Create a unique key for grouping
        const key = `${concert.artist}|${concert.venue}|${concert.date}`;
        
        if (!concertGroups.has(key)) {
          concertGroups.set(key, []);
        }
        concertGroups.get(key)!.push(concert);
      }
    });
    
    // Calculate aggregate statistics for each group
    const aggregatedConcerts: Concert[] = [];
    
    concertGroups.forEach((groupConcerts, key) => {
      if (groupConcerts.length > 0) {
        const firstConcert = groupConcerts[0];
        const totalRatings = groupConcerts.length;
        const averageRating = groupConcerts.reduce((sum, concert) => sum + (concert.rating || 0), 0) / totalRatings;
        
        // Create aggregated concert object
        const aggregatedConcert: Concert = {
          ...firstConcert,
          id: key, // Use the key as the unique ID
          totalRatings,
          averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
          rating: averageRating // Use average rating for sorting
        };
        
        aggregatedConcerts.push(aggregatedConcert);
      }
    });
    
    // Sort by average rating descending and limit to top 50
    return aggregatedConcerts
      .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
      .slice(0, 50);
  },

  // Update concert
  async updateConcert(concertId: string, concertData: Partial<Concert>): Promise<void> {
    try {
      console.log('=== UPDATE CONCERT DEBUG ===');
      console.log('concertId:', concertId);
      console.log('concertData:', concertData);
      
      // Validate concert exists
      const concertDoc = await getDoc(doc(db, 'concerts', concertId));
      if (!concertDoc.exists()) {
        throw new Error('Concert not found');
      }
      
      const updateData: any = {
        ...concertData,
        updatedAt: new Date().toISOString()
      };
      
      // Handle image uploads if present
      if (concertData.images && Array.isArray(concertData.images) && concertData.images.length > 0) {
        console.log('Processing images for update...');
        // Check if images are File objects (new uploads) or URLs (existing)
        const newImages = concertData.images.filter(img => 
          typeof img === 'object' && img !== null && 'name' in img && 'type' in img
        ) as File[];
        const existingImages = concertData.images.filter(img => typeof img === 'string') as string[];
        
        console.log('newImages:', newImages);
        console.log('existingImages:', existingImages);
        
        if (newImages.length > 0) {
          console.log('Found new images to upload');
          const concert = concertDoc.data();
          if (concert) {
            try {
              console.log('Found concert, uploading images...');
              const uploadedUrls = await this.uploadImages(concert.userId, newImages);
              console.log('Uploaded URLs:', uploadedUrls);
              updateData.images = [...existingImages, ...uploadedUrls];
            } catch (uploadError) {
              console.error('Error uploading images:', uploadError);
              // Continue with existing images rather than failing
              updateData.images = existingImages;
            }
          }
        } else {
          console.log('No new images to upload');
          updateData.images = existingImages;
        }
      } else {
        console.log('No images in concertData');
      }
      
      console.log('Final updateData:', updateData);
      const dataSize = JSON.stringify(updateData).length;
      console.log('Total data size:', dataSize, 'bytes');
      
      // Firestore has a 1MB document size limit - implement chunked uploads
      if (dataSize > 500000) { // 500KB limit to be safe
        console.error('Data too large for Firestore:', dataSize, 'bytes');
        
        // Check if we have multiple files that can be split
        const newImages = concertData.images?.filter(img => 
          typeof img === 'object' && img !== null && 'name' in img && 'type' in img
        ) as File[];
        
        if (newImages && newImages.length > 1) {
          console.log('Attempting chunked upload - splitting files into smaller batches');
          
          // Split files into smaller batches
          const batchSize = Math.ceil(newImages.length / 2); // Split into 2 batches
          const batch1 = newImages.slice(0, batchSize);
          const batch2 = newImages.slice(batchSize);
          
          console.log(`Splitting ${newImages.length} files into batches of ${batchSize} and ${batch2.length}`);
          
          const concert = concertDoc.data();
          
          if (!concert) {
            throw new Error('Concert not found');
          }
          
          // Upload first batch
          if (batch1.length > 0) {
            try {
              const uploadedUrls1 = await this.uploadImages(concert.userId, batch1);
              const existingImages = concertData.images?.filter(img => typeof img === 'string') as string[];
              const updateData1 = {
                ...concertData,
                images: [...existingImages, ...uploadedUrls1],
                updatedAt: new Date().toISOString()
              };
              
              await updateDoc(doc(db, 'concerts', concertId), updateData1);
              console.log('First batch uploaded successfully');
            } catch (error) {
              console.error('Error uploading first batch:', error);
              throw new Error('Failed to upload images. Please try with smaller files.');
            }
          }
          
          // Upload second batch if it exists
          if (batch2.length > 0) {
            try {
              const uploadedUrls2 = await this.uploadImages(concert.userId, batch2);
              const currentDoc = await getDoc(doc(db, 'concerts', concertId));
              const currentData = currentDoc.data();
              const currentImages = currentData?.images || [];
              
              const updateData2 = {
                images: [...currentImages, ...uploadedUrls2],
                updatedAt: new Date().toISOString()
              };
              
              await updateDoc(doc(db, 'concerts', concertId), updateData2);
              console.log('Second batch uploaded successfully');
            } catch (error) {
              console.error('Error uploading second batch:', error);
              throw new Error('Failed to upload remaining images. Please try with smaller files.');
            }
          }
          
          console.log('Chunked upload completed successfully');
          return;
        } else {
          throw new Error('Uploaded files are too large. Please try with fewer or smaller files (under 5MB each).');
        }
      }
      
      try {
        await updateDoc(doc(db, 'concerts', concertId), updateData);
        console.log('Database update successful');
      } catch (error) {
        console.error('Database update failed:', error);
        throw new Error(`Database update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      console.log('=== END UPDATE CONCERT DEBUG ===');
    } catch (error) {
      console.error('Error updating concert:', error);
      throw new Error(`Failed to update concert: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Update concert rating
  async updateConcertRating(concertId: string, rating: number): Promise<void> {
    await updateDoc(doc(db, 'concerts', concertId), {
      rating,
      updatedAt: new Date().toISOString()
    });
  },

  // Delete concert
  async deleteConcert(concertId: string): Promise<void> {
    // Get concert data to delete associated images
    const concertDoc = await getDoc(doc(db, 'concerts', concertId));
    const concert = concertDoc.data();
    
    if (concert && concert.images && concert.images.length > 0) {
      // Delete all images from storage
      await Promise.all(
        concert.images.map(async (imageUrl: string) => {
          try {
            const imageRef = ref(storage, imageUrl);
            await deleteObject(imageRef);
          } catch (error) {
            console.error('Error deleting image:', error);
          }
        })
      );
    }
    
    await deleteDoc(doc(db, 'concerts', concertId));
  },

  // Helper method to compress images
  async compressImage(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Image file ${file.name} took too long to process`));
      }, 8000); // 8 second timeout
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        try {
          clearTimeout(timeout);
          const maxSize = 600; // Reduced from 800
          let { width, height } = img;
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
          
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.3); // Reduced quality to 0.3
          console.log(`Created compressed data URL for image (${compressedDataUrl.length} bytes)`);
          resolve(compressedDataUrl);
        } catch (error) {
          clearTimeout(timeout);
          reject(error);
        }
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        reject(new Error(`Failed to load image: ${file.name}`));
      };
      
      img.src = URL.createObjectURL(file);
    });
  },

  // Helper method to generate video thumbnail
  async generateVideoThumbnail(videoFile: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      video.onloadedmetadata = () => {
        // Set canvas size to thumbnail size
        canvas.width = 300;
        canvas.height = 200;
        
        // Seek to 0.1 seconds to get a good frame
        video.currentTime = 0.1;
      };
      
      video.onseeked = () => {
        try {
          // Draw the video frame to canvas
          ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Convert to data URL
          const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          console.log(`Generated thumbnail for ${videoFile.name} (${thumbnailDataUrl.length} bytes)`);
          resolve(thumbnailDataUrl);
        } catch (error) {
          console.error('Error generating thumbnail:', error);
          // Fallback to a simple placeholder
          const fallbackThumbnail = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMzMzIi8+CjxjaXJjbGUgY3g9IjE1MCIgY3k9IjEwMCIgcj0iNDAiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjgiLz4KPHBhdGggZD0iTTEzMCA5MGw0MCAyMC00MCAyMFY5MHoiIGZpbGw9IndoaXRlIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5WaWRlbyBQbGFjZWhvbGRlcjwvdGV4dD4KPC9zdmc+';
          resolve(fallbackThumbnail);
        }
      };
      
      video.onerror = () => {
        console.error('Error loading video for thumbnail generation');
        // Fallback to a simple placeholder
        const fallbackThumbnail = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMzMzIi8+CjxjaXJjbGUgY3g9IjE1MCIgY3k9IjEwMCIgcj0iNDAiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjgiLz4KPHBhdGggZD0iTTEzMCA5MGw0MCAyMC00MCAyMFY5MHoiIGZpbGw9IndoaXRlIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5WaWRlbyBQbGFjZWhvbGRlcjwvdGV4dD4KPC9zdmc+';
        resolve(fallbackThumbnail);
      };
      
      // Load the video file
      video.src = URL.createObjectURL(videoFile);
      video.muted = true;
      video.preload = 'metadata';
    });
  },

    async uploadImages(userId: string, images: File[]): Promise<string[]> {
    console.log('=== SOLVING STORAGE vs DISPLAY PARADOX ===');
    console.log('userId:', userId);
    console.log('media files:', images);
    
    const dataUrls: string[] = [];
    
    for (let index = 0; index < images.length; index++) {
      const file = images[index];
      console.log(`Processing file ${index}: ${file.name} (${file.size} bytes)`);
      
      try {
        if (file.type.startsWith('video/')) {
          // VIDEOS: Use Firebase Storage to solve the paradox
          console.log(`Processing video file ${index} with Firebase Storage...`);
          
          if (file.size > 100 * 1024 * 1024) { // 100MB limit for videos
            console.warn(`Video file ${file.name} is too large (${file.size} bytes). Skipping.`);
            continue;
          }
          
          try {
            // Upload to Firebase Storage
            const videoRef = ref(storage, `videos/${userId}/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(videoRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            
            console.log(`Video uploaded to Firebase Storage: ${downloadURL}`);
            dataUrls.push(downloadURL);
            console.log(`Completed video ${index} with Firebase Storage`);
            
          } catch (storageError) {
            console.error('Firebase Storage upload failed:', storageError);
            
            // FALLBACK: Use data URL for small videos only
            if (file.size <= 800000) { // 800KB limit for fallback
              console.log(`Falling back to data URL for small video ${file.name}`);
              const videoUrl = await new Promise<string>((resolve, reject) => {
                const timeout = setTimeout(() => {
                  reject(new Error(`Video file ${file.name} took too long to process`));
                }, 15000);
                
                const reader = new FileReader();
                reader.onload = () => {
                  clearTimeout(timeout);
                  const dataUrl = reader.result as string;
                  console.log(`Created fallback data URL for video ${index} (${dataUrl.length} bytes)`);
                  resolve(dataUrl);
                };
                reader.onerror = () => {
                  clearTimeout(timeout);
                  reject(new Error(`Failed to read video: ${file.name}`));
                };
                reader.readAsDataURL(file);
              });
              dataUrls.push(videoUrl);
              console.log(`Completed video ${index} with fallback data URL`);
            } else {
              // Use placeholder for large videos that can't be stored
              console.warn(`Video ${file.name} too large for fallback (${file.size} bytes). Using placeholder.`);
              const placeholderVideo = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMzMzIi8+CjxjaXJjbGUgY3g9IjE1MCIgY3k9IjEwMCIgcj0iNDAiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjgiLz4KPHBhdGggZD0iTTEzMCA5MGw0MCAyMC00MCAyMFY5MHoiIGZpbGw9IndoaXRlIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5WaWRlbyBQbGFjZWhvbGRlcjwvdGV4dD4KPC9zdmc+';
              dataUrls.push(placeholderVideo);
              console.log(`Completed video ${index} with placeholder`);
            }
          }
          
        } else if (file.type.startsWith('image/')) {
          // IMAGES: Continue using compressed data URLs (works fine)
          console.log(`Processing image file ${index}...`);
          const compressedImage = await this.compressImage(file);
          dataUrls.push(compressedImage);
          console.log(`Completed image ${index}`);
        } else {
          console.warn(`Unsupported file type: ${file.type}. Skipping file ${file.name}`);
        }
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        // Remove showToast call since it's not available in this context
      }
    }
    
    console.log('=== END UPLOAD MEDIA DEBUG (PARADOX SOLVED) ===');
    return dataUrls;
  }
}; 