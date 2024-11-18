import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  QueryConstraint, 
  onSnapshot,
  DocumentData,
  FirestoreError
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useFirestoreQuery(
  collectionName: string,
  constraints: QueryConstraint[] = []
) {
  const [data, setData] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    const q = query(collection(db, collectionName), ...constraints);
    
    const unsubscribe = onSnapshot(
      q, 
      (querySnapshot) => {
        const documents = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log(`Fetched ${documents.length} documents from ${collectionName}`); // Debug log
        setData(documents);
        setLoading(false);
      },
      (err: FirestoreError) => {
        console.error('Firestore query error:', err); // Debug log
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, JSON.stringify(constraints)]);

  return { data, loading, error };
}