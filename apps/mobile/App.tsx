import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

export default function App() {
  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>GASFlow</Text>
        <Text style={styles.profile}>👤</Text>
      </View>

      {/* Welcome Section */}
      <View style={styles.welcome}>
        <Text style={styles.title}>
          Welcome, Delivery Partner!
        </Text>

        <Text style={styles.subtitle}>
          Manage your daily deliveries easily.
        </Text>
      </View>

      {/* Summary Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Today's Summary
        </Text>

        <View style={styles.stats}>
          <View style={styles.statBox}>
            <Text style={styles.number}>12</Text>
            <Text style={styles.statLabel}>
              Total Deliveries
            </Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.number}>8</Text>
            <Text style={styles.statLabel}>
              Completed
            </Text>
          </View>
        </View>
      </View>

      {/* Button */}
      <Pressable
        style={styles.button}
        onPress={() => alert('My Trips clicked!')}
      >
        <Text style={styles.buttonText}>
          View My Trips
        </Text>
      </Pressable>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 20,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
  },

  logo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2563EB',
  },

  profile: {
    fontSize: 25,
  },

  welcome: {
    marginTop: 40,
    marginBottom: 25,
  },

  title: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#1E293B',
  },

  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
  },

  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 15,
    elevation: 3,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1E293B',
  },

  stats: {
    flexDirection: 'row',
    gap: 12,
  },

  statBox: {
    flex: 1,
    backgroundColor: '#DBEAFE',
    padding: 18,
    borderRadius: 10,
  },

  number: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563EB',
  },

  statLabel: {
    fontSize: 12,
    marginTop: 5,
    color: '#334155',
  },

  button: {
    backgroundColor: '#2563EB',
    padding: 17,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 25,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
