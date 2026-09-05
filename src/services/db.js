import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc,
  query,
  where,
  serverTimestamp,
  deleteDoc,
  updateDoc,
  setDoc,
  onSnapshot,
  orderBy,
  arrayUnion
} from 'firebase/firestore';

// Collection references
const petsCol = collection(db, 'pets');
const listingsCol = collection(db, 'listings');
const chatsCol = collection(db, 'chats');
const reportsCol = collection(db, 'reports');
const usersCol = collection(db, 'users');
const paymentTokensCol = collection(db, 'paymentTokens');

// ========================
// User Profiles (Premium)
// ========================

export async function getUserProfile(userId, email) {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      // Create default free profile if it doesn't exist
      const newProfile = {
        email,
        isPremium: false,
        createdAt: serverTimestamp()
      };
      await setDoc(docRef, newProfile);
      return { id: userId, ...newProfile, isPremium: false };
    }
  } catch (error) {
    console.error("Error getting user profile: ", error);
    return { id: userId, isPremium: false }; // fallback for free tier if DB errors out
  }
}

export async function upgradeUserToPremium(userId) {
  try {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, { isPremium: true });
  } catch (error) {
    console.error("Error upgrading user: ", error);
    throw error;
  }
}

export async function cancelPremium(userId) {
  try {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, { isPremium: false });
  } catch (error) {
    console.error("Error canceling premium: ", error);
    throw error;
  }
}

// ========================
// Secure Payment Tokens
// ========================

// Creates a one-time token tied to a user. Returned to Settings page.
export async function createPaymentToken(userId) {
  try {
    // Invalidate any old pending tokens for this user first
    const q = query(paymentTokensCol, where('userId', '==', userId), where('used', '==', false));
    const existing = await getDocs(q);
    existing.forEach(async (d) => await deleteDoc(d.ref));

    const tokenDoc = await addDoc(paymentTokensCol, {
      userId,
      used: false,
      createdAt: serverTimestamp()
    });
    return tokenDoc.id; // This ID IS the token
  } catch (error) {
    console.error("Error creating payment token: ", error);
    throw error;
  }
}

// Verifies the token belongs to the user, hasn't been used, and activates premium.
export async function verifyAndActivatePremium(token, userId) {
  try {
    const tokenRef = doc(db, 'paymentTokens', token);
    const tokenSnap = await getDoc(tokenRef);

    if (!tokenSnap.exists()) throw new Error('Invalid payment token.');
    const data = tokenSnap.data();
    if (data.used) throw new Error('This token has already been used.');
    if (data.userId !== userId) throw new Error('Token does not belong to this user.');

    // Mark token as used (one-time use)
    await updateDoc(tokenRef, { used: true });

    // Now safely upgrade the user
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { isPremium: true });

    return true;
  } catch (error) {
    console.error("Payment verification failed: ", error.message);
    throw error;
  }
}

export async function addPet(userId, petData) {
  try {
    const docRef = await addDoc(petsCol, {
      ...petData,
      userId,
      createdAt: serverTimestamp()
    });
    return { id: docRef.id, ...petData };
  } catch (error) {
    console.error("Error adding pet: ", error);
    throw error;
  }
}

export async function getUserPets(userId) {
  try {
    const q = query(petsCol, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const pets = [];
    querySnapshot.forEach((doc) => {
      pets.push({ id: doc.id, ...doc.data() });
    });
    return pets;
  } catch (error) {
    console.error("Error getting pets: ", error);
    throw error;
  }
}

export async function getPetById(petId) {
  try {
    const docRef = doc(db, 'pets', petId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error("Pet not found");
    }
  } catch (error) {
    console.error("Error getting pet: ", error);
    throw error;
  }
}

export async function deletePet(petId) {
  try {
    const docRef = doc(db, 'pets', petId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting pet: ", error);
    throw error;
  }
}

export async function addListing(petId, petData, sellerId, price, description, contactLink, type = 'selling', isFeatured = false) {
  try {
    const docRef = await addDoc(listingsCol, {
      petId,
      petData,
      sellerId,
      price,
      description,
      contactLink,
      type,
      isFeatured,
      status: 'active',
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding listing: ", error);
    throw error;
  }
}

export async function getListings() {
  try {
    const q = query(listingsCol, where("status", "==", "active"));
    const querySnapshot = await getDocs(q);
    const listings = [];
    querySnapshot.forEach((doc) => {
      listings.push({ id: doc.id, ...doc.data() });
    });
    return listings.sort((a, b) => b.createdAt - a.createdAt); // Newest first
  } catch (error) {
    console.error("Error getting listings: ", error);
    throw error;
  }
}

export async function markListingSold(listingId) {
  try {
    const docRef = doc(db, 'listings', listingId);
    await updateDoc(docRef, { status: 'sold' });
  } catch (error) {
    console.error("Error marking listing sold: ", error);
    throw error;
  }
}

export async function reportListing(listingId, reporterId, reason) {
  try {
    await addDoc(reportsCol, {
      listingId,
      reporterId,
      reason,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error reporting listing", error);
    throw error;
  }
}

// ========================
// Messaging System
// ========================

export async function getOrCreateChat(listingId, buyerId, sellerId, listingData) {
  try {
    // Check if chat already exists
    const q = query(chatsCol, where("listingId", "==", listingId), where("participants", "array-contains", buyerId));
    const querySnapshot = await getDocs(q);
    
    // We also need to ensure the seller is in participants, but array-contains only supports one value in a simple query.
    // So we manually check if sellerId is in participants.
    let existingChat = null;
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.participants.includes(sellerId)) {
        existingChat = { id: doc.id, ...data };
      }
    });

    if (existingChat) return existingChat.id;

    // Create new chat
    const newChatRef = await addDoc(chatsCol, {
      listingId,
      listingTitle: listingData.petData?.name || 'Listing',
      participants: [buyerId, sellerId],
      buyerId,
      sellerId,
      messages: [],
      updatedAt: serverTimestamp()
    });
    return newChatRef.id;
  } catch (error) {
    console.error("Error creating chat", error);
    throw error;
  }
}

export async function sendMessage(chatId, senderId, text) {
  try {
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      messages: arrayUnion({
        senderId,
        text,
        timestamp: Date.now() // using Date.now for simpler serialization in arrays
      }),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error sending message", error);
    throw error;
  }
}

export function subscribeToChat(chatId, callback) {
  const chatRef = doc(db, 'chats', chatId);
  return onSnapshot(chatRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() });
    }
  });
}

export async function getUserChats(userId) {
  try {
    const q = query(chatsCol, where("participants", "array-contains", userId));
    const querySnapshot = await getDocs(q);
    const chats = [];
    querySnapshot.forEach((doc) => {
      chats.push({ id: doc.id, ...doc.data() });
    });
    // Sort by most recently updated
    return chats.sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0));
  } catch (error) {
    console.error("Error getting chats", error);
    throw error;
  }
}
