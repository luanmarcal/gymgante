import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, List, ActivityIndicator, Colors } from 'react-native-paper'; // Added ActivityIndicator
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { FIREBASE_DB } from '~/utils/firebase.client';

/**
 * FeedbacksDoAluno Component
 *
 * This component displays a list of all feedback entries submitted by a specific student.
 * It retrieves the student's ID from the URL parameters and fetches relevant feedback
 * data from Firestore. Users can tap on a feedback item to view its details.
 */
export default function FeedbacksDoAluno() {
  // Get the 'alunoId' from the URL parameters. This ID determines which student's
  // feedbacks are to be fetched and displayed.
  const { alunoId } = useLocalSearchParams();

  // Initialize the router object using the `useRouter` hook. This is used for
  // programmatically navigating to other screens (e.g., FeedbackDetails).
  const router = useRouter();

  // State to store the list of feedback items fetched from Firestore.
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  // State to manage the loading status. True when data is being fetched, false otherwise.
  const [loading, setLoading] = useState(true);

  /**
   * useEffect hook to perform data fetching when the component mounts or
   * when the `alunoId` parameter changes.
   */
  useEffect(() => {
    async function fetchFeedbacks() {
      // Basic validation: If `alunoId` is not present or not a string,
      // set loading to false and exit to prevent unnecessary operations.
      if (!alunoId || typeof alunoId !== 'string') {
        setLoading(false);
        console.warn('alunoId is missing or invalid.');
        return;
      }

      setLoading(true); // Set loading to true before starting the fetch operation.
      try {
        // Create a reference to the 'feedbacks' collection in Firestore.
        const feedbacksRef = collection(FIREBASE_DB, 'feedbacks');
        // Construct a query to filter documents where 'userId' field matches the `alunoId`.
        const q = query(feedbacksRef, where('userId', '==', alunoId));
        // Execute the query and get the document snapshots.
        const snapshot = await getDocs(q);

        // Map each document snapshot to a JavaScript object, including its Firestore document ID.
        const feedbackList = snapshot.docs.map((doc) => ({
          id: doc.id, // The unique ID of the Firestore document.
          ...doc.data(), // All other fields from the document.
        }));

        setFeedbacks(feedbackList); // Update the state with the fetched feedback list.
      } catch (error) {
        // Log any errors that occur during the fetching process.
        console.error('Error fetching feedbacks:', error);
        // In a production application, you might display an error message to the user here.
      } finally {
        // Ensure loading is set to false once the fetch operation completes,
        // regardless of success or failure.
        setLoading(false);
      }
    }

    fetchFeedbacks(); // Call the async function to initiate data fetching.
  }, [alunoId]); // Dependency array: This effect re-runs whenever `alunoId` changes.

  // --- Conditional Rendering based on Loading State and Data Availability ---

  // Display a loading indicator while data is being fetched.
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating={true} color={Colors.blue500} size="large" />
        <Text style={styles.loadingText}>Carregando feedbacks...</Text>
      </View>
    );
  }

  // Display a message if no feedbacks are found for the given student after loading.
  if (feedbacks.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noFeedbacksText}>Nenhum feedback encontrado para este aluno.</Text>
      </View>
    );
  }

  // --- Main Render Block ---
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Feedbacks do Aluno</Text>
      <FlatList
        data={feedbacks} // The array of feedback objects to display.
        keyExtractor={(item) => item.id} // Unique key for each item, essential for FlatList performance.
        renderItem={({ item }) => (
          <List.Item
            // Display a descriptive title based on the feedback's target type.
            title={
                item.targetType === 'exercise'
                    ? `Feedback sobre Exercício`
                    : item.targetType === 'workout'
                    ? `Feedback sobre Treino`
                    : 'Feedback Geral' // Fallback for other or unknown types.
            }
            description={item.comment} // Display the student's comment as the description.
            left={(props) => <List.Icon {...props} icon="message-text-outline" />} // Icon for visual cue.
            onPress={() => {
                // Log the ID being used for navigation (useful for debugging).
                console.log('Navigating to feedbackId:', item.id);
                // Navigate to the FeedbackDetails screen, passing the feedback ID as a parameter.
                router.push({
                    pathname: '/treinador/feedbacks/[feedbackId]', // The dynamic route path.
                    params: { feedbackId: item.id }, // The actual ID to fill the dynamic segment.
                });
            }}
            style={styles.listItem} // Apply custom styling to each list item.
          />
        )}
      />
    </View>
  );
}

// StyleSheet for the component's visual presentation.
const styles = StyleSheet.create({
  container: {
    flex: 1, // Ensures the container takes up the full available space.
    padding: 16, // Padding around the content.
    backgroundColor: '#f8f8f8', // Light background color for the screen.
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 10,
    color: '#666',
  },
  noFeedbacksText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
    color: '#888',
  },
  listItem: {
    backgroundColor: '#fff', // White background for each list item.
    borderRadius: 8, // Rounded corners for a softer look.
    marginBottom: 10, // Space between list items.
    elevation: 2, // Android shadow.
    shadowColor: '#000', // iOS shadow.
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
});
