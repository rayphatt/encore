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
}

// Auth service
export const firebaseAuthService = {
  // Register new user
  async register(email: string, password: string, name: string, phone: string): Promise<User> {
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
  },

  // Login user
  async login(email: string, password: string): Promise<User> {
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
    const now = new Date().toISOString();
    
    // Handle image uploads if present
    let imageUrls: string[] = [];
    if (concertData.images && concertData.images.length > 0) {
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
    // Sort and limit in memory for now to avoid index requirement
    return concerts
      .filter(concert => concert.rating && concert.rating > 0)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 50);
  },

  // Update concert
  async updateConcert(concertId: string, concertData: Partial<Concert>): Promise<void> {
    console.log('=== UPDATE CONCERT DEBUG ===');
    console.log('concertId:', concertId);
    console.log('concertData:', concertData);
    
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
        // Get the concert to find userId for upload path
        const concertDoc = await getDoc(doc(db, 'concerts', concertId));
        const concert = concertDoc.data();
        if (concert) {
          console.log('Found concert, uploading images...');
          const uploadedUrls = await this.uploadImages(concert.userId, newImages);
          console.log('Uploaded URLs:', uploadedUrls);
          updateData.images = [...existingImages, ...uploadedUrls];
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
        
        // Get the concert to find userId for upload path
        const concertDoc = await getDoc(doc(db, 'concerts', concertId));
        const concert = concertDoc.data();
        
        if (!concert) {
          throw new Error('Concert not found');
        }
        
        // Upload first batch
        if (batch1.length > 0) {
          const uploadedUrls1 = await this.uploadImages(concert.userId, batch1);
          const existingImages = concertData.images?.filter(img => typeof img === 'string') as string[];
          const updateData1 = {
            ...concertData,
            images: [...existingImages, ...uploadedUrls1],
            updatedAt: new Date().toISOString()
          };
          
          await updateDoc(doc(db, 'concerts', concertId), updateData1);
          console.log('First batch uploaded successfully');
        }
        
        // Upload second batch if it exists
        if (batch2.length > 0) {
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

  // Upload images and videos to Firebase Storage
  async uploadImages(userId: string, images: File[]): Promise<string[]> {
    console.log('=== UPLOAD MEDIA DEBUG ===');
    console.log('userId:', userId);
    console.log('media files:', images);
    
    // TEMPORARY: Use data URLs due to CORS issues with Firebase Storage
    const BYPASS_FIREBASE_STORAGE = true;
    
    if (BYPASS_FIREBASE_STORAGE) {
      console.log('Bypassing Firebase Storage due to CORS issues - using compressed data URLs');
      
      const dataUrls: string[] = [];
      
      for (let index = 0; index < images.length; index++) {
        const file = images[index];
        console.log(`Processing file ${index}: ${file.name} (${file.size} bytes)`);
        
        try {
          if (file.type.startsWith('video/')) {
            // Handle video files - check size BEFORE processing
            if (file.size > 25 * 1024 * 1024) { // 25MB limit for videos
              console.warn(`Video file ${file.name} is too large (${file.size} bytes). Skipping.`);
              continue;
            }
            
            // Check if video is too large for Firestore BEFORE creating data URL
            if (file.size > 800000) { // 800KB limit for Firestore
              console.warn(`Video ${file.name} is too large for Firestore (${file.size} bytes). Using placeholder.`);
              
              // Create a small video placeholder that can be stored in Firestore
              // Using an image placeholder that looks like a video thumbnail
              const placeholderVideo = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMzMzIi8+CjxjaXJjbGUgY3g9IjE1MCIgY3k9IjEwMCIgcj0iNDAiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjgiLz4KPHBhdGggZD0iTTEzMCA5MGw0MCAyMC00MCAyMFY5MHoiIGZpbGw9IndoaXRlIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5WaWRlbyBQbGFjZWhvbGRlcjwvdGV4dD4KPC9zdmc+';
              
              dataUrls.push(placeholderVideo);
              console.log(`Completed video ${index} with placeholder`);
              continue;
            }
            
            console.log(`Processing video file ${index}...`);
            const videoUrl = await new Promise<string>((resolve, reject) => {
              const timeout = setTimeout(() => {
                reject(new Error(`Video file ${file.name} took too long to process`));
              }, 15000); // 15 second timeout
              
              const reader = new FileReader();
              
              reader.onload = () => {
                try {
                  clearTimeout(timeout);
                  const dataUrl = reader.result as string;
                  console.log(`Created video data URL for video ${index} (${dataUrl.length} bytes)`);
                  
                  // Check if too large for internal processing
                  if (dataUrl.length > 25000000) { // 25MB limit for video data URLs
                    console.warn(`Video ${file.name} is too large (${dataUrl.length} bytes). Skipping.`);
                    reject(new Error(`Video ${file.name} is too large. Please try a shorter video.`));
                    return;
                  }
                  
                  // Store the actual video data URL (it's small enough since we checked file size)
                  console.log(`Storing actual video data URL for ${file.name} (${dataUrl.length} bytes)`);
                  resolve(dataUrl);
                } catch (error) {
                  clearTimeout(timeout);
                  reject(error);
                }
              };
              
              reader.onerror = () => {
                clearTimeout(timeout);
                reject(new Error(`Failed to read video: ${file.name}`));
              };
              
              reader.readAsDataURL(file);
            });
            dataUrls.push(videoUrl);
            console.log(`Completed video ${index}`);
            
          } else {
            // Handle image files with aggressive compression
            console.log(`Processing image file ${index}...`);
            const imageUrl = await new Promise<string>((resolve, reject) => {
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
                  console.log(`Created compressed data URL for image ${index} (${compressedDataUrl.length} bytes)`);
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
            dataUrls.push(imageUrl);
            console.log(`Completed image ${index}`);
          }
        } catch (error) {
          console.error(`Error processing file ${index}:`, error);
          continue;
        }
      }
      
      console.log('=== END UPLOAD MEDIA DEBUG (BYPASSED) ===');
      return dataUrls;
    }
    
    // Firebase Storage upload (currently bypassed due to CORS)
    const uploadPromises = images.map(async (image, index) => {
      try {
        console.log(`Uploading file ${index}:`, image.name, `(${image.size} bytes)`);
        
        // Check file size limits
        if (image.size > 10 * 1024 * 1024) { // 10MB limit
          console.warn(`File ${image.name} is too large (${image.size} bytes). Skipping.`);
          throw new Error(`File ${image.name} is too large. Maximum size is 10MB.`);
        }
        
        const timestamp = Date.now();
        const fileName = `concerts/${userId}/${timestamp}_${index}_${image.name}`;
        const imageRef = ref(storage, fileName);
        
        console.log('Uploading to Firebase Storage:', fileName);
        await uploadBytes(imageRef, image);
        console.log('Upload successful, getting download URL...');
        const downloadURL = await getDownloadURL(imageRef);
        console.log('Download URL obtained:', downloadURL);
        
        return downloadURL;
      } catch (error) {
        console.error('Failed to upload file:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown upload error';
        throw new Error(`Failed to upload ${image.name}: ${errorMessage}`);
      }
    });
    
    console.log('=== END UPLOAD MEDIA DEBUG ===');
    return Promise.all(uploadPromises);
  }
}; 