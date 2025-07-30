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
    
    // Use Firebase Storage for production
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