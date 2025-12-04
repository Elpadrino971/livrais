import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';

interface RateDeliveryScreenProps {
  route: any;
  navigation: any;
}

// Critères de notation rapides
const RATING_CRITERIA = [
  { key: 'punctuality', label: '⏰ Ponctuel', emoji: '⏰' },
  { key: 'friendly', label: '😊 Sympathique', emoji: '😊' },
  { key: 'careful', label: '📦 Soigneux', emoji: '📦' },
  { key: 'professional', label: '👔 Professionnel', emoji: '👔' },
];

// Commentaires rapides
const QUICK_COMMENTS = [
  'Parfait ! 👍',
  'Très bien, merci !',
  'Service rapide',
  'Livreur sympathique',
  'Très professionnel',
  'À recommander',
  'Objet bien protégé',
  'Communication claire',
];

// Pourboires suggérés
const TIP_AMOUNTS = [2, 5, 10];

export default function RateDeliveryScreen({
  route,
  navigation,
}: RateDeliveryScreenProps) {
  const { deliveryId } = route.params;

  const [rating, setRating] = useState(0);
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [tip, setTip] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStarPress = (value: number) => {
    setRating(value);
  };

  const toggleCriteria = (key: string) => {
    if (selectedCriteria.includes(key)) {
      setSelectedCriteria(selectedCriteria.filter((c) => c !== key));
    } else {
      setSelectedCriteria([...selectedCriteria, key]);
    }
  };

  const handleQuickComment = (text: string) => {
    setComment(comment ? `${comment} ${text}` : text);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Note requise', 'Veuillez donner une note avant de continuer');
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Envoyer la note à Supabase
      // await supabase.from('ratings').insert({
      //   delivery_id: deliveryId,
      //   rating,
      //   comment,
      //   criteria: selectedCriteria,
      // });

      // TODO: Si pourboire, traiter le paiement
      // if (tip > 0) {
      //   await processStripePayment(tip);
      // }

      Alert.alert(
        'Merci ! 🎉',
        tip > 0
          ? `Votre avis et votre pourboire de ${tip}€ ont été envoyés !`
          : 'Votre avis a été envoyé !',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Home'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingMessage = () => {
    if (rating === 0) return 'Donnez une note';
    if (rating === 5) return 'Excellent ! ⭐⭐⭐⭐⭐';
    if (rating === 4) return 'Très bien ! ⭐⭐⭐⭐';
    if (rating === 3) return 'Bien ⭐⭐⭐';
    if (rating === 2) return 'Moyen ⭐⭐';
    return 'Décevant ⭐';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>🎉</Text>
          <Text style={styles.headerTitle}>Livraison terminée !</Text>
          <Text style={styles.headerSubtitle}>
            Comment s'est passée votre expérience ?
          </Text>
        </View>

        {/* Notation par étoiles */}
        <View style={styles.ratingSection}>
          <Text style={styles.ratingLabel}>{getRatingMessage()}</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => handleStarPress(star)}
                style={styles.starButton}
              >
                <Text style={styles.star}>
                  {star <= rating ? '⭐' : '☆'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Critères rapides (si note >= 4) */}
        {rating >= 4 && (
          <View style={styles.criteriaSection}>
            <Text style={styles.sectionTitle}>Points forts</Text>
            <View style={styles.criteriaGrid}>
              {RATING_CRITERIA.map((criterion) => (
                <TouchableOpacity
                  key={criterion.key}
                  style={[
                    styles.criterionButton,
                    selectedCriteria.includes(criterion.key) &&
                      styles.criterionButtonActive,
                  ]}
                  onPress={() => toggleCriteria(criterion.key)}
                >
                  <Text style={styles.criterionEmoji}>{criterion.emoji}</Text>
                  <Text
                    style={[
                      styles.criterionLabel,
                      selectedCriteria.includes(criterion.key) &&
                        styles.criterionLabelActive,
                    ]}
                  >
                    {criterion.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Commentaires rapides */}
        {rating > 0 && (
          <View style={styles.quickCommentsSection}>
            <Text style={styles.sectionTitle}>Commentaires rapides</Text>
            <View style={styles.quickCommentsGrid}>
              {QUICK_COMMENTS.map((text, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickCommentButton}
                  onPress={() => handleQuickComment(text)}
                >
                  <Text style={styles.quickCommentText}>{text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Commentaire personnalisé */}
        <View style={styles.commentSection}>
          <Text style={styles.sectionTitle}>
            Votre avis (optionnel)
          </Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Partagez votre expérience..."
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            maxLength={500}
          />
          <Text style={styles.characterCount}>
            {comment.length}/500 caractères
          </Text>
        </View>

        {/* Pourboire (si note >= 4) */}
        {rating >= 4 && (
          <View style={styles.tipSection}>
            <Text style={styles.sectionTitle}>
              💝 Donner un pourboire (optionnel)
            </Text>
            <Text style={styles.tipSubtitle}>
              Le livreur a fait du bon travail ? Montrez votre appréciation !
            </Text>
            <View style={styles.tipButtons}>
              {TIP_AMOUNTS.map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.tipButton,
                    tip === amount && styles.tipButtonActive,
                  ]}
                  onPress={() => setTip(tip === amount ? 0 : amount)}
                >
                  <Text
                    style={[
                      styles.tipButtonText,
                      tip === amount && styles.tipButtonTextActive,
                    ]}
                  >
                    {amount}€
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[
                  styles.tipButton,
                  tip === 0 && styles.tipButtonActive,
                ]}
                onPress={() => setTip(0)}
              >
                <Text
                  style={[
                    styles.tipButtonText,
                    tip === 0 && styles.tipButtonTextActive,
                  ]}
                >
                  Pas de pourboire
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Bouton valider */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            rating === 0 && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={rating === 0 || isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting
              ? 'Envoi...'
              : tip > 0
              ? `Envoyer l'avis et ${tip}€ de pourboire`
              : 'Envoyer l\'avis'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.skipButtonText}>Passer</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerEmoji: {
    fontSize: 60,
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  ratingSection: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  ratingLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  starButton: {
    padding: 5,
  },
  star: {
    fontSize: 40,
  },
  criteriaSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  criteriaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  criterionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  criterionButtonActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  criterionEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  criterionLabel: {
    fontSize: 14,
    color: '#666',
  },
  criterionLabelActive: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  quickCommentsSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  quickCommentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickCommentButton: {
    backgroundColor: '#E3F2FD',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  quickCommentText: {
    fontSize: 14,
    color: '#2196F3',
  },
  commentSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  commentInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 5,
  },
  tipSection: {
    backgroundColor: '#FFF3E0',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  tipSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  tipButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tipButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FF9800',
  },
  tipButtonActive: {
    backgroundColor: '#FF9800',
  },
  tipButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9800',
  },
  tipButtonTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  skipButton: {
    padding: 15,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    color: '#999',
  },
});
