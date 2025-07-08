import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button, Divider, ActivityIndicator, Colors } from 'react-native-paper'; // Added ActivityIndicator
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { FIREBASE_DB } from '~/utils/firebase.client';
import { useAppSelector } from '~/redux/store';

/**
 * FeedbackDetails Component
 *
 * This component displays the detailed view of a single feedback entry.
 * It allows a coach to read the student's comment and submit a response.
 *
 * It retrieves the `feedbackId` from the URL parameters, fetches the
 * corresponding feedback document from Firestore, and uses Redux state
 * to resolve the names of associated exercises or workouts.
 */
export default function FeedbackDetails() {
  // Extract the `feedbackId` from the current route's parameters.
  // This ID is crucial for fetching the specific feedback.
  const { feedbackId } = useLocalSearchParams();
  console.log('feedbackId:', feedbackId); // Log the ID for debugging purposes

  // Initialize the router object using the `useRouter` hook.
  // This provides methods like `router.back()` for navigation.
  const router = useRouter();

  // Use `useAppSelector` to access the `workouts` and `exercises` arrays
  // from your Redux store. These are used to display the full name of the
  // workout or exercise that the feedback pertains to.
  const workouts = useAppSelector((state) => state.workout.workouts);
  const exercises = useAppSelector((state) => state.workout.exercises);

  // State to store the fetched feedback document data.
  // It's initialized as null until data is successfully loaded.
  const [feedback, setFeedback] = useState<any>(null);
  // State to manage the text input for the coach's response.
  // It's pre-filled with an existing response if available, otherwise empty.
  const [response, setResponse] = useState('');
  // State to indicate if data is currently being loaded.
  // True initially, set to false after fetching completes (success or failure).
  const [loading, setLoading] = useState(true);

  /**
   * useEffect hook to fetch feedback data from Firestore.
   * This effect runs once when the component mounts and re-runs if `feedbackId` changes.
   */
  useEffect(() => {
    const fetchFeedback = async () => {
      // If `feedbackId` is not provided (e.g., invalid URL), exit early
      // and set loading to false to prevent an infinite loading state.
      if (!feedbackId) {
        setLoading(false);
        console.warn('feedbackId is missing or invalid.');
        return;
      }

      try {
        // Create a reference to the specific feedback document in the 'feedbacks' collection.
        // `String(feedbackId)` ensures the ID is a string, as Firestore expects.
        const ref = doc(FIREBASE_DB, 'feedbacks', String(feedbackId));
        // Fetch the document snapshot from Firestore.
        const snap = await getDoc(ref);

        // Check if the document exists in the database.
        if (snap.exists()) {
          const data = snap.data(); // Get the data from the document
          setFeedback(data); // Update the `feedback` state with the fetched data
          setResponse(data.response || ''); // Initialize `response` with existing data or an empty string
        } else {
          // If the document does not exist, log a warning and clear the feedback state.
          console.warn(`Feedback with ID ${feedbackId} not found.`);
          setFeedback(null);
        }
      } catch (err) {
        // Catch and log any errors that occur during the Firestore fetch operation.
        console.error('Erro ao buscar feedback:', err);
        setFeedback(null); // Clear feedback state on error
      } finally {
        // Ensure `loading` is set to false once the fetch operation is complete,
        // regardless of success or failure.
        setLoading(false);
      }
    };

    fetchFeedback(); // Call the async function to start fetching data.
  }, [feedbackId]); // Dependency array: Re-run this effect if `feedbackId` changes.

  /**
   * `handleRespond` function: Called when the "Enviar resposta" button is pressed.
   * It updates the `response` field of the current feedback document in Firestore.
   */
  const handleRespond = async () => {
    // Prevent execution if `feedbackId` is missing.
    if (!feedbackId) {
      console.warn('Cannot respond: feedbackId is missing.');
      return;
    }

    try {
      // Update the Firestore document. Only the 'response' field is modified.
      await updateDoc(doc(FIREBASE_DB, 'feedbacks', String(feedbackId)), {
        response, // The value from the `response` state (TextInput)
      });
      console.log('Resposta enviada com sucesso!');
      // After a successful update, navigate back to the previous screen
      // (e.g., the list of feedbacks for the student).
      router.back();
    } catch (err) {
      // Catch and log any errors that occur during the Firestore update.
      console.error('Erro ao responder feedback:', err);
      // In a real application, you might display a user-friendly error message here.
    }
  };

  // Conditional rendering: Show a loading message if data is still being fetched
  // or if `feedback` is null (e.g., not found or an error occurred).
  if (loading || !feedback) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating={true} color={Colors.blue500} size="large" />
        <Text style={styles.loading}>Carregando feedback...</Text>
      </View>
    );
  }

  // Determine the name of the associated exercise or workout.
  // This logic checks the `targetType` in the feedback and then searches
  // the `exercises` or `workouts` arrays from Redux for a matching `targetId`.
  const targetName =
    feedback.targetType === 'exercise'
      ? exercises.find((e) => e.id === feedback.targetId)?.name
      : workouts.find((w) => w.id === feedback.targetId)?.title;

  // Main UI rendering for the feedback details.
  return (
    <View style={styles.container}>
      {/* Section: What the feedback is about */}
      <Text style={styles.label}>Referente a:</Text>
      <Text style={styles.title}>{targetName || 'Desconhecido'}</Text>

      <Divider style={styles.divider} /> {/* Visual separator */}

      {/* Section: Student's comment */}
      <Text style={styles.label}>Comentário do aluno:</Text>
      <Text style={styles.comment}>{feedback.comment}</Text>

      <Divider style={styles.divider} /> {/* Visual separator */}

      {/* Section: Coach's response input */}
      <Text style={styles.label}>Resposta do treinador:</Text>
      <TextInput
        mode="outlined" // Applies Material Design outlined style
        placeholder="Digite sua resposta aqui..."
        value={response} // Binds the input value to the `response` state
        onChangeText={setResponse} // Updates the `response` state on text change
        multiline // Allows the input to span multiple lines
        style={styles.textInput} // Apply specific styling
      />

      {/* Button to submit the response */}
      <Button
        mode="contained" // Applies Material Design contained button style
        onPress={handleRespond} // Calls the `handleRespond` function when pressed
        style={styles.button} // Apply specific styling
      >
        Enviar resposta
      </Button>
    </View>
  );
}

// StyleSheet for defining the visual styles of the component.
const styles = StyleSheet.create({
  container: {
    flex: 1, // Ensures the container takes up the full screen height
    padding: 20, // Padding around the content
    backgroundColor: '#f5f5f5', // Light background color for the screen
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loading: {
    padding: 20,
    textAlign: 'center',
    fontSize: 18,
    color: '#666',
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
  },
  title: {
    fontSize: 18,
    marginBottom: 8,
    color: '#000',
  },
  comment: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#555',
    lineHeight: 24, // Improve readability for longer comments
  },
  divider: {
    marginVertical: 16, // Vertical spacing for dividers
    backgroundColor: '#ccc', // Color of the divider line
  },
  textInput: {
    marginBottom: 10, // Space below the text input
  },
  button: {
    marginTop: 16, // Space above the button
    paddingVertical: 8, // Vertical padding inside the button
    backgroundColor: '#6200ee', // A common Material Design primary color
  },
});
